import { esc } from "../../core/state.js";
import { openModal, closeModal } from "../../components/modal.js";
import { searchProducts } from "../../core/foodApi.js";
import { handleProductPicked } from "./portionEditModal.js";

export function openSearchModal(rerender) {
  openModal('<h3>Search foods</h3>'
    + '<input class="inp" id="search-q" placeholder="e.g. magere kwark, havermout..." autocomplete="off">'
    + '<div id="search-results" style="margin-top:10px;min-height:50px;"></div>'
    + '<div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button></div>');
  document.getElementById("m-cancel").onclick = closeModal;
  const q = document.getElementById("search-q");
  const results = document.getElementById("search-results");
  q.focus();

  let timer = null;
  let lastQuery = "";
  q.addEventListener("input", () => {
    clearTimeout(timer);
    const val = q.value.trim();
    if (val.length < 2) { results.innerHTML = ""; return; }
    timer = setTimeout(async () => {
      lastQuery = val;
      results.innerHTML = '<div class="empty">Searching…</div>';
      try {
        const list = await searchProducts(val, 15);
        if (lastQuery !== val) return; // a newer query started
        if (list.length === 0) {
          results.innerHTML = '<div class="empty">No products found. Try a simpler name.</div>';
          return;
        }
        results.innerHTML = list.map(p => {
          const label = (p.brand ? p.brand + " — " : "") + p.name;
          return '<div class="food-pick" data-id="' + p.id + '">'
            + '<span>' + esc(label) + '</span>'
            + '<span class="macros">' + p.kcalPer100 + ' kcal · ' + p.proteinPer100 + ' g / 100g</span>'
            + '</div>';
        }).join("");
        results.querySelectorAll(".food-pick").forEach(div => {
          div.onclick = () => {
            const prod = list.find(x => x.id === div.dataset.id);
            if (prod) handleProductPicked(prod, rerender);
          };
        });
      } catch (e) {
        if (lastQuery !== val) return;
        results.innerHTML = '<div class="empty">Search failed. Check your connection.</div>';
      }
    }, 350);
  });
}
