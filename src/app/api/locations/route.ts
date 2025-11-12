/**
 * API Route: /api/locations
 * GET: Récupère la liste combinée des villes (sans arrondissements) et départements
 */

import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';

export async function GET() {
    try {
        // Récupération des villes et départements en parallèle
        const [cities, departments] = await Promise.all([
            prisma.restaurant.findMany({
                where: {
                    city: {
                        not: null,
                    },
                },
                select: {
                    city: true,
                },
                distinct: ['city'],
            }),
            prisma.restaurant.findMany({
                where: {
                    department: {
                        not: null,
                    },
                },
                select: {
                    department: true,
                },
                distinct: ['department'],
            }),
        ]);

        // Extraction et nettoyage
        type CityRow = { city: string | null };
        type DepartmentRow = { department: string | null };

        // Filtrer les villes en EXCLUANT les arrondissements
        const cityList = (cities as CityRow[])
            .map((c) => c.city)
            .filter((c: string | null): c is string => 
                !!c && 
                c.trim() !== "" &&
                // Exclure les arrondissements (contiennent "Xe Arrondissement")
                !/\d+e?r?\s+Arrondissement$/i.test(c)
            )
            .map(c => {
                // Pour les villes principales (Paris, Lyon, Marseille), on garde juste le nom
                // sans "Arrondissement" au cas où
                return c.trim();
            });
        
        const departmentList = (departments as DepartmentRow[])
            .map((d) => d.department)
            .filter((d: string | null): d is string => !!d && d.trim() !== "");

        // Fusionner et dédupliquer
        const combinedSet = new Set([...cityList, ...departmentList]);
        const locationList = Array.from(combinedSet).sort();

        return NextResponse.json({
            locations: locationList,
            count: locationList.length,
        });

    } catch (error) {
        console.error('Erreur API /api/locations:', error);
        return NextResponse.json(
            {error: 'Erreur lors de la récupération des localisations'},
            {status: 500}
        );
    }
}

