import { writable } from "svelte/store";
export type ToastType = "info" | "success" | "error";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export const toasts = writable<Toast[]>([]);

export function addToast({
  message,
  type = "info",
  duration = 3000,
}: {
  message: string;
  type?: ToastType;
  duration?: number;
}) {
  const id = crypto.randomUUID();
  const toast: Toast = { id, message, type, duration };
  toasts.update((all) => [...all, toast]);

  setTimeout(() => {
    toasts.update((all) => all.filter((t) => t.id !== id));
  }, duration);
}
