import { TARGET_KCAL, TARGET_PROTEIN, GOAL_WEIGHT } from "../data/config.js";
import {
  STATE, esc, el, dateKey, isoToDate, avg,
  dayTotals, persist
} from "../core/state.js";
import { findExercise } from "../data/program.js";
import { openModal, closeModal } from "../components/modal.js";
import { showUndoToast } from "../components/toast.js";

/* Build the export payload from the four persisted slices of STATE. */
function buildBackup() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    workoutLog: STATE.workoutLog,
    intake: STATE.intake,
    weights: STATE.weights,
    customFoods: STATE.customFoods
  };
}

/* True if the parsed object looks like a backup we made. We only check
   the four top-level keys exist with the right types — fine for catching
   "you imported the wrong file" without rejecting future schema bumps. */
function looksLikeBackup(b) {
  return b && typeof b === "object"
    && b.workoutLog && typeof b.workoutLog === "object"
    && b.intake && typeof b.intake === "object"
    && Array.isArray(b.weights)
    && Array.isArray(b.customFoods);
}

function applyBackup(b) {
  STATE.workoutLog = b.workoutLog;
  STATE.intake = b.intake;
  STATE.weights = b.weights;
  STATE.customFoods = b.customFoods;
  persist("workoutLog");
  persist("intake");
  persist("weights");
  persist("customFoods");
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function renderStats(root, rerender) {
  const weightCard = document.createElement("div");
  weightCard.className = "card";
  weightCard.style.paddingBottom = "8px";
  weightCard.innerHTML = '<div class="card-head"><span class="card-title">Weight</span>'
    + '<button class="btn btn-sm" id="add-weight">+ Log</button></div>';

  if (STATE.weights.length === 0) {
    weightCard.appendChild(el('<div class="empty">No weights logged yet. Tap "+ Log" to start.</div>'));
  } else {
    const latest = STATE.weights[STATE.weights.length - 1];
    const first = STATE.weights[0];
    const diff = (latest.kg - first.kg).toFixed(1);
    const diffStr = diff >= 0 ? "+" + diff : diff;

    const w = 420, h = 140, pad = 24;
    const xs = STATE.weights.map(w => isoToDate(w.date).getTime());
    const ys = STATE.weights.map(w => w.kg);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    let minY = Math.min(...ys, GOAL_WEIGHT) - 1;
    let maxY = Math.max(...ys, GOAL_WEIGHT) + 1;
    if (maxY - minY < 4) { const c = (maxY+minY)/2; minY = c - 2; maxY = c + 2; }
    const sx = x => minX === maxX ? w/2 : pad + (x-minX)/(maxX-minX) * (w-2*pad);
    const sy = y => h - pad - (y-minY)/(maxY-minY) * (h-2*pad);

    let pts = "", dotsSvg = "";
    STATE.weights.forEach(w0 => {
      const x = sx(isoToDate(w0.date).getTime());
      const y = sy(w0.kg);
      pts += (pts ? " L " : "M ") + x.toFixed(1) + " " + y.toFixed(1);
      dotsSvg += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3.5" fill="#1c1917"/>';
    });
    const goalY = sy(GOAL_WEIGHT);
    weightCard.appendChild(el(
      '<div class="chart-wrap"><svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">'
      + '<line x1="' + pad + '" y1="' + goalY + '" x2="' + (w-pad) + '" y2="' + goalY + '" stroke="#16a34a" stroke-width="1" stroke-dasharray="4 4"/>'
      + '<text x="' + (w-pad) + '" y="' + (goalY-5) + '" text-anchor="end" font-size="10" fill="#16a34a">Goal ' + GOAL_WEIGHT + ' kg</text>'
      + '<path d="' + pts + '" fill="none" stroke="#1c1917" stroke-width="2"/>'
      + dotsSvg + '</svg></div>'
    ));
    weightCard.appendChild(el(
      '<div class="stat-row"><span>Current</span><b>' + latest.kg + ' kg</b></div>'
      + '<div class="stat-row"><span>Change since first entry</span><b>' + diffStr + ' kg</b></div>'
      + '<div class="stat-row"><span>To goal (' + GOAL_WEIGHT + ' kg)</span><b>' + (GOAL_WEIGHT - latest.kg).toFixed(1) + ' kg</b></div>'
    ));

    const recent = STATE.weights.slice(-5).reverse();
    let recentHTML = '<div style="font-size:11px;font-weight:600;color:#a8a29e;padding:10px 16px 4px;text-transform:uppercase;letter-spacing:0.5px;">Recent</div>';
    recent.forEach(w0 => {
      recentHTML += '<div class="log-item"><div>' + w0.date + '</div>'
        + '<div class="right"><span>' + w0.kg + ' kg</span>'
        + '<button class="x-btn" data-w-del="' + w0.date + '">×</button></div></div>';
    });
    weightCard.appendChild(el(recentHTML));
  }
  root.appendChild(weightCard);

  document.getElementById("add-weight").onclick = () => openWeightModal(rerender);
  root.querySelectorAll("[data-w-del]").forEach(b => {
    b.onclick = () => {
      const date = b.dataset.wDel;
      const removed = STATE.weights.find(w => w.date === date);
      if (!removed) return;
      STATE.weights = STATE.weights.filter(w => w.date !== date);
      persist("weights"); rerender();
      showUndoToast("Removed " + date + " (" + removed.kg + " kg)", () => {
        STATE.weights.push(removed);
        STATE.weights.sort((a,b) => a.date.localeCompare(b.date));
        persist("weights"); rerender();
      });
    };
  });

  root.appendChild(renderFeedback());

  // Last 7 days intake
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dateKey(d);
    last7.push({ date: k, ...dayTotals(STATE.intake[k] || []) });
  }
  const daysLogged = last7.filter(d => d.kcal > 0);
  const avgK = daysLogged.length ? Math.round(avg(daysLogged.map(d => d.kcal))) : 0;
  const avgP = daysLogged.length ? Math.round(avg(daysLogged.map(d => d.protein))) : 0;

  const intakeCard = document.createElement("div");
  intakeCard.className = "card";
  intakeCard.innerHTML = '<div class="card-head"><span class="card-title">Intake — last 7 days</span><span class="card-sub">' + daysLogged.length + '/7 days logged</span></div>';
  if (daysLogged.length === 0) {
    intakeCard.appendChild(el('<div class="empty">Log meals in the Today tab to see averages here.</div>'));
  } else {
    intakeCard.appendChild(el(
      '<div class="stat-row"><span>Average calories</span><b>' + avgK + ' / ' + TARGET_KCAL + ' kcal</b></div>'
      + '<div class="stat-row"><span>Average protein</span><b>' + avgP + ' / ' + TARGET_PROTEIN + ' g</b></div>'
    ));
  }
  root.appendChild(intakeCard);

  const strengthCard = renderStrengthCard();
  if (strengthCard) root.appendChild(strengthCard);

  root.appendChild(renderBackupCard(rerender));
}

