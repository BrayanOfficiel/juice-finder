/**
 * API Routes - Gestion des restaurants marqués
 * GET /api/bookmarks - Récupérer les bookmarks de l'utilisateur
 * POST /api/bookmarks - Ajouter un bookmark
 * DELETE /api/bookmarks - Supprimer un bookmark
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Récupérer les bookmarks d'un utilisateur
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const bookmarks = await prisma.bookmarkedRestaurant.findMany({
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

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Erreur lors de la récupération des bookmarks:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des bookmarks' },
      { status: 500 }
    );
  }
}

// POST - Ajouter un bookmark
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

    // Vérifier si le bookmark existe déjà
    const existingBookmark = await prisma.bookmarkedRestaurant.findUnique({
      where: {
        userId_restaurantId: {
          userId: parseInt(userId),
          restaurantId: parseInt(restaurantId),
        },
      },
    });

    if (existingBookmark) {
      return NextResponse.json(
        { error: 'Ce restaurant est déjà marqué' },
        { status: 409 }
      );
    }

    const bookmark = await prisma.bookmarkedRestaurant.create({
      data: {
        userId: parseInt(userId),
        restaurantId: parseInt(restaurantId),
      },
      include: {
        restaurant: true,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de l\'ajout du bookmark:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout du bookmark' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un bookmark
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

    await prisma.bookmarkedRestaurant.delete({
      where: {
        userId_restaurantId: {
          userId: parseInt(userId),
          restaurantId: parseInt(restaurantId),
        },
      },
    });

    return NextResponse.json({ message: 'Bookmark supprimé' });
  } catch (error) {
    console.error('Erreur lors de la suppression du bookmark:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du bookmark' },
      { status: 500 }
    );
  }
}

