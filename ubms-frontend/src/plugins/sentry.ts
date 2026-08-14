// ════════════════════════════════════════════════════
//  boshqar.uz — Sentry Frontend Monitoring (Vue 3)
//  src/plugins/sentry.ts
// ════════════════════════════════════════════════════

import * as Sentry from '@sentry/vue';
import type { App } from 'vue';
import router from '../router';

export function initSentry(app: App) {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string;

  if (!dsn || import.meta.env.DEV) {
    console.log('[Sentry] Frontend monitoring disabled (dev or no DSN)');
    return;
  }

  Sentry.init({
    app,
    dsn,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllInputs: true,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.05,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
    release: '2.0.0',
    tracePropagationTargets: [
      'localhost',
      /^https:\/\/boshqar\.uz\/api/,
    ],
    beforeSend(event) {
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        if (data.password) data.password = '[FILTERED]';
      }
      return event;
    },
  });

  console.log('[Sentry] Frontend error monitoring enabled');
}
