const AUTH_CALLBACK_PATH = "/auth/callback";

export function getAuthCallbackUrl() {
  if (typeof window === "undefined") {
    return AUTH_CALLBACK_PATH;
  }

  return `${window.location.origin}${AUTH_CALLBACK_PATH}`;
}
