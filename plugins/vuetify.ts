import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

export default defineNuxtPlugin((nuxtApp) => {
  const themeCookie = useCookie<string>("theme");

  const validThemes = ["light", "dark"];

  const defaultTheme = "light";

  const initialTheme = validThemes.includes(themeCookie.value)
    ? themeCookie.value
    : defaultTheme;

  const vuetify = createVuetify({
    ssr: true,
    components,
    directives,
    theme: {
      defaultTheme: initialTheme,
      themes: {
        light: {
          dark: false,
          colors: {
            background: "#FFFFFF",
            surface: "#F5F5F5",
            primary: "#6dc254ff",
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
            primary: "#6dc254ff",
            secondary: "#FFC107",
            accent: "#03DAC6",
            error: "#EF5350",
            info: "#2196F3",
            success: "#4CAF50",
            warning: "#FB8C00",
            surface: "#212121",
            "surface-lighten1": "#2C2C2C",
            "surface-lighten2": "#363636",
            background: "#121212",
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
