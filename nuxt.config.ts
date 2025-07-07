import { defineNuxtConfig } from "nuxt/config";
import vuetify, { transformAssetUrls } from "vite-plugin-vuetify";
import type { UserConfig } from "vite";

export default defineNuxtConfig({
  ssr: false, // Mantido como SPA
  // 'target: "static"' é uma configuração do Nuxt 2 e é ignorada no Nuxt 3 com ssr: false.
  // A implantação estática para SPAs é o comportamento padrão com ssr: false.

  app: {
    baseURL: "/financial-control/", // <-- base para GitHub Pages
    // head: {
    //   meta: [
    //     { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }
    //   ],
    //   link: [
    //     // Adicione aqui links para fontes ou outros recursos globais, se necessário
    //   ]
    // }
  },

  router: {
    base: "/financial-control/", // <-- base para rotas funcionarem
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
    // Opcional: Aumentar o limite do aviso de tamanho de chunk se você não puder otimizar imediatamente
    // build: {
    //   chunkSizeWarningLimit: 1000, // Exemplo: Aumenta o limite para 1000 kB (1MB)
    // }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        "/",
        "/404.html", // Adicionado explicitamente para garantir que seja tratado como um arquivo
        // Se você tiver outras rotas que deseja pré-renderizar (mesmo em SPA, para ter um HTML inicial), adicione-as aqui:
        // '/expenses',
        // '/analytics',
      ],
    },
  },
});
