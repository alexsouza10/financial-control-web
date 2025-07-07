import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import type { UserConfig } from "vite";

export default defineNuxtConfig({
  ssr: false,
  target: "static", // ← necessário para build estático

  devtools: { enabled: true },

  app: {
    baseURL: "/financial-control/", // ← necessário para GitHub Pages
  },

  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css",
  ],

  build: {
    transpile: ["vuetify"],
  },

  modules: [
    "@pinia/nuxt",
    (moduleOptions, nuxt) => {
      nuxt.hook("vite:extendConfig", (config: UserConfig) => {
        config.plugins = config.plugins || [];
        config.plugins.push(
          vuetify({
            autoImport: true,
          })
        );
      });
    },
  ],

  vite: {
    define: {
      "process.env.DEBUG": false,
    },
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },

  nitro: {
    compatibilityDate: "2025-07-05",
  },
});
