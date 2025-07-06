import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((nuxtApp) => {
  const storedTheme =
    typeof window !== "undefined" ? localStorage.getItem("theme") : null;
  const initialDefaultTheme = storedTheme || "light";

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
            background: "#121212",
            primary: "#90CAF9",
            secondary: "#BB86FC",
            accent: "#03DAC6",
            error: "#CF6679",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FB8C00",
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
