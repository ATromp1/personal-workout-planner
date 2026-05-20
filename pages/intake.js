import { MEAL_DAYS, MEAL_DAY_ORDER, LOW_APP_FOODS } from "../data/meals.js";
import { TARGET_KCAL, TARGET_PROTEIN } from "../data/config.js";
import {
  STATE, esc, el, dateKey,
  todaysIntake, dayTotals, addIntake,
  persist
} from "../core/state.js";
import { openModal, closeModal } from "../components/modal.js";

export function renderIntake(root, rerender) {
  const items = todaysIntake();
  const tot = dayTotals(items);
  const kPct = Math.min(100, Math.round(tot.kcal / TARGET_KCAL * 100));
  const pPct = Math.min(100, Math.round(tot.protein / TARGET_PROTEIN * 100));
  const kOver = tot.kcal > TARGET_KCAL * 1.1;
  const pOver = tot.protein > TARGET_PROTEIN * 1.2;

  const summary = document.createElement("div");
  summary.className = "card";
  summary.innerHTML =
    '<div class="card-head"><span class="card-title">Today</span><span class="card-sub">' + dateKey() + '</span></div>'
    + '<div class="progress-wrap">'
      + '<div class="progress-label"><span>Calories</span><span><b>' + tot.kcal + '</b> / ' + TARGET_KCAL + ' kcal</span></div>'
      + '<div class="progress-bar"><div class="progress-fill ' + (kOver ? "over" : "") + '" style="width:' + kPct + '%"></div></div>'
    + '</div>'
    + '<div class="progress-wrap" style="padding-top:0">'
      + '<div class="progress-label"><span>Protein</span><span><b>' + tot.protein + '</b> / ' + TARGET_PROTEIN + ' g</span></div>'
      + '<div class="progress-bar"><div class="progress-fill ' + (pOver ? "over" : "") + '" style="width:' + pPct + '%"></div></div>'
    + '</div>';
  root.appendChild(summary);

  const addCard = document.createElement("div");
  addCard.className = "card";
  addCard.style.paddingBottom = "8px";
  addCard.innerHTML =
    '<div class="card-head"><span class="card-title">Add a meal</span></div>'
    + '<div class="add-row" style="flex-wrap:wrap; gap:6px;">'
      + '<button class="btn btn-sm" id="add-template">From plan</button>'
      + '<button class="btn btn-sm btn-ghost" id="add-custom">My foods</button>'
      + '<button class="btn btn-sm btn-ghost" id="add-quick">Quick entry</button>'
    + '</div>';
  root.appendChild(addCard);

  document.getElementById("add-template").onclick = () => openTemplateModal(rerender);
  document.getElementById("add-custom").onclick = () => openCustomFoodModal(rerender);
  document.getElementById("add-quick").onclick = () => openQuickEntryModal(rerender);

  const log = document.createElement("div");
  log.className = "card";
  log.innerHTML = '<div class="card-head"><span class="card-title">Logged today</span></div>';
  if (items.length === 0) {
    log.appendChild(el('<div class="empty">Nothing logged yet today.</div>'));
  } else {
    items.forEach((it, i) => {
      log.appendChild(el(
        '<div class="log-item">'
        + '<div>' + esc(it.name) + '<div class="macros">' + it.kcal + ' kcal · ' + it.protein + ' g protein</div></div>'
        + '<button class="x-btn" data-i="' + i + '">×</button>'
        + '</div>'
      ));
    });
  }
  root.appendChild(log);

  log.querySelectorAll(".x-btn").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.i);
      const k = dateKey();
      STATE.intake[k].splice(i, 1);
      if (STATE.intake[k].length === 0) delete STATE.intake[k];
      persist("intake");
      rerender();
    };
  });
}

