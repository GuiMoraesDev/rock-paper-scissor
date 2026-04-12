import * as Sentry from "@sentry/nextjs";

type CaptureApiErrorParams = {
  error: unknown;
  context?: Record<string, unknown>;
};

export const captureApiError = ({
  error,
  context,
}: CaptureApiErrorParams): void => {
  Sentry.captureException(error, context ? { extra: context } : undefined);
};
