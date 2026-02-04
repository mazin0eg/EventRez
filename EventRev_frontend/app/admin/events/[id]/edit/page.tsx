'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { eventApi, categoryApi, UpdateEventData, Event, Category } from '@/lib/api';

export default function EditEventPage() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = Number(params.id);

  const [event, setEvent] = useState<Event | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    capacity: '',
    categoryId: '',
  });

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
    const fetchEvent = async () => {
      try {
        setIsLoading(true);
        const data = await eventApi.getById(eventId);
        setEvent(data);
        
        // Format dates for datetime-local input
        const formatDateForInput = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().slice(0, 16);
        };

        setFormData({
          title: data.title,
          description: data.description || '',
          startDate: formatDateForInput(data.startDate),
          endDate: data.endDate ? formatDateForInput(data.endDate) : '',
          location: data.location || '',
          capacity: data.capacity ? String(data.capacity) : '',
          categoryId: data.categoryId ? String(data.categoryId) : '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const data = await categoryApi.getAll();
        setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin' && eventId) {
      fetchEvent();
      fetchCategories();
    }
  }, [isAuthenticated, user, eventId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.startDate) {
      setError('Start date is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const eventData: UpdateEventData = {
        title: formData.title.trim(),
        startDate: new Date(formData.startDate).toISOString(),
      };

      if (formData.description?.trim()) {
        eventData.description = formData.description.trim();
      }

      if (formData.endDate) {
        eventData.endDate = new Date(formData.endDate).toISOString();
      }

      if (formData.location?.trim()) {
        eventData.location = formData.location.trim();
      }

      if (formData.capacity) {
        eventData.capacity = parseInt(formData.capacity, 10);
      }

      if (formData.categoryId) {
        eventData.categoryId = parseInt(formData.categoryId, 10);
      }

      await eventApi.update(eventId, eventData);
      router.push('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-neutral-500">Loading event...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (!event && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Event not found
          </h2>
          <p className="text-neutral-500 mb-4">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/events"
            className="text-violet-600 hover:text-violet-700 font-medium"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/events"
            className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
              Edit Event
            </h1>
            <p className="text-sm text-neutral-500 mt-1">
              Update the event details
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  End Date & Time
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event venue or address"
                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isLoadingCategories}
                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {isLoadingCategories && (
                <p className="mt-1 text-xs text-neutral-500">Loading categories...</p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Capacity
              </label>
              <input
                id="capacity"
                name="capacity"
                type="number"
                min="1"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Leave empty for unlimited"
                className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-700 placeholder-neutral-400 text-neutral-900 dark:text-white bg-neutral-50 dark:bg-neutral-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Maximum number of attendees. Leave empty for unlimited spots.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href="/admin/events"
                className="flex-1 py-3 px-4 text-center text-sm font-medium rounded-xl text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 text-sm font-medium rounded-xl text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
