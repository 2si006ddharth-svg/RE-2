'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  ShoppingBag,
  User as UserIcon,
  Bell,
  ShieldCheck,
  LogOut,
  Sparkles,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const { user, loyalty, logout } = useAuth();
  const { totalItemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetch('/api/notifications')
        .then((res) => res.json())
        .then((data) => {
          if (data.unreadCount) setUnreadCount(data.unreadCount);
        })
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-800 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Loyal<span className="text-indigo-600">Shop</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-amber-600 -mt-1">
                Repeat & Save
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <Link href="/shop" className="hover:text-indigo-600 transition">
              Shop All
            </Link>
            <Link href="/loyalty" className="hover:text-indigo-600 transition flex items-center gap-1.5">
              <span>Loyalty Perks</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                Up to 20%
              </span>
            </Link>
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md transition flex items-center gap-1 text-xs font-bold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Portal
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Cart */}
          <Link
            href="/cart"
            className="relative p-2 text-slate-700 hover:text-indigo-600 transition rounded-lg hover:bg-slate-100"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                {totalItemCount}
              </span>
            )}
          </Link>

          {/* User Status / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="relative p-2 text-slate-700 hover:text-indigo-600 transition rounded-lg hover:bg-slate-100"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white" />
                )}
              </Link>

              <Link
                href="/account"
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition text-sm font-semibold text-slate-800"
              >
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-left">
                  <span className="block text-xs font-bold text-slate-900 leading-tight">
                    {user.name}
                  </span>
                  <span className="block text-[10px] text-indigo-600 font-semibold leading-tight">
                    {loyalty?.isRegular ? `${loyalty.discountPercent}% Regular` : 'Account'}
                  </span>
                </div>
              </Link>

              <button
                onClick={() => logout()}
                className="p-2 text-slate-400 hover:text-rose-600 transition rounded-lg hover:bg-slate-100"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-700 hover:text-indigo-600 px-3 py-1.5 transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-lg shadow-sm shadow-indigo-200 transition"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2">
          <Link
            href="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            Shop All Products
          </Link>
          <Link
            href="/loyalty"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-800 font-medium"
          >
            Loyalty Perks & How It Works
          </Link>
          {user && (
            <Link
              href="/account"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-800 font-medium"
            >
              My Account & Loyalty Card
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-indigo-600 font-bold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
