<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-16">
    <!-- Top Hero Banner Card Component -->
    <AboutHeroBanner />

    <!-- 6 Key Modules Grid Component -->
    <AboutModulesGrid />

    <!-- Security & Architecture Guarantee Cards Component -->
    <AboutPillarsGrid />

    <!-- Support and Contact Footer Card Component -->
    <AboutSupportCard />
  </div>
</template>

<script setup lang="ts">
import AboutHeroBanner from './components/AboutHeroBanner.vue';
import AboutModulesGrid from './components/AboutModulesGrid.vue';
import AboutPillarsGrid from './components/AboutPillarsGrid.vue';
import AboutSupportCard from './components/AboutSupportCard.vue';
</script>
