'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, Plus, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  onMenuToggle: () => void;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Header({ onMenuToggle, title, subtitle, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-4 sm:px-8 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 lg:hidden"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title */}
        <div>
          {title && (
            <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 hidden sm:block mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5">
        {action || (
          <Link href="/dashboard/products/new">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Product
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
