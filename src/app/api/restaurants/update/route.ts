/**
 * API Route: /api/restaurants/update
 * POST: Synchronise la base de données avec l'API OpenDataSoft
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';

// Configuration Next.js pour désactiver le timeout
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

const API_BASE_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records';
const BATCH_SIZE = 100; // Réduit pour éviter les timeouts

interface ApiRecord {
  name?: string;
  type?: string;
  phone?: string;
  website?: string;
  email?: string;
  cuisine?: string | string[];
  street?: string;
  housenumber?: string;
  postcode?: string; // Rarement rempli par OSM
  // Les vrais champs de l'API OpenDataSoft
  meta_code_com?: string;  // Code postal de la commune (le vrai champ à utiliser!)
  meta_name_com?: string;  // Nom de la commune (notre city)
  meta_code_dep?: string;  // Code du département (ex: "75")
  meta_name_dep?: string;  // Nom du département (ex: "Paris")
  meta_code_reg?: string;  // Code de la région
  meta_name_reg?: string;  // Nom de la région
  opening_hours?: string;
  wheelchair?: string;
  delivery?: string;
  takeaway?: string;
  outdoor_seating?: string;
  meta_geo_point?: {
    lat: number;
    lon: number;
  };
  meta_osm_id?: string;
  meta_osm_url?: string;
}

export async function POST() {
  try {
    console.log('🚀 Début de la synchronisation avec OpenDataSoft...');
    
    // Test de connexion à la base de données
    try {
      await prisma.$connect();
      console.log('✅ Connexion à MySQL réussie');
    } catch (dbError) {
      console.error('❌ Impossible de se connecter à MySQL:', dbError);
      return NextResponse.json(
        { 
          error: 'Erreur de connexion à la base de données',
          details: dbError instanceof Error ? dbError.message : 'Erreur inconnue'
        },
        { status: 500 }
      );
    }
    
    let offset = 0;
    let totalFetched = 0;
    let totalUpdated = 0;
    let hasMore = true;
    
    while (hasMore) {
      // L'API OpenDataSoft a une limite à offset=10000
      if (offset >= 10000) {
        console.log('⚠️  Limite API atteinte (offset 10000). Arrêt de la synchronisation.');
        hasMore = false;
        break;
      }
      
      // Récupération d'un lot depuis l'API
      const url = `${API_BASE_URL}?limit=${BATCH_SIZE}&offset=${offset}`;
      console.log(`📥 Récupération du lot ${offset / BATCH_SIZE + 1} (offset: ${offset})...`);
      
      const response = await axios.get(url, { timeout: 30000 });
      const data = response.data;
      
      if (!data.results || data.results.length === 0) {
        hasMore = false;
        break;
      }
      
      const records: ApiRecord[] = data.results;
      
      // Liste des régions DOM-TOM à exclure
      const domTomRegions = [
        'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte',
        'Saint-Pierre-et-Miquelon', 'Wallis-et-Futuna', 'Polynésie française',
        'Nouvelle-Calédonie', 'Saint-Barthélemy', 'Saint-Martin',
        'Collectivité de Saint-Martin', 'Terres australes et antarctiques françaises'
      ];
      
      // Filtrer uniquement ceux avec téléphone OU email ET un nom ET pas dans les DOM-TOM
      const validRecords = records.filter(r => 
        (r.phone || r.email) && 
        r.name && 
        r.name.trim() !== '' &&
        (!r.meta_name_reg || !domTomRegions.includes(r.meta_name_reg))
      );
      
      console.log(`📦 ${records.length} reçus, ${validRecords.length} valides (avec nom, contact, hors DOM-TOM). Traitement...`);
      
      totalFetched += validRecords.length;
      
      // Upsert en base de données
      for (const record of validRecords) {
        try {
          // Création d'un identifiant unique
          const uniqueId = record.meta_osm_id || 
                          `${record.name}-${record.meta_name_com}-${record.street}-${record.meta_geo_point?.lat}-${record.meta_geo_point?.lon}`;
          
          if (!uniqueId) continue;
          
          // Conversion cuisine en string si c'est un tableau
          const cuisineStr = record.cuisine 
            ? (Array.isArray(record.cuisine) ? record.cuisine.join(', ') : record.cuisine)
            : null;
          
          await prisma.restaurant.upsert({
            where: {
              meta_osm_id: uniqueId,
            },
            update: {
              name: record.name,
              type: record.type,
              phone: record.phone,
              website: record.website,
              email: record.email,
              cuisine: cuisineStr,
              street: record.street,
              housenumber: record.housenumber,
              postcode: record.meta_code_com || record.postcode, // Utiliser meta_code_com en priorité !
              city: record.meta_name_com,
              department: record.meta_name_dep,
              region: record.meta_name_reg,
              lat: record.meta_geo_point?.lat,
              lon: record.meta_geo_point?.lon,
              opening_hours: record.opening_hours,
              wheelchair: record.wheelchair,
              delivery: record.delivery,
              takeaway: record.takeaway,
              outdoor_seating: record.outdoor_seating,
              osm_id: record.meta_osm_id,
              osm_type: null,
              last_update: new Date(),
            },
            create: {
              meta_osm_id: uniqueId,
              name: record.name,
              type: record.type,
              phone: record.phone,
              website: record.website,
              email: record.email,
              cuisine: cuisineStr,
              street: record.street,
              housenumber: record.housenumber,
              postcode: record.meta_code_com || record.postcode, // Utiliser meta_code_com en priorité !
              city: record.meta_name_com,
              department: record.meta_name_dep,
              region: record.meta_name_reg,
              lat: record.meta_geo_point?.lat,
              lon: record.meta_geo_point?.lon,
              opening_hours: record.opening_hours,
              wheelchair: record.wheelchair,
              delivery: record.delivery,
              takeaway: record.takeaway,
              outdoor_seating: record.outdoor_seating,
              osm_id: record.meta_osm_id,
              osm_type: null,
            },
          });
          
          totalUpdated++;
        } catch (err) {
          console.error(`❌ Erreur lors de l'insertion/mise à jour:`, err);
        }
      }
      
      console.log(`✅ Lot traité. Total: ${totalUpdated} restaurants en base.`);
      
      // Vérifier s'il y a plus de données
      if (totalFetched >= data.total_count) {
        hasMore = false;
      } else {
        offset += BATCH_SIZE;
        // Pause de 1 seconde entre les requêtes pour éviter le rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Statistiques finales
    const finalCount = await prisma.restaurant.count();
    
    console.log('✅ Synchronisation terminée !');
    console.log(`📊 Total récupéré: ${totalFetched}`);
    console.log(`📊 Total mis à jour: ${totalUpdated}`);
    console.log(`📊 Total en base: ${finalCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Synchronisation réussie',
      stats: {
        fetched: totalFetched,
        updated: totalUpdated,
        total: finalCount,
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la synchronisation',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

