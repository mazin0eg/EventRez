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
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-8">
          Dashboard
        </h1>
        
        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            User Profile
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-zinc-500 dark:text-zinc-400 w-24">Email:</span>
              <span className="text-zinc-900 dark:text-white font-medium">{user?.email}</span>
            </div>
            <div className="flex items-center">
              <span className="text-zinc-500 dark:text-zinc-400 w-24">Role:</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' 
                  : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              }`}>
                {user?.role}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-zinc-500 dark:text-zinc-400 w-24">User ID:</span>
              <span className="text-zinc-900 dark:text-white font-mono text-sm">{user?.id}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <h3 className="font-medium text-zinc-900 dark:text-white">Profile Settings</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Update your profile information
              </p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <h3 className="font-medium text-zinc-900 dark:text-white">Security</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage your password and security settings
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
