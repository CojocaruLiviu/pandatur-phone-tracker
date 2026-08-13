import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {

    res.setHeader(
        'Access-Control-Allow-Origin',
        'https://pandatur.md'
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
        'Access-Control-Allow-Credentials',
        'true'
    );

    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false
        });
    }

    try {

        let data = req.body;

        if (typeof data === 'string') {
            data = JSON.parse(data);
        }

        const page = data?.page || '';

        if (!page) {
            return res.status(400).json({
                success: false,
                error: 'Page missing'
            });
        }

        const url = new URL(page);

        const pathParts =
            url.pathname
                .split('/')
                .filter(Boolean);

        /*
         * Exemplu:
         *
         * /ro/excursion/istanbul-excurs/177
         *
         * pathParts:
         *
         * [0] ro
         * [1] excursion
         * [2] istanbul-excurs
         * [3] 177
         */

        const excursionIndex =
            pathParts.indexOf('excursion');

        if (
            excursionIndex === -1 ||
            !pathParts[excursionIndex + 1]
        ) {

            return res.status(400).json({
                success: false,
                error: 'Excursion URL not detected'
            });

        }

        const slug =
            pathParts[excursionIndex + 1];

        const excursionId =
            pathParts[excursionIndex + 2] || '';


        /*
         * Data Moldovei.
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
         * Exemplu:
         *
         * clicks:2026-08-13:istanbul-excurs
         */

        const key =
            `clicks:${date}:${slug}`;


        /*
         * +1 click.
         */

        await redis.incr(key);


        /*
         * Salvăm și ID-ul excursiei.
         */

        await redis.hset(
            `info:${slug}`,
            {
                slug: slug,
                id: excursionId
            }
        );


        return res.status(200).json({
            success: true
        });


    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: error.message
        });

    }

}
