import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { calculateLoyaltyStatus } from '@/lib/discount-engine';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const loyalty = await prisma.loyaltyStatus.findUnique({
      where: { userId: auth.userId },
    });

    if (!loyalty) {
      return NextResponse.json({
        loyalty: {
          isRegular: false,
          discountPercent: 0,
          daysRemaining: -1,
          streakCount: 0,
          expiresAt: null,
          lastPurchaseAt: null,
        },
      });
    }

    const status = calculateLoyaltyStatus({
      lastPurchaseAt: loyalty.lastPurchaseAt,
      streakCount: loyalty.streakCount,
    });

    return NextResponse.json({
      loyalty: {
        ...status,
        lastPurchaseAt: loyalty.lastPurchaseAt,
      },
    });
  } catch (error) {
    console.error('Loyalty error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
