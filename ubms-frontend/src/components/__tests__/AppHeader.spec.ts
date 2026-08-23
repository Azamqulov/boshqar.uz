import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppHeader from '../AppHeader.vue';

describe('AppHeader Vue Component', () => {
  const defaultProps = {
    isSidebarCollapsed: false,
    activeBusinessName: 'Baraka Market',
    activeBusinessType: 'SHOP',
    showCurrencyTicker: true,
    currencyRateMode: 'auto',
    usdRate: 12650,
    rubRate: 140,
    isDemo: false,
  };

  const globalStubs = {
    RouterLink: {
      template: '<a><slot /></a>',
    },
    ThemeToggle: {
      template: '<button class="theme-toggle-stub">Theme</button>',
    },
  };

  const createMountOptions = (propsOverride = {}) => ({
    props: {
      ...defaultProps,
      ...propsOverride,
    },
    global: {
      stubs: globalStubs,
      mocks: {
        $route: { path: '/' },
      },
    },
  });

  it('boshlangich holatda biznes nomi va turini togri render qilishi kerak', () => {
    const wrapper = mount(AppHeader, createMountOptions());

    expect(wrapper.text()).toContain('Baraka Market');
    expect(wrapper.text()).toContain('SHOP');
  });

  it('isDemo true bolganda Demo banner paydo bolishi kerak', () => {
    const wrapper = mount(AppHeader, createMountOptions({ isDemo: true }));

    expect(wrapper.text()).toContain('Demo Rejim');
    expect(wrapper.text()).toContain('14 Kun Bepul Boshlash');
  });

  it('demo banner bosilganda goToRegister hodisasi (emit) berilishi kerak', async () => {
    const wrapper = mount(AppHeader, createMountOptions({ isDemo: true }));

    const banner = wrapper.find('.bg-gradient-to-r');
    await banner.trigger('click');

    expect(wrapper.emitted()).toHaveProperty('goToRegister');
  });

  it('showCurrencyTicker true bolganda USD va RUB kursini formatlab korsatishi kerak', () => {
    const wrapper = mount(AppHeader, createMountOptions());

    const cleanText = wrapper.text().replace(/\u00a0/g, ' ');
    expect(cleanText).toContain('$1=12 650');
    expect(cleanText).toContain('₽1=140');
  });
});
