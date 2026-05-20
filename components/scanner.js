/**
 * Barcode scanner with two backends:
 *  1. Native BarcodeDetector  (Android Chrome, Edge — instant, no library)
 *  2. ZXing-js                (iOS Safari, Firefox — loaded on demand)
 *
 * Public API:
 *   startScanner(videoEl, onFound) -> stopFn
 *   onFound(code) is called once with the detected barcode string.
 *   Calling stopFn() releases the camera and aborts the scan loop.
 */

let zxingPromise = null;
function loadZXing() {
  if (zxingPromise) return zxingPromise;
  zxingPromise = new Promise((resolve, reject) => {
    if (window.ZXingBrowser) { resolve(window.ZXingBrowser); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@zxing/browser@0.1.5/umd/index.min.js";
    script.onload = () => resolve(window.ZXingBrowser);
    script.onerror = () => reject(new Error("Failed to load ZXing"));
    document.head.appendChild(script);
  });
  return zxingPromise;
}

export async function startScanner(videoEl, onFound) {
  let stopped = false;
  let mediaStream = null;
  let zxingReader = null;
  let rafId = null;

  // Try to use native BarcodeDetector first
  const hasNative = "BarcodeDetector" in window;

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false
    });
  } catch (e) {
    onFound(null, e);
    return () => {};
  }

  videoEl.srcObject = mediaStream;
  videoEl.setAttribute("playsinline", "true");
  await videoEl.play().catch(() => {});

  if (hasNative) {
    let detector;
    try {
      detector = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39"]
      });
    } catch (e) {
      // BarcodeDetector exists but formats unsupported — fall through to ZXing
    }

    if (detector) {
      const loop = async () => {
        if (stopped) return;
        try {
          const codes = await detector.detect(videoEl);
          if (codes && codes.length) {
            onFound(codes[0].rawValue);
            cleanup();
            return;
          }
        } catch (e) { /* ignore single-frame errors */ }
        rafId = requestAnimationFrame(loop);
      };
      loop();

      const cleanup = () => {
        stopped = true;
        if (rafId) cancelAnimationFrame(rafId);
        if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
      };
      return cleanup;
    }
  }

  // Fallback: ZXing
  try {
    const ZX = await loadZXing();
    zxingReader = new ZX.BrowserMultiFormatReader();
    zxingReader.decodeFromStream(mediaStream, videoEl, (result, err) => {
      if (stopped) return;
      if (result) {
        onFound(result.getText());
        cleanup();
      }
      // err is fired every frame without a result — ignore
    });
  } catch (e) {
    onFound(null, e);
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
    return () => {};
  }

  const cleanup = () => {
    stopped = true;
    if (zxingReader) {
      try { zxingReader.reset(); } catch (e) {}
    }
    if (mediaStream) mediaStream.getTracks().forEach(t => t.stop());
  };
  return cleanup;
}
