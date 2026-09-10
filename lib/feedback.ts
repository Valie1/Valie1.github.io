export type FeedbackType = "success" | "error";

export type FeedbackPayload = {
  type: FeedbackType;
  message: string;
  title?: string;
  duration?: number;
};

export const GLOBAL_FEEDBACK_EVENT = "valie:feedback";

export function showFeedback(payload: FeedbackPayload) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FeedbackPayload>(GLOBAL_FEEDBACK_EVENT, { detail: payload }));
}

export function showSuccess(message: string, options: Omit<FeedbackPayload, "type" | "message"> = {}) {
  showFeedback({ type: "success", message, ...options });
}

export function showError(message: string, options: Omit<FeedbackPayload, "type" | "message"> = {}) {
  showFeedback({ type: "error", message, ...options });
}
