<template>
  <div class="analytics-page">
    <AnalyticsDashboard />
  </div>
</template>

<script setup lang="ts">
import AnalyticsDashboard from "~/components/organisms/AnalyticsDashboard.vue";

definePageMeta({
  layout: "default",
});
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
}
</style>
