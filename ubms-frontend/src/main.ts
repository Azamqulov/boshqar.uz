import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './index.css';
import { useThemeStore } from './stores/theme.store';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize theme from localStorage / system preference
const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app');

