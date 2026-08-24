import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ShiftModal from '../ShiftModal.vue';

// Mock dependencies
vi.mock('../../composables/useToast', () => ({
  useToast: () => ({
    success: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('ShiftModal Component', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('modal yopiq bo\'lganda hech narsa ko\'rsatilmasligi kerak', () => {
    const wrapper = mount(ShiftModal, {
      props: {
        isOpen: false,
        mode: 'open',
      },
      global: {
        stubs: {
          Teleport: true,
          AppButton: true,
          CurrencyInput: true,
        },
      },
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('open rejimida ochiq modal tegishli sarlavha va formani aks ettirishi kerak', () => {
    const wrapper = mount(ShiftModal, {
      props: {
        isOpen: true,
        mode: 'open',
      },
      global: {
        stubs: {
          Teleport: true,
          AppButton: true,
          CurrencyInput: true,
        },
      },
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.text()).toContain('Yangi Smena Ochish');
  });

  it('yopish tugmasi bosilganda close hodisasi emit qilinishi kerak', async () => {
    const wrapper = mount(ShiftModal, {
      props: {
        isOpen: true,
        mode: 'open',
      },
      global: {
        stubs: {
          Teleport: true,
          AppButton: true,
          CurrencyInput: true,
        },
      },
    });

    const closeBtn = wrapper.find('button');
    if (closeBtn.exists()) {
      await closeBtn.trigger('click');
      expect(wrapper.emitted('close')).toBeTruthy();
    }
  });
});
