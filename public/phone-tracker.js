(function () {

    'use strict';

    const API_URL =
        'https://pandatur-phone-tracker.vercel.app/api/phone-click';


    console.log(
        '✅ PandaTour Phone Tracker LOADED'
    );


    function sendClick(link) {

        try {

            const data = {

                phone:
                    link.getAttribute('href') || '',

                page:
                    window.location.href,

                title:
                    document.title || '',

                referrer:
                    document.referrer || '',

                timestamp:
                    new Date().toISOString()

            };


            console.log(
                '📞 PHONE CLICK:',
                data
            );


            const body =
                JSON.stringify(data);


            // ======================================
            // SENDBEACON
            // ======================================

            if (navigator.sendBeacon) {

                const blob =
                    new Blob(
                        [body],
                        {
                            type:
                                'text/plain;charset=UTF-8'
                        }
                    );


                const sent =
                    navigator.sendBeacon(
                        API_URL,
                        blob
                    );


                console.log(
                    '📡 sendBeacon:',
                    sent
                );


                if (sent) {

                    return;

                }

            }


            // ======================================
            // FALLBACK
            // ======================================

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
            )
            .then(function () {

                console.log(
                    '✅ Tracking request sent'
                );

            })
            .catch(function (error) {

                console.error(
                    '❌ Tracking error:',
                    error
                );

            });


        } catch (error) {

            console.error(
                '❌ Tracker error:',
                error
            );

        }

    }


    // ==========================================
    // DETECT ALL TEL LINKS
    // ==========================================

    document.addEventListener(
        'click',
        function (event) {

            const link =
                event.target.closest(
                    'a[href^="tel:"]'
                );


            if (!link) {

                return;

            }


            console.log(
                '📞 Telephone link detected:',
                link.href
            );


            sendClick(link);

        },
        true
    );


})();
