import type { ErrorCode } from "@/types/api";

export const MESSAGES: Record<ErrorCode, string> = {
  invalid_url: "Please enter a valid HTTP or HTTPS URL.",
  invalid_key: "Your API key is invalid or expired.",
  rate_limited: "Too many requests. Please wait before trying again.",
  network: "Unable to reach the processing service.",
  timeout: "The request took too long. Please try again later.",
  not_configured: "The processing service is not configured yet.",
  unexpected: "The service returned an unexpected response.",
  bad_request: "The request was incomplete or invalid. Check the link and try again.",
  upstream: "The processing service had a problem resolving this link. Try again later.",
  forbidden_origin: "This request origin is not allowed.",
};
