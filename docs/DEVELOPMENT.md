# Panduan Development

## Prasyarat

- Node.js versi LTS terbaru (disarankan Node 20+)
- [pnpm](https://pnpm.io/) sebagai package manager (repo ini pakai `pnpm-lock.yaml` + `pnpm-workspace.yaml`)

## Setup

```bash
git clone https://github.com/imamnura/mini-product-dashboard
cd mini-product-dashboard
pnpm install
pnpm dev       # http://localhost:3000
```

> Jika port 3000 sudah dipakai (mis. ada dev server lain berjalan), Nuxt akan mengunci proses per-folder (`NUXT_IGNORE_LOCK`). Cek proses yang sedang jalan dulu sebelum start server baru: `nuxt dev` akan menolak start dan menunjukkan PID yang aktif.

## Scripts

| Command           | Fungsi                                   |
| ------------------ | ------------------------------------------ |
| `pnpm dev`         | Jalankan dev server (HMR)                  |
| `pnpm build`       | Build production (Nitro preset: `vercel`)  |
| `pnpm generate`    | Static generate                            |
| `pnpm preview`     | Preview hasil build                        |
| `pnpm test`        | Jalankan semua unit test sekali             |
| `pnpm test:watch`  | Unit test mode watch                       |
| `pnpm test:ui`     | Unit test dengan Vitest UI                 |

## Konvensi Proyek

### Auto-import

Nuxt meng-auto-import composables (`app/composables/*.ts`) dan components (`app/components/**`). Komponen di `components/ui/` diakses dengan prefix `Ui`, misal `ProductCard.vue` → `<UiProductCard />`. Komponen di `components/layout/` pakai prefix `Layout`, misal `<LayoutNavbar />`. Tidak perlu import manual di `<script setup>`.

### Penamaan `useState` key

Setiap state global punya key string unik. Ikuti pola `namespace:nama` (contoh: `cart:items`, `nav:selectedCat`, `search:history`) supaya mudah ditelusuri dan tidak bentrok antar composable. Daftar lengkap key yang sudah dipakai ada di [ARCHITECTURE.md](./ARCHITECTURE.md#state-management).

### Pola state + localStorage

Kalau menambah state baru yang perlu persist di client (seperti wishlist, preferensi lain, dsb), ikuti pola yang sudah ada di `useTheme.ts` / `useCart.ts`:

1. State utama via `useState(key, () => defaultValue)`.
2. Flag `*:hydrated` (juga `useState`) supaya proses baca `localStorage` cuma jalan sekali per page load.
3. Baca dari `localStorage` di dalam `onMounted` (dibungkus `if (!process.client) return`).
4. Tulis ke `localStorage` setiap kali state berubah (lewat fungsi `persist()` yang dipanggil manual setelah mutasi, atau `watch(..., { deep: true })`).

Ini menghindari hydration mismatch, karena render awal di server dan client sama-sama mulai dari default kosong.

### Styling

- Tailwind v4, di-import langsung di `assets/css/tailwind.css` (`@import "tailwindcss"`), bukan lewat `tailwind.config.js` klasik.
- Dark mode pakai custom variant: `@custom-variant dark (&:where(.dark, .dark *))`, jadi selalu tulis dua varian class (`bg-white dark:bg-zinc-950`) di komponen baru.
- Class utility bersama ada di `tailwind.css`: `.container`, `.btn`, `.badge`. Pakai ini dulu sebelum menulis utility class panjang berulang.

### Testing

Test ada di `tests/`, memakai Vitest + `@vue/test-utils` + jsdom. `tests/setup.ts` mock `useRuntimeConfig` dan men-stub `NuxtLink` supaya komponen bisa di-test di luar runtime Nuxt penuh. Saat menambah composable/komponen baru yang bergantung pada API Nuxt (mis. `useState`, `useHead`), cek dulu apakah perlu mock tambahan di `tests/setup.ts`.

Jalankan test spesifik:

```bash
pnpm vitest run tests/composables/useDebounce.test.ts
```

## Menambah Fitur Baru (contoh alur kerja)

1. **Composable dulu** — kalau fitur butuh state atau fetch data, buat di `app/composables/useXxx.ts`. Tentukan key `useState` sesuai konvensi di atas.
2. **Component presentational** — buat di `app/components/ui/` atau `layout/`, terima data lewat props, emit event untuk aksi (hindari akses composable langsung di komponen kalau bisa dihindari, kecuali memang butuh state global seperti `useCart`/`useTheme`).
3. **Page** — orkestrasi: panggil composable, kirim data ke komponen.
4. **Test** — tambahkan unit test minimal untuk composable/komponen baru di `tests/`.
5. **Verifikasi manual** — jalankan `pnpm dev`, cek golden path + edge case (loading, error, empty state) di browser, termasuk mode dark dan tampilan mobile (hamburger menu).
6. **Update docs** — kalau menambah state/composable baru atau mengubah alur, update [ARCHITECTURE.md](./ARCHITECTURE.md) dan/atau [FLOW.md](./FLOW.md).

## Deployment

Nitro preset di `nuxt.config.ts` sudah diset ke `"vercel"`. `pnpm build` menghasilkan output yang siap deploy ke Vercel; tidak ada langkah tambahan khusus.
