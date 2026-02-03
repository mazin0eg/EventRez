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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Admin Panel
          </h1>
          <span className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm font-medium">
            Admin Only
          </span>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}
        
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Admin Data from API
          </h2>
          {adminData ? (
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
              <pre className="text-sm text-zinc-900 dark:text-zinc-100 overflow-auto">
                {JSON.stringify(adminData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-zinc-500 dark:text-zinc-400">No admin data available</p>
          )}
        </div>

        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Admin Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-left">
              <h3 className="font-medium text-blue-900 dark:text-blue-100">Manage Users</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                View and manage all users
              </p>
            </button>
            <button className="p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors text-left">
              <h3 className="font-medium text-green-900 dark:text-green-100">View Reports</h3>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Access system reports
              </p>
            </button>
            <button className="p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors text-left">
              <h3 className="font-medium text-purple-900 dark:text-purple-100">Settings</h3>
              <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                Configure system settings
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
