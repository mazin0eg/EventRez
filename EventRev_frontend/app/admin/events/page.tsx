'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Event, eventApi } from '@/lib/api';

export default function AdminEventsPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);
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
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const data = await eventApi.getAll();
        setEvents(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchEvents();
    }
  }, [isAuthenticated, user]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);
      setSuccessMessage(null);

      await eventApi.delete(id);
      
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSuccessMessage('Event deleted successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (id: number, isPublished: boolean) => {
    try {
      setPublishingId(id);
      setError(null);
      setSuccessMessage(null);

      const updatedEvent = await eventApi.togglePublish(id);
      
      setEvents((prev) => prev.map((e) => e.id === id ? updatedEvent : e));
      setSuccessMessage(isPublished ? 'Event unpublished!' : 'Event published!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update publish status');
    } finally {
      setPublishingId(null);
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

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
              Manage Events
            </h1>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
            <p className="text-sm text-stone-500 mt-2 font-light">
              Create, edit, and manage all events
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/admin')}
              className="px-5 py-2.5 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700 transition-all text-sm font-light tracking-wide"
            >
              Back to Admin
            </button>
            <Link
              href="/admin/events/create"
              className="px-5 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 transition-all text-sm font-light tracking-wide flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm font-light">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border-l-2 border-emerald-400 text-emerald-600 dark:text-emerald-400 flex items-start gap-3 text-sm font-light">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
            <div className="w-14 h-14 mx-auto bg-stone-100 dark:bg-stone-800 flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-200 uppercase mb-2">
              No events yet
            </h3>
            <p className="text-stone-500 dark:text-stone-400 mb-6 font-light text-sm">
              Create your first event to get started!
            </p>
            <Link
              href="/admin/events/create"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 text-white hover:bg-emerald-800 transition-all font-light tracking-wide text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              Create Event
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800">
                <thead className="bg-stone-50 dark:bg-stone-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Capacity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-light text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 dark:divide-stone-800">
                  {events.map((event) => {
                    const isPast = isEventPast(event.startDate);
                    
                    return (
                      <tr key={event.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm text-stone-800 dark:text-stone-100">
                              {event.title}
                            </div>
                            {event.category && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-800">
                                {event.category.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-stone-700 dark:text-stone-200 font-light">
                            {formatDate(event.startDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-stone-500 dark:text-stone-400 max-w-xs truncate font-light">
                            {event.location || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-stone-700 dark:text-stone-200 font-light">
                            {event.capacity || 'Unlimited'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPast ? (
                            <span className="px-2.5 py-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-light">
                              Past
                            </span>
                          ) : event.isPublished ? (
                            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-light border border-emerald-200 dark:border-emerald-800">
                              Published
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-light border border-amber-200 dark:border-amber-800">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            {!isPast && (
                              <button
                                onClick={() => handleTogglePublish(event.id, event.isPublished)}
                                disabled={publishingId === event.id}
                                className={`px-3 py-1.5 text-sm font-light transition-all ${
                                  publishingId === event.id
                                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-wait'
                                    : event.isPublished
                                    ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                                    : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {publishingId === event.id ? '...' : event.isPublished ? 'Unpublish' : 'Publish'}
                              </button>
                            )}
                            <Link
                              href={`/admin/events/${event.id}/edit`}
                              className="px-3 py-1.5 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 text-sm font-light transition-all border border-stone-200 dark:border-stone-700"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(event.id, event.title)}
                              disabled={deletingId === event.id}
                              className={`px-3 py-1.5 text-sm font-light transition-all ${
                                deletingId === event.id
                                  ? 'bg-stone-200 dark:bg-stone-700 text-stone-400 cursor-wait'
                                  : 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800'
                              }`}
                            >
                              {deletingId === event.id ? '...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
