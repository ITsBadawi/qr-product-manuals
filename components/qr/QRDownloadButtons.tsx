'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Download, Printer, FileImage, Sparkles } from 'lucide-react';
import { downloadQrPng, downloadQrSvg, getProductPermanentUrl } from '@/lib/utils/qr';
import { useToast } from '@/components/ui/Toast';

interface QRDownloadButtonsProps {
  productId: string;
  productName: string;
  onPrint?: () => void;
  size?: 'sm' | 'md';
}

export function QRDownloadButtons({
  productId,
  productName,
  onPrint,
  size = 'md',
}: QRDownloadButtonsProps) {
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [downloadingSvg, setDownloadingSvg] = useState(false);
  const { success, error } = useToast();

  const permanentUrl = getProductPermanentUrl(productId);

  const handleDownloadPng = async () => {
    try {
      setDownloadingPng(true);
      await downloadQrPng(productId, productName, permanentUrl);
      success('High-resolution PNG downloaded');
    } catch (err) {
      console.error(err);
      error('Failed to generate PNG download');
    } finally {
      setDownloadingPng(false);
    }
  };

  const handleDownloadSvg = async () => {
    try {
      setDownloadingSvg(true);
      await downloadQrSvg(productId, productName, permanentUrl);
      success('Crisp Vector SVG downloaded');
    } catch (err) {
      console.error(err);
      error('Failed to generate SVG download');
    } finally {
      setDownloadingSvg(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size={size}
        isLoading={downloadingPng}
        onClick={handleDownloadPng}
        leftIcon={<Download className="w-4 h-4" />}
      >
        PNG (1024px)
      </Button>

      <Button
        variant="secondary"
        size={size}
        isLoading={downloadingSvg}
        onClick={handleDownloadSvg}
        leftIcon={<FileImage className="w-4 h-4" />}
      >
        Vector SVG
      </Button>

      {onPrint && (
        <Button
          variant="outline"
          size={size}
          onClick={onPrint}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Label
        </Button>
      )}
    </div>
  );
}
