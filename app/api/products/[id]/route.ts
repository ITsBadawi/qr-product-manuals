import { NextRequest, NextResponse } from 'next/server';
import { getProductById, updateProduct, deleteProduct } from '@/lib/db';
import { uploadPdfToR2, deletePdfFromR2 } from '@/lib/storage/r2';
import { sanitizeFileName } from '@/lib/utils/format';
import { validateProductData, validatePdfFile } from '@/lib/validations/product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await getProductById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const sku = (formData.get('sku') as string) || null;
    const description = (formData.get('description') as string) || null;
    const isActive = formData.get('is_active') === 'true';
    const newPdfFile = formData.get('pdf') as File | null;

    // Validate fields
    const validation = validateProductData({ name, sku: sku || undefined, description: description || undefined });
    if (!validation.isValid) {
      return NextResponse.json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
    }

    let updatedPdfPath = existing.pdf_path;
    let updatedOriginalName = existing.pdf_original_name;
    let updatedSize = existing.pdf_size;

    // If replacement PDF is attached
    if (newPdfFile && newPdfFile.size > 0) {
      const fileValidation = validatePdfFile(newPdfFile);
      if (!fileValidation.isValid) {
        return NextResponse.json({ error: fileValidation.error }, { status: 400 });
      }

      const safeName = sanitizeFileName(newPdfFile.name);
      const newR2Key = `manuals/${existing.id}/${Date.now()}-${safeName}`;

      // Upload new file to Cloudflare R2
      const arrayBuffer = await newPdfFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await uploadPdfToR2(newR2Key, buffer, 'application/pdf');

      // Delete old file from Cloudflare R2
      if (existing.pdf_path) {
        await deletePdfFromR2(existing.pdf_path);
      }

      updatedPdfPath = newR2Key;
      updatedOriginalName = newPdfFile.name;
      updatedSize = newPdfFile.size;
    }

    // Update product (PRODUCT ID AND QR CODE REMAIN 100% UNCHANGED)
    const updated = await updateProduct(existing.id, {
      name: name.trim(),
      sku: sku ? sku.trim() : null,
      description: description ? description.trim() : null,
      is_active: isActive,
      pdf_path: updatedPdfPath,
      pdf_original_name: updatedOriginalName,
      pdf_size: updatedSize,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    console.error('Error updating product:', err);
    return NextResponse.json({ error: err.message || 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await getProductById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete PDF from Cloudflare R2
    if (existing.pdf_path) {
      await deletePdfFromR2(existing.pdf_path);
    }

    // Delete record from database
    await deleteProduct(id);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    return NextResponse.json({ error: err.message || 'Failed to delete product' }, { status: 500 });
  }
}
