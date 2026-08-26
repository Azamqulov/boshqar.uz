import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppButton from '../AppButton.vue';

describe('AppButton.vue', () => {
  it('renders slot content correctly', () => {
    const wrapper = mount(AppButton, {
      slots: {
        default: 'Saqlash',
      },
    });

    expect(wrapper.text()).toContain('Saqlash');
    expect(wrapper.find('button').attributes('type')).toBe('button');
  });

  it('handles loading state with accessibility attributes', () => {
    const wrapper = mount(AppButton, {
      props: {
        loading: true,
      },
      slots: {
        default: 'Yuklanmoqda',
      },
    });

    const button = wrapper.find('button');
    expect(button.attributes('disabled')).toBeDefined();
    expect(button.attributes('aria-busy')).toBe('true');
    expect(button.attributes('aria-disabled')).toBe('true');
    expect(wrapper.find('.animate-spin').exists()).toBe(true);
    expect(wrapper.find('.sr-only').text()).toBe('Yuklanmoqda...');
  });

  it('sets custom aria-label when provided', () => {
    const wrapper = mount(AppButton, {
      props: {
        ariaLabel: 'Yopish tugmasi',
      },
    });

    expect(wrapper.find('button').attributes('aria-label')).toBe('Yopish tugmasi');
  });
});
