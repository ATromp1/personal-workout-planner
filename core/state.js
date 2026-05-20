import { findExercise } from "../data/program.js";
import { REST_SECONDS } from "../data/config.js";

export const STATE = {
  page: "workout",
  workout: { activeDay: todayKey(), activeExIdx: 0 },
  meals: { activeDay: "a" },
  openHints: {},
  workoutLog: {},
  intake: {},
  weights: [],
  customFoods: []
};

export function todayKey() {
  const map = { 1:"mon", 2:"tue", 3:"wed", 4:"thu", 5:"fri", 6:"sat", 0:"sat" };
  return map[new Date().getDay()];
}

/* ISO 8601 week id: "YYYY-wWW" where week 1 contains the year's first Thursday.
   Avoids the off-by-one issues near January 1 that the naive day-of-year math produced. */
export function weekId(d) {
  const target = d ? new Date(d.valueOf()) : new Date();
  target.setHours(0, 0, 0, 0);
  // Shift to Thursday of the current ISO week (Mon=0…Sun=6, +3 = Thu).
  const dayNr = (target.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const isoYear = target.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const jan4DayNr = (jan4.getDay() + 6) % 7;
  jan4.setDate(jan4.getDate() - jan4DayNr + 3);
  const week = 1 + Math.round((target - jan4) / (7 * 86400000));
  return isoYear + "-w" + String(week).padStart(2, "0");
}
export function prevWeekId() {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return weekId(d);
}
export function dateKey(d) {
  d = d || new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return y + "-" + m + "-" + dd;
}
export function isoToDate(s) {
  const [y,m,d] = s.split("-").map(Number);
  return new Date(y, m-1, d);
}

export const WK = weekId();
export const PREV_WK = prevWeekId();

const KEYS = {
  workoutLog: "workoutLog",
  intake: "intake",
  weights: "weights",
  customFoods: "customFoods"
};

export function load() {
  try { STATE.workoutLog = JSON.parse(localStorage.getItem(KEYS.workoutLog) || "{}"); } catch(e) {}
  try { STATE.intake = JSON.parse(localStorage.getItem(KEYS.intake) || "{}"); } catch(e) {}
  try { STATE.weights = JSON.parse(localStorage.getItem(KEYS.weights) || "[]"); } catch(e) {}
  try { STATE.customFoods = JSON.parse(localStorage.getItem(KEYS.customFoods) || "[]"); } catch(e) {}
}
export function persist(key) {
  try {
    localStorage.setItem(KEYS[key], JSON.stringify(STATE[key]));
    flashSaved();
  } catch(e) { console.error("save failed", e); }
}

/* Debounced variant — batches rapid writes (e.g. typing in weight/reps inputs)
   into one localStorage write. Keeps the "Saved" flash from flickering. */
const _debounceTimers = {};
export function persistDebounced(key, ms = 250) {
  clearTimeout(_debounceTimers[key]);
  _debounceTimers[key] = setTimeout(() => persist(key), ms);
}
function flashSaved() {
  const s = document.getElementById("saved");
  if (!s) return;
  s.classList.add("show");
  clearTimeout(window._st);
  window._st = setTimeout(() => s.classList.remove("show"), 1100);
}

/* Workout log helpers.
   readEntry: side-effect-free; returns the stored entry (resized to match
     current sets count) or a synthesized empty entry that is NOT stored.
     Mutating the returned object when the entry doesn't exist yet won't
     persist — use ensureEntry for write paths.
   ensureEntry: creates and stores the entry if missing, then returns it.
     Also resizes done[] if the program's sets count has changed. */
function resizeDone(entry, sets) {
  if (!entry || !Array.isArray(entry.done) || entry.done.length === sets) return entry;
  if (entry.done.length < sets) {
    entry.done = entry.done.concat(new Array(sets - entry.done.length).fill(false));
  } else {
    entry.done = entry.done.slice(0, sets);
  }
  return entry;
}
function defaultSets(dayKey, exId) {
  const exDef = findExercise(dayKey, exId);
  return exDef ? exDef.sets : 3;
}
export function readEntry(wk, dayKey, exId, sets) {
  const stored = STATE.workoutLog[wk] && STATE.workoutLog[wk][dayKey] && STATE.workoutLog[wk][dayKey][exId];
  const n = sets != null ? sets : defaultSets(dayKey, exId);
  if (stored) return resizeDone(stored, n);
  return { weight: "", reps: "", done: new Array(n).fill(false) };
}
export function ensureEntry(wk, dayKey, exId, sets) {
  if (!STATE.workoutLog[wk]) STATE.workoutLog[wk] = {};
  if (!STATE.workoutLog[wk][dayKey]) STATE.workoutLog[wk][dayKey] = {};
  const n = sets != null ? sets : defaultSets(dayKey, exId);
  if (!STATE.workoutLog[wk][dayKey][exId]) {
    STATE.workoutLog[wk][dayKey][exId] = { weight: "", reps: "", done: new Array(n).fill(false) };
  }
  return resizeDone(STATE.workoutLog[wk][dayKey][exId], n);
}

/* Intake helpers */
export function todaysIntake() { return STATE.intake[dateKey()] || []; }
export function dayTotals(items) {
  let k = 0, p = 0;
  items.forEach(it => { k += Number(it.kcal) || 0; p += Number(it.protein) || 0; });
  return { kcal: k, protein: p };
}
/* Sanity caps for a single intake entry. Picked to be permissive enough
   for big meals (e.g. a cheat-day pizza) but tight enough to catch typos
   like 9999 instead of 999. Returns true on success, false (with alert)
   on rejection. */
const MAX_ITEM_KCAL = 5000;
const MAX_ITEM_PROTEIN = 500;

/**
 * Add an entry to today's intake.
 * Either pass absolute macros (kcal, protein), or pass per-100g macros
 * with a portion size in grams and we scale.
 */
export function addIntake(name, kcal, protein, extra) {
  const kNum = Number(kcal), pNum = Number(protein);
  if (!isFinite(kNum) || kNum < 0 || kNum > MAX_ITEM_KCAL) {
    alert("Calories out of range (0–" + MAX_ITEM_KCAL + "). Got " + kcal + ".");
    return false;
  }
  if (!isFinite(pNum) || pNum < 0 || pNum > MAX_ITEM_PROTEIN) {
    alert("Protein out of range (0–" + MAX_ITEM_PROTEIN + " g). Got " + protein + ".");
    return false;
  }
  const k = dateKey();
  if (!STATE.intake[k]) STATE.intake[k] = [];
  const item = { name, kcal: kNum, protein: pNum };
  if (extra) {
    // Optional fields for editable scanned/searched items
    if (extra.grams != null) item.grams = Number(extra.grams);
    if (extra.kcalPer100 != null) item.kcalPer100 = Number(extra.kcalPer100);
    if (extra.proteinPer100 != null) item.proteinPer100 = Number(extra.proteinPer100);
    if (extra.barcode) item.barcode = extra.barcode;
  }
  STATE.intake[k].push(item);
  persist("intake");
  return true;
}

/* Save a food (from search/scan) into the user's custom foods list,
   unless it's already there. Matches by barcode if available, else by name. */
export function rememberFood(food) {
  const exists = STATE.customFoods.some(f =>
    (food.barcode && f.barcode === food.barcode) ||
    f.name.toLowerCase() === food.name.toLowerCase()
  );
  if (exists) return;
  STATE.customFoods.push({
    id: "cf-" + Date.now(),
    name: food.name,
    kcal: food.kcal,
    protein: food.protein,
    kcalPer100: food.kcalPer100,
    proteinPer100: food.proteinPer100,
    barcode: food.barcode || null
  });
  persist("customFoods");
}

/* DOM helpers */
export function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;" }[c]));
}
export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstChild;
}
export function avg(arr) { return arr.reduce((a,b)=>a+b,0) / arr.length; }

/* Rest timer */
let timerInterval = null;
let timerRemaining = 0;

export function startTimer() {
  stopTimer();
  timerRemaining = REST_SECONDS;
  const bar = document.getElementById("timer");
  const count = document.getElementById("timer-count");
  count.textContent = timerRemaining;
  bar.classList.add("show");
  timerInterval = setInterval(() => {
    timerRemaining--;
    count.textContent = timerRemaining;
    if (timerRemaining <= 0) {
      stopTimer();
      beep();
    }
  }, 1000);
}
export function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
  const bar = document.getElementById("timer");
  if (bar) bar.classList.remove("show");
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 660;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.42);
  } catch (e) { /* audio blocked, that's fine */ }
}
