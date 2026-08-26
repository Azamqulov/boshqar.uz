import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSelect from '../AppSelect.vue';

describe('AppSelect.vue Component', () => {
  const sampleOptions = [
    { label: 'Oziq-ovqat', value: 'food' },
    { label: 'Ichimliklar', value: 'drinks' },
    { label: 'Kiyim-kechak', value: 'clothes' },
  ];

  it('renders custom combobox trigger with accessibility role', () => {
    const wrapper = mount(AppSelect, {
      props: {
        modelValue: 'food',
        options: sampleOptions,
      },
    });

    const button = wrapper.find('button[role="combobox"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Oziq-ovqat');
  });

  it('renders placeholder when no option is selected', () => {
    const wrapper = mount(AppSelect, {
      props: {
        modelValue: '',
        options: sampleOptions,
        placeholder: 'Kategoriya tanlang',
      },
    });

    const button = wrapper.find('button[role="combobox"]');
    expect(button.exists()).toBe(true);
    expect(button.text()).toContain('Kategoriya tanlang');
  });

  it('respects disabled state', () => {
    const wrapper = mount(AppSelect, {
      props: {
        modelValue: 'food',
        options: sampleOptions,
        disabled: true,
      },
    });

    const button = wrapper.find('button[role="combobox"]');
    expect(button.attributes('disabled')).toBeDefined();
  });
});
