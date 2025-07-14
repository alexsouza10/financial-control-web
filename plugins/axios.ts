import axios from "axios";
import { defineNuxtPlugin, useRuntimeConfig } from "#app";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const api = axios.create({
    baseURL: config.public.apiBase, 
    headers: { "Content-Type": "application/json" },
  });

  return { provide: { api } };
});
