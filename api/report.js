import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {

    /*
     * Protecție pentru endpoint.
     */

    const CRON_SECRET =
        process.env.CRON_SECRET;

    const authorization =
        req.headers.authorization || '';

    if (
        CRON_SECRET &&
        authorization !== `Bearer ${CRON_SECRET}`
    ) {

        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });

    }


    try {

        /*
         * ==========================================
         * DATA DE IERI
         * ==========================================
         *
         * Raportul rulează la 23:30.
         *
         * Vrem ziua curentă,
         * nu ziua următoare.
         */

        const now = new Date();

        const date =
            new Intl.DateTimeFormat(
                'en-CA',
                {
                    timeZone: 'Europe/Chisinau',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }
            ).format(now);


        /*
         * ==========================================
         * CĂUTĂM CHEILE ZILEI
         * ==========================================
         */

        const pattern =
            `clicks:${date}:*`;

        const keys = [];

        let cursor = 0;

        do {

            const result =
                await redis.scan(
                    cursor,
                    {
                        match: pattern,
                        count: 100
                    }
                );

            cursor = Number(result[0]);

            const foundKeys =
                result[1] || [];

            keys.push(...foundKeys);

        } while (cursor !== 0);


        /*
         * Dacă nu există clickuri.
         */

        if (keys.length === 0) {

            await sendTelegram(
                `📊 <b>RAPORT CLICKURI TELEFON</b>

📅 ${formatDate(date)}

Nu au fost înregistrate clickuri.

📱 <b>TOTAL: 0 clickuri</b>`
            );

            return res.status(200).json({
                success: true,
                total: 0,
                excursions: 0
            });

        }


        /*
         * ==========================================
         * CITIM COUNT-URILE
         * ==========================================
         */

        const report = [];

        let total = 0;


        for (const key of keys) {

            const count =
                Number(
                    await redis.get(key)
                ) || 0;


            const slug =
                key.substring(
                    `clicks:${date}:`.length
                );


            /*
             * Luăm ID-ul excursiei.
             */

            const info =
                await redis.hgetall(
                    `info:${slug}`
                );


            const excursionId =
                info?.id || '';


            /*
             * Transformăm slug-ul într-un nume
             * mai frumos.
             */

            const name =
                formatExcursionName(slug);


            report.push({
                slug: slug,
                id: excursionId,
                name: name,
                count: count
            });


            total += count;

        }


        /*
         * ==========================================
         * SORTARE DESCRESCĂTOARE
         * ==========================================
         */

        report.sort(
            (a, b) => b.count - a.count
        );


        /*
         * ==========================================
         * CONSTRUIM MESAJUL
         * ==========================================
         */

        let message =
`📊 <b>RAPORT CLICKURI TELEFON</b>

📅 ${formatDate(date)}

`;


        const medals = [
            '🔥',
            '🥈',
            '🥉'
        ];


        report.forEach(
            function (item, index) {

                const icon =
                    medals[index] || '📌';


                message +=
`${icon} ${escapeHtml(item.name)} — ${item.count}\n`;

            }
        );


        message +=
`
📱 <b>TOTAL: ${total} clickuri</b>`;


        /*
         * ==========================================
         * TELEGRAM
         * ==========================================
         */

        await sendTelegram(message);


        /*
         * ==========================================
         * ȘTERGEM COUNT-URILE
         * ==========================================
         *
         * După ce raportul a fost trimis,
         * count-urile zilei sunt resetate.
         */

        for (const key of keys) {

            await redis.del(key);

        }


        return res.status(200).json({

            success: true,

            date: date,

            total: total,

            excursions: report.length

        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            error: error.message

        });

    }

}


/*
 * ==========================================
 * TELEGRAM
 * ==========================================
 */

async function sendTelegram(message) {

    const BOT_TOKEN =
        process.env.TELEGRAM_BOT_TOKEN;

    const CHAT_ID =
        process.env.TELEGRAM_CHAT_ID;


    if (!BOT_TOKEN || !CHAT_ID) {

        throw new Error(
            'Telegram environment variables missing'
        );

    }


    const response =
        await fetch(
            `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
            {
                method: 'POST',

                headers: {
                    'Content-Type':
                        'application/json'
                },

                body: JSON.stringify({

                    chat_id: CHAT_ID,

                    text: message,

                    parse_mode: 'HTML',

                    disable_web_page_preview: true

                })

            }
        );


    const result =
        await response.json();


    if (
        !response.ok ||
        !result.ok
    ) {

        throw new Error(
            'Telegram error: ' +
            JSON.stringify(result)
        );

    }

}


/*
 * ==========================================
 * EXCURSION NAME
 * ==========================================
 */

function formatExcursionName(slug) {

    return String(slug)

        .replace(/[-_]+/g, ' ')

        .replace(/\b\w/g, function (letter) {
            return letter.toUpperCase();
        });

}


/*
 * ==========================================
 * DATE
 * ==========================================
 */

function formatDate(date) {

    const parts =
        String(date).split('-');

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}.${parts[1]}.${parts[0]}`;

}


/*
 * ==========================================
 * HTML ESCAPE
 * ==========================================
 */

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');

}
