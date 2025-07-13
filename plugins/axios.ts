import axios from 'axios';
import { defineNuxtPlugin } from '#app';

export default defineNuxtPlugin(() => {
  const api = axios.create({
    baseURL: 'http://localhost:7000/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return {
    provide: {
      api: api
    }
  }
});