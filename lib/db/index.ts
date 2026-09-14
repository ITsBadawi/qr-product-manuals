import fs from 'fs/promises';
import path from 'path';
import { neon } from '@neondatabase/serverless';
import { Product } from '@/types/database';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'products.json');

function getSql() {
  if (process.env.DATABASE_URL) {
    return neon(process.env.DATABASE_URL);
  }
  return null;
}

// Ensure local database fallback file exists
async function ensureDb(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify([], null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('Error ensuring database file:', err);
  }
}

/**
 * Get all products sorted by updated_at DESC
 */
export async function getProducts(): Promise<Product[]> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          id,
          user_id,
          name,
          sku,
          description,
          pdf_path,
          pdf_original_name,
          CAST(pdf_size AS integer) as pdf_size,
          is_active,
          created_at,
          updated_at
        FROM products 
        ORDER BY updated_at DESC
      `;
      return rows as unknown as Product[];
    } catch (err) {
      console.error('Neon DB query error (getProducts):', err);
    }
  }

  // Fallback to file storage
  await ensureDb();
  try {
    const raw = await fs.readFile(DB_FILE, 'utf-8');
    const products: Product[] = JSON.parse(raw || '[]');
    return products.sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  } catch (err) {
    console.error('Error reading products fallback:', err);
    return [];
  }
}

/**
 * Get a single product by UUID
 */
export async function getProductById(id: string): Promise<Product | null> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`
        SELECT 
          id,
          user_id,
          name,
          sku,
          description,
          pdf_path,
          pdf_original_name,
          CAST(pdf_size AS integer) as pdf_size,
          is_active,
          created_at,
          updated_at
        FROM products 
        WHERE id = ${id} 
        LIMIT 1
      `;
      return (rows[0] as unknown as Product) || null;
    } catch (err) {
      console.error('Neon DB query error (getProductById):', err);
    }
  }

  // Fallback
  const products = await getProducts();
  return products.find((p) => p.id === id) || null;
}

/**
 * Create a new product record
 */
export async function createProduct(
  data: Omit<Product, 'created_at' | 'updated_at'>
): Promise<Product> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`
        INSERT INTO products (
          id,
          user_id,
          name,
          sku,
          description,
          pdf_path,
          pdf_original_name,
          pdf_size,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          ${data.id},
          ${data.user_id},
          ${data.name},
          ${data.sku || null},
          ${data.description || null},
          ${data.pdf_path},
          ${data.pdf_original_name},
          ${data.pdf_size},
          ${data.is_active ?? true},
          now(),
          now()
        )
        RETURNING 
          id,
          user_id,
          name,
          sku,
          description,
          pdf_path,
          pdf_original_name,
          CAST(pdf_size AS integer) as pdf_size,
          is_active,
          created_at,
          updated_at
      `;
      return rows[0] as unknown as Product;
    } catch (err) {
      console.error('Neon DB insert error:', err);
      throw err;
    }
  }

  // Fallback
  await ensureDb();
  const products = await getProducts();
  const now = new Date().toISOString();

  const newProduct: Product = {
    ...data,
    created_at: now,
    updated_at: now,
  };

  products.unshift(newProduct);
  await fs.writeFile(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  return newProduct;
}

/**
 * Update an existing product by UUID without changing its ID
 */
export async function updateProduct(
  id: string,
  updates: Partial<Omit<Product, 'id' | 'created_at'>>
): Promise<Product | null> {
  const sql = getSql();
  if (sql) {
    try {
      const current = await getProductById(id);
      if (!current) return null;

      const merged = {
        name: updates.name ?? current.name,
        sku: updates.sku !== undefined ? updates.sku : current.sku,
        description: updates.description !== undefined ? updates.description : current.description,
        pdf_path: updates.pdf_path ?? current.pdf_path,
        pdf_original_name: updates.pdf_original_name ?? current.pdf_original_name,
        pdf_size: updates.pdf_size ?? current.pdf_size,
        is_active: updates.is_active !== undefined ? updates.is_active : current.is_active,
      };

      const rows = await sql`
        UPDATE products SET
          name = ${merged.name},
          sku = ${merged.sku},
          description = ${merged.description},
          pdf_path = ${merged.pdf_path},
          pdf_original_name = ${merged.pdf_original_name},
          pdf_size = ${merged.pdf_size},
          is_active = ${merged.is_active},
          updated_at = now()
        WHERE id = ${id}
        RETURNING 
          id,
          user_id,
          name,
          sku,
          description,
          pdf_path,
          pdf_original_name,
          CAST(pdf_size AS integer) as pdf_size,
          is_active,
          created_at,
          updated_at
      `;
      return (rows[0] as unknown as Product) || null;
    } catch (err) {
      console.error('Neon DB update error:', err);
      throw err;
    }
  }

  // Fallback
  await ensureDb();
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const existing = products[index];
  const updated: Product = {
    ...existing,
    ...updates,
    id: existing.id,
    updated_at: new Date().toISOString(),
  };

  products[index] = updated;
  await fs.writeFile(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  return updated;
}

/**
 * Delete a product by UUID
 */
export async function deleteProduct(id: string): Promise<Product | null> {
  const sql = getSql();
  if (sql) {
    try {
      const rows = await sql`
        DELETE FROM products
        WHERE id = ${id}
        RETURNING 
          id,
          user_id,
          name,
          sku,
          description,
          pdf_path,
          pdf_original_name,
          CAST(pdf_size AS integer) as pdf_size,
          is_active,
          created_at,
          updated_at
      `;
      return (rows[0] as unknown as Product) || null;
    } catch (err) {
      console.error('Neon DB delete error:', err);
      throw err;
    }
  }

  // Fallback
  await ensureDb();
  const products = await getProducts();
  const index = products.findIndex((p) => p.id === id);

  if (index === -1) return null;

  const [deleted] = products.splice(index, 1);
  await fs.writeFile(DB_FILE, JSON.stringify(products, null, 2), 'utf-8');
  return deleted;
}
