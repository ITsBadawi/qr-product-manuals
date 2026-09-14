'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Printer, Download, QrCode } from 'lucide-react';
import { generateQrPngDataUrl, getProductPermanentUrl, downloadQrPng, downloadQrSvg } from '@/lib/utils/qr';
import { useToast } from '@/components/ui/Toast';

interface QRPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  sku?: string | null;
}

export function QRPrintModal({
  isOpen,
  onClose,
  productId,
  productName,
  sku,
}: QRPrintModalProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const { success } = useToast();

  const permanentUrl = getProductPermanentUrl(productId);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    generateQrPngDataUrl(permanentUrl, { width: 1024, margin: 2 })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => console.error(err));

    return () => {
      isMounted = false;
    };
  }, [isOpen, permanentUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Print QR Code Label"
        description="Warehouse & retail ready physical label. Formatted for thermal and laser printers."
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Label Preview Card (Screen Preview) */}
          <div className="flex justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800">
            {/* The physical sticker simulator */}
            <div className="w-72 bg-white text-black p-6 rounded-2xl shadow-2xl flex flex-col items-center text-center border border-slate-300">
              <div className="flex items-center gap-1.5 text-[11px] font-black tracking-widest text-slate-500 uppercase mb-1">
                <QrCode className="w-3.5 h-3.5 text-black" />
                <span>Product Manual</span>
              </div>

              <h2 className="text-base font-black tracking-tight text-black line-clamp-2 leading-snug">
                {productName}
              </h2>

              {sku && (
                <div className="mt-1 px-2.5 py-0.5 rounded bg-black text-white text-[10px] font-mono font-bold">
                  SKU: {sku}
                </div>
              )}

              <div className="my-4 p-2 bg-white rounded-xl flex items-center justify-center">
                {dataUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={dataUrl}
                    alt={`QR Code for ${productName}`}
                    width={180}
                    height={180}
                    className="aspect-square object-contain"
                  />
                ) : (
                  <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-lg" />
                )}
              </div>

              <p className="text-[11px] font-bold text-slate-700">
                Scan with camera for instructions
              </p>
              <p className="text-[9px] font-mono text-slate-500 mt-0.5 break-all max-w-[220px]">
                {permanentUrl}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadQrPng(productId, productName, permanentUrl);
                  success('PNG downloaded');
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  downloadQrSvg(productId, productName, permanentUrl);
                  success('SVG downloaded');
                }}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                SVG
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Done
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Label
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Dedicated Print Only Element - Rendered outside dialog for @media print */}
      {isOpen && (
        <div id="qr-printable-area" className="hidden">
          <div
            style={{
              width: '80mm',
              minHeight: '80mm',
              padding: '6mm',
              backgroundColor: '#ffffff',
              color: '#000000',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              border: '2px dashed #cccccc',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                fontSize: '9pt',
                fontWeight: 800,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                color: '#555555',
                marginBottom: '2mm',
              }}
            >
              PRODUCT INSTRUCTION MANUAL
            </div>

            <div
              style={{
                fontSize: '13pt',
                fontWeight: 900,
                color: '#000000',
                lineHeight: '1.2',
                marginBottom: '2mm',
                maxWidth: '70mm',
              }}
            >
              {productName}
            </div>

            {sku && (
              <div
                style={{
                  fontSize: '9pt',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '1mm 3mm',
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderRadius: '2mm',
                  marginBottom: '2mm',
                }}
              >
                SKU: {sku}
              </div>
            )}

            {dataUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={dataUrl}
                alt={productName}
                style={{
                  width: '45mm',
                  height: '45mm',
                  margin: '2mm 0',
                }}
              />
            )}

            <div
              style={{
                fontSize: '8pt',
                fontWeight: 700,
                color: '#333333',
                marginTop: '1mm',
              }}
            >
              Scan with phone camera to view manual
            </div>
            <div
              style={{
                fontSize: '7pt',
                fontFamily: 'monospace',
                color: '#777777',
                marginTop: '1mm',
              }}
            >
              {permanentUrl}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
