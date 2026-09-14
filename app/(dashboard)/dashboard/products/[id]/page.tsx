import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/db';
import { ProductForm } from '@/components/products/ProductForm';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  return {
    title: product ? `Edit: ${product.name}` : 'Product Details',
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Products</span>
          </Link>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">{product.name}</h2>
            {product.sku && (
              <span className="font-mono text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md">
                {product.sku}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanent Product ID: <span className="font-mono text-indigo-400">{product.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href={`/p/${product.id}`} target="_blank">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              View Public QR Page
            </Button>
          </Link>
        </div>
      </div>

      {/* Edit Form with PDF Replacement & QR Controls */}
      <ProductForm initialProduct={product} mode="edit" />
    </div>
  );
}
