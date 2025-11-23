/**
 * Composant UserSelection - Écran de sélection/création d'utilisateur
 */

'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faUser, faLock } from '@fortawesome/free-solid-svg-icons';

interface User {
  id: number;
  username: string;
  hasPassword: boolean;
  createdAt: string;
}

interface UserSelectionProps {
  onUserSelected: (userId: number, username: string) => void;
}

export default function UserSelection({ onUserSelected }: UserSelectionProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Charger les utilisateurs
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users');
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('Impossible de charger les utilisateurs');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = async (user: User) => {
    setError('');
    
    // Si l'utilisateur n'a pas de mot de passe, connexion directe
    if (!user.hasPassword) {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id }),
        });

        if (response.ok) {
          onUserSelected(user.id, user.username);
        } else {
          setError('Erreur lors de la connexion');
        }
      } catch (err) {
        setError('Erreur lors de la connexion');
        console.error(err);
      }
    } else {
      // Afficher le formulaire de mot de passe
      setSelectedUser(user);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          password,
        }),
      });

      if (response.ok) {
        onUserSelected(selectedUser.id, selectedUser.username);
      } else {
        const data = await response.json();
        setError(data.error || 'Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la connexion');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUsername,
          password: newPassword,
        }),
      });

      if (response.ok) {
        const newUser = await response.json();
        setShowCreateUser(false);
        setNewUsername('');
        setNewPassword('');
        await fetchUsers();
        
        // Connexion automatique
        onUserSelected(newUser.id, newUser.username);
      } else {
        const data = await response.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur lors de la création de l\'utilisateur');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran de saisie du mot de passe
  if (selectedUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#011C2D' }}>
        <div className="w-full max-w-md p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => {
                setSelectedUser(null);
                setPassword('');
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Retour
            </button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E5EDFF' }}>
                <FontAwesomeIcon icon={faUser} className="text-3xl" style={{ color: '#2853FE' }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#092C42' }}>{selectedUser.username}</h2>
              <p className="text-sm text-gray-600 mt-2">Entrez votre mot de passe</p>
            </div>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#092C42' }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    color: '#092C42',
                    backgroundColor: '#FFFFFF'
                  }}
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#2853FE' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a3fcc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2853FE'}
              >
                {isSubmitting ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Écran de création d'utilisateur
  if (showCreateUser) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#011C2D' }}>
        <div className="w-full max-w-md p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <button
              onClick={() => {
                setShowCreateUser(false);
                setNewUsername('');
                setNewPassword('');
                setError('');
              }}
              className="text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              ← Retour
            </button>
            
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E5EDFF' }}>
                <FontAwesomeIcon icon={faPlus} className="text-3xl" style={{ color: '#2853FE' }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: '#092C42' }}>Nouvel utilisateur</h2>
              <p className="text-sm text-gray-600 mt-2">Créez votre compte</p>
            </div>

            <form onSubmit={handleCreateUser}>
              <div className="mb-4">
                <label htmlFor="username" className="block text-sm font-medium mb-2" style={{ color: '#092C42' }}>
                  Nom d&apos;utilisateur
                </label>
                <input
                  type="text"
                  id="username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    color: '#092C42',
                    backgroundColor: '#FFFFFF'
                  }}
                  autoFocus
                  required
                />
              </div>

              <div className="mb-4">
                <label htmlFor="new-password" className="block text-sm font-medium mb-2" style={{ color: '#092C42' }}>
                  Mot de passe <span className="text-gray-500 font-normal">(optionnel)</span>
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ 
                    color: '#092C42',
                    backgroundColor: '#FFFFFF'
                  }}
                  placeholder="Laisser vide pour connexion directe"
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#2853FE' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1a3fcc'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2853FE'}
              >
                {isSubmitting ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Écran de sélection d'utilisateur
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#011C2D' }}>
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="logo-finder" style={{ color: '#2853FE' }}>JUICE FINDER</span>
          </h1>
          <p className="text-lg" style={{ color: '#F5FBFF' }}>Qui êtes-vous ?</p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#2853FE' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserClick(user)}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center group"
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors" 
                     style={{ backgroundColor: '#E5EDFF' }}
                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D0DDFF'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E5EDFF'}>
                  <FontAwesomeIcon icon={faUser} className="text-2xl" style={{ color: '#2853FE' }} />
                </div>
                <h3 className="font-semibold mb-1" style={{ color: '#092C42' }}>{user.username}</h3>
                {user.hasPassword && (
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <FontAwesomeIcon icon={faLock} className="text-xs" />
                    <span>Protégé</span>
                  </div>
                )}
              </button>
            ))}

            {/* Bouton d'ajout d'utilisateur */}
            <button
              onClick={() => setShowCreateUser(true)}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center group border-2 border-dashed"
              style={{ borderColor: '#D1D5DB' }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2853FE'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 transition-colors" 
                   style={{ backgroundColor: '#F3F4F6' }}
                   onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5EDFF'}
                   onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}>
                <FontAwesomeIcon icon={faPlus} className="text-2xl" style={{ color: '#6B7280' }} />
              </div>
              <h3 className="font-semibold transition-colors" style={{ color: '#6B7280' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#2853FE'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}>Ajouter</h3>
            </button>
          </div>
        )}

        {error && !selectedUser && !showCreateUser && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-center text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

