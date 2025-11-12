/**
 * API Route: /api/arrondissements
 * GET: Récupère la liste des arrondissements depuis la colonne city
 * Format: "Paris 1er Arrondissement", "Lyon 3e Arrondissement", etc.
 */

import {NextResponse} from 'next/server';
import {prisma} from '@/lib/db';

export async function GET() {
    try {
        // Récupération des villes distinctes
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
        });

        // Filtrer uniquement les arrondissements (contiennent "Arrondissement")
        type CityRow = { city: string | null };
        
        const arrondissements = (cities as CityRow[])
            .filter((c): c is { city: string } => 
                !!c.city && 
                c.city.trim() !== "" &&
                /\d+e?r?\s+Arrondissement$/i.test(c.city)
            )
            .map(c => c.city.trim())
            .sort((a, b) => {
                // Extraire la ville et le numéro pour un tri correct
                const matchA = a.match(/^(.+?)\s+(\d+)e?r?\s+Arrondissement$/i);
                const matchB = b.match(/^(.+?)\s+(\d+)e?r?\s+Arrondissement$/i);
                
                if (matchA && matchB) {
                    const [, cityA, numA] = matchA;
                    const [, cityB, numB] = matchB;
                    
                    // D'abord trier par ville
                    if (cityA !== cityB) {
                        return cityA.localeCompare(cityB);
                    }
                    // Puis par numéro d'arrondissement
                    return parseInt(numA) - parseInt(numB);
                }
                
                return a.localeCompare(b);
            });

        return NextResponse.json({
            arrondissements,
            count: arrondissements.length,
        });

    } catch (error) {
        console.error('Erreur API /api/arrondissements:', error);
        return NextResponse.json(
            {error: 'Erreur lors de la récupération des arrondissements'},
            {status: 500}
        );
    }
}

