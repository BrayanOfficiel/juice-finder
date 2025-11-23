/**
 * API Routes - Gestion des restaurants archivés
 * GET /api/archived - Récupérer les restaurants archivés de l'utilisateur
 * POST /api/archived - Archiver un restaurant
 * DELETE /api/archived - Désarchiver un restaurant
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer les restaurants archivés d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const archived = await prisma.archivedRestaurant.findMany({
      where: {
        userId: parseInt(userId),
      },
      include: {
        restaurant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(archived);
  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants archivés:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des restaurants archivés' },
      { status: 500 }
    );
  }
}

// POST - Archiver un restaurant
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { restaurantId } = body;

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'L\'ID du restaurant est requis' },
        { status: 400 }
      );
    }

    // Vérifier si le restaurant est déjà archivé
    const existingArchived = await prisma.archivedRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId: parseInt(userId),
          restaurantId: parseInt(restaurantId),
        },
      },
    });

    if (existingArchived) {
      return NextResponse.json(
        { error: 'Ce restaurant est déjà archivé' },
        { status: 409 }
      );
    }

    const archived = await prisma.archivedRestaurant.create({
      data: {
        userId: parseInt(userId),
        restaurantId: parseInt(restaurantId),
      },
      include: {
        restaurant: true,
      },
    });

    return NextResponse.json(archived, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'archivage du restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'archivage du restaurant' },
      { status: 500 }
    );
  }
}

// DELETE - Désarchiver un restaurant
export async function DELETE(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'L\'ID du restaurant est requis' },
        { status: 400 }
      );
    }

    await prisma.archivedRestaurant.delete({
      where: {
        userId_restaurantId: {
          userId: parseInt(userId),
          restaurantId: parseInt(restaurantId),
        },
      },
    });

    return NextResponse.json({ message: 'Restaurant désarchivé' });
  } catch (error) {
    console.error('Erreur lors du désarchivage du restaurant:', error);
    return NextResponse.json(
      { error: 'Erreur lors du désarchivage du restaurant' },
      { status: 500 }
    );
  }
}

