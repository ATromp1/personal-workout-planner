export function openModal(html) {
  document.getElementById("modal").innerHTML = html;
  document.getElementById("modal-bg").classList.add("show");
}
export function closeModal() {
  document.getElementById("modal-bg").classList.remove("show");
}

/* Initialize the dismiss-on-backdrop-click once at load */
export function initModal() {
  document.getElementById("modal-bg").addEventListener("click", e => {
    if (e.target.id === "modal-bg") closeModal();
  });
}
