import React from 'react';
import Link from 'next/link';
import { Sparkles, Shield, RefreshCw, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-lg font-black text-white">
                Loyal<span className="text-indigo-400">Shop</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              The modern storefront designed to reward repeat buyers. Purchase once every 10 days to keep an automatic rolling discount on all future orders.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Shop & Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/shop" className="hover:text-indigo-400 transition">All Products</Link></li>
              <li><Link href="/loyalty" className="hover:text-indigo-400 transition">How Loyalty Works</Link></li>
              <li><Link href="/cart" className="hover:text-indigo-400 transition">Shopping Bag</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">Account</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/account" className="hover:text-indigo-400 transition">My Loyalty Dashboard</Link></li>
              <li><Link href="/login" className="hover:text-indigo-400 transition">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-indigo-400 transition">Create Account</Link></li>
            </ul>
          </div>

          {/* Trust Guarantees */}
          <div className="space-y-3">
            <div className="flex items-start gap-2.5">
              <RefreshCw className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-slate-100 block">Rolling 10-Day Window</strong>
                <span className="text-slate-400">Automatic discounts apply directly at checkout.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-slate-100 block">Stripe-Ready Security</strong>
                <span className="text-slate-400">Pure server-side price & discount validation.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 LoyalShop Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for repeat customer loyalty.
          </p>
        </div>
      </div>
    </footer>
  );
}
