/**
 * API Route - Connexion utilisateur
 * POST /api/auth/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'L\'ID utilisateur est requis' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      );
    }

    // Si l'utilisateur a un mot de passe, le vérifier
    if (user.password) {
      if (!password) {
        return NextResponse.json(
          { error: 'Mot de passe requis', requiresPassword: true },
          { status: 401 }
        );
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mot de passe incorrect' },
          { status: 401 }
        );
      }
    }

    // Créer une session (stockée côté client)
    const session = {
      userId: user.id,
      username: user.username,
    };

    return NextResponse.json(session);
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}

