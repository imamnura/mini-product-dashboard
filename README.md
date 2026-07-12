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

4. Shopping Cart
  - Tambah produk ke keranjang dari kartu produk maupun halaman detail (dengan pilihan qty)
  - Ubah jumlah, hapus item, dan clear cart di halaman `/cart`
  - Badge jumlah item real-time di navbar
  - Keranjang tersimpan di localStorage, jadi tetap ada saat halaman di-refresh
  - Simulasi checkout (mengosongkan keranjang + pesan konfirmasi)

5. Responsif & Modern UI
  - Tampilan konsisten di desktop, tablet, dan mobile
  - Styling menggunakan Tailwind v4

6. Dark Mode
  - Toggle dark/light mode dengan penyimpanan di localStorage
  - Sinkron dengan prefers-color-scheme dari browser

7. Backend Integration
  - Menggunakan $fetch/asyncData dengan error handling
  - Caching sederhana pake useState().

8. Optimasi & UX
  - Lazy loading gambar
  - Debounce pencarian
  - SSR

## Stuktur Folder

```bash
orange-store/
|--app/
|  |--assets/
|  |  |--css/tailwind.css
|  |--components/
|  |  |--layout/Navbar.vue
|  |  |--ui/
|  |     |--CategoryFilter.vue
|  |     |--ProductCard.vue
|  |     |--SearchBar.vue
|  |     |--SkeletonCard.vue
|  |--composables/
|  |  |--useCart.ts
|  |  |--useDebounce.ts
|  |  |--useProducts.ts
|  |  |--useTheme.ts
|  |--pages/
|     |--cart.vue
|     |--category/
|     |--products/
|--docs/
|  |--ARCHITECTURE.md
|  |--FLOW.md
|  |--DEVELOPMENT.md
|--tests/
|--nuxt.config.ts
|--package.json
|--README.md
|--vitest.config.ts
|--tsconfig.json
```

Dokumentasi lebih detail:

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — stack, layer, state management
- [docs/FLOW.md](./docs/FLOW.md) — alur data & interaksi pengguna (browse, kategori, cart, dark mode)
- [docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md) — setup, konvensi, testing, panduan menambah fitur

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
 useProducts() composable ──── useCart() (localStorage, client-only)
        ↓                              ↓
 index.vue / category.vue      ProductCard.vue / products/[id].vue / cart.vue
 / products/[id].vue
        ↓
    UI Components (Tailwind)
        ↓
        SSR → Deployed to Vercel
```

Detail lengkap ada di [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).
