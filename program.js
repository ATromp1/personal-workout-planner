* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html, body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #1c1917; background: #fafaf9; min-height: 100%;
}
body { padding-bottom: 84px; }
.wrap { max-width: 480px; margin: 0 auto; }
header { padding: 20px 18px 12px; display: flex; justify-content: space-between; align-items: baseline; }
h1 { font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }
.sub { font-size: 12.5px; color: #78716c; }
.saved { font-size: 11px; color: #16a34a; font-weight: 600; opacity: 0; transition: opacity .3s; }
.saved.show { opacity: 1; }

/* Tab bar */
.tabbar {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: #fff; border-top: 1px solid #ececea;
  display: flex; justify-content: space-around; padding: 8px 0 14px;
  z-index: 100;
}
.tabbar-inner { max-width: 480px; margin: 0 auto; display: flex; width: 100%; }
.tabbtn {
  flex: 1; background: none; border: none; padding: 6px 4px;
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  font-size: 11px; color: #a8a29e; cursor: pointer; font-weight: 600;
}
.tabbtn.active { color: #1c1917; }
.tabbtn .ic { font-size: 22px; line-height: 1; filter: grayscale(1); opacity: 0.5; }
.tabbtn.active .ic { filter: none; opacity: 1; }

/* Section tabs */
.seg {
  display: flex; gap: 6px; padding: 0 12px 8px;
  overflow-x: auto; -webkit-overflow-scrolling: touch;
}
.seg::-webkit-scrollbar { display: none; }
.seg-btn {
  flex: 0 0 auto; padding: 8px 13px; border-radius: 999px;
  border: 1px solid #e7e5e4; background: #fff; color: #57534e;
  font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap;
}
.seg-btn.active { color: #fff; }

.meta {
  display: flex; justify-content: space-between; align-items: center;
  padding: 6px 16px 4px; font-size: 11.5px; color: #a8a29e;
}

/* Generic cards */
.card {
  background: #fff; margin: 12px 12px 0; border-radius: 14px;
  border: 1px solid #ececea; overflow: hidden;
}
.card-head {
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 14px 16px 6px; gap: 8px;
}
.card-title { font-size: 15px; font-weight: 700; }
.card-sub { font-size: 11.5px; color: #a8a29e; font-weight: 500; }

/* === WORKOUT (one exercise at a time) === */
.ex-nav {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; font-size: 12px; color: #78716c;
}
.ex-nav .arrow {
  background: #fff; border: 1px solid #e7e5e4; border-radius: 9px;
  width: 38px; height: 38px; font-size: 18px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  color: #1c1917;
}
.ex-nav .arrow:disabled { color: #d6d3d1; cursor: default; }
.ex-nav .pos { font-weight: 600; color: #1c1917; font-size: 13px; }

.ex-card {
  background: #fff; margin: 4px 12px 0; border-radius: 16px;
  border: 1px solid #ececea; padding: 22px 18px 18px;
}
.ex-name-row {
  display: flex; align-items: center; gap: 8px; margin-bottom: 4px;
}
.ex-name { font-size: 20px; font-weight: 700; letter-spacing: -0.01em; }
.info-btn {
  flex: 0 0 auto; width: 22px; height: 22px; border-radius: 50%;
  border: 1px solid #d6d3d1; background: #fff; color: #78716c;
  font-size: 13px; font-weight: 700; font-style: italic; line-height: 1;
  cursor: pointer; padding: 0;
  display: flex; align-items: center; justify-content: center;
}
.info-btn.open { background: #1c1917; color: #fff; border-color: #1c1917; }
.ex-target { font-size: 13px; color: #78716c; margin-bottom: 14px; }
.how {
  display: none; margin-bottom: 14px; padding: 12px 14px;
  background: #f7f6f4; border: 1px solid #ececea; border-radius: 10px;
  font-size: 13px; line-height: 1.5; color: #44403c;
}
.how.show { display: block; }
.how .muscle {
  display: block; margin-top: 6px; font-size: 11.5px;
  color: #a8a29e; font-weight: 600;
}

.inputs-row { display: flex; gap: 10px; margin-bottom: 4px; }
.inputs-row .field { flex: 1; }
.field label {
  display: block; font-size: 11px; color: #78716c;
  font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;
  margin-bottom: 4px;
}
.field input {
  width: 100%; padding: 12px; font-size: 18px; font-weight: 600;
  border: 1px solid #e7e5e4; border-radius: 10px; background: #fafaf9;
  color: #1c1917; outline: none; text-align: center;
}
.field input:focus { border-color: #1c1917; background: #fff; }
.last-week {
  font-size: 11.5px; color: #a8a29e; margin: 6px 2px 14px;
  text-align: center;
}
.last-week b { color: #57534e; font-weight: 600; }

.sets-grid {
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;
  margin-bottom: 12px;
}
.sets-grid.two-col { grid-template-columns: 1fr 1fr; }
.set-btn {
  padding: 18px 12px; border-radius: 12px;
  border: 1.5px solid #e7e5e4; background: #fff;
  cursor: pointer; transition: all .15s ease;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.set-btn .lbl {
  font-size: 11px; color: #a8a29e; text-transform: uppercase;
  letter-spacing: 0.5px; font-weight: 700;
}
.set-btn .mark { font-size: 22px; line-height: 1; color: #d6d3d1; }
.set-btn.done { background: #1c1917; border-color: #1c1917; }
.set-btn.done .lbl { color: #a8a29e; }
.set-btn.done .mark { color: #16a34a; }

.next-btn {
  width: 100%; padding: 14px; border-radius: 12px; border: none;
  background: #1c1917; color: #fff; font-size: 15px; font-weight: 700;
  cursor: pointer; margin-top: 4px;
}
.next-btn.muted { background: #fff; color: #57534e; border: 1px solid #e7e5e4; }

/* Rest timer */
.timer-bar {
  position: fixed; left: 12px; right: 12px; bottom: 92px;
  max-width: 456px; margin: 0 auto;
  background: #1c1917; color: #fff;
  border-radius: 14px; padding: 12px 14px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 10px; box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  z-index: 90; transform: translateY(120%); transition: transform .25s ease;
}
.timer-bar.show { transform: translateY(0); }
.timer-bar .left { display: flex; align-items: center; gap: 12px; }
.timer-bar .count { font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; min-width: 50px; text-align: center; }
.timer-bar .label { font-size: 12px; opacity: 0.8; }
.timer-bar button {
  background: rgba(255,255,255,0.12); color: #fff; border: none;
  padding: 6px 10px; border-radius: 8px; font-size: 12px; cursor: pointer;
  font-weight: 600;
}

.progress-dots {
  display: flex; gap: 6px; padding: 14px 16px 2px; justify-content: center;
}
.dot { width: 10px; height: 10px; border-radius: 50%; background: #e7e5e4; cursor: pointer; }
.dot.done { background: #16a34a; }
.dot.current { background: #1c1917; }

/* Banners */
.banner {
  margin: 12px 12px 0; padding: 16px; border-radius: 14px;
  background: #f5f3ff; border: 1px solid #e9d5ff; color: #6b21a8; font-size: 14px;
}
.banner ul { margin: 8px 0 0; padding-left: 18px; }
.banner li { margin: 5px 0; line-height: 1.5; }
.rest-day {
  margin: 12px 12px 0; padding: 20px 16px; border-radius: 14px;
  background: #f5f5f4; border: 1px solid #e7e5e4; color: #57534e;
  font-size: 14px; text-align: center;
}
.info-yellow {
  margin: 12px 12px 0; padding: 14px 16px; border-radius: 14px;
  background: #fef3c7; border: 1px solid #fde68a; color: #78350f;
  font-size: 13px; line-height: 1.5;
}
.info-green {
  margin: 12px 12px 0; padding: 14px 16px; border-radius: 14px;
  background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46;
  font-size: 13px; line-height: 1.5;
}
.info-red {
  margin: 12px 12px 0; padding: 14px 16px; border-radius: 14px;
  background: #fef2f2; border: 1px solid #fecaca; color: #991b1b;
  font-size: 13px; line-height: 1.5;
}

/* Targets */
.targets { display: flex; gap: 8px; margin: 0 12px 4px; }
.target-pill {
  flex: 1; background: #fff; border: 1px solid #ececea;
  border-radius: 12px; padding: 10px 12px; text-align: center;
}
.target-label { font-size: 10.5px; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
.target-value { font-size: 17px; font-weight: 700; color: #1c1917; margin-top: 2px; }

/* Meal plan ingredients */
.ingredients { list-style: none; padding: 0 16px 6px; margin: 0; border-top: 1px solid #f5f5f4; }
.ingredients li {
  padding: 8px 0; border-bottom: 1px solid #f5f5f4;
  font-size: 13.5px; line-height: 1.45;
  display: flex; justify-content: space-between; gap: 12px;
}
.ingredients li:last-child { border-bottom: none; }
.qty { color: #78716c; flex: 0 0 auto; font-size: 12.5px; }
.meal-notes {
  padding: 10px 16px 14px; font-size: 12.5px; color: #57534e;
  line-height: 1.5; background: #fafaf9; border-top: 1px solid #f5f5f4;
}
.macro-row { display: flex; gap: 14px; padding: 0 16px 12px; font-size: 11.5px; color: #78716c; }
.macro-row b { color: #1c1917; font-weight: 700; }
.totals {
  margin: 14px 12px 0; padding: 14px 16px;
  background: #1c1917; color: #fff; border-radius: 14px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.totals-label { font-size: 12px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px; }
.totals-value { font-size: 16px; font-weight: 700; }

/* Intake */
.progress-wrap { padding: 6px 16px 14px; }
.progress-bar { height: 8px; background: #f5f5f4; border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: #16a34a; transition: width .3s; }
.progress-fill.over { background: #f59e0b; }
.progress-label { display: flex; justify-content: space-between; font-size: 12px; color: #57534e; margin-top: 4px; }

.add-row { display: flex; gap: 8px; padding: 8px 14px 12px; }
.btn {
  padding: 10px 14px; border-radius: 9px; border: 1px solid #1c1917;
  background: #1c1917; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
}
.btn-ghost { background: #fff; color: #1c1917; }
.btn-sm { padding: 6px 10px; font-size: 12px; }

.log-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 16px; border-top: 1px solid #f5f5f4;
  font-size: 13.5px;
}
.log-item .right { display: flex; align-items: center; gap: 12px; }
.log-item .macros { color: #78716c; font-size: 12px; }
.x-btn { background: none; border: none; color: #a8a29e; font-size: 18px; cursor: pointer; padding: 0 2px; }

/* Stats chart */
.chart-wrap { padding: 10px 14px 14px; }
svg.chart { width: 100%; height: 160px; display: block; }

.stat-row { display: flex; justify-content: space-between; padding: 12px 16px; border-top: 1px solid #f5f5f4; font-size: 14px; }
.stat-row:first-child { border-top: none; }
.stat-row b { font-weight: 700; }

.empty { text-align: center; padding: 28px 16px; color: #a8a29e; font-size: 13px; }

/* Modal */
.modal-bg {
  position: fixed; inset: 0; background: rgba(0,0,0,0.4);
  display: none; align-items: flex-end; justify-content: center;
  z-index: 200;
}
.modal-bg.show { display: flex; }
.modal {
  background: #fff; width: 100%; max-width: 480px;
  border-radius: 16px 16px 0 0; padding: 16px 16px 24px;
  max-height: 85vh; overflow-y: auto;
}
.modal h3 { font-size: 16px; margin-bottom: 12px; }
.modal label { display: block; font-size: 12px; color: #57534e; margin: 10px 0 4px; font-weight: 600; }
.modal .inp { width: 100%; padding: 10px; font-size: 16px; border: 1px solid #e7e5e4; border-radius: 9px; background: #fafaf9; outline: none; }
.modal-actions { display: flex; gap: 8px; margin-top: 16px; }
.modal-actions .btn { flex: 1; }

.food-pick {
  padding: 12px 14px; border-top: 1px solid #f5f5f4; font-size: 14px;
  display: flex; justify-content: space-between; align-items: center;
  cursor: pointer;
}
.food-pick:hover { background: #fafaf9; }
.food-pick .macros { font-size: 12px; color: #78716c; }
.food-pick:first-child { border-top: none; }
