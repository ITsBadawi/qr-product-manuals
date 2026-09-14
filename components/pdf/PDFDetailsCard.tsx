import React from 'react';
import { FileText, Download, ExternalLink, HardDrive } from 'lucide-react';
import { formatBytes, formatDate } from '@/lib/utils/format';
import { Button } from '@/components/ui/Button';

interface PDFDetailsCardProps {
  originalName: string;
  size: number;
  updatedAt: string;
  pdfUrl?: string | null;
  productId: string;
}

export function PDFDetailsCard({
  originalName,
  size,
  updatedAt,
  pdfUrl,
  productId,
}: PDFDetailsCardProps) {
  const downloadUrl = pdfUrl || `/api/products/${productId}/pdf?download=1`;
  const viewUrl = pdfUrl || `/api/products/${productId}/pdf`;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white truncate max-w-sm" title={originalName}>
              {originalName}
            </h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                {formatBytes(size)}
              </span>
              <span className="text-slate-600">•</span>
              <span>Updated {formatDate(updatedAt)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Preview
            </Button>
          </a>

          <a
            href={downloadUrl}
            download={originalName}
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              leftIcon={<Download className="w-3.5 h-3.5" />}
            >
              Download
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
