<template>
  <div class="space-y-6">
    <!-- Section 1: SuperAdmin Payment Requisites Configuration Component -->
    <SuperAdminRequisitesCard
      :requisites-form="requisitesForm"
      :saving-requisites="savingRequisites"
      @save="saveRequisites"
    />

    <!-- Section 2: Billing Requests Queue Component -->
    <SuperAdminBillingTable
      :filtered-requests="filteredRequests"
      :paginated-requests="paginatedRequests"
      :total-count="requests.length"
      :count-pending="countPending"
      :count-approved="countApproved"
      :count-rejected="countRejected"
      :loading-requests="loadingRequests"
      v-model:search-query="searchQuery"
      v-model:filter-status="filterStatus"
      v-model:filter-plan="filterPlan"
      :plan-filter-options="planFilterOptions"
      :action-loading-id="actionLoadingId"
      v-model:current-page="pagination.currentPage.value"
      v-model:page-size="pagination.pageSize.value"
      :format-money="formatMoney"
      :format-date-time="formatDateTime"
      @refresh="loadRequests"
      @open-receipt="openReceiptPreview"
      @open-approve="openApproveModal"
      @open-reject="openRejectModal"
      @open-edit="openEditRequestModal"
      @delete="deleteRequest"
    />

    <!-- MODAL 1: Receipt Preview Modal Component -->
    <SuperAdminReceiptModal
      :request="selectedReceiptReq"
      :format-money="formatMoney"
      :format-date-time="formatDateTime"
      @close="selectedReceiptReq = null"
    />

    <!-- MODAL 2: Approve Request Modal Component -->
    <SuperAdminApproveModal
      :request="approvingReq"
      :approve-form="approveForm"
      :loading="actionLoadingId === approvingReq?.id"
      :format-money="formatMoney"
      @close="approvingReq = null"
      @confirm="confirmApproveRequest"
      @date-change="onApproveDateChange"
      @days-change="onApproveDaysChange"
    />

    <!-- MODAL 3: Reject Modal Component -->
    <SuperAdminRejectModal
      :request="rejectingReq"
      :reject-form="rejectForm"
      :loading="actionLoadingId === rejectingReq?.id"
      @close="rejectingReq = null"
      @confirm="confirmRejectRequest"
    />

    <!-- MODAL 4: Edit Request / Change Business Plan Modal Component -->
    <SuperAdminEditRequestModal
      :request="editingReq"
      :edit-req-form="editReqForm"
      :edit-days-left="editDaysLeft"
      :plan-select-options="planSelectOptions"
      :saving="savingReq"
      @close="editingReq = null"
      @confirm="saveRequestChanges"
      @set-expiry-days="setEditExpiryDays"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { usePagination } from '@/composables/usePagination';

import SuperAdminRequisitesCard from './SuperAdminRequisitesCard.vue';
import SuperAdminBillingTable from './SuperAdminBillingTable.vue';
import SuperAdminReceiptModal from './SuperAdminReceiptModal.vue';
import SuperAdminApproveModal from './SuperAdminApproveModal.vue';
import SuperAdminRejectModal from './SuperAdminRejectModal.vue';
import SuperAdminEditRequestModal from './SuperAdminEditRequestModal.vue';

const toast = useToast();

const requisitesForm = ref({
  cardNumber: '8600 0000 0000 0000',
  cardHolder: 'BOSHQAR UZ ADMIN',
  bankName: 'Kapitalbank / TBC Bank',
  phone: '+998 90 000 00 00',
  telegramContact: '@Boshqar_uzbot',
  instructions: '',
  isEnabled: true,
});

const savingRequisites = ref(false);
const requests = ref<any[]>([]);
const plansList = ref<any[]>([]);
const loadingRequests = ref(false);

// Filters & Search
const searchQuery = ref('');
const filterStatus = ref('all');
const filterPlan = ref('all');
const actionLoadingId = ref<string | null>(null);

