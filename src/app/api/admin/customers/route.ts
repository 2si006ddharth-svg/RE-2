import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { calculateLoyaltyStatus } from '@/lib/discount-engine';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      where: { role: 'customer' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        loyalty: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            paidAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = customers.map((c) => {
      const paidOrders = c.orders.filter((o) => o.status === 'paid');
      const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);

      const status = calculateLoyaltyStatus({
        lastPurchaseAt: c.loyalty?.lastPurchaseAt || null,
        streakCount: c.loyalty?.streakCount || 0,
      });

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        createdAt: c.createdAt,
        totalOrders: paidOrders.length,
        totalSpent: Math.round(totalSpent * 100) / 100,
        loyalty: {
          ...status,
          lastPurchaseAt: c.loyalty?.lastPurchaseAt || null,
        },
      };
    });

    return NextResponse.json({ customers: enriched });
  } catch (error) {
    console.error('Admin customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
