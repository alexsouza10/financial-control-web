import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import type { UserConfig } from "vite";

export default defineNuxtConfig({
  ssr: false,

  app: {
    baseURL:
      process.env.NODE_ENV === "production" && process.env.VERCEL
        ? "/"
        : "/financial-control/",
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
    preset: "vercel",
    prerender: {
      crawlLinks: true,
      routes: ["/", "/404.html"],
    },
  },
});
