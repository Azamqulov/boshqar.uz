import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppInput from '../AppInput.vue';

describe('AppInput.vue', () => {
  it('renders input with label and auto-generates id for linking', () => {
    const wrapper = mount(AppInput, {
      props: {
        modelValue: 'Toshkent',
        label: 'Shahar nomi',
      },
    });

    const label = wrapper.find('label');
    const input = wrapper.find('input');

    expect(label.text()).toContain('Shahar nomi');
    expect(label.attributes('for')).toBe(input.attributes('id'));
    expect(input.element.value).toBe('Toshkent');
  });

  it('handles error state with aria-invalid and role alert', () => {
    const wrapper = mount(AppInput, {
      props: {
        modelValue: '',
        label: 'Telefon',
        error: 'Raqam kiritilishi shart',
      },
    });

    const input = wrapper.find('input');
    const alert = wrapper.find('[role="alert"]');

    expect(input.attributes('aria-invalid')).toBe('true');
    expect(alert.exists()).toBe(true);
    expect(alert.text()).toBe('Raqam kiritilishi shart');
  });
});
