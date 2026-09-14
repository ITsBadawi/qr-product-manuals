'use client';

import React, { useState, useRef } from 'react';
import { FileUp, FileCheck, AlertCircle, X } from 'lucide-react';
import { validatePdfFile } from '@/lib/validations/product';
import { formatBytes } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface PDFDropzoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  uploadProgress?: number;
  isUploading?: boolean;
  disabled?: boolean;
  label?: string;
  sublabel?: string;
}

export function PDFDropzone({
  onFileSelect,
  selectedFile,
  uploadProgress = 0,
  isUploading = false,
  disabled = false,
  label = 'Upload Instruction Manual',
  sublabel = 'Drag & drop your PDF manual here, or browse files',
}: PDFDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled || isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleProcessFile = (file: File) => {
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      setErrorMessage(validation.error || 'Invalid PDF file');
      onFileSelect(null);
      return;
    }

    setErrorMessage(null);
    onFileSelect(file);
  };

  const clearFile = () => {
    setErrorMessage(null);
    onFileSelect(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-2">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        aria-label="PDF File Upload Input"
      />

      {/* Dropzone container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => {
          if (!selectedFile && !disabled && !isUploading) {
            inputRef.current?.click();
          }
        }}
        className={cn(
          'relative rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer select-none',
          isDragging
            ? 'border-indigo-500 bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-slate-500 hover:bg-slate-900/70',
          selectedFile && 'border-indigo-500/60 bg-indigo-950/20 cursor-default',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        {selectedFile ? (
          /* Selected File State */
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left min-w-0">
              <div className="p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-400 shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate max-w-sm">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatBytes(selectedFile.size)} • PDF Document
                </p>
              </div>
            </div>

            {!isUploading && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    inputRef.current?.click();
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium px-3 py-1.5 rounded-lg bg-indigo-950/50 border border-indigo-800/60 hover:bg-indigo-900/50 transition-colors"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFile();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty / Prompt State */
          <div className="flex flex-col items-center justify-center py-4">
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 mb-3 group-hover:scale-110 transition-transform">
              <FileUp className="w-7 h-7 text-indigo-400" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200">{label}</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{sublabel}</p>
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs font-medium text-slate-300">
              <span>PDF only</span>
              <span className="w-1 h-1 rounded-full bg-slate-500" />
              <span>Max 50MB</span>
            </div>
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-4 space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-indigo-300">Uploading PDF manual...</span>
              <span className="text-slate-400">{Math.round(uploadProgress)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-2 text-xs font-medium text-rose-400 px-1">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
