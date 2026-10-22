'use client';

import React, { useEffect, useState } from 'react';
import { Save, CheckCircle2, RotateCcw, Sliders, AlertCircle, Loader2 } from 'lucide-react';

interface LoyaltyConfig {
  REGULAR_WINDOW_DAYS: number;
  BASE_DISCOUNT: number;
  MAX_DISCOUNT_CAP: number;
  STREAK_TIERS: Array<{ min: number; max: number; discount: number }>;
  REMINDER_DAYS: number[];
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<LoyaltyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSettings = () => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.config) setConfig(data.config);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Business rules and settings saved successfully!');
      } else {
        setMessage(data.error || 'Failed to save settings');
      }
    } catch {
      setMessage('Save error');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    setConfig({
      REGULAR_WINDOW_DAYS: 10,
      BASE_DISCOUNT: 10,
      MAX_DISCOUNT_CAP: 25,
      STREAK_TIERS: [
        { min: 1, max: 2, discount: 10 },
        { min: 3, max: 5, discount: 15 },
        { min: 6, max: 9999, discount: 20 },
      ],
      REMINDER_DAYS: [7, 9],
    });
  };

  if (loading) {
    return <div className="h-64 bg-slate-800 rounded-3xl animate-pulse" />;
  }

  if (!config) return null;

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Loyalty Strategy Configuration
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dynamically adjust rolling window durations, discount thresholds, and streak caps.
          </p>
        </div>

        <button
          onClick={resetToDefaults}
          className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-bold transition"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset to Defaults
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-indigo-950 border border-indigo-700 text-indigo-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-indigo-400" />
            Core Business Thresholds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs font-semibold">
            <div>
              <label className="block text-slate-400 uppercase tracking-wider mb-1">
                Regular Window (Days)
              </label>
              <input
                type="number"
                min={1}
                max={90}
                value={config.REGULAR_WINDOW_DAYS}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    REGULAR_WINDOW_DAYS: parseInt(e.target.value, 10) || 10,
                  })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Default: 10 days rolling window
              </span>
            </div>

            <div>
              <label className="block text-slate-400 uppercase tracking-wider mb-1">
                Base Discount (%)
              </label>
              <input
                type="number"
                min={0}
                max={50}
                value={config.BASE_DISCOUNT}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    BASE_DISCOUNT: parseInt(e.target.value, 10) || 10,
                  })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Default: 10% for Regular customers
              </span>
            </div>

            <div>
              <label className="block text-slate-400 uppercase tracking-wider mb-1">
                Max Discount Cap (%)
              </label>
              <input
                type="number"
                min={5}
                max={100}
                value={config.MAX_DISCOUNT_CAP}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    MAX_DISCOUNT_CAP: parseInt(e.target.value, 10) || 25,
                  })
                }
                required
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 font-bold"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Default: 25% hard cap
              </span>
            </div>
          </div>
        </div>

        {/* Streak Tiers Config */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Streak Tiers Mapping
          </h2>
          <p className="text-xs text-slate-400">
            Configure order streaks required to unlock higher discount percentages.
          </p>

          <div className="space-y-3">
            {config.STREAK_TIERS.map((tier, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-slate-900 p-3.5 rounded-2xl border border-slate-800 text-xs font-semibold"
              >
                <span className="w-16 text-slate-400 font-bold">Tier {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Streak:</span>
                  <span className="text-white font-mono">{tier.min}</span>
                  <span className="text-slate-500">to</span>
                  <span className="text-white font-mono">
                    {tier.max > 1000 ? '6+' : tier.max}
                  </span>
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <span className="text-slate-500">Discount:</span>
                  <span className="text-amber-400 font-black text-sm">{tier.discount}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reminder Days Config */}
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Notification Reminder Days
          </h2>
          <p className="text-xs text-slate-400">
            Dispatch in-app & email warnings on specific days of inactivity.
          </p>

          <div className="flex items-center gap-3">
            {config.REMINDER_DAYS.map((d, i) => (
              <div
                key={i}
                className="bg-indigo-950/80 border border-indigo-700 px-4 py-2 rounded-xl text-indigo-200 text-xs font-bold"
              >
                Day {d} of Inactivity
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save & Apply Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
