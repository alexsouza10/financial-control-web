import { defineNuxtConfig } from "nuxt/config";
import vuetify from "vite-plugin-vuetify";

export default defineNuxtConfig({
  // Configuração da aplicação
  app: {
    baseURL: "/",
    head: {
      title: "Financial Control",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "theme-color", content: "#1976D2" },
      ],
      link: [
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },

  // Configuração de módulos
  modules: [
    "@pinia/nuxt",
    // Configuração do Vuetify
    (_moduleOptions, nuxt) => {
      nuxt.hook("vite:extendConfig", (config) => {
        config.plugins = config.plugins || [];
        config.plugins.push(
          vuetify({
            autoImport: true,
          })
        );
      });
    },
  ],

  // Configuração de tempo de execução
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:7001/api',
    },
  },

  // Estilos globais
  css: [
    "vuetify/lib/styles/main.sass",
    "@mdi/font/css/materialdesignicons.min.css"
  ],

  // Configuração de build
  build: {
    transpile: ["vuetify"],
  },

  // Plugins
  plugins: ["~/plugins/axios"],

  // Configuração do Vite
  vite: {
    define: {
      "process.env.DEBUG": false,
    },
    vue: {
      template: {
        transformAssetUrls: true,
      },
    },
    ssr: {
      noExternal: ["form-data"],
    },
  },

  // Configuração do Nitro (SSR)
  nitro: {
    preset: "static",
    serveStatic: true,
    prerender: {
      crawlLinks: true,
      routes: ["/", "/404.html"],
    },
  },

  // Configuração do servidor de desenvolvimento
  devServer: {
    host: '0.0.0.0',
    port: 3000
  },
});
