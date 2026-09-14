export const MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const ALLOWED_MIME_TYPES = ['application/pdf'];

export interface ProductValidationErrors {
  name?: string;
  sku?: string;
  description?: string;
  pdf?: string;
}

export function validateProductData(data: {
  name?: string;
  sku?: string;
  description?: string;
}): { isValid: boolean; errors: ProductValidationErrors } {
  const errors: ProductValidationErrors = {};

  if (!data.name || data.name.trim().length === 0) {
    errors.name = 'Product name is required';
  } else if (data.name.trim().length < 2) {
    errors.name = 'Product name must be at least 2 characters';
  } else if (data.name.length > 255) {
    errors.name = 'Product name cannot exceed 255 characters';
  }

  if (data.sku && data.sku.trim().length > 100) {
    errors.sku = 'SKU cannot exceed 100 characters';
  }

  if (data.description && data.description.trim().length > 2000) {
    errors.description = 'Description cannot exceed 2000 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validatePdfFile(file: File | null): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'Please select a PDF file to upload' };
  }

  // Check file type
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');

  if (!isPdfMime && !isPdfExt) {
    return {
      isValid: false,
      error: 'Invalid file type. Only PDF documents are allowed.',
    };
  }

  // Check file size
  if (file.size <= 0) {
    return { isValid: false, error: 'The selected PDF file is empty.' };
  }

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return {
      isValid: false,
      error: `File size exceeds the 50MB limit (${(file.size / (1024 * 1024)).toFixed(1)}MB). Please choose a smaller file.`,
    };
  }

  return { isValid: true };
}
