export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object' || !('error' in error)) {
    return fallback;
  }

  const payload = error.error;
  if (!payload || typeof payload !== 'object' || !('message' in payload)) {
    return fallback;
  }

  const message = payload.message;
  if (typeof message === 'string') {
    return message;
  }
  if (Array.isArray(message) && message.every((item) => typeof item === 'string')) {
    return message.join('. ');
  }
  return fallback;
}
