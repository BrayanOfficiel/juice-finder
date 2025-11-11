/**
 * API Route: /api/restaurants/test-update
 * POST: Test de synchronisation avec seulement 20 restaurants (avec téléphone ou email)
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import axios from 'axios';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

const API_BASE_URL = 'https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/osm-france-food-service/records';

interface ApiRecord {
  name?: string;
  type?: string;
  phone?: string;
  website?: string;
  email?: string;
  cuisine?: string | string[];
  street?: string;
  housenumber?: string;
  postcode?: string; // Rarement rempli
  // Les vrais champs de l'API OpenDataSoft
  meta_code_com?: string;  // Code postal de la commune (le vrai champ à utiliser!)
  meta_name_com?: string;  // Nom de la commune (notre city)
  meta_code_dep?: string;  // Code du département
  meta_name_dep?: string;  // Nom du département
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
    console.log('🧪 Test de synchronisation...');
    
    // Test connexion DB
    await prisma.$connect();
    console.log('✅ Connexion MySQL OK');
    
    // Récupération de 100 restaurants pour avoir au moins 20 avec contact
    const url = `${API_BASE_URL}?limit=100&offset=0`;
    console.log(`📥 Appel API: ${url}`);
    
    let response;
    try {
      response = await axios.get(url, { 
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      });
    } catch (axiosError) {
      console.error('❌ Erreur Axios:', axiosError);
      if (axios.isAxiosError(axiosError)) {
        console.error('Status:', axiosError.response?.status);
        console.error('Data:', axiosError.response?.data);
        console.error('Headers:', axiosError.response?.headers);
      }
      throw axiosError;
    }
    
    const data = response.data;
    
    console.log(`📦 ${data.results.length} restaurants reçus au total`);
    
    // Liste des régions DOM-TOM à exclure
    const domTomRegions = [
      'Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte',
      'Saint-Pierre-et-Miquelon', 'Wallis-et-Futuna', 'Polynésie française',
      'Nouvelle-Calédonie', 'Saint-Barthélemy', 'Saint-Martin',
      'Collectivité de Saint-Martin', 'Terres australes et antarctiques françaises'
    ];
    
    // Filtrer ceux avec téléphone OU email ET un nom ET pas dans les DOM-TOM
    const withContact: ApiRecord[] = data.results.filter((r: ApiRecord) => 
      (r.phone || r.email) && 
      r.name && 
      r.name.trim() !== '' &&
      (!r.meta_name_reg || !domTomRegions.includes(r.meta_name_reg))
    );
    console.log(`✅ ${withContact.length} restaurants valides (avec nom, contact, hors DOM-TOM)`);
    
    const validRecords = withContact.slice(0, 20);
    console.log(`🎯 Test avec les ${validRecords.length} premiers`);
    
    let inserted = 0;
    let index = 0;
    
    for (const record of validRecords) {
      try {
        // Génération d'un ID unique
        const uniqueId = record.meta_osm_id || `manual-${record.name}-${record.meta_name_com}-${index}-${Date.now()}`;
        
        // Conversion cuisine en string si c'est un tableau
        const cuisineStr = record.cuisine 
          ? (Array.isArray(record.cuisine) ? record.cuisine.join(', ') : record.cuisine)
          : null;
        
        console.log(`🔄 Traitement: ${record.name} - ${record.meta_name_com}`);
        
        await prisma.restaurant.upsert({
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
        
        inserted++;
        index++;
        console.log(`✅ ${inserted}/${validRecords.length} - ${record.name}`);
      } catch (err) {
        console.error(`❌ Erreur insertion pour ${record.name}:`, err);
        index++;
      }
    }
    
    const total = await prisma.restaurant.count();
    
    console.log(`📊 Total reçus: ${data.results.length}`);
    console.log(`📊 Avec contact: ${validRecords.length}`);
    console.log(`📊 Insérés: ${inserted}`);
    
    return NextResponse.json({
      success: true,
      message: `Test réussi (${validRecords.length}/${data.results.length} avec contact)`,
      stats: {
        fetched: validRecords.length,
        updated: inserted,
        total,
      },
    });
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    return NextResponse.json(
      { 
        error: 'Erreur test',
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

