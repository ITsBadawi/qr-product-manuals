import { NextRequest, NextResponse } from 'next/server';
import { getProductById } from '@/lib/db';
import { getR2SignedUrl } from '@/lib/storage/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get('download') === '1';

    // 1. Fetch product from database
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product manual not found.' },
        { status: 404 }
      );
    }

    if (!product.is_active) {
      return NextResponse.json(
        { error: 'This product manual is currently inactive.' },
        { status: 403 }
      );
    }

    // 2. Generate secure presigned URL from Cloudflare R2
    const signedUrl = await getR2SignedUrl(
      product.pdf_path,
      3600,
      isDownload ? product.pdf_original_name : undefined
    );

    // 3. Redirect to Cloudflare R2 storage
    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err: any) {
    console.error('Error serving product PDF from Cloudflare R2:', err);
    return NextResponse.json(
      { error: 'Internal server error while retrieving product manual from R2.' },
      { status: 500 }
    );
  }
}
