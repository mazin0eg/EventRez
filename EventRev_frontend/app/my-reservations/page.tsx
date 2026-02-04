'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Reservation, reservationApi } from '@/lib/api';

export default function MyReservationsPage() {
  const { isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        const data = await reservationApi.getMyReservations();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchReservations();
    }
  }, [isAuthenticated]);

  const handleCancel = async (id: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setCancellingId(id);
      setError(null);
      const updated = await reservationApi.cancel(id);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? updated : r))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-light border border-emerald-200 dark:border-emerald-800">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-light border border-amber-200 dark:border-amber-800">
            Pending
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-light border border-red-200 dark:border-red-800">
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
        <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading reservations...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
              My Reservations
            </h1>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
            <p className="text-sm text-stone-500 mt-2 font-light">
              Manage your event bookings
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-5 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 transition-all active:scale-[0.98] text-sm font-light tracking-wide"
          >
            Browse Events
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm font-light">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="w-14 h-14 mx-auto bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-200 uppercase mb-2">
              No reservations yet
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6 font-light text-sm">
              Start exploring events and book your first experience!
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 transition-all active:scale-[0.98] font-light tracking-wide text-sm"
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-all"
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-sm text-stone-800 dark:text-stone-100">
                          {reservation.event?.title || `Event #${reservation.eventId}`}
                        </h2>
                        {getStatusBadge(reservation.status)}
                      </div>

                      {reservation.event && (
                        <div className="space-y-2 text-sm text-stone-500 dark:text-stone-400 font-light">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(reservation.event.startDate)}
                          </div>
                          {reservation.event.location && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {reservation.event.location}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-sm font-light">
                        <span className="text-stone-600 dark:text-stone-400">
                          <strong className="font-normal">{reservation.numberOfTickets}</strong> ticket(s)
                        </span>
                        <span className="text-stone-400 dark:text-stone-500">
                          Reserved on {formatDate(reservation.createdAt)}
                        </span>
                      </div>

                      {reservation.notes && (
                        <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 italic font-light">
                          Note: {reservation.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {reservation.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(reservation.id)}
                          disabled={cancellingId === reservation.id}
                          className={`px-4 py-2 text-sm font-light transition-all ${
                            cancellingId === reservation.id
                              ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-wait'
                              : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          {cancellingId === reservation.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
