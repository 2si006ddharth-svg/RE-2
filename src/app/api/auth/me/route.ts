import { NextResponse } from 'next/server';
import { getAuthFromCookies } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) {
      return NextResponse.json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
