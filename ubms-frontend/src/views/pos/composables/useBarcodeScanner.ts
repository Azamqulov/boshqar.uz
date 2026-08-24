import { ref, onMounted, onUnmounted } from 'vue';

export interface UseBarcodeScannerOptions {
  onScan: (barcode: string) => void;
  scannerThresholdMs?: number; // Time between keystrokes (default 50ms)
}

export function useBarcodeScanner(options: UseBarcodeScannerOptions) {
  const buffer = ref('');
  let lastKeyTime = 0;
  const threshold = options.scannerThresholdMs || 50;

  const handleKeyDown = (event: KeyboardEvent) => {
    // Ignore function keys, modifier keys, Escape, etc.
    if (event.key.length > 1 && event.key !== 'Enter') {
      return;
    }

    const currentTime = Date.now();
    const timeDiff = currentTime - lastKeyTime;

    if (event.key === 'Enter') {
      if (buffer.value.length >= 3) {
        // Scanned barcode complete
        options.onScan(buffer.value.trim());
      }
      buffer.value = '';
      return;
    }

    // If typing speed is fast (< 50ms per key), accumulate into barcode buffer
    if (timeDiff < threshold || buffer.value.length === 0) {
      buffer.value += event.key;
    } else {
      // Slow typing (human keyboard typing) - reset buffer
      buffer.value = event.key;
    }

    lastKeyTime = currentTime;
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    buffer,
  };
}
