import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import {
  QrCode,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Printer,
  Smartphone,
  CheckCircle2,
  FileText,
} from 'lucide-react';

import { cookies } from 'next/headers';

export default async function HomePage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get('admin_session')?.value;

  if (adminSession) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/25">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white block leading-tight">
              QR Manual Hub
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
              Permanent QR System
            </span>
          </div>
        </div>

        <Link href="/login">
          <Button variant="secondary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
            Owner Login
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Never Reprint a QR Code Again</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight sm:leading-none">
          Permanent QR Codes for <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
            Product Instruction PDFs
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mt-6 leading-relaxed">
          Stick permanent QR code labels on physical products in your warehouse or store. When you
          update or replace the instruction manual, the QR code continues working seamlessly
          without reprinting.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link href="/login">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Open Owner Dashboard
            </Button>
          </Link>
        </div>

        {/* 3-Step Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left w-full">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 w-fit mb-4">
              <Printer className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">1. Generate & Print Once</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Generate crisp vector SVG and thermal-printer-ready labels encoding an immutable
              application URL.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 w-fit mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">2. Replace PDF Anytime</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload revised instruction manuals without changing product IDs. The existing QR code
              instantly serves the new document.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-blue-400 w-fit mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white">3. Mobile-First Reading</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Customers scan with their phone camera to instantly view or download the manual with zero
              account requirements.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-600">
        <p>Production-ready serverless architecture built with Next.js, Cloudflare R2, and Neon DB.</p>
      </footer>
    </main>
  );
}
