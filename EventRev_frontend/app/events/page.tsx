import { Event } from '@/lib/api';
import { Metadata } from 'next';
import PublicEventsClient from '@/components/PublicEventsClient';

/**
 * ============================================
 * SSR - Server-Side Rendering
 * ============================================
 * 
 * Cette page utilise SSR car c'est une page PUBLIQUE:
 * - SEO: Google peut indexer les événements
 * - Performance: Contenu visible immédiatement (pas de spinner)
 * - Partage social: Facebook/Twitter peuvent lire les métadonnées
 * 
 * COMMENT ÇA MARCHE:
 * 1. Utilisateur demande /events
 * 2. Le SERVEUR Next.js appelle getPublishedEvents()
 * 3. Le SERVEUR génère le HTML complet avec les données
 * 4. Le HTML est envoyé au navigateur (contenu visible!)
 * 5. JavaScript "hydrate" pour ajouter l'interactivité
 */

// Métadonnées SEO générées côté serveur
export const metadata: Metadata = {
  title: 'Événements | EventRez',
  description: 'Découvrez tous nos événements à venir et réservez vos places.',
  openGraph: {
    title: 'Événements | EventRez',
    description: 'Découvrez tous nos événements à venir et réservez vos places.',
  },
};

// ⚡ Cette fonction s'exécute sur le SERVEUR (pas dans le navigateur!)
async function getPublishedEvents(): Promise<Event[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${API_BASE_URL}/events/published`, {
      // ISR (Incremental Static Regeneration):
      // - Cache les données pendant 60 secondes
      // - Après 60s, régénère en arrière-plan
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error('Failed to fetch events:', res.status);
      return [];
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// 🖥️ Server Component (pas de 'use client' = serveur par défaut)
export default async function EventsPage() {
  // Les données sont récupérées AVANT que la page soit envoyée au navigateur
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header - Rendu côté SERVEUR (HTML statique) */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
          <div className="text-center">
            <div className="w-12 h-px bg-emerald-600 mx-auto mb-6"></div>
            <h1 className="text-2xl font-light text-stone-800 dark:text-stone-100 tracking-wide uppercase">
              Tous les événements
            </h1>
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 font-light">
              {events.length} événement{events.length !== 1 ? 's' : ''} disponible{events.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* 
        Events Grid - Composant CLIENT pour l'interactivité
        On passe les données pré-chargées du serveur (initialEvents)
      */}
      <PublicEventsClient initialEvents={events} />
    </div>
  );
}
