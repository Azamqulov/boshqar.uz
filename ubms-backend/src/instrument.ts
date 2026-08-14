import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry() {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn || process.env.NODE_ENV === "development") {
    console.log("[Sentry] Monitoring disabled (dev mode or no DSN)");
    return;
  }

  Sentry.init({
    dsn,
    integrations: [nodeProfilingIntegration()],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    environment: process.env.NODE_ENV || "development",
    release: process.env.APP_VERSION || "2.0.0",
    beforeSend(event) {
      if (event.request?.data) {
        const data = event.request.data as Record<string, unknown>;
        if (data.password) data.password = "[FILTERED]";
        if (data.currentPassword) data.currentPassword = "[FILTERED]";
        if (data.newPassword) data.newPassword = "[FILTERED]";
      }
      return event;
    },
  });

  console.log("[Sentry] Error monitoring enabled");
}
