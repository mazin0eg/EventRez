'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      // Redirect based on role: admin goes to dashboard, user goes to home
      if (user.role === 'admin') {
        router.push('/dashboard');
      } else {
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 py-12 px-4 sm:px-6">
      <div className="max-w-sm w-full">
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-8">
          <div className="text-center mb-8">
            <div className="w-10 h-10 bg-emerald-700 dark:bg-emerald-600 flex items-center justify-center mx-auto mb-6">
              <span className="text-white font-light text-sm tracking-widest">禅</span>
            </div>
            <h2 className="text-xl font-light tracking-wide text-stone-800 dark:text-stone-100">
              Welcome back
            </h2>
            <div className="w-8 h-px bg-emerald-600 mx-auto mt-3"></div>
            <p className="mt-4 text-sm text-stone-500 dark:text-stone-400 font-light">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-emerald-700 dark:text-emerald-500 hover:text-emerald-800">
                Sign up
              </Link>
            </p>
          </div>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/10 border-l-2 border-red-400 text-red-600 dark:text-red-400 text-sm font-light flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-xs font-light tracking-wide text-stone-600 dark:text-stone-400 mb-2 uppercase">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-200 dark:border-stone-700 placeholder-stone-400 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-light"
                placeholder="you@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-xs font-light tracking-wide text-stone-600 dark:text-stone-400 mb-2 uppercase">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-200 dark:border-stone-700 placeholder-stone-400 text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 focus:outline-none focus:border-emerald-500 transition-colors text-sm font-light"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-light tracking-wide text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
