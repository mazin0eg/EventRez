'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Event, EventAvailability, eventApi, reservationApi } from '@/lib/api';

export default function EventsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [availability, setAvailability] = useState<Record<number, EventAvailability>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingEventId, setReservingEventId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Only fetch published events for regular users
        const eventsData = await eventApi.getPublished();
        setEvents(eventsData);

        // Fetch availability for each event
        const availabilityPromises = eventsData.map(async (event) => {
          try {
            const avail = await reservationApi.getAvailability(event.id);
            return { id: event.id, availability: avail };
          } catch {
            return { id: event.id, availability: null };
          }
        });

        const availabilityResults = await Promise.all(availabilityPromises);
        const availabilityMap: Record<number, EventAvailability> = {};
        availabilityResults.forEach((result) => {
          if (result.availability) {
            availabilityMap[result.id] = result.availability;
          }
        });
        setAvailability(availabilityMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchEvents();
    }
  }, [isAuthenticated]);

  const handleReserve = async (eventId: number) => {
    try {
      setReservingEventId(eventId);
      setError(null);
      setSuccessMessage(null);

      await reservationApi.create({ eventId, numberOfTickets: 1 });
      
      setSuccessMessage('Reservation submitted successfully! Waiting for admin confirmation.');
      
      // Refresh availability
      const avail = await reservationApi.getAvailability(eventId);
      setAvailability((prev) => ({ ...prev, [eventId]: avail }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reservation');
    } finally {
      setReservingEventId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventPast = (startDate: string) => {
    return new Date(startDate) < new Date();
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
        <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading events...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
              Upcoming Events
            </h1>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
          </div>
          {user?.role === 'user' && (
            <button
              onClick={() => router.push('/my-reservations')}
              className="px-4 py-2 bg-emerald-700 text-white text-sm font-light tracking-wide hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
            >
              My Reservations
            </button>
          )}
        </div>

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

        {events.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 dark:text-stone-400 font-light">
              No events available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const eventAvailability = availability[event.id];
              const isPast = isEventPast(event.startDate);
              const isSoldOut = eventAvailability?.available === 0;

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-base font-normal tracking-wide text-stone-800 dark:text-stone-100">
                        {event.title}
                      </h2>
                      {event.category && (
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-light tracking-wide border border-emerald-200 dark:border-emerald-800">
                          {event.category.name}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-4 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs font-light">
                      <div className="flex items-center text-stone-500 dark:text-stone-400">
                        <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(event.startDate)}
                      </div>

                      {event.location && (
                        <div className="flex items-center text-stone-500 dark:text-stone-400">
                          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </div>
                      )}

                      {eventAvailability && (
                        <div className="flex items-center text-stone-500 dark:text-stone-400">
                          <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {eventAvailability.available !== null ? (
                            <span className={isSoldOut ? 'text-red-500' : ''}>
                              {eventAvailability.available} / {eventAvailability.capacity} spots
                            </span>
                          ) : (
                            'Open seating'
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                      {user?.role === 'user' && (
                        <button
                          onClick={() => handleReserve(event.id)}
                          disabled={isPast || isSoldOut || reservingEventId === event.id}
                          className={`w-full py-2.5 px-4 font-light text-sm tracking-wide transition-colors ${
                            isPast || isSoldOut
                              ? 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
                              : reservingEventId === event.id
                              ? 'bg-emerald-500 text-white cursor-wait'
                              : 'bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700'
                          }`}
                        >
                          {reservingEventId === event.id
                            ? 'Reserving...'
                            : isPast
                            ? 'Event Ended'
                            : isSoldOut
                            ? 'Sold Out'
                            : 'Reserve Now'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
