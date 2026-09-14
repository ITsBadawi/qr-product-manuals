import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const expectedEmail = process.env.ADMIN_EMAIL || 'admin@warehouse.com';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'admin123456';

    const cleanInputEmail = email?.trim().toLowerCase();
    const cleanExpectedEmail = expectedEmail.trim().toLowerCase();

    // Verify credentials
    if (cleanInputEmail === cleanExpectedEmail && password === expectedPassword) {
      const cookieStore = await cookies();
      cookieStore.set('admin_session', cleanInputEmail, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });

      return NextResponse.json({ success: true, email: cleanInputEmail });
    }

    return NextResponse.json(
      { error: 'Invalid email or password. Please verify your admin credentials.' },
      { status: 401 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return NextResponse.json({ success: true });
}
