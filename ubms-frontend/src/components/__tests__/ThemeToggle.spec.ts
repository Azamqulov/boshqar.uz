import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ThemeToggle from '../ThemeToggle.vue';
import { useThemeStore } from '../../stores/theme.store';

describe('ThemeToggle.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders switch role and accessible labels', () => {
    const wrapper = mount(ThemeToggle);
    const button = wrapper.find('button');

    expect(button.attributes('role')).toBe('switch');
    expect(button.attributes('aria-checked')).toBeDefined();
    expect(button.attributes('aria-label')).toBeDefined();
  });

  it('toggles theme when clicked', async () => {
    const themeStore = useThemeStore();
    const initial = themeStore.isDark;

    const wrapper = mount(ThemeToggle);
    await wrapper.find('button').trigger('click');

    expect(themeStore.isDark).toBe(!initial);
  });
});
