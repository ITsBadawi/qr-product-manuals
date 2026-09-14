import React from 'react';
import { getProductById } from '@/lib/db';
import { getR2SignedUrl } from '@/lib/storage/r2';
import { PDFViewer } from '@/components/pdf/PDFViewer';
import { formatDate, formatBytes } from '@/lib/utils/format';
import { QrCode, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PublicProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PublicProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product || !product.is_active) {
    return {
      title: 'Product Manual Unavailable',
    };
  }

  return {
    title: `${product.name} - Official Instruction Manual`,
    description: `View and download the official instruction manual for ${product.name}.`,
  };
}

export default async function PublicProductPage({ params }: PublicProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  // Check if product exists and is active
  if (!product || !product.is_active) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100">
        <div className="w-full max-w-md text-center p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/60 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">
            Manual Currently Unavailable
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            The instruction manual for this product is currently inactive or being updated. Please
            contact store or warehouse staff for assistance.
          </p>

          <div className="mt-6 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 text-left space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Scanned Reference ID
            </span>
            <p className="font-mono text-xs text-slate-300 break-all">{id}</p>
          </div>
        </div>
      </main>
    );
  }

  // Generate secure signed URL from Cloudflare R2 for the document viewer
  let pdfUrl = `/api/products/${product.id}/pdf`;
  try {
    pdfUrl = await getR2SignedUrl(product.pdf_path, 3600);
  } catch (err) {
    console.error('Error generating presigned URL from R2:', err);
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Public Header */}
      <header className="sticky top-0 z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs sm:text-sm font-bold tracking-tight text-white block leading-tight">
              Product Instruction Manual
            </span>
            <span className="text-[10px] text-slate-400 hidden sm:block">
              Official Digital Documentation (Cloudflare R2 Protected)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="hidden sm:inline">Verified Product</span>
        </div>
      </header>

      {/* Main Public Document Screen */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Product Identity Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                Instruction Manual
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {product.name}
              </h1>
            </div>

            {product.sku && (
              <div className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700/80 text-xs font-mono font-bold text-slate-300">
                SKU: {product.sku}
              </div>
            )}
          </div>

          {product.description && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl pt-1">
              {product.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Last Updated: {formatDate(product.updated_at)}</span>
            <span className="text-slate-600">•</span>
            <span>File Size: {formatBytes(product.pdf_size)}</span>
          </div>
        </div>

        {/* PDF Viewer Component */}
        <PDFViewer
          pdfUrl={pdfUrl}
          productName={product.name}
          originalName={product.pdf_original_name}
          fileSize={product.pdf_size}
        />
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-600">
        <p>Powered by Permanent QR Code Manual Architecture & Cloudflare R2.</p>
        <p className="text-[11px] mt-0.5 text-slate-700">
          This document updates automatically when revisions are published.
        </p>
      </footer>
    </div>
  );
}