/* Walk workoutLog and collect, per exercise, a chronological series of
   logged weights (one point per week — the value the user typed for that
   exercise that week). Exercises that were never loaded or were 0kg only
   are skipped. Returns Map<exId, { name, dayKey, points: [{wk, weight}] }>. */
function buildStrengthSeries() {
  const series = new Map();
  const weeks = Object.keys(STATE.workoutLog).sort();
  for (const wk of weeks) {
    const days = STATE.workoutLog[wk] || {};
    for (const dayKey of Object.keys(days)) {
      const exs = days[dayKey] || {};
      for (const exId of Object.keys(exs)) {
        const entry = exs[exId];
        const w = Number(entry && entry.weight);
        if (!isFinite(w) || w <= 0) continue;
        if (!series.has(exId)) {
          const def = findExercise(dayKey, exId);
          series.set(exId, { name: def ? def.name : exId, dayKey, points: [] });
        }
        series.get(exId).points.push({ wk, weight: w });
      }
    }
  }
  return series;
}

function renderStrengthCard() {
  const series = buildStrengthSeries();
  const items = [...series.values()].filter(s => s.points.length >= 2);
  if (items.length === 0) return null;

  // Most recently active exercises first — sort by latest week descending.
  items.sort((a, b) => b.points[b.points.length - 1].wk.localeCompare(a.points[a.points.length - 1].wk));

  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = '<div class="card-head"><span class="card-title">Strength progress</span><span class="card-sub">' + items.length + ' tracked</span></div>';

  const sparkW = 80, sparkH = 22;
  items.forEach(s => {
    const last = s.points[s.points.length - 1];
    const first = s.points[0];
    const delta = Math.round((last.weight - first.weight) * 10) / 10;
    const deltaStr = delta > 0 ? "+" + delta : "" + delta;
    const deltaCls = delta > 0 ? " up" : delta < 0 ? " down" : "";

    const ys = s.points.map(p => p.weight);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = maxY - minY || 1;
    const sx = i => s.points.length === 1 ? sparkW / 2 : (i / (s.points.length - 1)) * sparkW;
    const sy = y => sparkH - 2 - ((y - minY) / span) * (sparkH - 4);
    let path = "";
    s.points.forEach((p, i) => {
      path += (i === 0 ? "M " : " L ") + sx(i).toFixed(1) + " " + sy(p.weight).toFixed(1);
    });

    card.appendChild(el(
      '<div class="strength-row">'
      + '<span class="strength-name">' + esc(s.name) + '</span>'
      + '<svg class="strength-spark" viewBox="0 0 ' + sparkW + ' ' + sparkH + '" preserveAspectRatio="none">'
        + '<path d="' + path + '" fill="none" stroke="#1c1917" stroke-width="1.5"/>'
      + '</svg>'
      + '<span class="strength-now"><b>' + last.weight + '</b> kg'
        + (delta !== 0 ? ' <span class="strength-delta' + deltaCls + '">' + deltaStr + '</span>' : '')
      + '</span>'
      + '</div>'
    ));
  });

  return card;
}

