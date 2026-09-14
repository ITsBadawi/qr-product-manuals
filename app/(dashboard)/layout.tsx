import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = await auth.getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient userEmail={session.user.email || session.user.name || 'User'}>
      {children}
    </DashboardLayoutClient>
  );
}
