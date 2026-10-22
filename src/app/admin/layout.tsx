'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  ShieldCheck,
  ArrowLeft,
  Loader2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin');
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white space-y-3 flex-col">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="text-sm font-semibold">Verifying Admin Access...</span>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard & Analytics', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Product Catalog', icon: Package },
    { href: '/admin/orders', label: 'Order Management', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customer Loyalty', icon: Users },
    { href: '/admin/settings', label: 'Loyalty Rules & Config', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
                <ShieldCheck className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">
                Loyal<span className="text-indigo-400">Admin</span>
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
              Control Panel & Rules Engine
            </span>
          </div>

          <nav className="space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Storefront</span>
          </Link>
          <div className="text-[11px] text-slate-500">
            Logged in as <strong className="text-slate-300">{user.email}</strong>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
