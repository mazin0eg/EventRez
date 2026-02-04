'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Reservation, reservationApi } from '@/lib/api';

export default function AdminReservationsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!authLoading && user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchPendingReservations = async () => {
      try {
        setIsLoading(true);
        const data = await reservationApi.getPending();
        setReservations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reservations');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchPendingReservations();
    }
  }, [isAuthenticated, user]);

  const handleConfirm = async (id: number) => {
    try {
      setProcessingId(id);
      setError(null);
      setSuccessMessage(null);

      await reservationApi.confirm(id);
      
      // Remove from pending list
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setSuccessMessage('Reservation confirmed successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm reservation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    if (!confirm('Are you sure you want to reject this reservation?')) {
      return;
    }

    try {
      setProcessingId(id);
      setError(null);
      setSuccessMessage(null);

      await reservationApi.reject(id);
      
      // Remove from pending list
      setReservations((prev) => prev.filter((r) => r.id !== id));
      setSuccessMessage('Reservation rejected.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject reservation');
    } finally {
      setProcessingId(null);
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

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
        <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading reservations...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
                Pending Reservations
              </h1>
              {reservations.length > 0 && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 text-xs font-light border border-amber-200 dark:border-amber-800">
                  {reservations.length} pending
                </span>
              )}
            </div>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
            <p className="text-sm text-stone-500 mt-2 font-light">
              Review and manage reservation requests
            </p>
          </div>
          <button
            onClick={() => router.push('/admin')}
            className="px-5 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-all text-sm font-light tracking-wide"
          >
            Back to Admin
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

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border-l-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-sm font-light">
            <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="w-14 h-14 mx-auto bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-200 uppercase mb-2">
              All caught up!
            </h3>
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm">
              No pending reservations to review.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
              <thead className="bg-stone-50 dark:bg-stone-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Tickets
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                {reservations.map((reservation) => (
                  <tr key={reservation.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-stone-800 dark:text-stone-100">
                        {reservation.user?.email || `User #${reservation.userId}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-800 dark:text-stone-100">
                        {reservation.event?.title || `Event #${reservation.eventId}`}
                      </div>
                      {reservation.event && (
                        <div className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-light">
                          {formatDate(reservation.event.startDate)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-stone-700 dark:text-stone-200 font-light">
                        {reservation.numberOfTickets}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-stone-500 dark:text-stone-400 font-light">
                        {formatDate(reservation.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-stone-500 dark:text-stone-400 max-w-xs truncate block font-light">
                        {reservation.notes || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleConfirm(reservation.id)}
                          disabled={processingId === reservation.id}
                          className={`px-4 py-2 text-sm font-light transition-all ${
                            processingId === reservation.id
                              ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-wait'
                              : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800'
                          }`}
                        >
                          {processingId === reservation.id ? '...' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => handleReject(reservation.id)}
                          disabled={processingId === reservation.id}
                          className={`px-4 py-2 text-sm font-light transition-all ${
                            processingId === reservation.id
                              ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-wait'
                              : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800'
                          }`}
                        >
                          {processingId === reservation.id ? '...' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
