/**
 * Undo toast. Shows a brief message anchored above the tab bar with an
 * Undo link. If the user taps Undo before the timeout, restoreFn() runs
 * and the deletion is reverted. Otherwise the toast fades and the
 * deletion is permanent.
 *
 * Only one toast at a time — calling showUndoToast while one is visible
 * dismisses the previous one (its restoreFn does NOT fire; the prior
 * deletion is committed).
 */

const DURATION_MS = 5000;
let currentEl = null;
let currentTimer = null;

export function showUndoToast(message, restoreFn) {
  dismiss();

  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = '<span class="toast-msg"></span>'
    + '<button class="toast-undo" type="button">Undo</button>';
  el.querySelector(".toast-msg").textContent = message;
  document.body.appendChild(el);
  // Trigger CSS transition on next frame
  requestAnimationFrame(() => el.classList.add("show"));

  el.querySelector(".toast-undo").addEventListener("click", () => {
    clearTimeout(currentTimer);
    currentTimer = null;
    removeEl(el);
    if (el === currentEl) currentEl = null;
    try { restoreFn(); } catch (e) { console.error(e); }
  });

  currentEl = el;
  currentTimer = setTimeout(() => {
    removeEl(el);
    if (el === currentEl) currentEl = null;
    currentTimer = null;
  }, DURATION_MS);
}

function removeEl(el) {
  el.classList.remove("show");
  setTimeout(() => el.remove(), 250);
}

function dismiss() {
  if (currentTimer) {
    clearTimeout(currentTimer);
    currentTimer = null;
  }
  if (currentEl) {
    removeEl(currentEl);
    currentEl = null;
  }
}
