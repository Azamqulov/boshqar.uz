import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './index.css';
import 'aos/dist/aos.css';
import { useThemeStore } from './stores/theme.store';
import { initSentry } from './plugins/sentry';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Global Vue runtime error catcher to prevent any white screen crashes
app.config.errorHandler = (err, _instance, info) => {
  console.error('[Vue Global Error]:', err, info);
  const isChunkError = /loading chunk|fetch dynamically imported module|Importing a module script failed/i.test((err as any)?.message || '');
  if (isChunkError) {
    const reloadKey = 'ubms_global_chunk_reload';
    if (!sessionStorage.getItem(reloadKey)) {
      sessionStorage.setItem(reloadKey, '1');
      window.location.reload();
    }
  }
};

// Global unhandled promise rejection listener
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const isChunkError = /loading chunk|fetch dynamically imported module|Importing a module script failed/i.test(event.reason?.message || '');
    if (isChunkError) {
      const reloadKey = 'ubms_promise_chunk_reload';
      if (!sessionStorage.getItem(reloadKey)) {
        sessionStorage.setItem(reloadKey, '1');
        window.location.reload();
      }
    }
  });
}

// Initialize theme from localStorage / system preference
const themeStore = useThemeStore();
themeStore.initTheme();

// Initialize Sentry error monitoring (only in production with DSN configured)
initSentry(app);

app.mount('#app');


