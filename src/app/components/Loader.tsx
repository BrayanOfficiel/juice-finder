/**
 * Composant Loader - Affiche un indicateur de chargement
 */

'use client';

export default function Loader({ message = 'Chargement...' }: { message?: string }) {
  return (
    <div className="loader py-12">
      <div className="loader__spinner">
        <div className="loader__ring" />
        <div className="loader__ring loader__ring--active" />
      </div>
      <p className="loader__text">{message}</p>
    </div>
  );
}
