export type ToastOptions = {
  message: string;
  duration?: number;
};

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export function showToast(message: string, duration = 1500): void {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  if (toastTimer) clearTimeout(toastTimer);

  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);

  toastTimer = setTimeout(() => {
    el.remove();
    toastTimer = null;
  }, duration);
}
