export default async function handler(req, res) {

    // ==========================================
    // CORS
    // ==========================================

    res.setHeader(
        'Access-Control-Allow-Origin',
        'https://pandatur.md'
    );

    res.setHeader(
        'Access-Control-Allow-Credentials',
        'true'
    );

    res.setHeader(
        'Access-Control-Allow-Methods',
        'POST, OPTIONS'
    );

    res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type'
    );

    res.setHeader(
        'Access-Control-Max-Age',
        '86400'
    );


    // ==========================================
    // OPTIONS / PREFLIGHT
    // ==========================================

    if (req.method === 'OPTIONS') {

        return res.status(204).end();

    }


    // ==========================================
    // ONLY POST
    // ==========================================

    if (req.method !== 'POST') {

        return res.status(405).json({
            success: false,
            error: 'POST only'
        });

    }


    try {

        // ==========================================
        // READ BODY
        // ==========================================

        let data = req.body;


        // Dacă body vine ca string
        if (typeof data === 'string') {

            try {

                data = JSON.parse(data);

            } catch (error) {

                console.error(
                    'JSON parse error:',
                    error
                );

                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON'
                });

            }

        }


        // ==========================================
        // DATA
        // ==========================================

        const phone =
            data?.phone || '';

        const page =
            data?.page || '';

        const title =
            data?.title || '';

        const referrer =
            data?.referrer || '';

        const timestamp =
            data?.timestamp || '';


        console.log(
            '======================================'
        );

        console.log(
            '📥 PANDA TOUR PHONE CLICK'
        );

        console.log(
            'Phone:',
            phone
        );

        console.log(
            'Page:',
            page
        );

        console.log(
            'Title:',
            title
        );

        console.log(
            'Referrer:',
            referrer
        );

        console.log(
            'Timestamp:',
            timestamp
        );

        console.log(
            '======================================'
        );


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!phone || !page) {

            return res.status(400).json({
                success: false,
                error: 'Phone or page is missing'
            });

        }


        // ==========================================
        // TELEGRAM SETTINGS
        // ==========================================

        const BOT_TOKEN =
            process.env.TELEGRAM_BOT_TOKEN;

        const CHAT_ID =
            process.env.TELEGRAM_CHAT_ID;


        console.log(
            'BOT TOKEN:',
            BOT_TOKEN ? 'OK' : 'MISSING'
        );

        console.log(
            'CHAT ID:',
            CHAT_ID ? 'OK' : 'MISSING'
        );


        if (!BOT_TOKEN || !CHAT_ID) {

            console.error(
                '❌ Telegram environment variables missing'
            );

            return res.status(500).json({
                success: false,
                error: 'Telegram environment variables missing'
            });

        }


        // ==========================================
        // CLEAN PHONE
        // ==========================================

        const cleanPhone =
            String(phone)
                .replace(/^tel:/i, '')
                .trim();


        // ==========================================
        // DATE
        // ==========================================

        let formattedDate = '-';

        if (timestamp) {

            try {

                formattedDate =
                    new Intl.DateTimeFormat(
                        'ro-RO',
                        {
                            dateStyle: 'short',
                            timeStyle: 'medium',
                            timeZone: 'Europe/Chisinau'
                        }
                    ).format(
                        new Date(timestamp)
                    );

            } catch (error) {

                formattedDate = timestamp;

            }

        }


        // ==========================================
        // TELEGRAM MESSAGE
        // ==========================================

        const message =
`📞 <b>CLICK TELEFON</b>

📱 <b>Număr:</b>
${escapeHtml(cleanPhone)}

🌐 <b>Pagina:</b>
${escapeHtml(page)}

📄 <b>Titlu:</b>
${escapeHtml(title || '-')}

🕐 <b>Data:</b>
${escapeHtml(formattedDate)}

🔗 <b>Referrer:</b>
${escapeHtml(referrer || '-')}`;


        console.log(
            '📨 Sending Telegram message...'
        );


        // ==========================================
        // SEND TELEGRAM
        // ==========================================

        const telegramResponse =
            await fetch(
                `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        chat_id: CHAT_ID,

                        text: message,

                        parse_mode: 'HTML',

                        disable_web_page_preview: false

                    })

                }
            );


        const telegramResult =
            await telegramResponse.json();


        console.log(
            'Telegram response:',
            telegramResult
        );


        // ==========================================
        // TELEGRAM ERROR
        // ==========================================

        if (
            !telegramResponse.ok ||
            !telegramResult.ok
        ) {

            console.error(
                '❌ TELEGRAM ERROR:',
                telegramResult
            );

            return res.status(500).json({

                success: false,

                error: 'Telegram API error',

                telegram: telegramResult

            });

        }


        // ==========================================
        // SUCCESS
        // ==========================================

        console.log(
            '✅ TELEGRAM MESSAGE SENT'
        );


        return res.status(200).json({

            success: true,

            message: 'Telegram message sent'

        });


    } catch (error) {

        console.error(
            '❌ SERVER ERROR:',
            error
        );


        return res.status(500).json({

            success: false,

            error: error.message

        });

    }

}


// ==========================================
// HTML ESCAPE
// ==========================================

function escapeHtml(value) {

    return String(value)

        .replace(/&/g, '&amp;')

        .replace(/</g, '&lt;')

        .replace(/>/g, '&gt;')

        .replace(/"/g, '&quot;')

        .replace(/'/g, '&#039;');

}
