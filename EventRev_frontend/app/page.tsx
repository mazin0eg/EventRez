'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-4xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white sm:text-5xl">
            Welcome to Auth App
          </h1>
          <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400">
            A Next.js application with JWT authentication
          </p>
          
          <div className="mt-10">
            {isAuthenticated ? (
              <div className="space-y-4">
                <p className="text-lg text-zinc-700 dark:text-zinc-300">
                  Welcome back, <span className="font-semibold">{user?.email}</span>!
                </p>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="inline-flex items-center px-6 py-3 border border-zinc-300 dark:border-zinc-700 text-base font-medium rounded-md text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
              <div className="text-blue-500 text-2xl mb-3">🔐</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Register</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                POST /auth/register
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
              <div className="text-green-500 text-2xl mb-3">🔑</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Login</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                POST /auth/login
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
              <div className="text-purple-500 text-2xl mb-3">👤</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Profile</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                GET /users/me
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-lg shadow">
              <div className="text-red-500 text-2xl mb-3">👑</div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white">Admin</h3>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                GET /users/admin
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
