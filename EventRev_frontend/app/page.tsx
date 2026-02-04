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
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Hero Section */}
      <div className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-white sm:text-5xl tracking-tight">
              Find your next
              <span className="text-violet-600"> experience</span>
            </h1>
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              Discover and book amazing events happening around you.
              From concerts to workshops, we&apos;ve got you covered.
            </p>
            {!isAuthenticated && (
              <div className="mt-8 flex justify-center gap-3">
                <Link
                  href="/register"
                  className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl transition-colors"
                >
                  Get started free
                </Link>
                <Link
                  href="/login"
                  className="px-6 py-3 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium rounded-xl transition-colors"
                >
                  Sign in
                </Link>
              </div>
            )}
            {isAuthenticated && user?.role === 'user' && (
              <div className="mt-8">
                <Link
                  href="/my-reservations"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium rounded-xl hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  View my reservations
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">
            Upcoming events
          </h2>
          {events.length > 0 && (
            <span className="text-sm text-neutral-500">
              {events.length} event{events.length !== 1 ? 's' : ''} available
            </span>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-neutral-500">Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800">
            <div className="w-16 h-16 mx-auto bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white mb-2">
              No events yet
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400">
              Check back soon for upcoming events!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => {
              const eventAvailability = availability[event.id];
              const isPast = isEventPast(event.startDate);
              const isSoldOut = eventAvailability?.available === 0;

              return (
                <div
                  key={event.id}
                  className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-violet-300 dark:hover:border-violet-700 transition-all hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-none"
                >
                  <div className="p-5">
                    {/* Category badge */}
                    {event.category && (
                      <span className="inline-block px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-lg mb-3">
                        {event.category.name}
                      </span>
                    )}

                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{formatDate(event.startDate)}</span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{event.location}</span>
                        </div>
                      )}

                      {isAuthenticated && eventAvailability && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {eventAvailability.available !== null ? (
                            <span className={isSoldOut ? 'text-red-500 font-medium' : 'text-neutral-500'}>
                              {isSoldOut ? 'Sold out' : `${eventAvailability.available} spots left`}
                            </span>
                          ) : (
                            <span className="text-neutral-500">Open seating</span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                      {user?.role === 'user' ? (
                        <button
                          onClick={() => handleReserve(event.id)}
                          disabled={isPast || isSoldOut || reservingEventId === event.id}
                          className={`w-full py-2.5 px-4 rounded-xl font-medium text-sm transition-all ${
                            isPast || isSoldOut
                              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
                              : reservingEventId === event.id
                              ? 'bg-violet-400 text-white cursor-wait'
                              : 'bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98]'
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
                          className="block w-full py-2.5 px-4 rounded-xl font-medium text-sm text-center bg-violet-600 text-white hover:bg-violet-700 active:scale-[0.98] transition-all"
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
