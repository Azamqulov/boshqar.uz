# Boshqar.uz — Frontend UI Komponentlari

Ushbu katalogda tizim bo'ylab qayta ishlatiladigan universal komponentlar joylashgan. Loyihada yangi sahifa yoki oyna yaratishda faqat ushbu komponentlardan foydalanish tavsiya etiladi.

---

## 1. `AppButton.vue`
Universal tugma komponenti. Dizayn tizimi va yuklanish animatsiyasi bilan integratsiyalangan.

```vue
<script setup>
import AppButton from '@/components/AppButton.vue';
import { Plus } from 'lucide-vue-next';
</script>

<template>
  <!-- Primary Tugma -->
  <AppButton variant="primary" size="md" :icon="Plus" @click="save">
    Saqlash
  </AppButton>

  <!-- Loading holati -->
  <AppButton variant="primary" :loading="isSaving">
    Yuklanmoqda...
  </AppButton>

  <!-- Danger / Delete Tugma -->
  <AppButton variant="danger" size="sm" @click="remove">
    O'chirish
  </AppButton>
</template>
```

**Variantlar:** `primary`, `secondary`, `danger`, `warning`, `success`, `ghost`.  
**O'lchamlar:** `sm`, `md`, `lg`.

---

## 2. `AppInput.vue`
Standartlashtirilgan label, xatolik ko'rsatkichi va icon integratsiyasiga ega input.

```vue
<AppInput
  v-model="userName"
  label="Foydalanuvchi nomi"
  placeholder="Masalan: Ali Valiyev"
  :required="true"
  :error="errors.userName"
/>
```

---

## 3. `AppCard.vue`
Tizimning glassmorphism kartochkasi.

```vue
<AppCard padding="md">
  <h3 class="font-bold">Kartochka sarlavhasi</h3>
  <p>Kartochka matni...</p>
</AppCard>
```

---

## 4. `AppConfirmDialog.vue`
Brauzerning eski `confirm()` o'rniga foydalaniladigan zamonaviy modal tasdiqlash oynasi.

```vue
<AppConfirmDialog
  :open="isConfirmOpen"
  title="Mahsulotni o'chirish"
  message="Haqiqatan ham ushbu mahsulotni o'chirmoqchimisiz?"
  variant="danger"
  confirm-text="Ha, o'chirish"
  @confirm="handleConfirm"
  @cancel="isConfirmOpen = false"
/>
```

---

## 5. `AppSelect.vue`
Qidiruv, rangli ikonka va filtr imkoniyatiga ega universal select komponenti.

```vue
<AppSelect
  v-model="selectedCategoryId"
  :options="categoryOptions"
  placeholder="Kategoriyani tanlang..."
  searchable
/>
```

---

## 6. `CurrencyInput.vue`
Kiritilayotgan summani real vaqtda 3 xonali bo'sh joy bilan formatlovchi raqamli input (`5 000 000 so'm`).

```vue
<CurrencyInput
  v-model="salePrice"
  placeholder="0"
  suffix="so'm"
/>
```

---

## 7. `PhoneInput.vue` & `PasswordInput.vue`
- `PhoneInput`: O'zbekiston telefon raqamlari uchun maska (`+998 90 123 45 67`).
- `PasswordInput`: Ko'zni ochish/yopish va maxfiylik belgilariga ega parol maydoni.
