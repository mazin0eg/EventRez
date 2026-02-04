'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="w-10 h-10 border-3 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-neutral-500">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">
          Dashboard
        </h1>
        
        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            User Profile
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-neutral-500 dark:text-neutral-400 w-24">Email:</span>
              <span className="text-neutral-900 dark:text-white font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-neutral-500 dark:text-neutral-400 w-24">Role:</span>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' 
                  : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {user?.role}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-neutral-500 dark:text-neutral-400 w-24">User ID:</span>
              <span className="text-neutral-900 dark:text-white font-mono text-sm">{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              <h3 className="font-medium text-neutral-900 dark:text-white">Profile Settings</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Update your profile information
              </p>
            </div>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-100 dark:border-neutral-700">
              <h3 className="font-medium text-neutral-900 dark:text-white">Security</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                Manage your password and security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
