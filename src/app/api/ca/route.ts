import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const ADMIN_PASSWORD = 'Gitup1234';
const CA_KEY = 'homepage_ca';

// GET - Retrieve current CA
export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: CA_KEY },
    });
    return NextResponse.json({ ca: setting?.value || '' });
  } catch {
    return NextResponse.json({ ca: '' });
  }
}

// POST - Save a new CA (password protected)
export async function POST(req: NextRequest) {
  try {
    const { ca, password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    if (!ca || typeof ca !== 'string' || ca.trim().length === 0) {
      return NextResponse.json({ error: 'CA is required' }, { status: 400 });
    }

    const trimmedCa = ca.trim();

    await prisma.siteSetting.upsert({
      where: { key: CA_KEY },
      update: { value: trimmedCa },
      create: { key: CA_KEY, value: trimmedCa },
    });

    return NextResponse.json({ success: true, ca: trimmedCa });
  } catch {
    return NextResponse.json({ error: 'Failed to save CA' }, { status: 500 });
  }
}

// DELETE - Remove the CA (password protected)
export async function DELETE(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    await prisma.siteSetting.deleteMany({
      where: { key: CA_KEY },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete CA' }, { status: 500 });
  }
}