function openTemplateModal(rerender) {
  let rows = "";
  MEAL_DAY_ORDER.forEach(dk => {
    const d = MEAL_DAYS[dk];
    rows += '<div style="font-size:12px;font-weight:600;color:#a8a29e;padding:8px 0 0;text-transform:uppercase;letter-spacing:0.5px;">' + esc(d.name) + ' — ' + esc(d.subtitle) + '</div>';
    d.meals.forEach(m => {
      rows += '<div class="food-pick" data-name="' + esc(m.title + " (" + d.name + ")") + '" data-k="' + m.kcal + '" data-p="' + m.protein + '">'
        + '<span>' + esc(m.title) + '</span><span class="macros">' + m.kcal + ' kcal · ' + m.protein + ' g</span></div>';
    });
  });
  rows += '<div style="font-size:12px;font-weight:600;color:#a8a29e;padding:8px 0 0;text-transform:uppercase;letter-spacing:0.5px;">Low-appetite</div>';
  LOW_APP_FOODS.forEach(f => {
    rows += '<div class="food-pick" data-name="' + esc(f.name) + '" data-k="' + f.kcal + '" data-p="' + f.protein + '">'
      + '<span>' + esc(f.name) + '</span><span class="macros">' + f.kcal + ' kcal · ' + f.protein + ' g</span></div>';
  });

  openModal('<h3>Pick a meal from your plan</h3>' + rows
    + '<div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button></div>');
  document.getElementById("m-cancel").onclick = closeModal;
  document.querySelectorAll(".food-pick").forEach(p => {
    p.onclick = () => {
      addIntake(p.dataset.name, p.dataset.k, p.dataset.p);
      closeModal(); rerender();
    };
  });
}

function openCustomFoodModal(rerender) {
  let list = STATE.customFoods.length === 0
    ? '<div class="empty">No custom foods yet. Add one below.</div>'
    : STATE.customFoods.map((f,i) =>
        '<div class="food-pick" data-i="' + i + '">'
        + '<span>' + esc(f.name) + '</span>'
        + '<span class="macros">' + f.kcal + ' kcal · ' + f.protein + ' g '
        + '<button class="x-btn" data-del="' + i + '" style="margin-left:6px;">×</button></span></div>'
      ).join("");

  openModal('<h3>My foods</h3>' + list
    + '<label>Name</label><input class="inp" id="cf-name" placeholder="e.g. Power shake">'
    + '<label>Calories</label><input class="inp" id="cf-k" inputmode="numeric" placeholder="e.g. 850">'
    + '<label>Protein (g)</label><input class="inp" id="cf-p" inputmode="numeric" placeholder="e.g. 45">'
    + '<div class="modal-actions">'
      + '<button class="btn btn-ghost" id="m-cancel">Close</button>'
      + '<button class="btn" id="m-save">Save food</button></div>');
  document.getElementById("m-cancel").onclick = closeModal;
  document.getElementById("m-save").onclick = () => {
    const name = document.getElementById("cf-name").value.trim();
    const k = Number(document.getElementById("cf-k").value);
    const p = Number(document.getElementById("cf-p").value);
    if (!name || isNaN(k) || isNaN(p)) { alert("Fill in name, kcal, and protein."); return; }
    STATE.customFoods.push({ id: "cf-" + Date.now(), name, kcal: k, protein: p });
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
      addIntake(f.name, f.kcal, f.protein);
      closeModal(); rerender();
    };
  });
}

function openQuickEntryModal(rerender) {
  openModal('<h3>Quick entry</h3>'
    + '<p style="font-size:12.5px;color:#78716c;margin-bottom:8px;">One-off — not saved to My Foods.</p>'
    + '<label>Name</label><input class="inp" id="q-name" placeholder="e.g. Pizza">'
    + '<label>Calories</label><input class="inp" id="q-k" inputmode="numeric">'
    + '<label>Protein (g)</label><input class="inp" id="q-p" inputmode="numeric">'
    + '<div class="modal-actions">'
      + '<button class="btn btn-ghost" id="m-cancel">Cancel</button>'
      + '<button class="btn" id="m-save">Add</button></div>');
  document.getElementById("m-cancel").onclick = closeModal;
  document.getElementById("m-save").onclick = () => {
    const name = document.getElementById("q-name").value.trim() || "Meal";
    const k = Number(document.getElementById("q-k").value) || 0;
    const p = Number(document.getElementById("q-p").value) || 0;
    addIntake(name, k, p);
    closeModal(); rerender();
  };
}
