import { TARGET_KCAL, TARGET_PROTEIN, GOAL_WEIGHT } from "../data/config.js";
import {
  STATE, esc, el, dateKey, isoToDate, avg,
  dayTotals, persist
} from "../core/state.js";
import { openModal, closeModal } from "../components/modal.js";

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
      STATE.weights = STATE.weights.filter(w => w.date !== b.dataset.wDel);
      persist("weights"); rerender();
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
