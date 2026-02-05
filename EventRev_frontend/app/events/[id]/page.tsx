import { Event } from '@/lib/api';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailClient from '@/components/EventDetailClient';

/**
 * ============================================
 * SSR - Page Détail d'un Événement
 * ============================================
 * 
 * Cette page utilise SSR avec Métadonnées DYNAMIQUES:
 * - Le titre et description changent selon l'événement
 * - Parfait pour le partage social (Facebook, Twitter)
 * - Google indexe chaque événement individuellement
 */

interface EventPageProps {
  params: Promise<{ id: string }>;
}

// 📊 Métadonnées DYNAMIQUES - générées pour chaque événement
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: 'Événement non trouvé | EventRez',
    };
  }

  return {
    title: `${event.title} | EventRez`,
    description: event.description || `Détails de l'événement ${event.title}`,
    openGraph: {
      title: event.title,
      description: event.description || `Détails de l'événement ${event.title}`,
      type: 'article',
    },
  };
}

// ⚡ Récupération côté SERVEUR
async function getEventById(id: string): Promise<Event | null> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  try {
    const res = await fetch(`${API_BASE_URL}/events/${id}`, {
      next: { revalidate: 60 }, // Cache 60 secondes
    });

    if (!res.ok) {
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

// 🖥️ Server Component
export default async function EventDetailPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* En-tête - Rendu côté SERVEUR */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
          <div className="text-center">
            <div className="w-12 h-px bg-emerald-600 mx-auto mb-6"></div>
            {event.category && (
              <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-light tracking-wide border border-emerald-200 dark:border-emerald-800 mb-4">
                {event.category.name}
              </span>
            )}
            <h1 className="text-2xl font-light text-stone-800 dark:text-stone-100 tracking-wide">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Contenu interactif - Composant CLIENT */}
      <EventDetailClient event={event} />
    </div>
  );
}
