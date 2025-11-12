/**
 * API Route: /api/cities
 * GET: Récupère la liste unique des villes depuis la base MySQL
 */

import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';

export async function GET() {
    try {
        // Récupération des villes distinctes, triées
        const cities = await prisma.restaurant.findMany({
            where: {
                city: {
                    not: null,
                },
            },
            select: {
                city: true,
            },
            distinct: ['city'],
            orderBy: {
                city: 'asc',
            },
        });

        // Extraction et nettoyage
        type CityRow = { city: string | null };

        const cityList = (cities as CityRow[])
            .map((c) => c.city)
            .filter((c: string | null): c is string => !!c && c.trim() !== "")
            .sort();

        return NextResponse.json({
            cities: cityList,
            count: cityList.length,
        });

    } catch (error) {
        console.error('Erreur API /api/cities:', error);
        return NextResponse.json(
            {error: 'Erreur lors de la récupération des villes'},
            {status: 500}
        );
    }
}

