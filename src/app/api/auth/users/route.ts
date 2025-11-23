/**
 * API Routes - Gestion des utilisateurs
 * GET /api/auth/users - Liste tous les utilisateurs
 * POST /api/auth/users - Créer un nouvel utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// GET - Récupérer tous les utilisateurs
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        password: true, // Pour savoir si l'user a un mot de passe
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Ne renvoyer qu'un booléen pour indiquer si l'user a un mot de passe
    const usersWithPasswordFlag = users.map(user => ({
      id: user.id,
      username: user.username,
      createdAt: user.createdAt,
      hasPassword: !!user.password,
    }));

    return NextResponse.json(usersWithPasswordFlag);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des utilisateurs' },
      { status: 500 }
    );
  }
}

// POST - Créer un nouvel utilisateur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { error: 'Le nom d\'utilisateur est requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ce nom d\'utilisateur existe déjà' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe s'il est fourni
    const hashedPassword = password && password.trim().length > 0
      ? await bcrypt.hash(password, 10)
      : null;

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'utilisateur' },
      { status: 500 }
    );
  }
}

