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
            background: "#f1f1f1ff",
            surface: "#FAFAFA",
            primary: "#00796B",
            secondary: "#FFB300",
            accent: "#4DB6AC",
            error: "#D32F2F",
            info: "#1976D2",
            success: "#388E3C",
            warning: "#FBC02D",
          },
        },
        dark: {
          dark: true,
          colors: {
            background: "#1C1C1C",
            surface: "#282828",
            primary: "#4DB6AC",
            secondary: "#FFB300",
            accent: "#00796B",
            error: "#EF5350",
            info: "#42A5F5",
            success: "#66BB6A",
            warning: "#FFCA28",
            "surface-lighten1": "#363636",
            "surface-lighten2": "#424242",
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
