# 📦 Permanent QR Code Product Manual Hub

> **Production-ready, lightweight, secure serverless web application for managing warehouse and retail product instruction PDFs through immutable physical QR codes.**

---

## 🎯 Architecture Overview: How the Permanent QR System Works

In warehouse, manufacturing, and retail environments, physical QR codes printed on thermal labels or equipment plates are costly and time-consuming to replace.

### The Fundamental Rule: Invariant QR Code Destination
A physical QR code must **never** encode:
- ❌ Direct storage URLs (e.g. `https://xxx.r2.cloudflarestorage.com/...`)
- ❌ Temporary signed URLs with expiration timestamps
- ❌ URLs containing the PDF filename (e.g. `manual-v1.pdf`)

Instead, every QR code encodes an **immutable application route**:
```
https://YOUR_DOMAIN.com/p/{PRODUCT_ID}
```

```mermaid
graph TD
    A[Physical QR Code on Product / Shelf] -->|Scanned with Camera| B[Permanent URL: /p/PRODUCT_ID]
    B -->|Server Route Query| C[(Database: Neon Postgres / Local DB)]
    C -->|Lookup Active Record| D[Current pdf_path Reference]
    D -->|Generate Presigned Access| E[Cloudflare R2 Storage: qr-pdf]
    E -->|Stream / Embed| F[Customer Browser / Mobile Viewer]
```

### When an Owner Updates / Replaces a Manual:
1. The **Product UUID (`id`)** remains **100% stable**.
2. The **Physical QR Code** and **Permanent URL** remain **identical**.
3. The new PDF manual is uploaded to Cloudflare R2 with a fresh revision timestamp.
4. The database updates `pdf_path`, `pdf_original_name`, `pdf_size`, and `updated_at`.
5. The old PDF file is automatically purged from Cloudflare R2 to eliminate orphans.
6. **Result**: Anyone scanning the original physical QR code immediately sees the updated manual—with **zero reprinting required**.

---

## 🚀 Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Modern Dark UI + `@media print` layout)
- **Database**: [Neon](https://neon.tech/) Serverless PostgreSQL (with JSON file fallback for offline/local development)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/) (S3-compatible Object Storage via `@aws-sdk/client-s3`)
- **QR Code Engine**: `qrcode` (Crisp vector SVG & 1024x1024 high-res raster PNG)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: Vercel / Node.js Serverless

---

## 📁 Project Structure

```
qr-project/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx               # Admin login portal
│   ├── (dashboard)/
│   │   ├── layout.tsx                   # Auth guard, responsive sidebar, navigation
│   │   ├── dashboard/page.tsx           # Metrics (products, storage, active QR counts)
│   │   └── dashboard/products/
│   │       ├── page.tsx                 # Searchable, filterable product table & actions
│   │       ├── new/page.tsx             # Step-by-step Add Product & PDF Upload Wizard
│   │       └── [id]/page.tsx            # Edit metadata, PDF replacement zone, QR center
│   ├── p/
│   │   └── [id]/page.tsx                # PUBLIC QR Target: Mobile-first manual viewer
│   ├── api/
│   │   ├── auth/login/route.ts          # Cookie-based secure admin authentication
│   │   └── products/
│   │       ├── route.ts                 # List products & create product with PDF upload
│   │       └── [id]/
│   │           ├── route.ts             # Update & delete product (with R2 cleanup)
│   │           └── pdf/route.ts         # Secure presigned PDF streaming / redirect
│   ├── layout.tsx                       # Root layout with fonts, metadata, ToastProvider
│   ├── page.tsx                         # Landing page with architecture explanation
│   └── globals.css                      # Tailwind base, dark palette, @media print CSS
├── components/
│   ├── ui/                              # Button, Input, Modal, Toast, Badge, Card, Skeleton
│   ├── dashboard/                       # Sidebar, Header, StatsCards, DashboardLayoutClient
│   ├── products/                        # ProductTable, ProductForm, DeleteModal
│   ├── pdf/                             # PDFDropzone, PDFViewer, PDFDetailsCard
│   └── qr/                              # QRDisplay, QRPrintModal, QRDownloadButtons
├── db/
│   └── schema.sql                       # PostgreSQL / Neon schema (tables, indexes, triggers)
├── lib/
│   ├── db/
│   │   └── index.ts                     # Database access layer (Neon with fallback)
│   ├── storage/
│   │   └── r2.ts                        # Cloudflare R2 upload, delete, presigned URL helpers
│   ├── validations/
│   │   └── product.ts                   # PDF file checks (MIME, 50MB limit) & text rules
│   └── utils/
│       ├── qr.ts                        # SVG & High-res PNG QR code generator utilities
│       ├── format.ts                    # File size, date, and string helpers
│       └── cn.ts                        # Tailwind class merger
├── middleware.ts                        # Next.js middleware for route protection
├── .env.example                         # Documented environment variables
└── README.md
```

---

## ⚡ Quick Start / Local Development

### 1. Prerequisites
- Node.js 20+
- Cloudflare R2 Bucket & API Credentials
- Neon PostgreSQL Database (optional; falls back to local storage if `DATABASE_URL` is omitted)

### 2. Clone and Install Dependencies
```bash
git clone <your-repo-url>
cd "qr project"
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your configuration:
```env
# Cloudflare R2 Storage Credentials
CLOUDFLARE_R2_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_access_key
CLOUDFLARE_R2_BUCKET_NAME=qr-pdf

# Permanent QR Code Base Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Admin Portal Credentials
ADMIN_EMAIL=admin@warehouse.com
ADMIN_PASSWORD=admin123456

# Neon PostgreSQL Database (Optional - fallback to local storage if omitted)
DATABASE_URL="postgresql://user:password@endpoint.neon.tech/neondb?sslmode=require"
```

### 4. Database Setup (Optional if using Neon)
Open your **Neon Console** -> **SQL Editor**, open [`db/schema.sql`](db/schema.sql), and execute it. This will create:
- `products` table
- Indexing on `id`, `sku`, `is_active`, and `created_at`
- Automatic `updated_at` timestamp trigger

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🖨️ Physical Label Printing & Export

The application includes a specialized print workflow for warehouse printers:

- **Vector SVG**: Download infinite-resolution vector graphics for high-end graphic design or engraving.
- **High-Res PNG (1024x1024)**: High contrast, 300+ DPI equivalent raster file.
- **Print Label Modal (`@media print`)**:
  - Automatically isolates the printable label card.
  - Strips backgrounds, navigation, and borders for crisp thermal transfer or laser label sheets.
  - Features high-contrast black on white, large bold product name, SKU tag, and camera scan instructions.

---

## ☁️ Deployment to Vercel

1. Push your repository to GitHub.
2. Import the repository in [vercel.com](https://vercel.com).
3. Add the environment variables from `.env.example`.
4. Deploy!
