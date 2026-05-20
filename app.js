import { STATE, load, stopTimer } from "./core/state.js";
import { initModal } from "./components/modal.js";
import { renderWorkout } from "./pages/workout.js";
import { renderMeals } from "./pages/meals.js";
import { renderIntake } from "./pages/intake.js";
import { renderStats } from "./pages/stats.js";

const TITLES = {
  workout: ["Workout", "Beginner muscle-building"],
  meals:   ["Meals", "Bulking · 3000 kcal · 140g protein"],
  intake:  ["Today", "Log what you ate"],
  stats:   ["Stats", "Weight & intake trends"]
};

function render() {
  const root = document.getElementById("root");
  root.innerHTML = "";
  const renderers = {
    workout: renderWorkout,
    meals: renderMeals,
    intake: renderIntake,
    stats: renderStats
  };
  renderers[STATE.page](root, render);
}

function navigate(page) {
  STATE.page = page;
  document.querySelectorAll(".tabbtn").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });
  const t = TITLES[page];
  document.getElementById("page-title").textContent = t[0];
  document.getElementById("page-sub").textContent = t[1];
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
}

document.querySelectorAll(".tabbtn").forEach(b => {
  b.addEventListener("click", () => navigate(b.dataset.page));
});
document.getElementById("timer-skip").addEventListener("click", stopTimer);

initModal();
load();
navigate("workout");

// Register the service worker for offline support. Fails silently on
// http://localhost (SW requires HTTPS) — production hosting (GitHub Pages,
// or any HTTPS subdomain) will pick it up.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
