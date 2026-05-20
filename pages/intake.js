import { MEAL_DAYS, MEAL_DAY_ORDER, LOW_APP_FOODS } from "../data/meals.js";
import { TARGET_KCAL, TARGET_PROTEIN } from "../data/config.js";
import {
  STATE, esc, el, dateKey,
  todaysIntake, dayTotals, addIntake, rememberFood,
  persist
} from "../core/state.js";
import { openModal, closeModal } from "../components/modal.js";
import { lookupBarcode, searchProducts } from "../core/foodApi.js";
import { startScanner } from "../components/scanner.js";

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
      STATE.intake[k].splice(i, 1);
      if (STATE.intake[k].length === 0) delete STATE.intake[k];
      persist("intake");
      rerender();
    };
  });
  log.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.edit);
      openPortionEditModal(i, rerender);
    };
  });
}

/* ===== Existing modals ===== */

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
    ? '<div class="empty">No custom foods yet. Add one below, or use Search / Scan.</div>'
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
      // If it has per-100g data, add as 100g portion so it's editable
      if (f.kcalPer100 != null) {
        addIntake(f.name, f.kcalPer100, f.proteinPer100, {
          grams: 100,
          kcalPer100: f.kcalPer100,
          proteinPer100: f.proteinPer100,
          barcode: f.barcode
        });
      } else {
        addIntake(f.name, f.kcal, f.protein);
      }
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

/* ===== NEW: Search Open Food Facts ===== */

function openSearchModal(rerender) {
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

/* ===== NEW: Scan barcode ===== */

function openScanModal(rerender) {
  openModal('<h3>Scan barcode</h3>'
    + '<div style="position:relative;background:#000;border-radius:10px;overflow:hidden;aspect-ratio:4/3;">'
      + '<video id="scan-video" style="width:100%;height:100%;object-fit:cover;display:block;"></video>'
      + '<div id="scan-overlay" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">'
        + '<div style="width:70%;height:35%;border:2px solid rgba(255,255,255,0.6);border-radius:8px;"></div>'
      + '</div>'
    + '</div>'
    + '<div id="scan-status" style="margin-top:10px;font-size:12.5px;color:#78716c;text-align:center;">Starting camera…</div>'
    + '<div class="modal-actions"><button class="btn btn-ghost" id="m-cancel">Cancel</button></div>');

  const video = document.getElementById("scan-video");
  const status = document.getElementById("scan-status");
  let stopFn = () => {};

  document.getElementById("m-cancel").onclick = () => {
    stopFn();
    closeModal();
  };

  (async () => {
    try {
      stopFn = await startScanner(video, async (code, err) => {
        if (err) {
          status.textContent = "Camera failed: " + (err.message || err);
          return;
        }
        if (!code) return;
        status.textContent = "Found " + code + " — looking up…";
        try {
          const prod = await lookupBarcode(code);
          stopFn();
          if (!prod) {
            // Show "not found, enter manually" fallback
            openModal('<h3>Not found</h3>'
              + '<p style="font-size:13px;color:#57534e;margin-bottom:8px;">Barcode <code>' + esc(code) + '</code> wasn\'t in the Open Food Facts database, or it has no macro data.</p>'
              + '<p style="font-size:13px;color:#57534e;">You can add it manually using Quick entry or My foods.</p>'
              + '<div class="modal-actions"><button class="btn" id="m-ok">OK</button></div>');
            document.getElementById("m-ok").onclick = closeModal;
            return;
          }
          handleProductPicked(prod, rerender);
        } catch (e) {
          status.textContent = "Lookup failed: " + e.message;
        }
      });
      if (status.textContent === "Starting camera…") status.textContent = "Point the camera at a barcode.";
    } catch (e) {
      status.textContent = "Can't access camera. Camera works only on HTTPS.";
    }
  })();
}

/* Common: a product was picked (from search OR scan).
   Default to 100g, save to My foods, add to today, then offer portion edit. */
function handleProductPicked(prod, rerender) {
  const label = (prod.brand ? prod.brand + " — " : "") + prod.name;
  // Auto-save to My foods (if not already there)
  rememberFood({
    name: label,
    kcal: prod.kcalPer100,
    protein: prod.proteinPer100,
    kcalPer100: prod.kcalPer100,
    proteinPer100: prod.proteinPer100,
    barcode: prod.barcode
  });
  // Add as 100g portion
  addIntake(label, prod.kcalPer100, prod.proteinPer100, {
    grams: 100,
    kcalPer100: prod.kcalPer100,
    proteinPer100: prod.proteinPer100,
    barcode: prod.barcode
  });
  // Open the portion edit dialog right away
  closeModal();
  rerender();
  // Open portion edit on the just-added item
  const k = dateKey();
  const lastIdx = STATE.intake[k].length - 1;
  openPortionEditModal(lastIdx, rerender);
}

/* ===== Portion editing ===== */

function openPortionEditModal(idx, rerender) {
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
    const k = Math.round(item.kcalPer100 * g / 100);
    const p = Math.round(item.proteinPer100 * g / 100 * 10) / 10;
    preview.innerHTML = '<b>' + k + '</b> kcal · <b>' + p + '</b> g protein';
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
