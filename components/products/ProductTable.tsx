'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database';
import { formatBytes, formatDate } from '@/lib/utils/format';
import { StatusBadge, Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QRPrintModal } from '@/components/qr/QRPrintModal';
import { DeleteModal } from '@/components/products/DeleteModal';
import {
  QrCode,
  Edit,
  Trash2,
  ExternalLink,
  FileText,
  Search,
  SlidersHorizontal,
  PackageX,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ProductTableProps {
  initialProducts: Product[];
  onProductDeleted?: (id: string) => void;
}

export function ProductTable({ initialProducts, onProductDeleted }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modal states
  const [selectedProductForQr, setSelectedProductForQr] = useState<Product | null>(null);
  const [selectedProductForDelete, setSelectedProductForDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { success, error } = useToast();

  // Filter products by search & status
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
      p.pdf_original_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL'
        ? true
        : statusFilter === 'ACTIVE'
        ? p.is_active
        : !p.is_active;

    return matchesSearch && matchesStatus;
  });

  const handleDeleteConfirm = async () => {
    if (!selectedProductForDelete) return;

    try {
      setIsDeleting(true);

      const res = await fetch(`/api/products/${selectedProductForDelete.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok || result.error) {
        throw new Error(result.error || 'Failed to delete product');
      }

      // 3. Update local state
      setProducts((prev) => prev.filter((p) => p.id !== selectedProductForDelete.id));
      if (onProductDeleted) onProductDeleted(selectedProductForDelete.id);

      success(`Product "${selectedProductForDelete.name}" deleted successfully.`);
      setSelectedProductForDelete(null);
    } catch (err: any) {
      console.error(err);
      error(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, SKU, or manual..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-slate-900/80 border border-slate-800 pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'ALL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'ACTIVE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Active ({products.filter((p) => p.is_active).length})
          </button>
          <button
            onClick={() => setStatusFilter('INACTIVE')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              statusFilter === 'INACTIVE'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inactive ({products.filter((p) => !p.is_active).length})
          </button>
        </div>
      </div>

      {/* Table / List View */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center">
          <PackageX className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">No products found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No products matching "${searchQuery}". Try clearing your search.`
              : 'You have not added any products yet.'}
          </p>
          {!searchQuery && (
            <div className="mt-5">
              <Link href="/dashboard/products/new">
                <Button size="sm">Create First Product</Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl backdrop-blur-md">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Product</th>
                  <th className="px-5 py-3.5">Instruction Manual</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Last Updated</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Product Name & SKU */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="font-bold text-white hover:text-indigo-400 transition-colors"
                        >
                          {product.name}
                        </Link>
                        {product.sku ? (
                          <span className="font-mono text-xs text-slate-400 mt-0.5">
                            SKU: {product.sku}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">No SKU</span>
                        )}
                      </div>
                    </td>

                    {/* PDF info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-slate-200 truncate max-w-[200px]" title={product.pdf_original_name}>
                            {product.pdf_original_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatBytes(product.pdf_size)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge isActive={product.is_active} />
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {formatDate(product.updated_at)}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* QR Code Action */}
                        <button
                          onClick={() => setSelectedProductForQr(product)}
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="View & Print QR Code"
                          aria-label="View & Print QR Code"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        {/* Public Link */}
                        <Link
                          href={`/p/${product.id}`}
                          target="_blank"
                          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Open Public QR Destination"
                          aria-label="Open Public QR Destination"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {/* Edit */}
                        <Link
                          href={`/dashboard/products/${product.id}`}
                          className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                          title="Edit Product & Replace PDF"
                          aria-label="Edit Product & Replace PDF"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>

                        {/* Delete */}
                        <button
                          onClick={() => setSelectedProductForDelete(product)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                          title="Delete Product"
                          aria-label="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List */}
          <div className="block md:hidden divide-y divide-slate-800/60">
            {filteredProducts.map((product) => (
              <div key={product.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link
                      href={`/dashboard/products/${product.id}`}
                      className="font-bold text-white hover:text-indigo-400 text-sm"
                    >
                      {product.name}
                    </Link>
                    {product.sku && (
                      <p className="font-mono text-xs text-slate-400 mt-0.5">
                        SKU: {product.sku}
                      </p>
                    )}
                  </div>
                  <StatusBadge isActive={product.is_active} />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-medium text-slate-300 block truncate">
                      {product.pdf_original_name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatBytes(product.pdf_size)} • Updated {formatDate(product.updated_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProductForQr(product)}
                    leftIcon={<QrCode className="w-3.5 h-3.5" />}
                  >
                    QR Code
                  </Button>

                  <div className="flex items-center gap-1">
                    <Link href={`/p/${product.id}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Link href={`/dashboard/products/${product.id}`}>
                      <Button variant="secondary" size="sm">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedProductForDelete(product)}
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Print / Preview Modal */}
      {selectedProductForQr && (
        <QRPrintModal
          isOpen={!!selectedProductForQr}
          onClose={() => setSelectedProductForQr(null)}
          productId={selectedProductForQr.id}
          productName={selectedProductForQr.name}
          sku={selectedProductForQr.sku}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedProductForDelete && (
        <DeleteModal
          isOpen={!!selectedProductForDelete}
          onClose={() => setSelectedProductForDelete(null)}
          onConfirm={handleDeleteConfirm}
          productName={selectedProductForDelete.name}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
