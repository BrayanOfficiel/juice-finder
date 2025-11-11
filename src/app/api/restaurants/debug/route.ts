/**
 * API Route: /api/restaurants/debug
 * GET: Liste tous les restaurants en base (pour debug)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        phone: true,
        email: true,
        city: true,
        meta_osm_id: true,
        created_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50, // Limité à 50 pour ne pas surcharger
    });
    
    const total = await prisma.restaurant.count();
    
    return NextResponse.json({
      total,
      showing: restaurants.length,
      restaurants,
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Supprimer tous les restaurants (pour reset en dev)
    const result = await prisma.restaurant.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `${result.count} restaurants supprimés`,
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

