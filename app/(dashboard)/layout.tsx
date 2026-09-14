import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { DashboardLayoutClient } from '@/components/dashboard/DashboardLayoutClient';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;

  if (!adminSession) {
    redirect('/login');
  }

  return (
    <DashboardLayoutClient userEmail={adminSession}>
      {children}
    </DashboardLayoutClient>
  );
}
