(function () {
    'use strict';

    const API_URL = 'https://pandatur-phone-tracker.vercel.app/api/phone-click';

    function sendClick(link) {
        try {
            const data = {
                phone: link.getAttribute('href') || '',
                page: window.location.href,
                title: document.title || '',
                referrer: document.referrer || '',
                timestamp: new Date().toISOString()
            };

            const body = JSON.stringify(data);

            if (navigator.sendBeacon) {
                const blob = new Blob([body], {
                    type: 'application/json'
                });

                navigator.sendBeacon(API_URL, blob);
            } else {
                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body,
                    keepalive: true
                }).catch(() => {});
            }

        } catch (e) {
            console.error('Phone tracker:', e);
        }
    }

    document.addEventListener('click', function (event) {

        const link = event.target.closest('a[href^="tel:"]');

        if (!link) return;

        sendClick(link);

    }, true);

})();
