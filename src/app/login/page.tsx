'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Lock, Mail, ArrowRight, Loader2, ShieldCheck, User } from 'lucide-react';
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await login(email, password);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
    setLoading(true);
    setError(null);

    const result = await login(quickEmail, quickPass);
    if (result.success) {
      router.push(redirect);
    } else {
      setError(result.error || 'Failed to sign in');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-md">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Welcome Back
        </h1>
        <p className="text-slate-500 text-sm">
          Sign in to access your loyalty card and active discounts.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl text-sm shadow-md shadow-indigo-200 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                Sign In <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Don&apos;t have an account?{' '}
          <Link href={`/register?redirect=${redirect}`} className="text-indigo-600 font-bold underline">
            Register here
          </Link>
        </div>
      </div>

      {/* Quick 1-Click Test Personas */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block text-center">
          ⚡ 1-Click Demo Profiles (Pre-seeded)
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('alex@example.com', 'Password123!')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition"
          >
            <strong className="block text-slate-800 font-bold">Alex Active</strong>
            <span className="text-[10px] text-emerald-600 font-semibold">Streak 2 • 10% Off</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('emma@example.com', 'Password123!')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition"
          >
            <strong className="block text-slate-800 font-bold">Emma Expiring</strong>
            <span className="text-[10px] text-amber-600 font-semibold">1 Day Left!</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('liam@example.com', 'Password123!')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-rose-400 hover:bg-rose-50/50 text-left transition"
          >
            <strong className="block text-slate-800 font-bold">Liam Lapsed</strong>
            <span className="text-[10px] text-rose-600 font-semibold">Expired • Win Back</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('sophia@example.com', 'Password123!')}
            className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition"
          >
            <strong className="block text-slate-800 font-bold">Sophia Streak</strong>
            <span className="text-[10px] text-indigo-600 font-semibold">Streak 6 • 20% Off</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('admin@loyalshop.com', 'Admin123!')}
            className="col-span-2 p-2 rounded-lg bg-indigo-900 text-white hover:bg-indigo-950 text-center transition flex items-center justify-center gap-1.5 font-bold"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            Sign in as Store Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
          <p className="text-sm font-medium">Loading login...</p>
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
