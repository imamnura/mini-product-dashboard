import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  css: ["~/assets/css/tailwind.css"],
  app: {
    head: {
      title: "Orange Store",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content: "Simple product dashboard using FakeStore API",
        },
        { property: "og:title", content: "Orange Store" },
        {
          property: "og:description",
          content: "Simple product dashboard using FakeStore API",
        },
        { property: "og:site_name", content: "Orange Store" },
        { property: "og:type", content: "website" },
      ],
      link: [{ rel: "preconnect", href: "https://fakestoreapi.com" }],
    },
  },
  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },
  routeRules: {
    "/": { ssr: true, swr: 60 }, // buat cache 60 detik
    "/category/**": { ssr: true, swr: 60 },
    "/products/**": { ssr: true, swr: 60 },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  devtools: { enabled: true },
  runtimeConfig: {
    public: { API_BASE: "https://fakestoreapi.com" }, // api base statis
  },
  nitro: { preset: "vercel" },
});
