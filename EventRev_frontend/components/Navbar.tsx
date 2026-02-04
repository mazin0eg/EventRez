'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-lg font-semibold text-neutral-900 dark:text-white">
                EventRez
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/events"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Events
                </Link>
                {user?.role === 'user' && (
                  <Link
                    href="/my-reservations"
                    className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    My Reservations
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      href="/admin/events"
                      className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Manage Events
                    </Link>
                    <Link
                      href="/admin"
                      className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Admin
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center">
                      <span className="text-violet-600 dark:text-violet-400 text-sm font-medium">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm text-neutral-600 dark:text-neutral-400 max-w-32 truncate">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/events"
                    className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Events
                  </Link>
                  {user?.role === 'user' && (
                    <Link
                      href="/my-reservations"
                      className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Reservations
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        href="/admin/events"
                        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Events
                      </Link>
                      <Link
                        href="/admin"
                        className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Admin
                      </Link>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
