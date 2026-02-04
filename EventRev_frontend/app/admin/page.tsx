'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/lib/api';

export default function AdminPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [adminData, setAdminData] = useState<{ message: string; data: unknown } | null>(null);
  const [error, setError] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!isLoading && user?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      try {
        const data = await userApi.getAdminData();
        setAdminData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch admin data');
      } finally {
        setIsLoadingData(false);
      }
    };

    if (!isLoading && isAuthenticated && user?.role === 'admin') {
      fetchAdminData();
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
        <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading admin panel...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <div>
            <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
              Admin Panel
            </h1>
            <div className="w-8 h-px bg-emerald-600 mt-2"></div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-light tracking-wide border border-emerald-200 dark:border-emerald-800">
            Admin
          </span>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 text-sm font-light mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 mb-6">
          <h2 className="text-sm font-light tracking-wide text-stone-600 dark:text-stone-400 uppercase mb-4">
            System Data
          </h2>
          {adminData ? (
            <div className="bg-stone-50 dark:bg-stone-800 p-4 border border-stone-200 dark:border-stone-700">
              <pre className="text-xs text-stone-700 dark:text-stone-300 overflow-auto font-mono">
                {JSON.stringify(adminData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-stone-500 dark:text-stone-400 font-light text-sm">No admin data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-sm font-light tracking-wide text-stone-600 dark:text-stone-400 uppercase mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/admin/events')}
              className="p-4 bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition-all text-left border border-emerald-200 dark:border-emerald-800/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-emerald-800 dark:text-emerald-200">Manage Events</h3>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-light">
                    Create & edit events
                  </p>
                </div>
              </div>
            </button>
            <button
              onClick={() => router.push('/admin/reservations')}
              className="p-4 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all text-left border border-amber-200 dark:border-amber-800/50 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-amber-800 dark:text-amber-200">Reservations</h3>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5 font-light">
                    Review pending requests
                  </p>
                </div>
              </div>
            </button>
            <button className="p-4 bg-stone-50 dark:bg-stone-800/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all text-left border border-stone-200 dark:border-stone-700 group">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-stone-100 dark:bg-stone-700 flex items-center justify-center">
                  <svg className="w-4 h-4 text-stone-600 dark:text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm text-stone-700 dark:text-stone-200">Manage Users</h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-light">
                    View and manage
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
