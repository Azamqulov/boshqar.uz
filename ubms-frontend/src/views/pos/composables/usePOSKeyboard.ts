import { onMounted, onUnmounted, type Ref } from 'vue';

export interface POSKeyboardOptions {
  enableHotkeys: Ref<boolean | undefined>;
  isCheckoutOpen: Ref<boolean>;
  isDiscountModalOpen: Ref<boolean>;
  isHotkeysModalOpen: Ref<boolean>;
  isHeldOrdersOpen: Ref<boolean>;
  isNewCustomerModalOpen: Ref<boolean>;
  completedOrder: Ref<any>;
  allowDiscounts: Ref<boolean | undefined>;
  allowDebt: Ref<boolean | undefined>;
  cartItemsCount: Ref<number>;
  onCompleteOrder: () => void;
  onSelectPaymentMethod: (id: string) => void;
  onOpenCheckout: () => void;
  onClearCart: () => void;
  onHoldCart: () => void;
  toast: any;
}

export function usePOSKeyboard(opts: POSKeyboardOptions) {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (opts.enableHotkeys.value === false) return;

    const key = e.key;

    // F1: Open Hotkeys cheat sheet modal
    if (key === 'F1') {
      e.preventDefault();
      opts.isHotkeysModalOpen.value = !opts.isHotkeysModalOpen.value;
      return;
    }

    // F11: Toggle Fullscreen for PC terminal
    if (key === 'F11') {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => null);
      } else {
        document.exitFullscreen().catch(() => null);
      }
      return;
    }

    // Escape: Close any open modal
    if (key === 'Escape') {
      if (opts.isHotkeysModalOpen.value) {
        opts.isHotkeysModalOpen.value = false;
        return;
      }
      if (opts.isCheckoutOpen.value) {
        opts.isCheckoutOpen.value = false;
        return;
      }
      if (opts.isDiscountModalOpen.value) {
        opts.isDiscountModalOpen.value = false;
        return;
      }
      if (opts.isHeldOrdersOpen.value) {
        opts.isHeldOrdersOpen.value = false;
        return;
      }
      if (opts.completedOrder.value) {
        opts.completedOrder.value = null;
        return;
      }
      if (opts.isNewCustomerModalOpen.value) {
        opts.isNewCustomerModalOpen.value = false;
        return;
      }
      return;
    }

    // If Checkout Modal is open:
    if (opts.isCheckoutOpen.value) {
      if (key === 'Enter') {
        const activeEl = document.activeElement as HTMLElement;
        if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.classList.contains('no-hotkey-enter'))) {
          return;
        }
        e.preventDefault();
        opts.onCompleteOrder();
        return;
      }

      // Number keys 1, 2, 3, 4 for payment method if not typing in input/textarea
      const activeEl = document.activeElement as HTMLElement;
      const isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      if (!isTyping) {
        if (key === '1') {
          e.preventDefault();
          opts.onSelectPaymentMethod('1');
          return;
        }
        if (key === '2') {
          e.preventDefault();
          opts.onSelectPaymentMethod('2');
          return;
        }
        if (key === '3') {
          e.preventDefault();
          opts.onSelectPaymentMethod('3');
          return;
        }
        if (key === '4' && opts.allowDebt.value) {
          e.preventDefault();
          opts.onSelectPaymentMethod('4');
          return;
        }
      }
      return;
    }

    // F2: Focus Search / Barcode input
    if (key === 'F2') {
      e.preventDefault();
      const searchEl = document.getElementById('pos-search-input');
      if (searchEl) {
        searchEl.focus();
        (searchEl as HTMLInputElement).select?.();
      }
      return;
    }

    // F4: Open Discount Modal
    if (key === 'F4') {
      e.preventDefault();
      if (opts.allowDiscounts.value === false) {
        opts.toast.warning("Sozlamalarda chegirma berish o'chirilgan!", 'Chegirma taqiqlangan');
        return;
      }
      if (opts.cartItemsCount.value > 0) {
        opts.isDiscountModalOpen.value = true;
      } else {
        opts.toast.warning("Chegirma berish uchun avval savatga tovar qo'shing!", "Savat bo'sh");
      }
      return;
    }

    // F7: Clear Cart
    if (key === 'F7') {
      e.preventDefault();
      if (opts.cartItemsCount.value > 0) {
        opts.onClearCart();
        opts.toast.info('Savat tozalandi', 'Savat');
      }
      return;
    }

    // F8: Hold Current Cart
    if (key === 'F8') {
      e.preventDefault();
      opts.onHoldCart();
      return;
    }

    // F9: Open Held Orders
    if (key === 'F9') {
      e.preventDefault();
      opts.isHeldOrdersOpen.value = true;
      return;
    }

    // F10: Open Checkout Modal
    if (key === 'F10') {
      e.preventDefault();
      opts.onOpenCheckout();
      return;
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
