import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { setAuthCookie, checkRateLimit } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'customer',
        loyalty: {
          create: {
            isRegular: false,
            streakCount: 0,
            currentDiscountPercent: 0,
          },
        },
      },
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'welcome',
        message: `Welcome to LoyalShop, ${name}! Make your first purchase to start building your loyalty streak and earn automatic discounts.`,
      },
    });

    await setAuthCookie({ userId: user.id, email: user.email, role: user.role });

    return NextResponse.json({
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    }, { status: 201 });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
