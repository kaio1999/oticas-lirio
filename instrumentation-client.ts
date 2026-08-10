import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: dsn || undefined,
  enabled: Boolean(dsn),
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.15 : 1,
  sendDefaultPii: false,
  integrations: [Sentry.replayIntegration({ maskAllText: true, blockAllMedia: true })],
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
