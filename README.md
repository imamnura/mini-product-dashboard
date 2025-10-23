# Mini Product Dashboard Orange Store (Nuxt 3 + Tailwind v4)

Orange Store adalah aplikasi dashboard produk sederhana berbasis Nuxt 3 dan Tailwind CSS v4, yang menampilkan daftar produk dari FakeStoreAPI.
Aplikasi ini dibuat untuk menampilkan kemampuan frontend modern dengan integrasi API publik, fitur pencarian, filter kategori, pagination/infinite scroll, serta mode gelap dan terang.

## Fitur Utama

1. Product List Page
  - Menampilkan daftar produk (gambar, nama, harga, kategori)
  - Pencarian dengan debounce dan riwayat pencarian
  - Filter produk berdasarkan kategori
  - Pagination dinamis (4 item per klik “Muat lebih banyak”)

2. Product Detail Page
  - Halaman detail berisi gambar besar, deskripsi, harga, dan rating
  - Breadcrumb produk

3. Product Category Page
  - Menampilkan semua produk dari kategori tertentu
  - Pagination

4. Responsif & Modern UI
  - Tampilan konsisten di desktop, tablet, dan mobile
  - Styling menggunakan Tailwind v4

5. Dark Mode
  - Toggle dark/light mode dengan penyimpanan di localStorage
  - Sinkron dengan prefers-color-scheme dari browser

6. Backend Integration
  - Menggunakan $fetch/asyncData dengan error handling
  - Caching sederhana pake useState().

7. Optimasi & UX
  - Lazy loading gambar
  - Debounce pencarian
  - SSR

## Stuktur Folder

```bash
orange-store/
|--assets/
|  |--css/tailwind.css
|--components/
|  |--layout/Navbar.vue
|  |--ui/
|     |--CategoryFilter.vue
|     |--ProductCard.vue
|     |--SearchBar.vue
|     |--SkeletonCard.vue
|--composables/
|  |--useDebounce.ts
|  |--useProducts.ts
|  |--useTheme.ts
|--pages/
|  |--category/
|  |--products/
|--tests/
|--nuxt.config.ts
|--package.json
|--README.md
|--vitest.config.ts
|--tsconfig.json
```

## Setup

```bash
# 1. Clone repository
git clone https://github.com/imamnura/mini-product-dashboard
cd mini-product-dashboard

# 2. Install dependencies
pnpm install   # atau npm install / yarn

# 3. Jalankan lokal
pnpm dev       # http://localhost:3000

# 4. Jalankan testing
pnpm test
# atau interaktif mode:
pnpm test:ui

# 5. Build untuk production
pnpm build
pnpm preview
```

## Arsitektur

```bash
API (https://fakestoreapi.com)
        ↓
 useProducts() composable
        ↓
 index.vue / category.vue / products/[id].vue
        ↓
    UI Components (Tailwind)
        ↓
        SSR → Deployed to Vercel
```
