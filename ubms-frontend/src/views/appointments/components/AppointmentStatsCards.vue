<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <AppStatCard
      title="Jami Bandlovlar"
      :value="`${appointments.length} ta`"
      subtitle="Jami yozilgan bandlovlar"
      :icon="Calendar"
      variant="blue"
    />

    <AppStatCard
      title="Kutilayotganlar"
      :value="`${pendingCount} ta`"
      subtitle="Kelishi kutilayotganlar"
      :icon="Clock"
      variant="amber"
    />

    <AppStatCard
      title="Bajarilganlar"
      :value="`${completedCount} ta`"
      subtitle="Muvaffaqiyatli yakunlangan"
      :icon="CheckCircle2"
      variant="emerald"
    />

    <AppStatCard
      title="Bekor Qilinganlar"
      :value="`${cancelledCount} ta`"
      subtitle="Bekor qilingan yozuvlar"
      :icon="XCircle"
      variant="rose"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-vue-next';
import AppStatCard from '../../../components/AppStatCard.vue';

const props = defineProps<{
  appointments: any[];
}>();

const pendingCount = computed(() =>
  props.appointments.filter((a: any) => a.status === 'pending' || a.status === 'confirmed').length
);
const completedCount = computed(() =>
  props.appointments.filter((a: any) => a.status === 'completed').length
);
const cancelledCount = computed(() =>
  props.appointments.filter((a: any) => a.status === 'cancelled').length
);
</script>
