<template>
  <div class="analytics-page">
    <ExpenseDashboard />
  </div>
</template>

<script setup lang="ts">
import ExpenseDashboard from "~/components/organisms/ExpenseDashboard.vue";

definePageMeta({
  layout: "default",
});
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
}
</style>
