'use client';

import React, { useEffect, useState } from 'react';
import { generateQrPngDataUrl, getProductPermanentUrl } from '@/lib/utils/qr';
import { Copy, Check, ExternalLink, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QRDisplayProps {
  productId: string;
  productName: string;
  sku?: string | null;
  size?: number;
  showUrl?: boolean;
}

export function QRDisplay({
  productId,
  productName,
  sku,
  size = 220,
  showUrl = true,
}: QRDisplayProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { success } = useToast();

  const permanentUrl = getProductPermanentUrl(productId);

  useEffect(() => {
    let isMounted = true;
    generateQrPngDataUrl(permanentUrl, { width: 512, margin: 2 })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => console.error('Error generating QR preview:', err));

    return () => {
      isMounted = false;
    };
  }, [permanentUrl]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(permanentUrl);
      setCopied(true);
      success('Permanent QR link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Physical sticker simulation card */}
      <div className="relative p-5 rounded-2xl bg-white border border-slate-200 shadow-xl flex flex-col items-center text-center text-slate-900 transition-transform duration-200 hover:scale-[1.01]">
        {/* Top brand / label callout */}
        <div className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mb-1 flex items-center gap-1">
          <QrCode className="w-3 h-3" />
          <span>Product Manual</span>
        </div>

        {/* Product Title */}
        <h4 className="text-sm font-bold max-w-[200px] truncate text-slate-900 leading-tight">
          {productName}
        </h4>
        {sku && (
          <span className="text-[10px] font-semibold text-slate-500 tracking-wider mt-0.5">
            SKU: {sku}
          </span>
        )}

        {/* The QR Code Graphic */}
        <div className="my-3 bg-white p-2 rounded-xl flex items-center justify-center">
          {dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={dataUrl}
              alt={`QR Code for ${productName}`}
              width={size}
              height={size}
              className="rounded-lg aspect-square object-contain"
            />
          ) : (
            <div
              style={{ width: size, height: size }}
              className="bg-slate-100 rounded-lg animate-pulse flex items-center justify-center"
            >
              <QrCode className="w-8 h-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Bottom instruction */}
        <p className="text-[10px] font-medium text-slate-500">Scan to read manual</p>
        <span className="text-[9px] font-mono text-slate-400 mt-0.5">/p/{productId.slice(0, 8)}...</span>
      </div>

      {/* Permanent URL banner & copy */}
      {showUrl && (
        <div className="mt-4 w-full max-w-sm flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <span className="font-mono text-slate-400 truncate text-[11px]" title={permanentUrl}>
            {permanentUrl}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={copyLink}
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Copy permanent URL"
              aria-label="Copy permanent URL"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <a
              href={permanentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Open public page in new tab"
              aria-label="Open public page in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
