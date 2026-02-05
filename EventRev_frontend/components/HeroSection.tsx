'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

/**
 * HeroSection - A Client Component
 * 
 * This needs to be a client component because it uses:
 * - useAuth() hook which requires React Context (client-side only)
 * - Conditional rendering based on authentication state
 * 
 * In SSR, the initial HTML is rendered on the server, then this
 * component "hydrates" on the client to add interactivity.
 */
export default function HeroSection() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
      <div className="max-w-6xl mx-auto py-20 px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-12 h-px bg-emerald-600 mx-auto mb-8"></div>
          <h1 className="text-3xl font-light text-stone-800 dark:text-stone-100 sm:text-4xl tracking-wide">
            Discover your next
            <span className="text-emerald-700 dark:text-emerald-500"> experience</span>
          </h1>
          <p className="mt-6 text-base text-stone-500 dark:text-stone-400 font-light leading-relaxed">
            Find and book curated events in your area.
            Simple. Elegant. Memorable.
          </p>
          
          {/* These buttons only show when user is NOT authenticated */}
          {!isAuthenticated && (
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-light tracking-wide transition-colors"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 border border-stone-300 hover:border-stone-400 dark:border-stone-700 dark:hover:border-stone-600 text-stone-700 dark:text-stone-300 font-light tracking-wide transition-colors"
              >
                Sign in
              </Link>
            </div>
          )}
          
          {/* This shows only for authenticated regular users */}
          {isAuthenticated && user?.role === 'user' && (
            <div className="mt-10">
              <Link
                href="/my-reservations"
                className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-light tracking-wide border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                View my reservations
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
