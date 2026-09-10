export type DocumentScrollLock = () => void;

const SCROLL_KEYS = new Set([" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"]);

function getLockRoot(lockClass: string): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const selector =
    lockClass === "review-modal-locked"
      ? ".review-lightbox"
      : lockClass === "video-modal-locked"
        ? ".one-video-modal"
        : lockClass === "cookie-settings-locked"
          ? ".cookie-consent-layer.is-settings-open, .cookie-consent-layer.is-settings-closing"
          : lockClass === "mobile-menu-locked"
            ? ".minimal-mobile-menu.is-open"
            : lockClass === "valie-cameo-locked"
              ? ".valie-cameo"
              : null;
  return selector ? document.querySelector<HTMLElement>(selector) : null;
}

function isEditableTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && Boolean(
    target.closest('input, textarea, select, [contenteditable="true"], [role="slider"]'),
  );
}

function canScrollInside(target: EventTarget | null, root: HTMLElement | null, deltaY: number) {
  if (!(target instanceof HTMLElement) || !root || !root.contains(target)) return false;

  let node: HTMLElement | null = target;
  while (node && root.contains(node)) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const scrollable = /auto|scroll|overlay/i.test(overflowY) && node.scrollHeight > node.clientHeight + 1;
    if (scrollable) {
      if (deltaY < 0 && node.scrollTop > 0) return true;
      if (deltaY > 0 && node.scrollTop + node.clientHeight < node.scrollHeight - 1) return true;
      if (deltaY === 0) return true;
    }
    if (node === root) break;
    node = node.parentElement;
  }

  return false;
}














export function lockDocumentScroll(lockClass: string): DocumentScrollLock {
  if (typeof window === "undefined" || typeof document === "undefined") return () => {};

  const body = document.body;
  const html = document.documentElement;
  let touchY: number | null = null;

  html.classList.add(lockClass);
  body.classList.add(lockClass);

  const root = () => getLockRoot(lockClass);

  const onWheel = (event: WheelEvent) => {
    if (canScrollInside(event.target, root(), event.deltaY)) return;
    event.preventDefault();
  };

  const onTouchStart = (event: TouchEvent) => {
    touchY = event.touches.length ? event.touches[0].clientY : null;
  };

  const onTouchMove = (event: TouchEvent) => {
    if (!event.touches.length || touchY === null) {
      event.preventDefault();
      return;
    }
    const nextY = event.touches[0].clientY;
    const deltaY = touchY - nextY;
    touchY = nextY;
    if (canScrollInside(event.target, root(), deltaY)) return;
    event.preventDefault();
  };

  const onTouchEnd = () => {
    touchY = null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!SCROLL_KEYS.has(event.key) || isEditableTarget(event.target)) return;
    const direction = event.key === "PageUp" || event.key === "Home" || event.key === "ArrowUp" ? -1 : 1;
    if (canScrollInside(event.target, root(), direction)) return;
    event.preventDefault();
  };

  document.addEventListener("wheel", onWheel, { passive: false, capture: true });
  document.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
  document.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });
  document.addEventListener("touchend", onTouchEnd, { passive: true, capture: true });
  document.addEventListener("touchcancel", onTouchEnd, { passive: true, capture: true });
  window.addEventListener("keydown", onKeyDown, true);

  return () => {
    document.removeEventListener("wheel", onWheel, true);
    document.removeEventListener("touchstart", onTouchStart, true);
    document.removeEventListener("touchmove", onTouchMove, true);
    document.removeEventListener("touchend", onTouchEnd, true);
    document.removeEventListener("touchcancel", onTouchEnd, true);
    window.removeEventListener("keydown", onKeyDown, true);
    html.classList.remove(lockClass);
    body.classList.remove(lockClass);
  };
}
