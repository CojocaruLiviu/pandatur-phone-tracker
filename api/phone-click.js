export default async function handler(req, res) {

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false
        });
    }

    try {

        const {
            phone,
            page,
            title,
            referrer,
            timestamp
        } = req.body || {};

        if (!phone || !page) {
            return res.status(400).json({
                success: false,
                error: 'Missing data'
            });
        }

        const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
        const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

        if (!BOT_TOKEN || !CHAT_ID) {
            console.error('Telegram settings missing');

            return res.status(500).json({
                success: false,
                error: 'Telegram settings missing'
            });
        }

        let date = timestamp;

        try {
            date = new Intl.DateTimeFormat('ro-RO', {
                dateStyle: 'short',
                timeStyle: 'medium',
                timeZone: 'Europe/Chisinau'
            }).format(new Date(timestamp));
        } catch (e) {}

        const cleanPhone = String(phone)
            .replace(/^tel:/i, '');

        const message =
`📞 <b>CLICK TELEFON</b>

📱 <b>Număr:</b> ${escapeHtml(cleanPhone)}

🌐 <b>Pagina:</b>
${escapeHtml(page)}

📄 <b>Titlu:</b>
${escapeHtml(title || '-')}

🕐 <b>Data:</b>
${escapeHtml(date || '-')}

🔗 <b>Referrer:</b>
${escapeHtml(referrer || '-')}`;

        const response = await fetch(
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

        const result = await response.json();

        if (!response.ok || !result.ok) {

            console.error(
                'Telegram error:',
                result
            );

            return res.status(500).json({
                success: false
            });
        }

        return res.status(200).json({
            success: true
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false
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