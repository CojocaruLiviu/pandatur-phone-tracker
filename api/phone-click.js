export default async function handler(req, res) {

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

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'POST only'
        });
    }

    try {

        let data = req.body;

        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid JSON'
                });
            }
        }

        const phone = data?.phone || '';
        const page = data?.page || '';
        const title = data?.title || '';
        const timestamp = data?.timestamp || '';

        if (!phone || !page) {
            return res.status(400).json({
                success: false,
                error: 'Phone or page is missing'
            });
        }

        const BOT_TOKEN =
            process.env.TELEGRAM_BOT_TOKEN;

        const CHAT_ID =
            process.env.TELEGRAM_CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            return res.status(500).json({
                success: false,
                error: 'Telegram environment variables missing'
            });
        }

        const cleanPhone = String(phone)
            .replace(/^tel:/i, '')
            .trim();

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
                    ).format(new Date(timestamp));
            } catch (error) {
                formattedDate = timestamp;
            }
        }

        const ip =
            req.headers['x-forwarded-for'] ||
            req.headers['x-real-ip'] ||
            req.socket?.remoteAddress ||
            'Necunoscut';

        const clientIp = String(ip)
            .split(',')[0]
            .trim();

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

🌍 <b>IP:</b>
${escapeHtml(clientIp)}`;

        const telegramResponse =
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
                        disable_web_page_preview: false
                    })
                }
            );

        const telegramResult =
            await telegramResponse.json();

        if (
            !telegramResponse.ok ||
            !telegramResult.ok
        ) {
            return res.status(500).json({
                success: false,
                error: 'Telegram API error'
            });
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }
}

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}
