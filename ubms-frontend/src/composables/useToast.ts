import { ref } from 'vue';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<Toast[]>([]);

export function useToast() {
  const show = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration || 3500;

    const newToast: Toast = { ...toast, id };
    toasts.value.push(newToast);

    setTimeout(() => {
      remove(id);
    }, duration);

    return id;
  };

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  };

  const success = (message: string, title: string = 'Muvaffaqiyatli!') => {
    return show({ type: 'success', title, message });
  };

  const error = (message: string, title: string = 'Xatolik!') => {
    return show({ type: 'error', title, message, duration: 5000 });
  };

  const warning = (message: string, title: string = 'Ogohlantirish') => {
    return show({ type: 'warning', title, message });
  };

  const info = (message: string, title: string = 'Ma\'lumot') => {
    return show({ type: 'info', title, message });
  };

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
  };
}
