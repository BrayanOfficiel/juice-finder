/**
 * API Route: /api/restaurants/import-json
 * POST: Importe tous les restaurants depuis le JSON complet OpenDataSoft
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';

export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

const JSON_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/exports/json';

interface JsonRecord {
  name?: string;
  type?: string;
  phone?: string;
  website?: string;
  email?: string;
  cuisine?: string | string[];
  street?: string;
  housenumber?: string;
  postcode?: string; // Rarement utilisé par OSM
  meta_code_com?: string; // Code postal de la commune (le vrai champ à utiliser!)
  meta_name_com?: string; // Nom de la commune (notre city)
  meta_name_dep?: string; // Nom du département
  meta_code_dep?: string; // Code du département (ex: "75" pour Paris)
  meta_name_reg?: string; // Nom de la région
  meta_code_reg?: string; // Code de la région
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
    console.log('🚀 Début de l\'import JSON complet...');
    
    // Test connexion DB
    await prisma.$connect();
    console.log('✅ Connexion MySQL OK');
    
    // Téléchargement du JSON complet
    console.log(`📥 Téléchargement du JSON depuis: ${JSON_URL}`);
    console.log('⏱️  Cela peut prendre 1-2 minutes...');
    
    const response = await axios.get(JSON_URL, {
      timeout: 120000, // 2 minutes
      maxContentLength: 500 * 1024 * 1024, // 500MB max
      maxBodyLength: 500 * 1024 * 1024,
    });
    
    const allRecords: JsonRecord[] = response.data;
    
    console.log(`📦 ${allRecords.length} restaurants reçus`);
    
    // Liste des régions DOM-TOM à exclure
    const domTomRegions = [
      'Guadeloupe',
      'Martinique',
      'Guyane',
      'La Réunion',
      'Mayotte',
      'Saint-Pierre-et-Miquelon',
      'Wallis-et-Futuna',
      'Polynésie française',
      'Nouvelle-Calédonie',
      'Saint-Barthélemy',
      'Saint-Martin',
      'Collectivité de Saint-Martin',
      'Terres australes et antarctiques françaises'
    ];
    
    // Filtrer uniquement ceux avec téléphone OU email ET un nom ET pas dans les DOM-TOM
    const withContact = allRecords.filter(r => 
      (r.phone || r.email) && 
      r.name && 
      r.name.trim() !== '' &&
      (!r.meta_name_reg || !domTomRegions.includes(r.meta_name_reg))
    );
    console.log(`✅ ${withContact.length} restaurants valides (avec nom, contact, hors DOM-TOM)`);
    
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    // Import par lots de 100 pour éviter de surcharger la mémoire
    const BATCH_SIZE = 100;
    const totalBatches = Math.ceil(withContact.length / BATCH_SIZE);
    
    for (let i = 0; i < withContact.length; i += BATCH_SIZE) {
      const batch = withContact.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
      
      console.log(`📦 Traitement du lot ${batchNumber}/${totalBatches} (${batch.length} restaurants)...`);
      
      for (const record of batch) {
        try {
          // Génération d'un ID unique
          const uniqueId = record.meta_osm_id || `manual-${record.name}-${record.meta_name_com}-${Date.now()}-${Math.random()}`;
          
          // Conversion cuisine en string si c'est un tableau
          const cuisineStr = record.cuisine 
            ? (Array.isArray(record.cuisine) ? record.cuisine.join(', ') : record.cuisine)
            : null;
          
          const result = await prisma.restaurant.upsert({
            where: {
              meta_osm_id: uniqueId,
            },
            update: {
              name: record.name || null,
              type: record.type || null,
              phone: record.phone || null,
              website: record.website || null,
              email: record.email || null,
              cuisine: cuisineStr,
              street: record.street || null,
              housenumber: record.housenumber || null,
              postcode: record.meta_code_com || record.postcode || null, // Utiliser meta_code_com en priorité !
              city: record.meta_name_com || null,
              department: record.meta_name_dep || null,
              region: record.meta_name_reg || null,
              lat: record.meta_geo_point?.lat || null,
              lon: record.meta_geo_point?.lon || null,
              opening_hours: record.opening_hours || null,
              wheelchair: record.wheelchair || null,
              delivery: record.delivery || null,
              takeaway: record.takeaway || null,
              outdoor_seating: record.outdoor_seating || null,
              osm_id: record.meta_osm_id || null,
              osm_type: null,
              last_update: new Date(),
            },
            create: {
              meta_osm_id: uniqueId,
              name: record.name || null,
              type: record.type || null,
              phone: record.phone || null,
              website: record.website || null,
              email: record.email || null,
              cuisine: cuisineStr,
              street: record.street || null,
              housenumber: record.housenumber || null,
              postcode: record.meta_code_com || record.postcode || null, // Utiliser meta_code_com en priorité !
              city: record.meta_name_com || null,
              department: record.meta_name_dep || null,
              region: record.meta_name_reg || null,
              lat: record.meta_geo_point?.lat || null,
              lon: record.meta_geo_point?.lon || null,
              opening_hours: record.opening_hours || null,
              wheelchair: record.wheelchair || null,
              delivery: record.delivery || null,
              takeaway: record.takeaway || null,
              outdoor_seating: record.outdoor_seating || null,
              osm_id: record.meta_osm_id || null,
              osm_type: null,
            },
          });
          
          // Vérifier si c'était un insert ou un update
          if (result.created_at.getTime() === result.last_update?.getTime()) {
            inserted++;
          } else {
            updated++;
          }
          
        } catch (err) {
          errors++;
          console.error(`❌ Erreur pour ${record.name}:`, err);
        }
      }
      
      console.log(`✅ Lot ${batchNumber}/${totalBatches} traité - Total: ${inserted} insérés, ${updated} mis à jour, ${errors} erreurs`);
    }
    
    const finalCount = await prisma.restaurant.count();
    
    console.log('✅ Import JSON terminé !');
    console.log(`📊 Total reçus: ${allRecords.length}`);
    console.log(`📊 Avec contact: ${withContact.length}`);
    console.log(`📊 Insérés: ${inserted}`);
    console.log(`📊 Mis à jour: ${updated}`);
    console.log(`📊 Erreurs: ${errors}`);
    console.log(`📊 Total en base: ${finalCount}`);
    
    return NextResponse.json({
      success: true,
      message: 'Import JSON réussi',
      stats: {
        fetched: allRecords.length,
        withContact: withContact.length,
        inserted,
        updated,
        errors,
        total: finalCount,
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import JSON:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'import JSON',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

