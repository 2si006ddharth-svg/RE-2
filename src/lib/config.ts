// LoyalShop Business Configuration
// All values are configurable — in production these come from the Settings DB table

export const DEFAULT_CONFIG = {
  // Loyalty Window
  REGULAR_WINDOW_DAYS: 10,

  // Base discount for Regular customers
  BASE_DISCOUNT: 10,

  // Streak tiers: [minStreak, maxStreak, discountPercent]
  STREAK_TIERS: [
    { min: 1, max: 2, discount: 10 },
    { min: 3, max: 5, discount: 15 },
    { min: 6, max: Infinity, discount: 20 },
  ] as const,

  // Maximum discount cap
  MAX_DISCOUNT_CAP: 25,

  // Reminder notification days (days of inactivity)
  REMINDER_DAYS: [7, 9],

  // Cron schedule for daily status recalculation (midnight UTC)
  CRON_SCHEDULE: '0 0 * * *',
} as const;

export type AppConfig = typeof DEFAULT_CONFIG;

// Helper to get config value, preferring DB settings over defaults
export function getConfigValue<K extends keyof AppConfig>(
  key: K,
  dbSettings?: Record<string, string>
): AppConfig[K] {
  if (dbSettings && key in dbSettings) {
    const raw = dbSettings[key];
    try {
      return JSON.parse(raw) as AppConfig[K];
    } catch {
      return raw as unknown as AppConfig[K];
    }
  }
  return DEFAULT_CONFIG[key];
}