// Modal states
const selectedReceiptReq = ref<any>(null);
const approvingReq = ref<any>(null);
const approveForm = ref({
  durationDays: 30,
  expiresAt: '',
});
const rejectingReq = ref<any>(null);
const rejectForm = ref({ reason: 'To\'lov cheki tasdiqlanmadi' });
const editingReq = ref<any>(null);
const savingReq = ref(false);
const editReqForm = ref({
  planId: '',
  durationMonths: 1,
  amount: 0,
  notes: '',
  expiresAt: '',
});

// Select Options Computeds
const planFilterOptions = computed(() => [
  { value: 'all', label: 'Barcha Tariflar' },
  ...plansList.value.map((pl) => ({
    value: pl.name,
    label: `${pl.name} tarifi`,
  })),
]);

const planSelectOptions = computed(() =>
  plansList.value.map((pl) => ({
    value: pl.id,
    label: `${pl.name} (${formatMoney(pl.priceMonthly)} / oy)`,
  }))
);

// Quick Counts
const countPending = computed(() => requests.value.filter((r) => r.status === 'pending').length);
const countApproved = computed(() => requests.value.filter((r) => r.status === 'approved').length);
const countRejected = computed(() => requests.value.filter((r) => r.status === 'rejected').length);

// Filtered Requests Computed
const filteredRequests = computed(() => {
  return requests.value.filter((req) => {
    if (filterStatus.value !== 'all' && req.status !== filterStatus.value) {
      return false;
    }
    if (filterPlan.value !== 'all' && req.plan?.name !== filterPlan.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const bName = (req.business?.name || '').toLowerCase();
      const oName = (req.business?.owner?.fullName || '').toLowerCase();
      const oPhone = (req.business?.owner?.phone || '').toLowerCase();
      const sName = (req.senderName || '').toLowerCase();
      const sCard = (req.senderCard || '').toLowerCase();
      const notes = (req.notes || '').toLowerCase();

      return (
        bName.includes(q) ||
        oName.includes(q) ||
        oPhone.includes(q) ||
        sName.includes(q) ||
        sCard.includes(q) ||
        notes.includes(q)
      );
    }
    return true;
  });
});

// Pagination for Filtered Requests
const pagination = usePagination(filteredRequests, {
  initialPageSize: 10,
  pageSizeOptions: [10, 20, 50],
  storageKey: 'superadmin_billing_requests_page_size',
});

const paginatedRequests = pagination.paginatedItems;

const loadRequisites = async () => {
  try {
    const { data } = await api.get('/billing/requisites');
    if (data) {
      requisitesForm.value = {
        cardNumber: data.cardNumber || '',
        cardHolder: data.cardHolder || '',
        bankName: data.bankName || '',
        phone: data.phone || '',
        telegramContact: data.telegramContact || '',
        instructions: data.instructions || '',
        isEnabled: data.isEnabled !== false,
      };
    }
  } catch (err) {
    console.error('Requisites error:', err);
  }
};

const loadPlans = async () => {
  try {
    const { data } = await api.get('/superadmin/plans');
    plansList.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Plans error:', err);
  }
};

const saveRequisites = async () => {
  savingRequisites.value = true;
  try {
    const { data } = await api.patch('/billing/requisites', requisitesForm.value);
    requisitesForm.value = { ...requisitesForm.value, ...data };
    toast.success('To\'lov rekvizitlari muvaffaqiyatli saqlandi!');
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    savingRequisites.value = false;
  }
};

const loadRequests = async () => {
  loadingRequests.value = true;
  try {
    const { data } = await api.get('/billing/admin/requests');
    requests.value = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Requests error:', err);
  } finally {
    loadingRequests.value = false;
  }
};

// Modal Openers
const openReceiptPreview = (req: any) => {
  selectedReceiptReq.value = req;
};

const onApproveDaysChange = (days: number) => {
  approveForm.value.durationDays = days;
  const d = new Date();
  d.setDate(d.getDate() + days);
  approveForm.value.expiresAt = d.toISOString().split('T')[0];
};

