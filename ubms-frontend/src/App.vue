<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <FloatingStockAlert />
  <ToastContainer />
</template>

<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue';
import FloatingStockAlert from './components/FloatingStockAlert.vue';
</script>
