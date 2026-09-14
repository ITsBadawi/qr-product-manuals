'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  QrCode,
  LogOut,
  X,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useToast } from '@/components/ui/Toast';
import { authClient } from '@/lib/auth/client';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  userEmail?: string | null;
}

export function Sidebar({ isOpen, onClose, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { info } = useToast();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      info('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      active: pathname === '/dashboard',
    },
    {
      name: 'Products',
      href: '/dashboard/products',
      icon: Package,
      active: pathname.startsWith('/dashboard/products') && pathname !== '/dashboard/products/new',
    },
    {
      name: 'Add Product',
      href: '/dashboard/products/new',
      icon: PlusCircle,
      active: pathname === '/dashboard/products/new',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-64 flex flex-col justify-between bg-slate-950 border-r border-slate-800/80 p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top Branding */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white block leading-tight">
                  QR Manual Hub
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400">
                  Permanent QR System
                </span>
              </div>
            </Link>

            {/* Mobile Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    item.active
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', item.active ? 'text-white' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Sign Out */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          {userEmail && (
            <div className="px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Signed In
              </span>
              <p className="text-slate-300 font-medium truncate mt-0.5" title={userEmail}>
                {userEmail}
              </p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
