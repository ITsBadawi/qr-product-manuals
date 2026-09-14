'use client';

import React, { useState } from 'react';
import { Download, ExternalLink, FileText, Maximize2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatBytes } from '@/lib/utils/format';

interface PDFViewerProps {
  pdfUrl: string;
  productName: string;
  originalName: string;
  fileSize: number;
}

export function PDFViewer({
  pdfUrl,
  productName,
  originalName,
  fileSize,
}: PDFViewerProps) {
  const [showEmbedded, setShowEmbedded] = useState(true);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Quick Action Bar for Scanners / Mobile users */}
      <div className="w-full mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-3 rounded-xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">{originalName}</h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Official Instruction Manual • {formatBytes(fileSize)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="outline"
              size="md"
              className="w-full"
              leftIcon={<ExternalLink className="w-4 h-4" />}
            >
              Open Fullscreen
            </Button>
          </a>

          <a
            href={`${pdfUrl}&download=1`}
            download={originalName}
            className="flex-1 sm:flex-none"
          >
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Embedded Document Viewer Container */}
      <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-2xl relative min-h-[500px] lg:min-h-[750px] flex flex-col">
        {/* Document Top Bar */}
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300 truncate max-w-[250px] sm:max-w-md">
            Document: {originalName}
          </span>
          <div className="flex items-center gap-3">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pop Out</span>
            </a>
          </div>
        </div>

        {/* The PDF Object / iFrame */}
        <div className="w-full flex-1 relative bg-slate-900">
          <object
            data={pdfUrl}
            type="application/pdf"
            className="w-full h-full min-h-[500px] lg:min-h-[750px]"
            title={`Instruction manual for ${productName}`}
          >
            {/* Fallback for devices / mobile browsers that cannot render inline PDF */}
            <div className="p-8 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 mb-4">
                <FileText className="w-10 h-10 text-indigo-400" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Preview not supported by your browser
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Most mobile browsers require viewing PDF files in full screen or a dedicated viewer.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <Button variant="primary" leftIcon={<ExternalLink className="w-4 h-4" />}>
                    Open Manual
                  </Button>
                </a>
                <a href={`${pdfUrl}&download=1`} download={originalName}>
                  <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>
                    Download Manual
                  </Button>
                </a>
              </div>
            </div>
          </object>
        </div>
      </div>
    </div>
  );
}
