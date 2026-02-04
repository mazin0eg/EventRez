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
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-emerald-600 animate-spin"></div>
        <p className="mt-4 text-stone-400 text-sm font-light tracking-wide">Loading dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-10">
          <h1 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100 uppercase">
            Dashboard
          </h1>
          <div className="w-8 h-px bg-emerald-600 mt-2"></div>
        </div>
        
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 mb-6">
          <h2 className="text-sm font-light tracking-wide text-stone-600 dark:text-stone-400 uppercase mb-4">
            User Profile
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-stone-500 dark:text-stone-400 w-24 text-sm font-light">Email:</span>
              <span className="text-stone-800 dark:text-stone-100 text-sm">{user?.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-stone-500 dark:text-stone-400 w-24 text-sm font-light">Role:</span>
              <span className={`px-2 py-0.5 text-xs font-light tracking-wide ${
                user?.role === 'admin' 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                  : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 border border-stone-200 dark:border-stone-700'
              }`}>
                {user?.role}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-stone-500 dark:text-stone-400 w-24 text-sm font-light">User ID:</span>
              <span className="text-stone-800 dark:text-stone-100 font-mono text-sm">{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6">
          <h2 className="text-sm font-light tracking-wide text-stone-600 dark:text-stone-400 uppercase mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <h3 className="text-sm text-stone-800 dark:text-stone-100">Profile Settings</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-light">
                Update your profile information
              </p>
            </div>
            <div className="p-4 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
              <h3 className="text-sm text-stone-800 dark:text-stone-100">Security</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 font-light">
                Manage your password and security
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
