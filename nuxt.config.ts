// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  nitro: {
    experimental: {
      websocket: true,
    },
  },
  modules: ["@nuxt/ui"],
  compatibilityDate: "2024-12-21",
});
