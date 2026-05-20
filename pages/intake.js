import { TARGET_KCAL, TARGET_PROTEIN } from "../data/config.js";
import {
  STATE, esc, el, dateKey,
  todaysIntake, dayTotals,
  persist
} from "../core/state.js";
import { openTemplateModal } from "./intake/templateModal.js";
import { openQuickEntryModal } from "./intake/quickEntryModal.js";
import { openCustomFoodModal } from "./intake/customFoodModal.js";
import { openSearchModal } from "./intake/searchModal.js";
import { openScanModal } from "./intake/scanModal.js";
import { openPortionEditModal } from "./intake/portionEditModal.js";
import { showUndoToast } from "../components/toast.js";

export function renderIntake(root, rerender) {
  const items = todaysIntake();
  const tot = dayTotals(items);
  const kPct = Math.min(100, Math.round(tot.kcal / TARGET_KCAL * 100));
  const pPct = Math.min(100, Math.round(tot.protein / TARGET_PROTEIN * 100));
  const kOver = tot.kcal > TARGET_KCAL * 1.1;
  const pOver = tot.protein > TARGET_PROTEIN * 1.2;

  // Remaining-vs-target string. Round protein to 1 decimal; kcal whole.
  const kRemain = TARGET_KCAL - tot.kcal;
  const pRemain = Math.round((TARGET_PROTEIN - tot.protein) * 10) / 10;
  const kRemainStr = kRemain > 0 ? kRemain + " kcal to go"
                  : kRemain < 0 ? Math.abs(kRemain) + " kcal over"
                  : "Target hit";
  const pRemainStr = pRemain > 0 ? pRemain + " g to go"
                  : pRemain < 0 ? Math.abs(pRemain) + " g over"
                  : "Target hit";
  const kRemainCls = kRemain < 0 ? " over" : "";
  const pRemainCls = pRemain < 0 ? " over" : "";

  const summary = document.createElement("div");
  summary.className = "card";
  summary.innerHTML =
    '<div class="card-head"><span class="card-title">Today</span><span class="card-sub">' + dateKey() + '</span></div>'
    + '<div class="progress-wrap">'
      + '<div class="progress-label"><span>Calories</span><span><b>' + tot.kcal + '</b> / ' + TARGET_KCAL + ' kcal</span></div>'
      + '<div class="progress-bar"><div class="progress-fill ' + (kOver ? "over" : "") + '" style="width:' + kPct + '%"></div></div>'
      + '<div class="remaining' + kRemainCls + '">' + kRemainStr + '</div>'
    + '</div>'
    + '<div class="progress-wrap" style="padding-top:0">'
      + '<div class="progress-label"><span>Protein</span><span><b>' + tot.protein + '</b> / ' + TARGET_PROTEIN + ' g</span></div>'
      + '<div class="progress-bar"><div class="progress-fill ' + (pOver ? "over" : "") + '" style="width:' + pPct + '%"></div></div>'
      + '<div class="remaining' + pRemainCls + '">' + pRemainStr + '</div>'
    + '</div>';
  root.appendChild(summary);

  const addCard = document.createElement("div");
  addCard.className = "card";
  addCard.style.paddingBottom = "8px";
  addCard.innerHTML =
    '<div class="card-head"><span class="card-title">Add a meal</span></div>'
    + '<div class="add-row" style="flex-wrap:wrap; gap:6px;">'
      + '<button class="btn btn-sm" id="add-template">From plan</button>'
      + '<button class="btn btn-sm btn-ghost" id="add-search">🔍 Search</button>'
      + '<button class="btn btn-sm btn-ghost" id="add-scan">📷 Scan</button>'
      + '<button class="btn btn-sm btn-ghost" id="add-custom">My foods</button>'
      + '<button class="btn btn-sm btn-ghost" id="add-quick">Quick</button>'
    + '</div>';
  root.appendChild(addCard);

  document.getElementById("add-template").onclick = () => openTemplateModal(rerender);
  document.getElementById("add-search").onclick = () => openSearchModal(rerender);
  document.getElementById("add-scan").onclick = () => openScanModal(rerender);
  document.getElementById("add-custom").onclick = () => openCustomFoodModal(rerender);
  document.getElementById("add-quick").onclick = () => openQuickEntryModal(rerender);

  const log = document.createElement("div");
  log.className = "card";
  log.innerHTML = '<div class="card-head"><span class="card-title">Logged today</span></div>';
  if (items.length === 0) {
    log.appendChild(el('<div class="empty">Nothing logged yet today.</div>'));
  } else {
    items.forEach((it, i) => {
      const portionStr = it.grams ? ' · ' + it.grams + ' g' : '';
      log.appendChild(el(
        '<div class="log-item">'
        + '<div>' + esc(it.name) + '<div class="macros">' + it.kcal + ' kcal · ' + it.protein + ' g protein' + portionStr + '</div></div>'
        + '<div class="right">'
        + (it.kcalPer100 != null ? '<button class="x-btn" data-edit="' + i + '" title="Edit portion">✎</button>' : '')
        + '<button class="x-btn" data-i="' + i + '">×</button>'
        + '</div>'
        + '</div>'
      ));
    });
  }
  root.appendChild(log);

  log.querySelectorAll("[data-i]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.i);
      const k = dateKey();
      const removed = STATE.intake[k][i];
      STATE.intake[k].splice(i, 1);
      if (STATE.intake[k].length === 0) delete STATE.intake[k];
      persist("intake");
      rerender();
      showUndoToast("Removed " + removed.name, () => {
        if (!STATE.intake[k]) STATE.intake[k] = [];
        STATE.intake[k].splice(i, 0, removed);
        persist("intake");
        rerender();
      });
    };
  });
  log.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.edit);
      openPortionEditModal(i, rerender);
    };
  });
}
