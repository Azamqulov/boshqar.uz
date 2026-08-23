import { ref, computed } from 'vue';
import api from '../../../services/api';
import { useDataStore } from '../../../stores/data.store';
import { useToast } from '../../../composables/useToast';
import { useFormat } from '../../../composables/useFormat';

export function usePOSCustomer() {
  const dataStore = useDataStore();
  const toast = useToast();
  const { formatCurrency } = useFormat();

  const selectedCustomerId = ref('');
  const isNewCustomerModalOpen = ref(false);
  const newCustomerForm = ref({ fullName: '', phone: '' });
  const savingCustomer = ref(false);

  const customers = computed(() => dataStore.customers || []);
  const selectedCustomer = computed(() => customers.value.find((c) => c.id === selectedCustomerId.value) || null);

  const customerSelectOptions = computed(() => {
    return [
      { value: '', label: '— Mijoz tanlanmagan (Oddiy to\'lov) —' },
      ...customers.value.map((c: any) => ({
        value: c.id,
        label: `${c.fullName} (${c.phone || 'Tel yo\'q'})`,
        badge: Number(c.debt || 0) > 0 ? `Qarzi: ${formatCurrency(c.debt)}` : undefined,
      })),
    ];
  });

  const saveNewCustomer = async () => {
    if (!newCustomerForm.value.fullName) {
      toast.warning('Mijoz ismini kiriting!', 'Ogohlantirish');
      return;
    }
    savingCustomer.value = true;
    try {
      const { data } = await api.post('/customers', {
        fullName: newCustomerForm.value.fullName,
        phone: newCustomerForm.value.phone || undefined,
      });
      toast.success(`"${data.fullName}" muvaffaqiyatli saqlandi!`, 'Yangi Mijoz');
      dataStore.invalidate('customers');
      await dataStore.fetchCustomers(true);
      selectedCustomerId.value = data.id;
      isNewCustomerModalOpen.value = false;
      newCustomerForm.value = { fullName: '', phone: '' };
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Mijozni saqlashda xatolik', 'Xatolik');
    } finally {
      savingCustomer.value = false;
    }
  };

  return {
    selectedCustomerId,
    selectedCustomer,
    isNewCustomerModalOpen,
    newCustomerForm,
    savingCustomer,
    customerSelectOptions,
    saveNewCustomer,
  };
}
