import { STATE, esc, dateKey, addIntake, rememberFood, persist } from "../../core/state.js";
import { openModal, closeModal } from "../../components/modal.js";

/* Portion editor for items with per-100g data. Used by:
   - the ✎ button on logged items
   - handleProductPicked (scan/search auto-add)
   - My foods picker (when picking a per-100g food) */
export function openPortionEditModal(idx, rerender) {
  const k = dateKey();
  const item = STATE.intake[k][idx];
  if (!item || item.kcalPer100 == null) return;

  openModal('<h3>' + esc(item.name) + '</h3>'
    + '<p style="font-size:12.5px;color:#78716c;margin-bottom:6px;">' + item.kcalPer100 + ' kcal · ' + item.proteinPer100 + ' g protein per 100g</p>'
    + '<label>Portion (grams)</label>'
    + '<input class="inp" id="p-grams" inputmode="numeric" value="' + (item.grams || 100) + '">'
    + '<div id="p-preview" style="margin-top:10px;font-size:13px;color:#57534e;"></div>'
    + '<div class="modal-actions">'
      + '<button class="btn btn-ghost" id="m-cancel">Cancel</button>'
      + '<button class="btn" id="m-save">Update</button></div>');

  const grams = document.getElementById("p-grams");
  const preview = document.getElementById("p-preview");
  const updatePreview = () => {
    const g = Number(grams.value) || 0;
    const kc = Math.round(item.kcalPer100 * g / 100);
    const pr = Math.round(item.proteinPer100 * g / 100 * 10) / 10;
    preview.innerHTML = '<b>' + kc + '</b> kcal · <b>' + pr + '</b> g protein';
  };
  updatePreview();
  grams.addEventListener("input", updatePreview);

  document.getElementById("m-cancel").onclick = closeModal;
  document.getElementById("m-save").onclick = () => {
    const g = Number(grams.value);
    if (!g || g <= 0) { alert("Enter a portion in grams."); return; }
    item.grams = g;
    item.kcal = Math.round(item.kcalPer100 * g / 100);
    item.protein = Math.round(item.proteinPer100 * g / 100 * 10) / 10;
    persist("intake");
    closeModal();
    rerender();
  };
}

/* Shared by scan + search: a product was picked. Default to 100g, save
   to My foods, add to today's intake, then open the portion editor. */
export function handleProductPicked(prod, rerender) {
  const label = (prod.brand ? prod.brand + " — " : "") + prod.name;
  rememberFood({
    name: label,
    kcal: prod.kcalPer100,
    protein: prod.proteinPer100,
    kcalPer100: prod.kcalPer100,
    proteinPer100: prod.proteinPer100,
    barcode: prod.barcode
  });
  addIntake(label, prod.kcalPer100, prod.proteinPer100, {
    grams: 100,
    kcalPer100: prod.kcalPer100,
    proteinPer100: prod.proteinPer100,
    barcode: prod.barcode
  });
  closeModal();
  rerender();
  const k = dateKey();
  openPortionEditModal(STATE.intake[k].length - 1, rerender);
}
