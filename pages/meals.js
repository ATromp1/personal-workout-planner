import { MEAL_DAYS, MEAL_DAY_ORDER, LOW_APP_FOODS } from "../data/meals.js";
import { STATE, esc, el } from "../core/state.js";

export function renderMeals(root, rerender) {
  root.appendChild(el(
    '<div class="targets">'
    + '<div class="target-pill"><div class="target-label">Calories</div><div class="target-value">3000</div></div>'
    + '<div class="target-pill"><div class="target-label">Protein</div><div class="target-value">140 g</div></div>'
    + '<div class="target-pill"><div class="target-label">Meals</div><div class="target-value">5</div></div>'
    + '</div>'
  ));

  const seg = document.createElement("div");
  seg.className = "seg";
  MEAL_DAY_ORDER.forEach(k => {
    const b = document.createElement("button");
    b.className = "seg-btn" + (STATE.meals.activeDay === k ? " active" : "");
    b.textContent = MEAL_DAYS[k].name;
    if (STATE.meals.activeDay === k) { b.style.background = "#1c1917"; b.style.borderColor = "#1c1917"; }
    b.onclick = () => { STATE.meals.activeDay = k; rerender(); };
    seg.appendChild(b);
  });
  const lb = document.createElement("button");
  lb.className = "seg-btn" + (STATE.meals.activeDay === "low" ? " active" : "");
  lb.textContent = "Low appetite";
  if (STATE.meals.activeDay === "low") { lb.style.background = "#1c1917"; lb.style.borderColor = "#1c1917"; }
  lb.onclick = () => { STATE.meals.activeDay = "low"; rerender(); };
  seg.appendChild(lb);
  root.appendChild(seg);

  if (STATE.meals.activeDay === "low") {
    root.appendChild(el('<div class="info-yellow"><strong>Low-appetite backup</strong><br>Days when food feels like a wall. Replace any 600–800 kcal meal with this — same protein, half the volume.</div>'));
    LOW_APP_FOODS.forEach(opt => {
      root.appendChild(el(
        '<div class="card">'
        + '<div class="card-head"><span class="card-title">' + esc(opt.name) + '</span></div>'
        + '<div class="macro-row"><span><b>' + opt.kcal + '</b> kcal</span><span><b>' + opt.protein + ' g</b> protein</span></div>'
        + '<div class="meal-notes">' + esc(opt.desc) + '</div>'
        + '</div>'
      ));
    });
    return;
  }

  const day = MEAL_DAYS[STATE.meals.activeDay];
  root.appendChild(el('<div style="padding: 0 16px 4px; font-size: 13px; color: #78716c;">' + esc(day.subtitle) + '</div>'));
  let totalK = 0, totalP = 0;
  day.meals.forEach(m => {
    totalK += m.kcal; totalP += m.protein;
    const items = m.items.map(it => '<li><span>' + esc(it[0]) + '</span><span class="qty">' + esc(it[1]) + '</span></li>').join("");
    root.appendChild(el(
      '<div class="card">'
      + '<div class="card-head"><span class="card-title">' + esc(m.title) + '</span><span class="card-sub">' + esc(m.time) + '</span></div>'
      + '<div class="macro-row"><span><b>' + m.kcal + '</b> kcal</span><span><b>' + m.protein + ' g</b> protein</span></div>'
      + '<ul class="ingredients">' + items + '</ul>'
      + '<div class="meal-notes">' + esc(m.notes) + '</div>'
      + '</div>'
    ));
  });
  root.appendChild(el(
    '<div class="totals"><span class="totals-label">Day total</span>'
    + '<span class="totals-value">' + totalK + ' kcal · ' + totalP + ' g protein</span></div>'
  ));
}
