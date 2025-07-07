import { defineNuxtConfig } from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

export default defineNuxtConfig({
  ssr: true,

  app: {
    baseURL: '/',
  },

  css: [
    'vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',
  ],

  build: {
    transpile: ['vuetify'],
  },

  modules: [
    '@pinia/nuxt',
    (moduleOptions, nuxt) => {
      nuxt.hook('vite:extendConfig', (config) => {
        config.plugins = config.plugins || []
        config.plugins.push(
          vuetify({
            autoImport: true,
          })
        )
      })
    },
  ],

  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    vue: {
      template: {
        transformAssetUrls: true,
      },
    },
  },

  nitro: {
    preset: 'vercel',
    prerender: {
      crawlLinks: true,
      routes: ['/', '/404.html'],
    },
  },
})
