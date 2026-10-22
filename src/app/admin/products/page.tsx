'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Package, Loader2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  active: boolean;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchProducts = () => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    setMessage(null);

    try {
      const url = isNew
        ? '/api/admin/products'
        : `/api/admin/products/${editingProduct.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editingProduct.name,
          description: editingProduct.description,
          price: Number(editingProduct.price),
          stock: Number(editingProduct.stock),
          category: editingProduct.category,
          imageUrl: editingProduct.imageUrl,
          active: editingProduct.active,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Product ${isNew ? 'created' : 'updated'} successfully!`);
        setEditingProduct(null);
        setIsNew(false);
        fetchProducts();
      } else {
        setMessage(data.error || 'Failed to save product');
      }
    } catch {
      setMessage('Error saving product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to deactivate this product?')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProducts();
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Product Catalog Management
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Create, edit, and organize merchandise for the storefront.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNew(true);
            setEditingProduct({
              id: '',
              name: '',
              description: '',
              price: 29.99,
              stock: 50,
              category: 'Audio',
              imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
              active: true,
            });
          }}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-200 text-xs font-semibold">
          {message}
        </div>
      )}

      {/* Product Edit / Create Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">
                {isNew ? 'Create New Product' : 'Edit Product'}
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, description: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1">
                    Stock Units
                  </label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        stock: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={editingProduct.category}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, category: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 uppercase tracking-wider mb-1">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={editingProduct.imageUrl}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, imageUrl: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-900/50 transition">
                <td className="p-4 flex items-center gap-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                  />
                  <div>
                    <strong className="block text-white font-bold">{p.name}</strong>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{p.description}</span>
                  </div>
                </td>
                <td className="p-4 font-semibold text-slate-400">{p.category}</td>
                <td className="p-4 font-bold text-white">${p.price.toFixed(2)}</td>
                <td className="p-4">
                  <span
                    className={`font-semibold ${
                      p.stock > 10 ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {p.stock} units
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      p.active
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {p.active ? 'Active' : 'Archived'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setIsNew(false);
                        setEditingProduct(p);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400"
                      title="Deactivate"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
