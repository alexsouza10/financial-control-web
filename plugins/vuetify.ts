import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((nuxtApp) => {
  const isClient = typeof window !== "undefined";
  const storedTheme = isClient ? localStorage.getItem("theme") : null;
  const validThemes = ["light", "dark"];
  const initialDefaultTheme = validThemes.includes(storedTheme || "")
    ? storedTheme!
    : "dark";

  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: initialDefaultTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            background: "#FFFFFF",
            primary: "#1976D2",
            secondary: "#424242",
            accent: "#82B1FF",
            error: "#FF5252",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FB8C00",
          },
        },
        dark: {
          dark: true,
          colors: {
            primary: '#1262c3ff', 
            secondary: '#FFC107', 
            accent: '#03DAC6',
            error: '#EF5350',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
            surface: '#212121', 
            'surface-lighten1': '#2C2C2C', 
            'surface-lighten2': '#363636', 
            background: '#121212', 
          },
        },
      },
    },
    icons: {
      defaultSet: "mdi",
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
