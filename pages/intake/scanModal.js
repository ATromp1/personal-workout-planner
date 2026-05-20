import { esc } from "../../core/state.js";
import { openModal, closeModal } from "../../components/modal.js";
import { lookupBarcode } from "../../core/foodApi.js";
import { startScanner } from "../../components/scanner.js";
import { handleProductPicked } from "./portionEditModal.js";

export function openScanModal(rerender) {
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
