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
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
        <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading event...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (!event && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <h2 className="text-sm font-light tracking-wide text-stone-700 dark:text-stone-200 uppercase mb-2">
            Event not found
          </h2>
          <p className="text-stone-500 mb-4 font-light text-sm">
            The event you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/admin/events"
            className="text-emerald-600 hover:text-emerald-700 font-light"
          >
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin/events"
            className="p-2 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <svg className="w-5 h-5 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
              Edit Event
            </h1>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
            <p className="text-sm text-stone-500 mt-2 font-light">
              Update the event details
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 flex items-start gap-3 text-sm font-light">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
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
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 placeholder-stone-400 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all font-light"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your event..."
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 placeholder-stone-400 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all resize-none font-light"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
                  Start Date & Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all font-light"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
                  End Date & Time
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all font-light"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event venue or address"
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 placeholder-stone-400 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all font-light"
              />
            </div>

            <div>
              <label htmlFor="categoryId" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
                Category
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={isLoadingCategories}
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all font-light"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {isLoadingCategories && (
                <p className="mt-1 text-xs text-stone-500 font-light">Loading categories...</p>
              )}
            </div>

            <div>
              <label htmlFor="capacity" className="block text-xs font-light text-stone-600 dark:text-stone-400 mb-2 uppercase tracking-wide">
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
                className="w-full px-4 py-3 border border-stone-200 dark:border-stone-700 placeholder-stone-400 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-600 transition-all font-light"
              />
              <p className="mt-1 text-xs text-stone-500 font-light">
                Maximum number of attendees. Leave empty for unlimited spots.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Link
                href="/admin/events"
                className="flex-1 py-3 px-4 text-center text-sm font-light tracking-wide text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 transition-all border border-stone-200 dark:border-stone-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 text-sm font-light tracking-wide text-white bg-emerald-700 hover:bg-emerald-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
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
