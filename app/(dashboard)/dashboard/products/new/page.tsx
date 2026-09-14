import React from 'react';
import Link from 'next/link';
import { ProductForm } from '@/components/products/ProductForm';
import { ArrowLeft, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Add New Product',
};

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      {/* Back link & page title */}
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Products</span>
        </Link>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Add New Product</h2>
          <span className="px-2 py-0.5 rounded-md bg-indigo-950/60 border border-indigo-500/30 text-[10px] font-semibold text-indigo-300">
            Step-by-Step
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Enter product details and attach an instruction manual. A permanent QR code will be
          automatically generated.
        </p>
      </div>

      {/* Wizard Form */}
      <ProductForm mode="create" />
    </div>
  );
}
