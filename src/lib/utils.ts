/**
 * Fonctions utilitaires pour formater et manipuler les données
 */

import type {Restaurant} from './types';

/**
 * Formate un numéro de téléphone français
 */
export function formatPhoneNumber(phone: string | undefined): string {
    if (!phone) return 'Non disponible';

    // Nettoie et formate le numéro
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }

    if (cleaned.length === 9) {
        return `0${cleaned}`.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }

    return phone;
}

/**
 * Formate les horaires d'ouverture
 */
export function formatOpeningHours(hours: string | undefined): string {
    if (!hours) return 'Non disponible';

    // Nettoie et formate les horaires
    return hours.replace(/;/g, ' • ');
}

/**
 * Génère une adresse complète
 */
export function formatAddress(restaurant: Restaurant): string {
    const parts = [];

    if (restaurant.housenumber) parts.push(restaurant.housenumber);
    if (restaurant.street) parts.push(restaurant.street);

    const street = parts.join(' ');
    const cityParts = [];

    if (restaurant.city) cityParts.push(restaurant.city);
    if (restaurant.postcode) cityParts.push(restaurant.postcode);

    const city = cityParts.join(' ');

    const fullAddress = [street, city].filter(Boolean).join(', ');

    return fullAddress || 'Adresse non disponible';
}

/**
 * Traduit le type d'établissement
 */
export function translateType(type: string | undefined): string {
    if (!type) return 'Établissement';

    const translations: Record<string, string> = {
        restaurant: 'Restaurant',
        bar: 'Bar',
        cafe: 'Café',
        fast_food: 'Fast Food',
        pub: 'Pub',
        biergarten: 'Brasserie',
        food_court: 'Court de restauration',
        ice_cream: 'Glacier',
    };

    return translations[type] || type.charAt(0).toUpperCase() + type.slice(1);
}

/**
 * Génère le lien OpenStreetMap
 */
export function getOsmLink(restaurant: Restaurant): string {
    if (restaurant.osm_id && restaurant.osm_type) {
        const typeMap: Record<string, string> = {
            node: 'node',
            way: 'way',
            relation: 'relation',
        };
        const osmType = typeMap[restaurant.osm_type] || 'node';
        return `https://www.openstreetmap.org/${osmType}/${restaurant.osm_id}`;
    }

    if (restaurant.meta_geo_point) {
        const {lat, lon} = restaurant.meta_geo_point;
        return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}&zoom=18`;
    }

    return 'https://www.openstreetmap.org/';
}

/** Génère le lien Google Maps */
export function getGoogleMapsLink(restaurant: Restaurant, type: string = 'name' ): string {

    if (type === 'coordinates' && restaurant.meta_geo_point) {
        const {lat, lon} = restaurant.meta_geo_point;
        return `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    } else if (type === 'name' && restaurant.name) {
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}${restaurant.postcode ? '+' + encodeURIComponent(restaurant.postcode) : ''}${restaurant.city ? '+' + encodeURIComponent(restaurant.city) : ''}`;
    } else {
        return 'https://www.google.com/maps';
    }
}

/**
 * Exporte les données en CSV
 */
export function exportToCSV(restaurants: Restaurant[]): void {
    if (restaurants.length === 0) {
        alert('Aucun résultat à exporter');
        return;
    }

    // En-têtes du CSV
    const headers = [
        'Nom',
        'Type',
        'Téléphone',
        'Email',
        'Site web',
        'Adresse',
        'Code postal',
        'Ville',
        'Région',
        'Département',
        'Horaires',
        'Latitude',
        'Longitude',
    ];

    // Génère les lignes
    const rows = restaurants.map(restaurant => [
        restaurant.name || '',
        translateType(restaurant.type) || '',
        restaurant.phone || '',
        restaurant.email || '',
        restaurant.website || '',
        formatAddress(restaurant),
        restaurant.postcode || '',
        restaurant.city || '',
        restaurant.region || '',
        restaurant.department || '',
        formatOpeningHours(restaurant.opening_hours),
        restaurant.meta_geo_point?.lat || '',
        restaurant.meta_geo_point?.lon || '',
    ]);

    // Convertit en CSV
    const csvContent = [
        headers.join(';'),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
    ].join('\n');

    // Télécharge le fichier
    const blob = new Blob(['\ufeff' + csvContent], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `juice-finder-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Copie du texte dans le presse-papiers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erreur lors de la copie:', err);
        return false;
    }
}

/**
 * Débounce une fonction
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

