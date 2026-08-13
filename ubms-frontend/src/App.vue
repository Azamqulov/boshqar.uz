<template>
  <router-view v-slot="{ Component }">
    <transition name="page" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
  <ToastContainer />
</template>

<script setup lang="ts">
import ToastContainer from './components/ToastContainer.vue';
</script>
