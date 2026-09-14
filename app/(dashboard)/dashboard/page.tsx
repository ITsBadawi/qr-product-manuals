import Link from 'next/link';
import { getProducts } from '@/lib/db';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { ProductTable } from '@/components/products/ProductTable';
import { Button } from '@/components/ui/Button';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Overview Dashboard',
};

export default async function DashboardPage() {
  const products = await getProducts();

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.is_active).length;
  const totalPdfSize = products.reduce((acc, curr) => acc + (Number(curr.pdf_size) || 0), 0);
  const recentProducts = products.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-slate-900/60 border border-indigo-500/20 shadow-xl backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Permanent QR Engine & Cloudflare R2 Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Warehouse Manuals Hub
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            Update, replace, and distribute product instruction PDFs without ever invalidating or
            reprinting physical QR codes. Powered by Cloudflare R2 storage.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <Link href="/dashboard/products/new">
            <Button size="lg" leftIcon={<Plus className="w-5 h-5" />}>
              Add New Product
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <StatsCards
        totalProducts={totalProducts}
        activeProducts={activeProducts}
        totalPdfSize={totalPdfSize}
      />

      {/* Recent Products Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Recently Updated Products
            </h3>
            <p className="text-xs text-slate-400">
              Quick access to products and printable permanent QR stickers
            </p>
          </div>

          {products.length > 5 && (
            <Link
              href="/dashboard/products"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>View all ({totalProducts})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        <ProductTable initialProducts={recentProducts} />
      </div>
    </div>
  );
}
