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
export function weekId(d) {
  d = d || new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - onejan) / 86400000 + onejan.getDay() + 1) / 7);
  return d.getFullYear() + "-w" + week;
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
function flashSaved() {
  const s = document.getElementById("saved");
  if (!s) return;
  s.classList.add("show");
  clearTimeout(window._st);
  window._st = setTimeout(() => s.classList.remove("show"), 1100);
}

/* Workout log helpers */
export function getEntry(wk, dayKey, exId) {
  if (!STATE.workoutLog[wk]) STATE.workoutLog[wk] = {};
  if (!STATE.workoutLog[wk][dayKey]) STATE.workoutLog[wk][dayKey] = {};
  if (!STATE.workoutLog[wk][dayKey][exId]) {
    const exDef = findExercise(dayKey, exId);
    STATE.workoutLog[wk][dayKey][exId] = { weight: "", reps: "", done: new Array(exDef ? exDef.sets : 3).fill(false) };
  }
  return STATE.workoutLog[wk][dayKey][exId];
}
export function getEntryReadOnly(wk, dayKey, exId) {
  return STATE.workoutLog[wk] && STATE.workoutLog[wk][dayKey] && STATE.workoutLog[wk][dayKey][exId];
}

/* Intake helpers */
export function todaysIntake() { return STATE.intake[dateKey()] || []; }
export function dayTotals(items) {
  let k = 0, p = 0;
  items.forEach(it => { k += Number(it.kcal) || 0; p += Number(it.protein) || 0; });
  return { kcal: k, protein: p };
}
/**
 * Add an entry to today's intake.
 * Either pass absolute macros (kcal, protein), or pass per-100g macros
 * with a portion size in grams and we scale.
 */
export function addIntake(name, kcal, protein, extra) {
  const k = dateKey();
  if (!STATE.intake[k]) STATE.intake[k] = [];
  const item = { name, kcal: Number(kcal), protein: Number(protein) };
  if (extra) {
    // Optional fields for editable scanned/searched items
    if (extra.grams != null) item.grams = Number(extra.grams);
    if (extra.kcalPer100 != null) item.kcalPer100 = Number(extra.kcalPer100);
    if (extra.proteinPer100 != null) item.proteinPer100 = Number(extra.proteinPer100);
    if (extra.barcode) item.barcode = extra.barcode;
  }
  STATE.intake[k].push(item);
  persist("intake");
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
