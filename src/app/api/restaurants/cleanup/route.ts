/**
 * API Route: /api/restaurants/cleanup
 * POST: Nettoie la base en supprimant les restaurants sans nom
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    console.log('🧹 Nettoyage de la base de données...');
    
    // Supprimer tous les restaurants sans nom
    const result = await prisma.restaurant.deleteMany({
      where: {
        OR: [
          { name: null },
          { name: '' },
        ]
      }
    });
    
    console.log(`✅ ${result.count} restaurants sans nom supprimés`);
    
    const remaining = await prisma.restaurant.count();
    
    return NextResponse.json({
      success: true,
      message: `${result.count} restaurants sans nom supprimés`,
      deleted: result.count,
      remaining,
    });
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors du nettoyage',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

