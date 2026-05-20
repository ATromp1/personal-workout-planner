<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#fafaf9">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Lift">
<title>Lift &amp; Eat</title>
<link rel="stylesheet" href="./style.css">
</head>
<body>

<div class="wrap">
  <header>
    <div>
      <h1 id="page-title">Workout</h1>
      <div class="sub" id="page-sub">Beginner muscle-building</div>
    </div>
    <span class="saved" id="saved">✓ Saved</span>
  </header>
  <div id="root"></div>
</div>

<div class="timer-bar" id="timer">
  <div class="left">
    <span class="count" id="timer-count">90</span>
    <span class="label">Rest</span>
  </div>
  <div>
    <button id="timer-skip">Skip</button>
  </div>
</div>

<nav class="tabbar">
  <div class="tabbar-inner">
    <button class="tabbtn" data-page="workout"><span class="ic">🏋️</span><span>Workout</span></button>
    <button class="tabbtn" data-page="meals"><span class="ic">🍽️</span><span>Meals</span></button>
    <button class="tabbtn" data-page="intake"><span class="ic">📝</span><span>Today</span></button>
    <button class="tabbtn" data-page="stats"><span class="ic">📈</span><span>Stats</span></button>
  </div>
</nav>

<div class="modal-bg" id="modal-bg">
  <div class="modal" id="modal"></div>
</div>

<script type="module" src="./app.js"></script>
</body>
</html>
