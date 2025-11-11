/**
 * API Route: /api/regions
 * GET: Récupère la liste unique des régions depuis la base MySQL
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Récupération des régions distinctes, triées
    const regions = await prisma.restaurant.findMany({
      where: {
        region: {
          not: null,
        },
      },
      select: {
        region: true,
      },
      distinct: ['region'],
      orderBy: {
        region: 'asc',
      },
    });
    
    // Extraction et nettoyage
    const regionList = regions
      .map(r => r.region)
      .filter((r): r is string => !!r && r.trim() !== '')
      .sort();
    
    return NextResponse.json({
      regions: regionList,
      count: regionList.length,
    });
    
  } catch (error) {
    console.error('Erreur API /api/regions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des régions' },
      { status: 500 }
    );
  }
}

