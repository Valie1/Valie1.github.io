const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function isVisible(element: HTMLElement) {
  if (element.hidden || element.getAttribute('aria-hidden') === 'true') return false;
  if (element.closest('[inert]')) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return element.getClientRects().length > 0;
}

export function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

export function trapTabKey(event: KeyboardEvent, container: HTMLElement) {
  if (event.key !== 'Tab') return false;
  const focusable = getFocusableElements(container);
  if (!focusable.length) {
    event.preventDefault();
    container.focus({ preventScroll: true });
    return true;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (event.shiftKey) {
    if (!active || active === first || !container.contains(active)) {
      event.preventDefault();
      last.focus({ preventScroll: true });
      return true;
    }
  } else if (!active || active === last || !container.contains(active)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
    return true;
  }

  return false;
}

export function restoreFocus(target: HTMLElement | null | undefined) {
  if (!target || !target.isConnected) return;
  window.requestAnimationFrame(() => {
    if (target.isConnected) target.focus({ preventScroll: true });
  });
}

export function isolateDialog(container: HTMLElement) {
  const root = Array.from(document.body.children).find((child) => child === container || child.contains(container));
  if (!(root instanceof HTMLElement)) return () => {};

  const changed: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
  Array.from(document.body.children).forEach((child) => {
    if (!(child instanceof HTMLElement) || child === root) return;
    if (child.id === "cnh-policy-portal") return;
    if (["SCRIPT", "STYLE", "LINK"].includes(child.tagName)) return;

    changed.push({
      element: child,
      inert: child.inert,
      ariaHidden: child.getAttribute("aria-hidden"),
    });
    child.inert = true;
    child.setAttribute("aria-hidden", "true");
  });

  return () => {
    changed.forEach(({ element, inert, ariaHidden }) => {
      if (!element.isConnected) return;
      element.inert = inert;
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    });
  };
}
