/**
 * Composant UpdateButton - Bouton pour synchroniser la base avec l'API
 */

'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

interface UpdateStats {
  fetched: number;
  updated: number;
  total: number;
}

export default function UpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [stats, setStats] = useState<UpdateStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    if (isUpdating) return;
    
    if (!confirm('Synchroniser tous les restaurants depuis OpenDataSoft ?\n\n⏱️ Cela peut prendre 2-3 minutes.')) {
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    setStats(null);

    try {
      console.log('📥 Synchronisation en cours...');
      
      const response = await axios.post('/api/restaurants/import-json', {}, {
        timeout: 300000, // 5 minutes
      });

      if (response.data.success) {
        setStats({
          fetched: response.data.stats.withContact,
          updated: response.data.stats.inserted + response.data.stats.updated,
          total: response.data.stats.total,
        });
        console.log('✅ Synchronisation réussie:', response.data.stats);
      } else {
        throw new Error('La synchronisation a échoué');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
      
      if (axios.isAxiosError(err) && err.response) {
        setError(
          `Erreur ${err.response.status}: ${err.response.data?.details || err.response.data?.error || err.message}`
        );
      } else {
        setError(
          err instanceof Error 
            ? err.message 
            : 'Erreur lors de la synchronisation'
        );
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer TOUS les restaurants de la base ?')) {
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    setStats(null);

    try {
      const response = await axios.delete('/api/restaurants/debug');
      alert(`✅ ${response.data.message}`);
      setStats({ fetched: 0, updated: 0, total: 0 });
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors de la suppression');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm('🧹 Nettoyer les restaurants sans nom de la base ?')) {
      return;
    }
    
    setIsUpdating(true);
    setError(null);

    try {
      const response = await axios.post('/api/restaurants/cleanup');
      alert(`✅ ${response.data.message}\n\nRestants: ${response.data.remaining}`);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Erreur lors du nettoyage');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="update-widget">
      <div className="update-panel update-panel--dark">
        {/* Bouton principal de synchronisation */}
        <button
          onClick={handleSync}
          disabled={isUpdating}
          className={`btn-sync btn-sync--dark ${isUpdating ? 'is-loading' : ''}`}
        >
          {isUpdating ? (
            <>
              <div className="btn-sync__spinner" />
              <span>Synchronisation...</span>
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faSync} className="h-5 w-5" />
              <span>Synchroniser</span>
            </>
          )}
        </button>

        {/* Statistiques de synchronisation */}
        {stats && (
          <div className="update-panel__stats mt-3">
            <h4 className="text-sm font-semibold text-green-800 mb-2">
              ✅ Synchronisation réussie !
            </h4>
            <div className="space-y-1 text-xs text-green-700">
              <p>• Récupérés: {stats.fetched.toLocaleString('fr-FR')}</p>
              <p>• Mis à jour: {stats.updated.toLocaleString('fr-FR')}</p>
              <p>• Total en base: {stats.total.toLocaleString('fr-FR')}</p>
            </div>
          </div>
        )}

        {/* Erreur */}
        {error && (
          <div className="update-panel__error mt-3">
            <h4 className="text-sm font-semibold text-red-800 mb-1">
              ❌ Erreur
            </h4>
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {/* Informations */}

          {/*  ADMIN ONLY*/}
        {!isUpdating && !stats && !error && (
          <div className="update-panel__info">
            <div className="mt-2 space-y-1">
              <button
                onClick={handleCleanup}
                className="update-panel__small-btn update-panel__small-btn--warn"
              >
                🧹 Nettoyer (supprimer sans nom)
              </button>
              <button
                onClick={handleReset}
                className="update-panel__small-btn update-panel__small-btn--danger"
              >
                🗑️ Vider la base (Reset)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
