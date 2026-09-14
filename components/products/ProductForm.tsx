'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/types/database';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { PDFDropzone } from '@/components/pdf/PDFDropzone';
import { PDFDetailsCard } from '@/components/pdf/PDFDetailsCard';
import { QRDisplay } from '@/components/qr/QRDisplay';
import { QRDownloadButtons } from '@/components/qr/QRDownloadButtons';
import { QRPrintModal } from '@/components/qr/QRPrintModal';
import { validateProductData } from '@/lib/validations/product';
import { sanitizeFileName } from '@/lib/utils/format';
import { useToast } from '@/components/ui/Toast';
import { CheckCircle2, ArrowRight, RefreshCw, Sparkles, ExternalLink, QrCode } from 'lucide-react';
import Link from 'next/link';

interface ProductFormProps {
  initialProduct?: Product;
  mode: 'create' | 'edit';
}

export function ProductForm({ initialProduct, mode }: ProductFormProps) {
  const router = useRouter();
  const { success, error, info } = useToast();

  // Form Fields
  const [name, setName] = useState(initialProduct?.name || '');
  const [sku, setSku] = useState(initialProduct?.sku || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [isActive, setIsActive] = useState(initialProduct ? initialProduct.is_active : true);

  // PDF states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Created Product State (for Wizard Step 3 on create)
  const [createdProduct, setCreatedProduct] = useState<Product | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Text Fields
    const validation = validateProductData({ name, sku, description });
    if (!validation.isValid) {
      setFormErrors(validation.errors as Record<string, string>);
      return;
    }

    // 2. Validate PDF Requirement
    if (mode === 'create' && !selectedFile) {
      setFormErrors((prev) => ({
        ...prev,
        pdf: 'Please upload an instruction manual in PDF format',
      }));
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      if (mode === 'create') {
        // --- CREATE FLOW ---
        const formData = new FormData();
        formData.append('name', name.trim());
        if (sku) formData.append('sku', sku.trim());
        if (description) formData.append('description', description.trim());
        formData.append('is_active', String(isActive));
        formData.append('pdf', selectedFile!);

        setUploadProgress(40);

        const res = await fetch('/api/products', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          throw new Error(result.error || 'Failed to create product');
        }

        setUploadProgress(100);
        success('Product & permanent QR code generated successfully!');
        setCreatedProduct(result.product);
      } else if (mode === 'edit' && initialProduct) {
        // --- EDIT / REPLACE PDF FLOW ---
        const formData = new FormData();
        formData.append('name', name.trim());
        if (sku) formData.append('sku', sku.trim());
        if (description) formData.append('description', description.trim());
        formData.append('is_active', String(isActive));
        if (selectedFile) {
          formData.append('pdf', selectedFile);
        }

        setUploadProgress(50);

        const res = await fetch(`/api/products/${initialProduct.id}`, {
          method: 'PUT',
          body: formData,
        });

        const result = await res.json();
        if (!res.ok || result.error) {
          throw new Error(result.error || 'Failed to update product');
        }

        setUploadProgress(100);
        setSelectedFile(null);
        success(
          selectedFile
            ? 'PDF manual replaced in Cloudflare R2! The permanent QR code now loads the new PDF.'
            : 'Product information updated successfully.'
        );
        router.refresh();
      }
    } catch (err: any) {
      console.error(err);
      error(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // --- CREATION SUCCESS VIEW (Wizard Step 3) ---
  if (createdProduct) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <Card className="text-center p-8 bg-slate-900/80 border-emerald-500/30">
          <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Product & Permanent QR Code Ready!
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Your QR code has been permanently linked to{' '}
            <span className="text-white font-semibold">{createdProduct.name}</span>. You can now
            print or download the label to stick on the product.
          </p>

          {/* QR Code Card */}
          <div className="my-6">
            <QRDisplay
              productId={createdProduct.id}
              productName={createdProduct.name}
              sku={createdProduct.sku}
              size={240}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <QRDownloadButtons
              productId={createdProduct.id}
              productName={createdProduct.name}
              onPrint={() => setIsPrintModalOpen(true)}
            />

            <Link href={`/p/${createdProduct.id}`} target="_blank">
              <Button variant="outline" leftIcon={<ExternalLink className="w-4 h-4" />}>
                Test QR Page
              </Button>
            </Link>
          </div>

          {/* Return link */}
          <div className="mt-8 pt-6 border-t border-slate-800 flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCreatedProduct(null);
                setName('');
                setSku('');
                setDescription('');
                setSelectedFile(null);
              }}
            >
              + Add Another Product
            </Button>

            <Link href="/dashboard/products">
              <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to Products List
              </Button>
            </Link>
          </div>
        </Card>

        {/* Print Modal */}
        <QRPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          productId={createdProduct.id}
          productName={createdProduct.name}
          sku={createdProduct.sku}
        />
      </div>
    );
  }

  // --- REGULAR FORM (Create / Edit) ---
  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader
              title={mode === 'create' ? '1. Product Information' : 'Product Details'}
              description="Enter the basic product identifiers. These can be edited anytime without breaking the QR code."
            />

            <div className="space-y-4">
              <Input
                label="Product Name *"
                placeholder="e.g. Industrial Water Pump X100"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={formErrors.name}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="SKU / Model Number"
                  placeholder="e.g. PUMP-X100-PRO"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  error={formErrors.sku}
                  helperText="Optional identifier printed on the label"
                />

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Product Status
                  </label>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsActive(!isActive)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isActive ? 'bg-indigo-600' : 'bg-slate-700'
                      }`}
                      role="switch"
                      aria-checked={isActive}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          isActive ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-medium text-slate-300">
                      {isActive ? 'Active (QR code works)' : 'Inactive (QR shows unavailable)'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. For model years 2024-2026. Maintenance schedule and safety precautions."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-700/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-colors"
                />
                {formErrors.description && (
                  <p className="text-xs text-rose-400 font-medium">{formErrors.description}</p>
                )}
              </div>
            </div>
          </Card>

          {/* PDF Upload / Replacement Section */}
          <Card>
            <CardHeader
              title={
                mode === 'create'
                  ? '2. Upload Instruction Manual (PDF)'
                  : 'Replace Instruction Manual'
              }
              description={
                mode === 'create'
                  ? 'Upload the official PDF instruction manual. It will be securely stored and linked to this product.'
                  : 'Upload a new PDF to update the manual. The permanent QR code and product URL will remain identical.'
              }
            />

            {/* In Edit mode, show current active PDF */}
            {mode === 'edit' && initialProduct && !selectedFile && (
              <div className="mb-4">
                <PDFDetailsCard
                  originalName={initialProduct.pdf_original_name}
                  size={initialProduct.pdf_size}
                  updatedAt={initialProduct.updated_at}
                  productId={initialProduct.id}
                />
              </div>
            )}

            <PDFDropzone
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
              isUploading={isSubmitting}
              uploadProgress={uploadProgress}
              label={
                mode === 'edit'
                  ? 'Select New PDF to Replace Existing Manual'
                  : 'Upload Instruction Manual'
              }
              sublabel={
                mode === 'edit'
                  ? 'Drag & drop a revised PDF here. The QR code never changes.'
                  : 'Drag & drop your PDF file here, or click to browse'
              }
            />

            {formErrors.pdf && (
              <p className="text-xs text-rose-400 font-medium mt-2">{formErrors.pdf}</p>
            )}

            {mode === 'edit' && selectedFile && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-indigo-400 shrink-0 animate-spin" />
                <span>
                  Ready to replace existing PDF with{' '}
                  <strong className="text-white">{selectedFile.name}</strong>. The QR code on physical
                  products will continue pointing to this product seamlessly.
                </span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Permanent QR Preview & Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Permanent QR Architecture"
              description="Physical stickers point to the immutable application URL, never the raw PDF file."
            />

            {mode === 'edit' && initialProduct ? (
              <div className="space-y-4">
                <QRDisplay
                  productId={initialProduct.id}
                  productName={name || initialProduct.name}
                  sku={sku || initialProduct.sku}
                  size={190}
                />

                <div className="pt-3 border-t border-slate-800 flex justify-center">
                  <QRDownloadButtons
                    productId={initialProduct.id}
                    productName={name || initialProduct.name}
                    onPrint={() => setIsPrintModalOpen(true)}
                    size="sm"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400 mb-2">
                  <QrCode className="w-8 h-8" />
                </div>
                <h4 className="text-xs font-bold text-slate-300">Generated on Creation</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  A permanent, high-resolution QR code will be generated immediately once you upload
                  the PDF.
                </p>
              </div>
            )}
          </Card>

          {/* Form Actions */}
          <div className="flex flex-col gap-2.5">
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={isSubmitting}
              className="w-full"
            >
              {mode === 'create'
                ? 'Create Product & Generate QR'
                : selectedFile
                ? 'Save Changes & Replace PDF'
                : 'Save Changes'}
            </Button>

            <Link href="/dashboard/products" className="w-full">
              <Button type="button" variant="ghost" size="md" className="w-full">
                Cancel
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* QR Print Modal (Edit Mode) */}
      {mode === 'edit' && initialProduct && (
        <QRPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          productId={initialProduct.id}
          productName={name || initialProduct.name}
          sku={sku || initialProduct.sku}
        />
      )}
    </form>
  );
}
