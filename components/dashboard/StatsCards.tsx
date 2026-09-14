import React from 'react';
import { Package, CheckCircle2, HardDrive, QrCode } from 'lucide-react';
import { formatBytes } from '@/lib/utils/format';

interface StatsCardsProps {
  totalProducts: number;
  activeProducts: number;
  totalPdfSize: number;
}

export function StatsCards({
  totalProducts,
  activeProducts,
  totalPdfSize,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Products',
      value: totalProducts,
      icon: Package,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-950/40 border-indigo-500/30',
      description: 'Registered inventory items',
    },
    {
      label: 'Active QR Codes',
      value: activeProducts,
      icon: QrCode,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-500/30',
      description: 'Permanently linked & scannable',
    },
    {
      label: 'Manuals Stored',
      value: formatBytes(totalPdfSize),
      icon: HardDrive,
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/40 border-blue-500/30',
      description: 'Secure Supabase PDF storage',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-lg relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl border ${stat.bgColor}`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {stat.value}
            </div>
            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
          </div>
        );
      })}
    </div>
  );
}
