# Alur Aplikasi (Flow)

Dokumen ini menjelaskan alur data dan interaksi pengguna untuk fitur-fitur utama.

## 1. Browse Produk (Home)

```mermaid
sequenceDiagram
    participant U as User
    participant P as index.vue
    participant C as useProducts()
    participant API as FakeStoreAPI

    U->>P: buka "/"
    P->>C: fetchAll() + fetchCategories()
    C->>C: cek useState cache
    alt cache kosong
        C->>API: GET /products
        API-->>C: data produk
        C->>C: simpan ke cache
    end
    C-->>P: data produk + kategori
    P->>P: applyFilter() (search + kategori)
    P-->>U: render grid produk (4 per halaman, "Muat lebih banyak")
```

Search (`SearchBar.vue`) dan filter kategori (`CategoryFilter.vue` / klik kategori di `Navbar.vue`) menulis ke `useState` bersama (`global:q`, `nav:selectedCat`). `index.vue` men-`watch` keduanya lalu memanggil ulang `applyFilter()` — tidak ada refetch ke API, filter dilakukan di memori atas data yang sudah di-cache.

## 2. Kategori & Detail Produk

- `/category/[slug]` memanggil `fetchByCategory(slug)`, hasilnya di-cache per slug (`cat:<slug>`), lalu dipaginasi sama seperti home.
- `/products/[id]` memanggil `fetchById(id)` lewat `useAsyncData` (SSR), sehingga detail produk sudah ter-render di HTML awal (baik untuk SEO/meta tag lewat `useHead`).

## 3. Cart — Menambahkan Produk

```mermaid
sequenceDiagram
    participant U as User
    participant Card as ProductCard.vue / products/[id].vue
    participant Cart as useCart()
    participant LS as localStorage

    U->>Card: klik "Add to Cart"
    Card->>Cart: addToCart(product, qty)
    Cart->>Cart: cari item existing by id
    alt sudah ada di cart
        Cart->>Cart: qty += qty
    else belum ada
        Cart->>Cart: push item baru
    end
    Cart->>LS: persist() → localStorage.setItem("cart:items", ...)
    Cart-->>Card: state ter-update (reaktif)
    Card-->>U: tombol berubah jadi "Added ✓" (1-1.5 detik)
```

Karena `items` disimpan lewat `useState("cart:items", ...)`, setiap komponen yang memanggil `useCart()` — `ProductCard`, halaman detail produk, `Navbar`, dan `cart.vue` — berbagi instance state yang sama. Badge jumlah item di `Navbar.vue` (`totalItems`) otomatis ikut update tanpa event manual.

## 4. Cart — Hydration dari localStorage

```mermaid
flowchart TD
    A[Komponen mount, panggil useCart] --> B{process.client?}
    B -- tidak --> Z[skip, tunggu client]
    B -- ya --> C{hydrated.value?}
    C -- sudah true --> Z
    C -- masih false --> D[set hydrated = true]
    D --> E[baca localStorage.cart:items]
    E --> F{ada data valid?}
    F -- ya --> G[items.value = JSON.parse]
    F -- tidak/error --> H[biarkan items tetap kosong]
```

Flag `cart:hydrated` (juga `useState`) mencegah proses read-localStorage berjalan berkali-kali ketika banyak `ProductCard` memanggil `useCart()` sekaligus di satu halaman.

## 5. Cart — Halaman `/cart`

1. Menampilkan seluruh `items` dari `useCart()`.
2. Tiap item punya stepper qty (`updateQty`) — qty 0 otomatis memanggil `removeFromCart`.
3. `totalPrice` dihitung reaktif (`computed`) dari `items`.
4. Tombol **Checkout** memanggil `clearCart()` dan menampilkan pesan sukses sementara (simulasi — tidak ada backend order/payment sungguhan, karena FakeStoreAPI tidak mendukung ini secara nyata).

## 6. Dark Mode

`useTheme()` membaca `localStorage.theme`, fallback ke `prefers-color-scheme`, lalu toggle class `dark` di `<html>`. Pola hydrate → persist ini identik dengan yang dipakai `useCart`.
