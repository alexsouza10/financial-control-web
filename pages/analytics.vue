<template>
  <div class="analytics-page">
    <ExpenseDashboard />
  </div>
</template>

<script setup lang="ts">
import ExpenseDashboard from '~/components/modules/expenses/ExpenseDashboard.vue';

definePageMeta({
  layout: "default",
});
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
}
</style>
