'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import {
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Clock,
  TrendingUp,
  Percent,
  CheckCircle,
  Star,
  ShoppingBag,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function HomePage() {
  const { user, loyalty } = useAuth();
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) {
          setFeaturedProducts(data.products.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const discountPercent = loyalty?.isRegular ? loyalty.discountPercent : 0;

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-semibold tracking-wide text-amber-300 backdrop-blur-md">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>The Regular Customer Loyalty Strategy</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] text-white">
            Buy once every 10 days.{' '}
            <span className="bg-gradient-to-r from-amber-300 via-amber-200 to-amber-400 bg-clip-text text-transparent">
              Save up to 20%
            </span>{' '}
            automatically.
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100/90 leading-relaxed font-normal">
            No coupon codes. No monthly fees. Simply shop at least once every 10 days to earn and keep an automatic discount on every single order.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-5 h-5" />
              Start Shopping Now
            </Link>

            <Link
              href="/loyalty"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-6 py-4 rounded-xl text-base border border-white/20 backdrop-blur-md transition"
            >
              How Loyalty Works <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12 max-w-4xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">10 Days</span>
              <span className="text-xs text-indigo-200 font-medium">Rolling Window</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-emerald-400">10% Base</span>
              <span className="text-xs text-indigo-200 font-medium">Regular Discount</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-amber-300">Up to 20%</span>
              <span className="text-xs text-indigo-200 font-medium">Streak Tiers</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <span className="block text-2xl sm:text-3xl font-black text-indigo-300">100% Auto</span>
              <span className="text-xs text-indigo-200 font-medium">No Codes Needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
            Transparent Reward Strategy
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How The 10-Day Loyalty Rule Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base">
            Keep your streak alive and watch your discounts compound automatically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition relative">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xl mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Place an Order</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Complete any purchase. Your order instantly activates your <strong>Regular Customer</strong> status and starts a 10-day countdown timer.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <CheckCircle className="w-3.5 h-3.5" />
              Activates 10% base discount
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Reorder Within 10 Days</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Each new paid order resets your 10-day clock and increments your <strong>Streak Count</strong>. Reaching Streak 3 unlocks 15%, and Streak 6 unlocks 20%!
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 fill-amber-500" />
              Timer resets + streak increases
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-xl mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Win It Back Anytime</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Missed the 10-day window? No penalty! Your next completed purchase instantly restores your status and starts your discount streak anew.
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
              <Clock className="w-3.5 h-3.5" />
              Always win it back on next order
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
              Handpicked Essentials
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              Featured Products
            </h2>
            <p className="text-slate-500 text-sm">
              Member pricing applies automatically at checkout.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-indigo-600 hover:text-indigo-700"
          >
            Browse all products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
                <div className="h-48 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => {
              const discountedPrice = discountPercent > 0
                ? Math.round((product.price * (1 - discountPercent / 100)) * 100) / 100
                : null;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all flex flex-col group"
                >
                  <Link href={`/products/${product.id}`} className="relative h-48 overflow-hidden bg-slate-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discountPercent > 0 && (
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </Link>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                        {product.category}
                      </span>
                      <Link href={`/products/${product.id}`}>
                        <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mt-0.5">
                          {product.name}
                        </h3>
                      </Link>
                      <p className="text-slate-500 text-xs line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {discountedPrice ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-black text-slate-900">
                              ${discountedPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-slate-400 line-through">
                              ${product.price.toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-lg font-black text-slate-900">
                            ${product.price.toFixed(2)}
                          </span>
                        )}
                        <span className="block text-[10px] text-emerald-600 font-semibold">
                          {loyalty?.isRegular ? 'Regular Member Price' : '10% off for Regulars'}
                        </span>
                      </div>

                      <button
                        onClick={() => addItem(product)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition shadow-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Customer Testimonials */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Loved by Consistent Shoppers
            </h2>
            <p className="text-slate-600 text-sm">
              See why our repeat customer model has created the most loyal community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                &ldquo;I buy coffee beans and desk gear twice a month. Hitting the 20% streak tier was effortless, and the discount just applies automatically at checkout!&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100">
                <strong className="block text-xs font-bold text-slate-900">Sophia K.</strong>
                <span className="text-[11px] text-indigo-600 font-semibold">Streak 6 • 20% Member</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                &ldquo;The 10-day countdown ring in my account dashboard is so clear. Getting reminders on day 7 and 9 keeps me on track so I never lose my discount.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100">
                <strong className="block text-xs font-bold text-slate-900">Marcus T.</strong>
                <span className="text-[11px] text-indigo-600 font-semibold">Streak 3 • 15% Member</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                &ldquo;I went on vacation and my status expired, but my very first order won it right back! Truly fair business rules with zero gimmicks.&rdquo;
              </p>
              <div className="pt-2 border-t border-slate-100">
                <strong className="block text-xs font-bold text-slate-900">Elena R.</strong>
                <span className="text-[11px] text-indigo-600 font-semibold">Regular Customer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-gradient-to-r from-indigo-900 to-indigo-950 rounded-3xl p-10 sm:p-14 text-white shadow-xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to Start Your 10-Day Loyalty Streak?
          </h2>
          <p className="text-indigo-200 max-w-xl mx-auto text-sm sm:text-base">
            Create an account in 30 seconds. Complete your first purchase to lock in your Regular Customer status and savings.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              href="/shop"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold px-8 py-3.5 rounded-xl shadow-lg transition"
            >
              Shop the Collection
            </Link>
            {!user && (
              <Link
                href="/register"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3.5 rounded-xl border border-white/20 transition"
              >
                Create Account
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
