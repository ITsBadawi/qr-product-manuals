import Link from 'next/link';
import { getProducts } from '@/lib/db';
import { ProductTable } from '@/components/products/ProductTable';
import { Button } from '@/components/ui/Button';
import { Plus, Package } from 'lucide-react';

export const metadata = {
  title: 'All Products',
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Product Manuals</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your store's products, replace PDF manuals in Cloudflare R2, and export permanent QR codes.
          </p>
        </div>

        <Link href="/dashboard/products/new">
          <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Main Product Table Component */}
      <ProductTable initialProducts={products} />
    </div>
  );
}
