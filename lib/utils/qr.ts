import QRCode from 'qrcode';

/**
 * Returns the canonical permanent QR code target URL for a product.
 * NEVER encodes storage URLs or file names directly.
 */
export function getProductPermanentUrl(productId: string): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  
  // Ensure no trailing slash on baseUrl
  const cleanBase = baseUrl.replace(/\/$/, '');
  return `${cleanBase}/p/${productId}`;
}

/**
 * Generate a vector SVG string for the QR code.
 * Ideal for scaling infinitely without pixelation.
 */
export async function generateQrSvg(
  url: string,
  options: { margin?: number; errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' } = {}
): Promise<string> {
  const { margin = 2, errorCorrectionLevel = 'M' } = options;
  return QRCode.toString(url, {
    type: 'svg',
    margin,
    errorCorrectionLevel,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Generate a high-resolution PNG Data URL (e.g. 1024px) for printing and downloading.
 */
export async function generateQrPngDataUrl(
  url: string,
  options: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  const { width = 1024, margin = 2, errorCorrectionLevel = 'M' } = options;
  return QRCode.toDataURL(url, {
    width,
    margin,
    errorCorrectionLevel,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });
}

/**
 * Trigger download of the QR code as a high-res PNG file.
 */
export async function downloadQrPng(
  productId: string,
  productName: string,
  targetUrl: string
): Promise<void> {
  const dataUrl = await generateQrPngDataUrl(targetUrl, { width: 1024, margin: 2 });
  const link = document.createElement('a');
  const safeName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  link.download = `qr-${safeName || productId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Trigger download of the QR code as a crisp vector SVG file.
 */
export async function downloadQrSvg(
  productId: string,
  productName: string,
  targetUrl: string
): Promise<void> {
  const svgString = await generateQrSvg(targetUrl, { margin: 2 });
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeName = productName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  link.download = `qr-${safeName || productId}.svg`;
  link.href = blobUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(blobUrl);
}