const onApproveDateChange = () => {
  if (!approveForm.value.expiresAt) return;
  const target = new Date(approveForm.value.expiresAt).getTime();
  const now = new Date().getTime();
  const diff = Math.max(1, Math.ceil((target - now) / 86400000));
  approveForm.value.durationDays = diff;
};

const openApproveModal = (req: any) => {
  approvingReq.value = req;
  const days = (req.durationMonths || 1) * 30;
  onApproveDaysChange(days);
};

const confirmApproveRequest = async () => {
  if (!approvingReq.value) return;
  const req = approvingReq.value;
  actionLoadingId.value = req.id;
  try {
    await api.patch(`/billing/admin/requests/${req.id}/approve`, {
      durationDays: approveForm.value.durationDays,
      expiresAt: approveForm.value.expiresAt,
    });
    toast.success(`Muvaffaqiyatli tasdiqlandi! "${req.business?.name}" uchun ${approveForm.value.expiresAt} gacha (${approveForm.value.durationDays} kun) obuna faollashtirildi.`);
    approvingReq.value = null;
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    actionLoadingId.value = null;
  }
};

const openRejectModal = (req: any) => {
  rejectingReq.value = req;
  rejectForm.value.reason = 'To\'lov cheki tasdiqlanmadi';
};

const confirmRejectRequest = async () => {
  if (!rejectingReq.value) return;
  const req = rejectingReq.value;
  actionLoadingId.value = req.id;
  try {
    await api.patch(`/billing/admin/requests/${req.id}/reject`, {
      reason: rejectForm.value.reason,
    });
    toast.info('To\'lov so\'rovi rad etildi.');
    rejectingReq.value = null;
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    actionLoadingId.value = null;
  }
};

const setEditExpiryDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  editReqForm.value.expiresAt = d.toISOString().split('T')[0];
  editReqForm.value.durationMonths = Math.max(1, Math.round(days / 30));
};

const editDaysLeft = computed(() => {
  if (!editReqForm.value.expiresAt) return 0;
  const target = new Date(editReqForm.value.expiresAt).getTime();
  const now = new Date().getTime();
  return Math.max(0, Math.ceil((target - now) / 86400000));
});

const openEditRequestModal = (req: any) => {
  editingReq.value = req;
  const days = (req.durationMonths || 1) * 30;
  const d = new Date();
  d.setDate(d.getDate() + days);
  editReqForm.value = {
    planId: req.planId,
    durationMonths: req.durationMonths || 1,
    amount: Number(req.amount || 0),
    notes: req.notes || '',
    expiresAt: d.toISOString().split('T')[0],
  };
};

const saveRequestChanges = async () => {
  if (!editingReq.value) return;
  savingReq.value = true;
  try {
    await api.patch(`/billing/admin/requests/${editingReq.value.id}`, editReqForm.value);
    toast.success('So\'rov va obuna amal qilish muddati muvaffaqiyatli saqlandi!');
    editingReq.value = null;
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    savingReq.value = false;
  }
};

const deleteRequest = async (req: any) => {
  if (!confirm(`"${req.business?.name}" to'lov so'rovini o'chirishni tasdiqlaysizmi?`)) return;

  actionLoadingId.value = req.id;
  try {
    await api.delete(`/billing/admin/requests/${req.id}`);
    toast.success('To\'lov so\'rovi o\'chirildi!');
    await loadRequests();
  } catch (err: any) {
    toast.error(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
  } finally {
    actionLoadingId.value = null;
  }
};

const formatMoney = (amount: any) => {
  const num = Math.round(Number(amount || 0));
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
};

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return '--:--';
  const d = new Date(dateStr);
  return `${d.toLocaleDateString('uz-UZ')} ${d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}`;
};

onMounted(() => {
  loadRequisites();
  loadPlans();
  loadRequests();
});
</script>
