import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './index.css';
import { useThemeStore } from './stores/theme.store';
import { initSentry } from './plugins/sentry';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize theme from localStorage / system preference
const themeStore = useThemeStore();
themeStore.initTheme();

// Initialize Sentry error monitoring (only in production with DSN configured)
initSentry(app);

app.mount('#app');


