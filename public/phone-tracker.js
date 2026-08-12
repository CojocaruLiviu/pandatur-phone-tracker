(function () {

    'use strict';


    console.log(
        '✅ PandaTour Phone Tracker LOADED'
    );


    const API_URL =
        'https://pandatur-phone-tracker.vercel.app/api/phone-click';


    // ==========================================
    // SEND CLICK
    // ==========================================

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

            if (
                navigator.sendBeacon
            ) {

                const blob =
                    new Blob(
                        [body],
                        {
                            type:
                                'application/json'
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
            // FALLBACK FETCH
            // ======================================

            fetch(
                API_URL,
                {

                    method: 'POST',

                    headers: {

                        'Content-Type':
                            'application/json'

                    },

                    body: body,

                    keepalive: true

                }
            )

            .then(
                function (response) {

                    console.log(
                        '📡 API STATUS:',
                        response.status
                    );

                    return response.text();

                }
            )

            .then(
                function (result) {

                    console.log(
                        '📨 API RESPONSE:',
                        result
                    );

                }
            )

            .catch(
                function (error) {

                    console.error(
                        '❌ API ERROR:',
                        error
                    );

                }
            );


        } catch (error) {

            console.error(
                '❌ Tracker error:',
                error
            );

        }

    }


    // ==========================================
    // CLICK LISTENER
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
