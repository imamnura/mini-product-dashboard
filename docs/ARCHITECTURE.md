# Arsitektur

Dokumen ini menjelaskan struktur teknis Orange Store: stack, layer, dan bagaimana state dikelola.

## Stack

| Layer      | Teknologi                              |
| ---------- | --------------------------------------- |
| Framework  | Nuxt 4 (Vue 3, auto-import, file-based routing) |
| Styling    | Tailwind CSS v4 (via `@tailwindcss/vite` + PostCSS) |
| Data       | [FakeStoreAPI](https://fakestoreapi.com) via `$fetch` / `useAsyncData` |
| State      | `useState` bawaan Nuxt (tanpa Pinia/Vuex) |
| Testing    | Vitest + @vue/test-utils + jsdom |
| Deployment | Vercel (`nitro.preset: "vercel"`) |

Tidak ada backend sendiri — semua data produk diambil langsung dari FakeStoreAPI di sisi server (SSR) maupun client.

## Struktur Folder

```bash
app/
├─ app.vue                     # root layout: navbar + slot halaman + footer
├─ assets/css/tailwind.css     # import Tailwind + utility class custom (.btn, .badge, .container)
├─ components/
│  ├─ layout/Navbar.vue        # navigasi, kategori, search slot, dark mode, cart icon
│  └─ ui/
│     ├─ ProductCard.vue       # kartu produk + tombol Add to Cart
│     ├─ CategoryFilter.vue    # dropdown filter kategori
│     ├─ SearchBar.vue         # input pencarian + riwayat (localStorage)
│     └─ SkeletonCard.vue      # placeholder loading
├─ composables/
│  ├─ useProducts.ts           # fetch produk (all/byId/byCategory/categories) + cache useState
│  ├─ useCart.ts                # state keranjang belanja + persist localStorage
│  ├─ useTheme.ts               # dark/light mode + persist localStorage
│  └─ useDebounce.ts            # helper debounce generik
└─ pages/
   ├─ index.vue                # daftar produk, search, filter, pagination
   ├─ cart.vue                 # halaman keranjang belanja
   ├─ category/[slug].vue      # daftar produk per kategori
   └─ products/[id].vue        # detail produk + Add to Cart

tests/                         # unit test (Vitest)
nuxt.config.ts                 # konfigurasi Nuxt (routeRules, runtimeConfig, dsb)
```

## Layering

Alur ketergantungan satu arah, dari luar (API) ke dalam (UI):

```
FakeStoreAPI (https://fakestoreapi.com)
        ↓
composables (useProducts, useCart, useTheme, useDebounce)
        ↓
pages (index, category/[slug], products/[id], cart)
        ↓
components (Navbar, ProductCard, CategoryFilter, SearchBar, SkeletonCard)
```

- **Composables** tidak pernah mengimpor dari `components/` atau `pages/` — mereka murni logika + state.
- **Pages** mengorkestrasi composable dan meneruskan data ke component lewat props.
- **Components** bersifat presentational, kecuali yang butuh state global (Navbar butuh `useCart`/`useTheme`/`useProducts`, ProductCard butuh `useCart` untuk tombol Add to Cart).

## State Management

Proyek ini sengaja **tidak** menggunakan Pinia. Semua state lintas komponen memakai `useState()` bawaan Nuxt, yang:

- SSR-safe (state di-serialize dari server ke client saat hydration).
- Di-scope per key string, jadi setiap composable memiliki key uniknya sendiri.

Key `useState` yang dipakai di aplikasi:

| Key                  | Dipakai di          | Isi                                  |
| -------------------- | ------------------- | -------------------------------------- |
| `cache`              | `useProducts`       | Cache hasil fetch per query (`all`, `cat:<slug>`) |
| `cart:items`         | `useCart`           | Array item keranjang (`CartItem[]`)    |
| `cart:hydrated`      | `useCart`           | Flag agar hydrate dari localStorage cuma sekali |
| `isDark`             | `useTheme`          | Status dark mode                       |
| `search:history`     | `SearchBar.vue`     | Riwayat pencarian                       |
| `global:q`           | `app.vue`, `index.vue`, `category/[slug].vue` | Query pencarian aktif (dipakai lintas halaman) |
| `nav:selectedCat`    | `Navbar.vue`, `index.vue` | Kategori aktif yang dipilih dari navbar |

### Pola persist ke localStorage

`useTheme`, `SearchBar`, dan `useCart` memakai pola yang sama: state utama disimpan lewat `useState` (agar reaktif & SSR-safe), lalu di-hydrate dari `localStorage` saat `onMounted` (client-only), dan ditulis kembali ke `localStorage` setiap kali state berubah. Ini mencegah mismatch hydration karena render awal di server maupun client sama-sama mulai dari state kosong/default.

## Rendering Strategy

`routeRules` di `nuxt.config.ts` mengatur SSR + cache SWR 60 detik untuk halaman `/`, `/category/**`, dan `/products/**`, supaya request ke FakeStoreAPI tidak dilakukan berulang untuk setiap hit.

Halaman `/cart` sengaja tidak diberi `routeRules` khusus karena isinya sepenuhnya bergantung pada `localStorage` di client — render awal (server maupun client) selalu mulai dari keranjang kosong, baru terisi setelah hydrate di `onMounted`.

## Keranjang Belanja (Cart)

Cart bersifat **client-side only** dan tidak memanggil endpoint `/carts` milik FakeStoreAPI, karena endpoint tersebut adalah mock yang tidak benar-benar menyimpan data di server. Sumber data produk (harga, gambar, judul) tetap berasal dari FakeStoreAPI lewat `useProducts`; yang disimpan lokal hanyalah pilihan pengguna (produk apa saja yang ditambahkan + qty).

Lihat [FLOW.md](./FLOW.md) untuk detail alur data cart.