function renderBackupCard(rerender) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = '<div class="card-head"><span class="card-title">Data</span></div>'
    + '<div style="padding:0 16px 14px;font-size:12.5px;color:#78716c;">'
      + 'Everything is stored only on this device. Back up before clearing browser data or switching phones.'
    + '</div>'
    + '<div style="display:flex;gap:8px;padding:0 16px 16px;">'
      + '<button class="btn btn-sm" id="data-export">Export backup</button>'
      + '<button class="btn btn-sm btn-ghost" id="data-import">Import backup</button>'
      + '<input type="file" id="data-import-file" accept="application/json,.json" style="display:none;">'
    + '</div>';

  card.querySelector("#data-export").onclick = () => {
    downloadJSON(buildBackup(), "lift-and-eat-backup-" + dateKey() + ".json");
  };

  const fileInput = card.querySelector("#data-import-file");
  card.querySelector("#data-import").onclick = () => fileInput.click();
  fileInput.onchange = () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      let parsed;
      try { parsed = JSON.parse(reader.result); }
      catch (e) { alert("That file isn't valid JSON."); return; }
      if (!looksLikeBackup(parsed)) {
        alert("That file doesn't look like a Lift & Eat backup. (Missing workoutLog/intake/weights/customFoods.)");
        return;
      }
      const dateLabel = parsed.exportedAt ? new Date(parsed.exportedAt).toLocaleString() : "unknown date";
      const ok = confirm("Replace all local data with the backup from " + dateLabel + "?\n\nThis cannot be undone (export your current data first if you want to keep it).");
      if (!ok) { fileInput.value = ""; return; }
      applyBackup(parsed);
      fileInput.value = "";
      rerender();
    };
    reader.readAsText(file);
  };
  return card;
}

function renderFeedback() {
  if (STATE.weights.length < 2) {
    return el('<div class="info-yellow"><strong>Need more data.</strong> Log your weight weekly for 2–3 weeks to see whether you\'re actually gaining.</div>');
  }
  const sorted = [...STATE.weights].sort((a,b) => a.date.localeCompare(b.date));
  const first = sorted[0], last = sorted[sorted.length - 1];
  const days = (isoToDate(last.date) - isoToDate(first.date)) / 86400000;
  if (days < 10) {
    return el('<div class="info-yellow"><strong>Need more time.</strong> A clear weight trend needs at least 10 days — yours covers ' + Math.round(days) + ' days.</div>');
  }
  const totalGain = last.kg - first.kg;
  const perWeek = (totalGain / days) * 7;
  if (perWeek >= 0.25 && perWeek <= 0.6) {
    return el('<div class="info-green"><strong>On track.</strong> Gaining ' + perWeek.toFixed(2) + ' kg/week over ' + Math.round(days) + ' days. Keep doing what you\'re doing.</div>');
  }
  if (perWeek > 0.6) {
    return el('<div class="info-yellow"><strong>Gaining fast.</strong> ' + perWeek.toFixed(2) + ' kg/week is above the ideal 0.25–0.5 — likely more fat than necessary. Drop ~200 kcal/day.</div>');
  }
  if (perWeek < 0.1 && perWeek > -0.1) {
    return el('<div class="info-red"><strong>Weight is flat.</strong> Over ' + Math.round(days) + ' days you\'ve changed by ' + totalGain.toFixed(1) + ' kg. You\'re likely undereating — add ~200 kcal/day.</div>');
  }
  if (perWeek < 0) {
    return el('<div class="info-red"><strong>Losing weight.</strong> Down ' + Math.abs(totalGain).toFixed(1) + ' kg over ' + Math.round(days) + ' days. You\'re in a deficit — add ~300 kcal/day.</div>');
  }
  return el('<div class="info-yellow"><strong>Slow progress.</strong> Gaining only ' + perWeek.toFixed(2) + ' kg/week. Add ~200 kcal/day for 2 weeks and reassess.</div>');
}

function openWeightModal(rerender) {
  openModal('<h3>Log weight</h3>'
    + '<label>Date</label><input class="inp" id="w-date" type="date" value="' + dateKey() + '">'
    + '<label>Weight (kg)</label><input class="inp" id="w-kg" inputmode="decimal" placeholder="e.g. 70.5">'
    + '<div class="modal-actions">'
      + '<button class="btn btn-ghost" id="m-cancel">Cancel</button>'
      + '<button class="btn" id="m-save">Save</button></div>');
  document.getElementById("m-cancel").onclick = closeModal;
  document.getElementById("m-save").onclick = () => {
    const date = document.getElementById("w-date").value;
    const kg = parseFloat(document.getElementById("w-kg").value);
    if (!date || isNaN(kg) || kg < 30 || kg > 250) { alert("Enter a valid weight."); return; }
    STATE.weights = STATE.weights.filter(w => w.date !== date);
    STATE.weights.push({ date, kg });
    STATE.weights.sort((a,b) => a.date.localeCompare(b.date));
    persist("weights");
    closeModal(); rerender();
  };
}
