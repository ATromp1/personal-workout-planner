import { STATE, esc, dateKey, addIntake, persist } from "../../core/state.js";
import { openModal, closeModal } from "../../components/modal.js";
import { openPortionEditModal } from "./portionEditModal.js";

export function openCustomFoodModal(rerender) {
  let list = STATE.customFoods.length === 0
    ? '<div class="empty">No custom foods yet. Add one below, or use Search / Scan.</div>'
    : STATE.customFoods.map((f,i) =>
        '<div class="food-pick" data-i="' + i + '">'
        + '<span>' + esc(f.name) + '</span>'
        + '<span class="macros">' + f.kcal + ' kcal · ' + f.protein + ' g '
        + '<button class="x-btn" data-del="' + i + '" style="margin-left:6px;">×</button></span></div>'
      ).join("");

  openModal('<h3>My foods</h3>' + list
    + '<label>Name</label><input class="inp" id="cf-name" placeholder="e.g. Power shake">'
    + '<div class="seg" style="margin:6px 0 10px;">'
      + '<button class="seg-btn active" id="cf-mode-fixed" type="button">Per portion</button>'
      + '<button class="seg-btn" id="cf-mode-100g" type="button">Per 100g</button>'
    + '</div>'
    + '<label><span id="cf-k-lbl">Calories</span></label><input class="inp" id="cf-k" inputmode="numeric" placeholder="e.g. 850">'
    + '<label><span id="cf-p-lbl">Protein (g)</span></label><input class="inp" id="cf-p" inputmode="numeric" placeholder="e.g. 45">'
    + '<p style="font-size:12px;color:#78716c;margin-top:6px;" id="cf-hint">Fixed macros — added as-is when picked.</p>'
    + '<div class="modal-actions">'
      + '<button class="btn btn-ghost" id="m-cancel">Close</button>'
      + '<button class="btn" id="m-save">Save food</button></div>');
  document.getElementById("m-cancel").onclick = closeModal;

  let per100 = false;
  const modeFixed = document.getElementById("cf-mode-fixed");
  const mode100g = document.getElementById("cf-mode-100g");
  const kLbl = document.getElementById("cf-k-lbl");
  const pLbl = document.getElementById("cf-p-lbl");
  const hint = document.getElementById("cf-hint");
  const setMode = (on) => {
    per100 = on;
    modeFixed.classList.toggle("active", !on);
    mode100g.classList.toggle("active", on);
    kLbl.textContent = on ? "Calories / 100g" : "Calories";
    pLbl.textContent = on ? "Protein / 100g (g)" : "Protein (g)";
    hint.textContent = on
      ? "Per-100g — picked as a 100g portion and editable to any gram amount."
      : "Fixed macros — added as-is when picked.";
  };
  modeFixed.onclick = () => setMode(false);
  mode100g.onclick = () => setMode(true);

  document.getElementById("m-save").onclick = () => {
    const name = document.getElementById("cf-name").value.trim();
    const k = Number(document.getElementById("cf-k").value);
    const p = Number(document.getElementById("cf-p").value);
    if (!name || isNaN(k) || isNaN(p)) { alert("Fill in name, kcal, and protein."); return; }
    const food = { id: "cf-" + Date.now(), name, kcal: k, protein: p };
    if (per100) { food.kcalPer100 = k; food.proteinPer100 = p; }
    STATE.customFoods.push(food);
    persist("customFoods");
    openCustomFoodModal(rerender);
  };

  document.querySelectorAll(".food-pick").forEach(p => {
    p.onclick = (e) => {
      if (e.target.dataset.del !== undefined) {
        STATE.customFoods.splice(Number(e.target.dataset.del), 1);
        persist("customFoods");
        openCustomFoodModal(rerender);
        return;
      }
      const f = STATE.customFoods[Number(p.dataset.i)];
      if (f.kcalPer100 != null) {
        addIntake(f.name, f.kcalPer100, f.proteinPer100, {
          grams: 100,
          kcalPer100: f.kcalPer100,
          proteinPer100: f.proteinPer100,
          barcode: f.barcode
        });
        closeModal(); rerender();
        const k = dateKey();
        openPortionEditModal(STATE.intake[k].length - 1, rerender);
      } else {
        addIntake(f.name, f.kcal, f.protein);
        closeModal(); rerender();
      }
    };
  });
}
