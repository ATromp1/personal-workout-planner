import { PROGRAM, DAY_ORDER } from "../data/program.js";
import {
  STATE, WK, PREV_WK,
  esc, el,
  readEntry, ensureEntry,
  persist, persistDebounced,
  startTimer, stopTimer
} from "../core/state.js";

export function renderWorkout(root, rerender) {
  // Day selector
  const seg = document.createElement("div");
  seg.className = "seg";
  DAY_ORDER.forEach(k => {
    const b = document.createElement("button");
    b.className = "seg-btn" + (STATE.workout.activeDay === k ? " active" : "");
    b.textContent = PROGRAM[k].name;
    if (STATE.workout.activeDay === k) {
      b.style.background = PROGRAM[k].accent;
      b.style.borderColor = PROGRAM[k].accent;
    }
    b.onclick = () => {
      STATE.workout.activeDay = k;
      STATE.workout.activeExIdx = 0;
      stopTimer();
      rerender();
    };
    seg.appendChild(b);
  });
  root.appendChild(seg);

  const day = PROGRAM[STATE.workout.activeDay];

  if (day.rest) {
    root.appendChild(el('<div class="rest-day"><strong>Full rest — Saturday &amp; Sunday.</strong>'
      + '<div style="margin-top:6px">Muscle is built during recovery. Light activity is fine. Prioritise 7–9 hours of sleep.</div></div>'));
    return;
  }
  if (day.recovery) {
    let li = day.recovery.map(r => "<li>" + esc(r) + "</li>").join("");
    root.appendChild(el('<div class="banner"><strong>Active recovery day</strong><ul>' + li + '</ul></div>'));
    return;
  }

  // Progress dots
  const dots = document.createElement("div");
  dots.className = "progress-dots";
  day.exercises.forEach((ex, i) => {
    const e = readEntry(WK, STATE.workout.activeDay, ex.id, ex.sets);
    const allDone = e.done.length === ex.sets && e.done.every(Boolean);
    const dot = document.createElement("div");
    dot.className = "dot" + (allDone ? " done" : "") + (i === STATE.workout.activeExIdx && !allDone ? " current" : "");
    dot.onclick = () => { STATE.workout.activeExIdx = i; stopTimer(); rerender(); };
    dots.appendChild(dot);
  });
  root.appendChild(dots);

  // Nav row
  const idx = STATE.workout.activeExIdx;
  const ex = day.exercises[idx];
  const nav = document.createElement("div");
  nav.className = "ex-nav";
  nav.innerHTML =
    '<button class="arrow" id="prev-ex"' + (idx === 0 ? " disabled" : "") + '>←</button>'
    + '<div><span class="pos">Exercise ' + (idx + 1) + ' of ' + day.exercises.length + '</span>'
    + '<div style="font-size:11px;color:#a8a29e;text-align:center;">' + esc(day.focus) + '</div></div>'
    + '<button class="arrow" id="next-ex"' + (idx === day.exercises.length - 1 ? " disabled" : "") + '>→</button>';
  root.appendChild(nav);
  document.getElementById("prev-ex").onclick = () => {
    if (idx > 0) { STATE.workout.activeExIdx--; stopTimer(); rerender(); }
  };
  document.getElementById("next-ex").onclick = () => {
    if (idx < day.exercises.length - 1) { STATE.workout.activeExIdx++; stopTimer(); rerender(); }
  };

  // Exercise card. Read-only here: don't bloat workoutLog just because the
  // user is viewing an exercise. Writes go through ensureEntry below.
  const entry = readEntry(WK, STATE.workout.activeDay, ex.id, ex.sets);
  const prevEntry = readEntry(PREV_WK, STATE.workout.activeDay, ex.id, ex.sets);
  const isOpen = !!STATE.openHints[ex.id];

  const wtPlaceholder = prevEntry && prevEntry.weight ? prevEntry.weight : "—";
  const rpPlaceholder = prevEntry && prevEntry.reps ? prevEntry.reps : "—";

  const card = document.createElement("div");
  card.className = "ex-card";
  let html =
    '<div class="ex-name-row">'
      + '<span class="ex-name">' + esc(ex.name) + '</span>'
      + '<button class="info-btn' + (isOpen ? " open" : "") + '" id="info-toggle">i</button>'
    + '</div>'
    + '<div class="ex-target">Target: ' + esc(ex.target) + '</div>'
    + '<div class="how' + (isOpen ? " show" : "") + '" id="how-panel">' + esc(ex.how)
      + '<span class="muscle">Works: ' + esc(ex.muscle) + '</span></div>'
    + '<div class="inputs-row">'
      + '<div class="field"><label>Weight (kg)</label>'
        + '<input id="wt" inputmode="decimal" placeholder="' + esc(wtPlaceholder) + '" value="' + esc(entry.weight || "") + '"></div>'
      + '<div class="field"><label>Reps</label>'
        + '<input id="rp" inputmode="numeric" placeholder="' + esc(rpPlaceholder) + '" value="' + esc(entry.reps || "") + '"></div>'
    + '</div>';

  // Set buttons
  html += '<div class="sets-grid' + (ex.sets === 2 ? " two-col" : "") + '">';
  for (let i = 0; i < ex.sets; i++) {
    const done = entry.done && entry.done[i];
    html += '<button class="set-btn' + (done ? " done" : "") + '" data-set="' + i + '">'
      + '<span class="lbl">Set ' + (i+1) + '</span>'
      + '<span class="mark">' + (done ? "✓" : "○") + '</span>'
      + '</button>';
  }
  html += '</div>';

  // Bottom button
  const allDone = entry.done.every(Boolean);
  if (allDone && idx < day.exercises.length - 1) {
    html += '<button class="next-btn" id="adv">Next exercise →</button>';
  } else if (allDone && idx === day.exercises.length - 1) {
    html += '<button class="next-btn" id="adv">Workout complete 💪</button>';
  } else if (!allDone) {
    html += '<button class="next-btn muted" id="adv">Skip to next exercise</button>';
  }

  card.innerHTML = html;
  root.appendChild(card);

  // Wire it all up. Each handler ensures the entry exists before mutating
  // (so view-only navigation doesn't create empty entries) and uses the
  // debounced persist for keystroke inputs to avoid jank on slow phones.
  const dayKey = STATE.workout.activeDay;
  document.getElementById("wt").addEventListener("input", e => {
    ensureEntry(WK, dayKey, ex.id, ex.sets).weight = e.target.value;
    persistDebounced("workoutLog");
  });
  document.getElementById("rp").addEventListener("input", e => {
    ensureEntry(WK, dayKey, ex.id, ex.sets).reps = e.target.value;
    persistDebounced("workoutLog");
  });
  document.getElementById("info-toggle").onclick = () => {
    STATE.openHints[ex.id] = !STATE.openHints[ex.id];
    document.getElementById("how-panel").classList.toggle("show", STATE.openHints[ex.id]);
    document.getElementById("info-toggle").classList.toggle("open", STATE.openHints[ex.id]);
  };

  card.querySelectorAll(".set-btn").forEach(b => {
    b.onclick = () => {
      const live = ensureEntry(WK, dayKey, ex.id, ex.sets);
      const i = Number(b.dataset.set);
      const was = live.done[i];
      live.done[i] = !was;
      persist("workoutLog");
      const nowAllDone = live.done.every(Boolean);
      if (!was) {
        if (nowAllDone && idx < day.exercises.length - 1) {
          stopTimer();
          setTimeout(() => {
            STATE.workout.activeExIdx++;
            rerender();
          }, 450);
        } else {
          startTimer();
          rerender();
        }
      } else {
        rerender();
      }
    };
  });

  const adv = document.getElementById("adv");
  if (adv) {
    adv.onclick = () => {
      stopTimer();
      if (idx < day.exercises.length - 1) {
        STATE.workout.activeExIdx++;
      } else {
        STATE.workout.activeExIdx = 0;
      }
      rerender();
    };
  }
}
