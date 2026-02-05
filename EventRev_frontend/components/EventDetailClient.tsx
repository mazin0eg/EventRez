'use client';

/**
 * ============================================
 * CLIENT COMPONENT - Détail d'un événement
 * ============================================
 * 
 * Gère l'interactivité:
 * - Vérification de l'authentification
 * - Affichage de la disponibilité
 * - Action de réservation
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Event, EventAvailability, reservationApi } from '@/lib/api';
import Link from 'next/link';

interface EventDetailClientProps {
  event: Event;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [availability, setAvailability] = useState<EventAvailability | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Charger la disponibilité
  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const avail = await reservationApi.getAvailability(event.id);
        setAvailability(avail);
      } catch {
        // Ignorer l'erreur si non authentifié
      }
    };

    if (isAuthenticated) {
      fetchAvailability();
    }
  }, [isAuthenticated, event.id]);

  const handleReserve = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setIsReserving(true);
      setError(null);
      setSuccessMessage(null);

      await reservationApi.create({ eventId: event.id, numberOfTickets: 1 });
      setSuccessMessage('Réservation soumise avec succès! En attente de confirmation.');

      // Rafraîchir la disponibilité
      const avail = await reservationApi.getAvailability(event.id);
      setAvailability(avail);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Échec de la réservation');
    } finally {
      setIsReserving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPast = new Date(event.startDate) < new Date();
  const isSoldOut = availability?.available === 0;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      {/* Fil d'Ariane */}
      <nav className="mb-8">
        <Link
          href="/events"
          className="text-emerald-600 dark:text-emerald-400 text-sm font-light hover:underline"
        >
          ← Retour aux événements
        </Link>
      </nav>

      {/* Messages */}
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 text-sm font-light">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border-l-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 text-sm font-light">
          {successMessage}
        </div>
      )}

      {/* Contenu principal */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
        <div className="p-8">
          {/* Description */}
          {event.description && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wide mb-3">
                Description
              </h2>
              <p className="text-stone-700 dark:text-stone-300 font-light leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Détails */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              {/* Date */}
              <div>
                <h3 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
                  Date et heure
                </h3>
                <div className="flex items-center text-stone-700 dark:text-stone-300 font-light">
                  <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formatDate(event.startDate)}
                </div>
              </div>

              {/* Lieu */}
              {event.location && (
                <div>
                  <h3 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
                    Lieu
                  </h3>
                  <div className="flex items-center text-stone-700 dark:text-stone-300 font-light">
                    <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Disponibilité */}
              {isAuthenticated && availability && (
                <div>
                  <h3 className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide mb-1">
                    Disponibilité
                  </h3>
                  <div className="flex items-center text-stone-700 dark:text-stone-300 font-light">
                    <svg className="w-4 h-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {availability.available !== null ? (
                      <span className={isSoldOut ? 'text-red-500' : ''}>
                        {availability.available} / {availability.capacity} places disponibles
                      </span>
                    ) : (
                      'Places illimitées'
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statut de l'événement */}
          {isPast && (
            <div className="mb-6 p-4 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-light text-center">
              Cet événement est terminé
            </div>
          )}

          {/* Action de réservation */}
          <div className="border-t border-stone-200 dark:border-stone-800 pt-6">
            {!isAuthenticated ? (
              <div className="text-center">
                <p className="text-stone-500 dark:text-stone-400 font-light mb-4">
                  Connectez-vous pour réserver cet événement
                </p>
                <Link
                  href="/login"
                  className="inline-block px-8 py-3 bg-emerald-700 text-white font-light tracking-wide hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
                >
                  Se connecter
                </Link>
              </div>
            ) : user?.role === 'user' ? (
              <button
                onClick={handleReserve}
                disabled={isPast || isSoldOut || isReserving || authLoading}
                className={`w-full py-4 px-6 font-light tracking-wide transition-colors ${
                  isPast || isSoldOut
                    ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                    : isReserving
                    ? 'bg-emerald-500 text-white cursor-wait'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                }`}
              >
                {isReserving
                  ? 'Réservation en cours...'
                  : isPast
                  ? 'Événement terminé'
                  : isSoldOut
                  ? 'Complet'
                  : 'Réserver maintenant'}
              </button>
            ) : (
              <p className="text-center text-stone-500 dark:text-stone-400 font-light">
                En tant qu&apos;administrateur, vous ne pouvez pas faire de réservations.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
