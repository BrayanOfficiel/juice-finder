/**
 * API Route: /api/restaurants
 * GET: Récupère les restaurants depuis la base MySQL
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { Restaurant as PrismaRestaurant } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Paramètres de recherche
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const region = searchParams.get('region') || '';
    const department = searchParams.get('department') || '';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const sortBy = searchParams.get('sortBy') || 'none';
    const userLat = parseFloat(searchParams.get('userLat') || '0');
    const userLon = parseFloat(searchParams.get('userLon') || '0');
    
    // Construction de la requête WHERE
    const where: {
      name?: { contains: string } | { not: null };
      type?: string;
      region?: string;
      department?: string;
    } = {};
    
    // TOUJOURS exclure les restaurants sans nom
    where.name = search 
      ? { contains: search }
      : { not: null };
    
    // Filtre par type
    if (type) {
      where.type = type;
    }
    
    // Filtre par région
    if (region) {
      where.region = region;
    }
    
    // Filtre par département (égalité exacte pour MySQL)
    if (department) {
      where.department = department;
    }
    
    // Récupération des données avec pagination
    let restaurants: PrismaRestaurant[];
    let totalCount: number;

    // Si tri par distance, utiliser une requête SQL brute avec formule Haversine
    if (sortBy === 'distance' && userLat !== 0 && userLon !== 0) {
      // Construction de la clause WHERE pour SQL brut
      let whereClause = 'WHERE name IS NOT NULL';
      const queryParams: string[] = [];
      
      if (search) {
        whereClause += ' AND name LIKE ?';
        queryParams.push(`%${search}%`);
      }
      if (type) {
        whereClause += ' AND type = ?';
        queryParams.push(type);
      }
      if (region) {
        whereClause += ' AND region = ?';
        queryParams.push(region);
      }
      if (department) {
        whereClause += ' AND department = ?';
        queryParams.push(department);
      }
      
      // Calcul de la distance avec la formule Haversine (version simplifiée)
      // Distance en km = 111.045 * sqrt((lat2-lat1)^2 + (cos(lat1)*(lon2-lon1))^2)
      const distanceFormula = `
        (111.045 * SQRT(
          POW(lat - ${userLat}, 2) + 
          POW(COS(RADIANS(${userLat})) * (lon - ${userLon}), 2)
        ))
      `;
      
      // Requête avec distance calculée
      const query = `
        SELECT *, ${distanceFormula} as distance
        FROM restaurants
        ${whereClause}
        AND lat IS NOT NULL 
        AND lon IS NOT NULL
        ORDER BY distance ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      
      const countQuery = `
        SELECT COUNT(*) as count
        FROM restaurants
        ${whereClause}
        AND lat IS NOT NULL 
        AND lon IS NOT NULL
      `;
      
      try {
        // Mise à jour des types pour les résultats des requêtes SQL brutes
        const [restaurantsResult, countResult] = await Promise.all([
          prisma.$queryRawUnsafe<Array<{ [key: string]: unknown }>>(query, ...queryParams),
          prisma.$queryRawUnsafe<Array<{ count: number }>>(countQuery, ...queryParams),
        ]);

        // Conversion explicite des résultats pour correspondre au type attendu
        restaurants = restaurantsResult.map((r) => ({
          id: r.id as number,
          name: r.name as string | null,
          type: r.type as string | null,
          phone: r.phone as string | null,
          website: r.website as string | null,
          email: r.email as string | null,
          cuisine: r.cuisine as string | null,
          street: r.street as string | null,
          housenumber: r.housenumber as string | null,
          postcode: r.postcode as string | null,
          city: r.city as string | null,
          region: r.region as string | null,
          department: r.department as string | null,
          opening_hours: r.opening_hours as string | null,
          wheelchair: r.wheelchair as string | null,
          delivery: r.delivery as string | null,
          takeaway: r.takeaway as string | null,
          outdoor_seating: r.outdoor_seating as string | null,
          lat: r.lat as number | null,
          lon: r.lon as number | null,
          osm_id: r.osm_id as string | null,
          osm_type: r.osm_type as string | null,
          meta_osm_id: r.meta_osm_id as string | null,
          meta_osm_type: r.meta_osm_type as string | null,
          last_update: r.last_update as Date | null,
          created_at: r.created_at as Date || new Date(), // Correction pour éviter null
        }));

        totalCount = Number(countResult[0]?.count) || 0;
      } catch (error) {
        console.error('Erreur requête SQL distance:', error);
        throw error;
      }
    } else {
      // Tri par nom (ordre alphabétique)
      const orderBy = sortBy === 'name' ? { name: 'asc' as const } : { name: 'asc' as const };
      
      [restaurants, totalCount] = await Promise.all([
        prisma.restaurant.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy,
        }),
        prisma.restaurant.count({ where }),
      ]);
    }
    
    // Transformation des données pour correspondre au format attendu
    const results = restaurants.map((r: PrismaRestaurant) => ({
      id: r.id.toString(),
      name: r.name,
      type: r.type,
      cuisine: r.cuisine,
      phone: r.phone,
      website: r.website,
      email: r.email,
      street: r.street,
      housenumber: r.housenumber,
      postcode: r.postcode,
      city: r.city,
      region: r.region,
      department: r.department,
      opening_hours: r.opening_hours,
      wheelchair: r.wheelchair,
      delivery: r.delivery,
      takeaway: r.takeaway,
      outdoor_seating: r.outdoor_seating,
      meta_geo_point: r.lat && r.lon ? { lat: r.lat, lon: r.lon } : undefined,
      osm_id: r.osm_id,
      osm_type: r.osm_type,
    }));
    
    return NextResponse.json({
      total_count: totalCount,
      results,
    });
    
  } catch (error) {
    console.error('Erreur API /api/restaurants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des restaurants' },
      { status: 500 }
    );
  }
}
