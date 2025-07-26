<template>
  <v-footer class="footer-custom" color="primary" dark>
    <v-container class="footer-container">
      <div class="footer-content">
        <span>&copy; {{ currentYear }} Gestão de Gastos</span>
      </div>
    </v-container>
  </v-footer>
</template>

<script setup>
import { ref } from "vue";

const currentYear = ref(new Date().getFullYear());
</script>

<style scoped>
.footer-custom {
  padding: 0;
  height: 20px;
  min-height: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: auto;
}

.footer-container {
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 12px;
}

.footer-content {
  padding: 2px 0;
  font-size: 0.65rem;
  line-height: 1;
  width: 100%;
  text-align: center;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .footer-custom {
    height: 18px;
    min-height: 18px;
  }
  
  .footer-content {
    font-size: 0.6rem;
    padding: 1px 0;
  }
  
  .footer-container {
    padding: 0 10px;
  }
}

/* For very small devices */
@media (max-width: 400px) {
  .footer-custom {
    height: 16px;
    min-height: 16px;
  }
  
  .footer-content {
    font-size: 0.55rem;
    padding: 0;
  }
  
  .footer-container {
    padding: 0 8px;
  }
}
</style>