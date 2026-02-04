'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between h-14">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center">
                <span className="text-white font-light text-sm tracking-widest">禅</span>
              </div>
              <span className="text-base font-light tracking-wider text-stone-800 dark:text-stone-100 uppercase">
                EventRez
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0">
            <Link
              href="/"
              className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b-2 border-transparent hover:border-emerald-600"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/events"
                  className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b-2 border-transparent hover:border-emerald-600"
                >
                  Events
                </Link>
                {user?.role === 'user' && (
                  <Link
                    href="/my-reservations"
                    className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b-2 border-transparent hover:border-emerald-600"
                  >
                    Reservations
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <>
                    <Link
                      href="/admin/events"
                      className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b-2 border-transparent hover:border-emerald-600"
                    >
                      Manage
                    </Link>
                    <Link
                      href="/admin"
                      className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors border-b-2 border-transparent hover:border-emerald-600"
                    >
                      Admin
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                      <span className="text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                        {user?.email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 max-w-28 truncate font-light">
                      {user?.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white px-3 py-1.5 text-xs font-light tracking-wide border border-stone-200 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-500 transition-colors"
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-1.5 text-sm font-light tracking-wide transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-4 py-1.5 text-sm font-light tracking-wide transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-stone-100 dark:border-stone-800">
            <div className="flex flex-col gap-0">
              <Link
                href="/"
                className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    href="/events"
                    className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Events
                  </Link>
                  {user?.role === 'user' && (
                    <Link
                      href="/my-reservations"
                      className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Reservations
                    </Link>
                  )}
                  {user?.role === 'admin' && (
                    <>
                      <Link
                        href="/admin/events"
                        className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Manage Events
                      </Link>
                      <Link
                        href="/admin"
                        className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white px-4 py-2 text-sm font-light tracking-wide hover:bg-stone-50 dark:hover:bg-stone-800"
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
