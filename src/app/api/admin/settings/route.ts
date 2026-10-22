import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromRequest } from '@/lib/auth';
import { DEFAULT_CONFIG } from '@/lib/config';

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const settingsFromDb = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settingsFromDb.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const config = {
      REGULAR_WINDOW_DAYS: settingsMap['REGULAR_WINDOW_DAYS']
        ? parseInt(settingsMap['REGULAR_WINDOW_DAYS'], 10)
        : DEFAULT_CONFIG.REGULAR_WINDOW_DAYS,
      BASE_DISCOUNT: settingsMap['BASE_DISCOUNT']
        ? parseInt(settingsMap['BASE_DISCOUNT'], 10)
        : DEFAULT_CONFIG.BASE_DISCOUNT,
      MAX_DISCOUNT_CAP: settingsMap['MAX_DISCOUNT_CAP']
        ? parseInt(settingsMap['MAX_DISCOUNT_CAP'], 10)
        : DEFAULT_CONFIG.MAX_DISCOUNT_CAP,
      STREAK_TIERS: settingsMap['STREAK_TIERS']
        ? JSON.parse(settingsMap['STREAK_TIERS'])
        : DEFAULT_CONFIG.STREAK_TIERS,
      REMINDER_DAYS: settingsMap['REMINDER_DAYS']
        ? JSON.parse(settingsMap['REMINDER_DAYS'])
        : DEFAULT_CONFIG.REMINDER_DAYS,
    };

    return NextResponse.json({ config });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const auth = await getAuthFromRequest(req);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();

    const allowedKeys = [
      'REGULAR_WINDOW_DAYS',
      'BASE_DISCOUNT',
      'MAX_DISCOUNT_CAP',
      'STREAK_TIERS',
      'REMINDER_DAYS',
    ];

    for (const key of allowedKeys) {
      if (key in body) {
        const val = typeof body[key] === 'object' ? JSON.stringify(body[key]) : String(body[key]);
        await prisma.setting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
