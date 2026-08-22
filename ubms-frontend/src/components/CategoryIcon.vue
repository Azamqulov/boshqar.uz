<template>
  <component :is="resolvedComponent" v-if="resolvedComponent" :class="iconClass || 'w-4 h-4'" />
  <Package v-else :class="iconClass || 'w-4 h-4'" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Package,
  Apple,
  UtensilsCrossed,
  Coffee,
  CupSoda,
  Milk,
  Cookie,
  Flame,
  ShoppingBag,
  Shirt,
  Pill,
  Sparkles,
  Scissors,
  BookOpen,
  Wrench,
  FolderTree,
  Laptop,
  HeartPulse,
  Gem,
  Tag,
  Store,
  Layers,
  Fuel,
  Flower2,
  Car
} from 'lucide-vue-next';

const props = defineProps<{
  icon?: string;
  iconClass?: string;
}>();

const iconMap: Record<string, any> = {
  package: Package,
  box: Package,
  apple: Apple,
  fruit: Apple,
  food: UtensilsCrossed,
  dish: UtensilsCrossed,
  utensils: UtensilsCrossed,
  utensilscrossed: UtensilsCrossed,
  coffee: Coffee,
  tea: Coffee,
  drink: CupSoda,
  cupsoda: CupSoda,
  water: CupSoda,
  milk: Milk,
  dairy: Milk,
  cookie: Cookie,
  sweet: Cookie,
  flame: Flame,
  hot: Flame,
  shoppingbag: ShoppingBag,
  bag: ShoppingBag,
  shirt: Shirt,
  cloth: Shirt,
  pill: Pill,
  med: Pill,
  pharmacy: Pill,
  sparkles: Sparkles,
  beauty: Sparkles,
  scissors: Scissors,
  barber: Scissors,
  bookopen: BookOpen,
  book: BookOpen,
  stationery: BookOpen,
  wrench: Wrench,
  service: Wrench,
  foldertree: FolderTree,
  folder: FolderTree,
  laptop: Laptop,
  tech: Laptop,
  heartpulse: HeartPulse,
  health: HeartPulse,
  gem: Gem,
  tag: Tag,
  store: Store,
  layers: Layers,
  fuel: Fuel,
  flower: Flower2,
  car: Car,
};

const resolvedComponent = computed(() => {
  if (!props.icon) return Package;
  const key = props.icon.toLowerCase().replace(/[\s\-_]/g, '');
  return iconMap[key] || null;
});
</script>
