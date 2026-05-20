import { addIntake } from "../../core/state.js";
import { openModal, closeModal } from "../../components/modal.js";

export function openQuickEntryModal(rerender) {
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
