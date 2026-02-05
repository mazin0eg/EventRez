import { Event } from '@/lib/api';
import EventsSection from '@/components/EventsSection';
import HeroSection from '@/components/HeroSection';

// Server-side data fetching function
async function getPublishedEvents(): Promise<Event[]> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${API_BASE_URL}/events/published`, {
      // This tells Next.js to revalidate data every 60 seconds
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch events');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// This is a Server Component (no 'use client' directive)
export default async function Home() {
  // Data is fetched on the server before the page is rendered
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Hero Section - Server Component wrapper with Client Component inside */}
      <HeroSection />

      {/* Events Section - Client Component for interactivity */}
      <EventsSection initialEvents={events} />
    </div>
  );
}
