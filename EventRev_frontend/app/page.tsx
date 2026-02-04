'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Event, EventAvailability, eventApi, reservationApi } from '@/lib/api';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [availability, setAvailability] = useState<Record<number, EventAvailability>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservingEventId, setReservingEventId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        // Only show published events to users on the home page
        const eventsData = await eventApi.getPublished();
        setEvents(eventsData);

        if (isAuthenticated) {
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
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [isAuthenticated]);

  const handleReserve = async (eventId: number) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    try {
      setReservingEventId(eventId);
      setError(null);
      setSuccessMessage(null);

      await reservationApi.create({ eventId, numberOfTickets: 1 });
      
      setSuccessMessage('Your reservation has been submitted! We\'ll notify you once it\'s confirmed.');
      
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
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isEventPast = (startDate: string) => {
    return new Date(startDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-6xl mx-auto py-20 px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <div className="w-12 h-px bg-emerald-600 mx-auto mb-8"></div>
            <h1 className="text-3xl font-light text-stone-800 dark:text-stone-100 sm:text-4xl tracking-wide">
              Discover your next
              <span className="text-emerald-700 dark:text-emerald-500"> experience</span>
            </h1>
            <p className="mt-6 text-base text-stone-500 dark:text-stone-400 font-light leading-relaxed">
              Find and book curated events in your area.
              Simple. Elegant. Memorable.
            </p>
            {!isAuthenticated && (
              <div className="mt-10 flex justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-light tracking-wide transition-colors"
                >
                  Get started
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 border border-stone-300 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300 font-light tracking-wide transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
            {isAuthenticated && user?.role === 'user' && (
              <div className="mt-10">
                <Link
                  href="/my-reservations"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-light tracking-wide border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View my reservations
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-lg font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
              Upcoming events
            </h2>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
          </div>
          {events.length > 0 && (
            <span className="text-xs text-stone-400 tracking-wide">
              {events.length} event{events.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 flex items-start gap-3">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-light">{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-8 p-4 bg-emerald-50 dark:bg-emerald-900/10 border-l-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 flex items-start gap-3">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-light">{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
            <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="w-14 h-14 mx-auto bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-base font-light text-stone-700 dark:text-stone-200 tracking-wide mb-2">
              No events available
            </h3>
            <p className="text-stone-400 text-sm font-light">
              Check back soon for upcoming events
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
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-emerald-400 dark:hover:border-emerald-700 transition-colors group"
                >
                  <div className="p-5">
                    {/* Category badge */}
                    {event.category && (
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-light tracking-wide border border-emerald-200 dark:border-emerald-800 mb-3">
                        {event.category.name}
                      </span>
                    )}

                    <h3 className="text-base font-normal text-stone-800 dark:text-stone-100 mb-2 tracking-wide">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-stone-500 dark:text-stone-400 text-sm font-light mb-4 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-light">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.startDate)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-light">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}

                      {isAuthenticated && eventAvailability && (
                        <div className="flex items-center gap-2 text-xs font-light">
                          <svg className="w-3.5 h-3.5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {eventAvailability.available !== null ? (
                            <span className={isSoldOut ? 'text-red-500' : 'text-stone-500'}>
                              {isSoldOut ? 'Sold out' : `${eventAvailability.available} spots left`}
                            </span>
                          ) : (
                            <span className="text-stone-500">Open seating</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-stone-100 dark:border-stone-800">
                      {user?.role === 'user' ? (
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
                            ? 'Event ended'
                            : isSoldOut
                            ? 'Sold out'
                            : 'Reserve a spot'}
                        </button>
                      ) : !isAuthenticated ? (
                        <Link
                          href="/login"
                          className="block w-full py-2.5 px-4 font-light text-sm tracking-wide text-center bg-emerald-700 text-white hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 transition-colors"
                        >
                          Sign in to reserve
                        </Link>
                      ) : null}
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
