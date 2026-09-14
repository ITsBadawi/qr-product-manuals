import { NextRequest, NextResponse } from 'next/server';
import { getProducts, createProduct } from '@/lib/db';
import { uploadPdfToR2 } from '@/lib/storage/r2';
import { sanitizeFileName } from '@/lib/utils/format';
import { validateProductData, validatePdfFile } from '@/lib/validations/product';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const sku = (formData.get('sku') as string) || null;
    const description = (formData.get('description') as string) || null;
    const isActive = formData.get('is_active') === 'true';
    const pdfFile = formData.get('pdf') as File | null;

    // Validate fields
    const validation = validateProductData({ name, sku: sku || undefined, description: description || undefined });
    if (!validation.isValid) {
      return NextResponse.json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
    }

    // Validate file
    const fileValidation = validatePdfFile(pdfFile);
    if (!fileValidation.isValid) {
      return NextResponse.json({ error: fileValidation.error }, { status: 400 });
    }

    const productId = crypto.randomUUID();
    const safeName = sanitizeFileName(pdfFile!.name);
    const r2Key = `manuals/${productId}/${Date.now()}-${safeName}`;

    // Upload to Cloudflare R2
    const arrayBuffer = await pdfFile!.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await uploadPdfToR2(r2Key, buffer, 'application/pdf');

    // Save to database
    const newProduct = await createProduct({
      id: productId,
      user_id: 'owner',
      name: name.trim(),
      sku: sku ? sku.trim() : null,
      description: description ? description.trim() : null,
      pdf_path: r2Key,
      pdf_original_name: pdfFile!.name,
      pdf_size: pdfFile!.size,
      is_active: isActive,
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    console.error('Error creating product:', err);
    return NextResponse.json({ error: err.message || 'Failed to create product' }, { status: 500 });
  }
}
