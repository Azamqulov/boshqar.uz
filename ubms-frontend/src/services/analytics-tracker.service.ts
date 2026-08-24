/**
 * Event Tracking & Product Analytics Service (PostHog / Custom Analytics Integration)
 */

export interface AnalyticsEventPayload {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  businessId?: string;
}

export class AnalyticsTrackerService {
  private static eventsQueue: AnalyticsEventPayload[] = [];
  private static isInitialized = false;

  public static init() {
    this.isInitialized = true;
    console.log('📊 [AnalyticsTracker] Initialized PostHog / Product Event Tracker');
  }

  public static trackEvent(eventName: string, properties: Record<string, any> = {}) {
    const payload: AnalyticsEventPayload = {
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
      },
    };

    this.eventsQueue.push(payload);

    if (import.meta.env.DEV) {
      console.log(`[Event Tracked]: ${eventName}`, properties);
    }

    // Process queue or dispatch to PostHog endpoint
    this.flush();
  }

  private static flush() {
    if (this.eventsQueue.length === 0) return;
    // Drain event queue asynchronously
    const events = [...this.eventsQueue];
    this.eventsQueue = [];

    // Optional: send to backend /posthog proxy endpoint if configured
  }
}
