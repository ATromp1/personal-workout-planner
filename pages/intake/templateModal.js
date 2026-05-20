import { MEAL_DAYS, MEAL_DAY_ORDER, LOW_APP_FOODS } from "../../data/meals.js";
import { esc, addIntake } from "../../core/state.js";
import { openModal, closeModal } from "../../components/modal.js";

export function openTemplateModal(rerender) {
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
