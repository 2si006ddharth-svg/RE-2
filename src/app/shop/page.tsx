'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { Search, SlidersHorizontal, Sparkles, Check, ShoppingBag } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

export default function ShopPage() {
  const { user, loyalty } = useAuth();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const query = new URLSearchParams();
    if (selectedCategory !== 'all') query.set('category', selectedCategory);
    if (search) query.set('search', search);
    if (sort) query.set('sort', sort);

    fetch(`/api/products?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedCategory, search, sort]);

  const discountPercent = loyalty?.isRegular ? loyalty.discountPercent : 0;

  const handleAddToCart = (product: Product) => {
    addItem(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Store Collection
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {loyalty?.isRegular ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Your Regular Customer {loyalty.discountPercent}% discount applies automatically at checkout!
              </span>
            ) : (
              'Every order keeps your 10-day rolling loyalty discount alive.'
            )}
          </p>
        </div>

        {/* Search & Sort */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm text-sm">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-slate-700 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
            selectedCategory === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Items ({products.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-4">
              <div className="h-52 bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No products found</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto">
            Try adjusting your search or category filter.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('all');
            }}
            className="text-xs font-bold text-indigo-600 underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const discountedPrice = discountPercent > 0
              ? Math.round((product.price * (1 - discountPercent / 100)) * 100) / 100
              : null;

            const isJustAdded = addedId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col group"
              >
                <Link href={`/products/${product.id}`} className="relative h-56 overflow-hidden bg-slate-100">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {discountPercent > 0 ? (
                    <span className="absolute top-2.5 right-2.5 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-md shadow">
                      {discountPercent}% OFF
                    </span>
                  ) : (
                    <span className="absolute top-2.5 right-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                      Regular: 10% Off
                    </span>
                  )}
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      {product.category}
                    </span>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1 mt-0.5 text-base">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-slate-500 text-xs line-clamp-2 mt-1">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      {discountedPrice ? (
                        <div className="flex items-baseline gap-2">
                          <span className="text-xl font-black text-slate-900">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xl font-black text-slate-900">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        {loyalty?.isRegular ? 'Your Member Price' : 'Standard Price'}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`text-xs font-bold py-2 px-3.5 rounded-xl transition flex items-center gap-1.5 shadow-sm ${
                        isJustAdded
                          ? 'bg-emerald-600 text-white'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
