(function () {
    'use strict';

    const API_URL =
        'https://pandatur-phone-tracker.vercel.app/api/phone-click';

    function sendClick(link) {

        try {

            const data = {
                phone: link.getAttribute('href') || '',
                page: window.location.href,
                title: document.title || '',
                timestamp: new Date().toISOString()
            };

            const body = JSON.stringify(data);

            if (navigator.sendBeacon) {

                const blob = new Blob(
                    [body],
                    {
                        type: 'text/plain;charset=UTF-8'
                    }
                );

                const sent = navigator.sendBeacon(
                    API_URL,
                    blob
                );

                if (sent) {
                    return;
                }
            }

            fetch(
                API_URL,
                {
                    method: 'POST',
                    mode: 'no-cors',
                    credentials: 'omit',
                    headers: {
                        'Content-Type':
                            'text/plain;charset=UTF-8'
                    },
                    body: body,
                    keepalive: true
                }
            ).catch(function () {});

        } catch (error) {}

    }

    document.addEventListener(
        'click',
        function (event) {

            const link = event.target.closest(
                'a[href^="tel:"]'
            );

            if (!link) {
                return;
            }

            sendClick(link);

        },
        true
    );

})();
