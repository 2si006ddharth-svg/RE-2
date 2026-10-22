export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initLoyaltyScheduler } = await import('@/lib/cron');
    initLoyaltyScheduler();
  }
}
