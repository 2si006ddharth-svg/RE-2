import { NextRequest, NextResponse } from 'next/server';
import { runDailyLoyaltyJob } from '@/lib/cron';
import { prisma } from '@/lib/db';
import { getAuthFromCookies } from '@/lib/auth';

/**
 * Endpoint for testing / simulation:
 * 1. POST { days: number } - shifts last purchase dates back by N days for the logged in user or a specified user, simulating time passing
 * 2. POST { triggerCron: true } - executes the daily cron recalculation immediately
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    const body = await req.json().catch(() => ({}));
    const days = typeof body.days === 'number' ? body.days : 11;
    const targetUserId = body.userId || auth?.userId;

    if (!targetUserId && !body.triggerCron) {
      return NextResponse.json(
        { error: 'User ID or authenticated session required' },
        { status: 400 }
      );
    }

    if (body.triggerCron) {
      const cronResult = await runDailyLoyaltyJob();
      return NextResponse.json({ success: true, cronResult });
    }

    // Fast-forward user's last purchase date backward by X days (e.g. 11 days ago)
    const loyalty = await prisma.loyaltyStatus.findUnique({
      where: { userId: targetUserId },
    });

    if (!loyalty || !loyalty.lastPurchaseAt) {
      return NextResponse.json(
        { error: 'Customer has no purchase record to age' },
        { status: 400 }
      );
    }

    const shiftedPurchaseDate = new Date(
      loyalty.lastPurchaseAt.getTime() - days * 24 * 60 * 60 * 1000
    );

    // Also shift order paidAt dates so syncUserLoyaltyStatus reflects the shifted time
    await prisma.order.updateMany({
      where: { userId: targetUserId, status: 'paid' },
      data: {
        paidAt: shiftedPurchaseDate,
      },
    });

    // Run the cron/recalculation to process the new date
    const updatedLoyalty = await prisma.loyaltyStatus.update({
      where: { userId: targetUserId },
      data: {
        lastPurchaseAt: shiftedPurchaseDate,
        expiresAt: new Date(shiftedPurchaseDate.getTime() + 10 * 24 * 60 * 60 * 1000),
      },
    });

    // Now execute cron job to expire if days >= 10
    const cronResult = await runDailyLoyaltyJob(new Date());

    return NextResponse.json({
      success: true,
      message: `Simulated ${days} days passing. Last purchase shifted to ${shiftedPurchaseDate.toISOString()}`,
      loyalty: updatedLoyalty,
      cronResult,
    });
  } catch (error) {
    console.error('Simulate time error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
