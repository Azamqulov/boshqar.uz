<template>
  <span class="inline-flex items-center justify-center shrink-0 overflow-hidden rounded-[3px] shadow-2xs border border-slate-300/40 dark:border-slate-700/60" :class="sizeClass">
    <!-- Uzbekistan Flag -->
    <svg v-if="code === 'uz_latn' || code === 'uz_cyrl' || code === 'uz'" viewBox="0 0 500 250" class="w-full h-full object-cover">
      <rect width="500" height="83.3" fill="#0099b5"/>
      <rect y="83.3" width="500" height="83.3" fill="#ffffff"/>
      <rect y="166.6" width="500" height="83.4" fill="#1eb53a"/>
      <rect y="80.3" width="500" height="3" fill="#ce1126"/>
      <rect y="163.6" width="500" height="3" fill="#ce1126"/>
      <!-- Crescent -->
      <circle cx="70" cy="41.6" r="22" fill="#ffffff"/>
      <circle cx="78" cy="41.6" r="18" fill="#0099b5"/>
      <!-- Stars (simplified dots for crisp icon rendering) -->
      <circle cx="115" cy="22" r="3" fill="#ffffff"/>
      <circle cx="130" cy="22" r="3" fill="#ffffff"/>
      <circle cx="145" cy="22" r="3" fill="#ffffff"/>
      <circle cx="115" cy="41.6" r="3" fill="#ffffff"/>
      <circle cx="130" cy="41.6" r="3" fill="#ffffff"/>
      <circle cx="145" cy="41.6" r="3" fill="#ffffff"/>
      <circle cx="115" cy="61" r="3" fill="#ffffff"/>
      <circle cx="130" cy="61" r="3" fill="#ffffff"/>
      <circle cx="145" cy="61" r="3" fill="#ffffff"/>
    </svg>

    <!-- Russia Flag -->
    <svg v-else-if="code === 'ru'" viewBox="0 0 900 600" class="w-full h-full object-cover">
      <rect width="900" height="200" fill="#ffffff"/>
      <rect y="200" width="900" height="200" fill="#0039a6"/>
      <rect y="400" width="900" height="200" fill="#d52b1e"/>
    </svg>

    <!-- UK Flag (English) -->
    <svg v-else-if="code === 'en' || code === 'gb'" viewBox="0 0 60 30" class="w-full h-full object-cover">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z"/>
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 m-30,0 l60,30 v-30 l-60,30 z h60 v-30 h-60 z"/>
      </clipPath>
      <g clip-path="url(#s)">
        <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" stroke-width="6"/>
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="4" clip-path="url(#t)"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" stroke-width="10"/>
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6"/>
      </g>
    </svg>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    code: string;
    size?: 'sm' | 'md' | 'lg';
  }>(),
  {
    size: 'md',
  }
);

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'w-4 h-3';
  if (props.size === 'lg') return 'w-7 h-5';
  return 'w-5 h-3.5';
});
</script>
