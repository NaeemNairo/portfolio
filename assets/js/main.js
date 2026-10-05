/* Naeem · Research portfolio
   Sections: nav · project filters · tabs · copy email · figures */
(function () {
  "use strict";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  /* ---------- Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
  const header = $(".site-header");
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const toggle = $(".nav-toggle");
  const menu = $("#nav-menu");
  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.querySelector(".sr-only").textContent = open ? "Close menu" : "Open menu";
    menu.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // Highlight the nav link for the section in view
  const links = $$(".nav-menu a[href^='#']");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle("is-current", l.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach((l) => { const s = $(l.getAttribute("href")); if (s) io.observe(s); });
  }

  /* ---------- Project filters ---------- */
  const filters = $$(".filter");
  const projects = $$(".project");
  const empty = $(".empty-note");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    filters.forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", String(on));
    });
    let shown = 0;
    projects.forEach((p) => {
      const match = f === "all" || p.dataset.category === f;
      p.hidden = !match;
      if (match) shown++;
    });
    if (empty) empty.hidden = shown > 0;
  }));

  /* ---------- Tabs (keyboard accessible) ---------- */
  const tabs = $$("[role='tab']");
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    drawAll();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!dir) return;
      const next = tabs[(i + dir + tabs.length) % tabs.length];
      next.focus();
      selectTab(next);
    });
  });

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copy-email");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    const done = (msg) => { copyBtn.textContent = msg; setTimeout(() => (copyBtn.textContent = "Copy email"), 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(copyBtn.dataset.email).then(() => done("Copied"), () => done(copyBtn.dataset.email));
    else done(copyBtn.dataset.email);
  });

  /* =========================================================
     FIGURES
     ========================================================= */
  const font = () => "13px " + cssVar("--font-mono");

  /* ----- Fig 1: 2D diffusion from microneedles (explicit FD) ----- */
  const NX = 150, NY = 60;
  function diffuse(nNeedle, steps) {
    let C = new Float32Array(NX * NY), N = new Float32Array(NX * NY);
    const depth = Math.round(NY * 0.35), src = [];
    for (let k = 0; k < nNeedle; k++) {
      const x = Math.round((k + 0.5) * NX / nNeedle);
      for (let y = 0; y <= depth; y++) src.push(y * NX + x);
    }
    const r = 0.24; // D·dt/dx² (< 0.25 for stability)
    for (let s = 0; s < steps; s++) {
      for (const i of src) C[i] = 1;
      for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
        const i = y * NX + x;
        const l = C[y * NX + Math.max(0, x - 1)], rr = C[y * NX + Math.min(NX - 1, x + 1)];
        const u = C[Math.max(0, y - 1) * NX + x], d = y === NY - 1 ? 0 : C[(y + 1) * NX + x];
        N[i] = C[i] + r * (l + rr + u + d - 4 * C[i]);
      }
      [C, N] = [N, C];
    }
    for (const i of src) C[i] = 1;
    return C;
  }
  const RAMP = [[246, 248, 250], [13, 110, 122], [208, 96, 31]];
  function ramp(v) {
    const lo = v < .5 ? RAMP[0] : RAMP[1], hi = v < .5 ? RAMP[1] : RAMP[2], f = v < .5 ? v / .5 : (v - .5) / .5;
    return lo.map((c, k) => Math.round(c + (hi[k] - c) * f));
  }
  function drawDiff() {
    const n = +$("#nNeed").value, t = +$("#tDiff").value;
    $("#oNeed").value = n; $("#oDiff").value = t;
    const cv = $("#cDiff"), g = cv.getContext("2d"), W = cv.width, H = cv.height, PH = H - 34;
    const C = diffuse(n, t);
    const img = g.createImageData(NX, NY);
    let cov = 0;
    for (let i = 0; i < NX * NY; i++) {
      if (C[i] > 0.1) cov++;
      const c = ramp(Math.pow(Math.min(1, C[i]), 0.6));
      img.data.set([c[0], c[1], c[2], 255], i * 4);
    }
    const off = document.createElement("canvas");
    off.width = NX; off.height = NY; off.getContext("2d").putImageData(img, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = cssVar("--bg-alt"); g.fillRect(0, 0, W, H);
    g.imageSmoothingEnabled = true; g.drawImage(off, 0, 0, W, PH);
    g.strokeStyle = cssVar("--ink"); g.lineWidth = 2.5;
    for (let k = 0; k < n; k++) {
      const x = (k + 0.5) * W / n;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x, PH * 0.35); g.stroke();
    }
    g.font = font(); g.textBaseline = "middle";
    g.fillStyle = cssVar("--muted"); g.textAlign = "left";
    g.fillText("skin surface at top · depth increases downward", 10, H - 17);
    g.fillStyle = cssVar("--ink"); g.textAlign = "right";
    g.fillText("area with C > 0.1: " + Math.round(100 * cov / (NX * NY)) + "%", W - 10, H - 17);
  }

  /* ----- Fig 2: crossed four-bar knee ----- */
  const KL = { g: 1.0, a: 1.25, b: 1.05, c: 0.42 }; // tibial base, anterior link, posterior link, femoral link
  const KA = [0, 0], KB = [-1.0, 0];
  function solveKnee(th) {
    const D = [KA[0] + KL.a * Math.cos(th), KA[1] + KL.a * Math.sin(th)];
    const dx = D[0] - KB[0], dy = D[1] - KB[1], d = Math.hypot(dx, dy);
    if (d > KL.b + KL.c || d < Math.abs(KL.b - KL.c)) return null;
    const a = (KL.b * KL.b - KL.c * KL.c + d * d) / (2 * d), h = Math.sqrt(Math.max(0, KL.b * KL.b - a * a));
    const mx = KB[0] + a * dx / d, my = KB[1] + a * dy / d;
    const C = [mx + h * dy / d, my - h * dx / d];
    const r = [D[0] - KA[0], D[1] - KA[1]], s = [C[0] - KB[0], C[1] - KB[1]];
    const t = ((KB[0] - KA[0]) * s[1] - (KB[1] - KA[1]) * s[0]) / (r[0] * s[1] - r[1] * s[0]);
    return { D, C, I: [KA[0] + t * r[0], KA[1] + t * r[1]] };
  }
  const angle = (s) => Math.atan2(s.C[1] - s.D[1], s.C[0] - s.D[0]);
  const kneeTable = [];
  (function () {
    let s0 = null;
    for (let th = 2.34; th > 1.5; th -= 0.001) {
      const s = solveKnee(th); if (!s) break;
      if (!s0) s0 = s;
      const f = Math.abs(angle(s) - angle(s0)) * 180 / Math.PI;
      if (f > 90.5) break;
      kneeTable.push({ f, s });
    }
  })();
  function drawKnee() {
    const fv = +$("#fKnee").value; $("#oKnee").value = fv + "°";
    const cv = $("#cKnee"), g = cv.getContext("2d"), W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = cssVar("--bg-alt"); g.fillRect(0, 0, W, H);
    let best = kneeTable[0];
    for (const k of kneeTable) if (Math.abs(k.f - fv) < Math.abs(best.f - fv)) best = k;
    const sc = 200, ox = W * 0.6, oy = H - 70, P = (p) => [ox + p[0] * sc, oy - p[1] * sc];
    const seg = (p, q, color, w) => { const a = P(p), b = P(q); g.strokeStyle = color; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };

    g.setLineDash([3, 5]); g.strokeStyle = cssVar("--warm"); g.lineWidth = 1.5; g.beginPath();
    kneeTable.forEach((k, i) => { const q = P(k.s.I); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); });
    g.stroke(); g.setLineDash([]);

    const { D, C, I } = best.s;
    seg(KB, KA, cssVar("--muted"), 10);
    seg(KA, D, cssVar("--accent"), 7);
    seg(KB, C, cssVar("--accent"), 7);
    seg(D, C, cssVar("--ink"), 10);
    [KA, KB, C, D].forEach((p) => { const q = P(p); g.fillStyle = "#fff"; g.strokeStyle = cssVar("--ink"); g.lineWidth = 2; g.beginPath(); g.arc(q[0], q[1], 6, 0, Math.PI * 2); g.fill(); g.stroke(); });
    const q = P(I); g.fillStyle = cssVar("--warm"); g.beginPath(); g.arc(q[0], q[1], 7, 0, Math.PI * 2); g.fill();

    g.font = font(); g.fillStyle = cssVar("--muted"); g.textBaseline = "top"; g.textAlign = "center";
    const pa = P(KA), pb = P(KB);
    g.fillText("anterior", pa[0], pa[1] + 16); g.fillText("posterior", pb[0], pb[1] + 16);
    g.fillText("tibial base", (pa[0] + pb[0]) / 2, pa[1] + 36);
    g.textAlign = "right"; g.fillStyle = cssVar("--ink");
    g.fillText("ICR height: " + (I[1] / KL.g).toFixed(2) + " × tibial base", W - 14, 14);
  }

  /* ----- Fig 3: PD-stabilised inverted pendulum ----- */
  function drawPend() {
    const kp = +$("#kp").value, kd = +$("#kd").value;
    $("#oKp").value = kp; $("#oKd").value = kd;
    const cv = $("#cPend"), g = cv.getContext("2d"), W = cv.width, H = cv.height;
    g.clearRect(0, 0, W, H);
    g.fillStyle = cssVar("--bg-alt"); g.fillRect(0, 0, W, H);
    const w2 = 30, T = 3, dt = 0.001, pts = [];
    let th = 10, om = 0;
    for (let t = 0; t <= T; t += dt) {
      pts.push([t, th]);
      const a = w2 * th - kp * th - kd * om;
      om += a * dt; th += om * dt;
      if (Math.abs(th) > 60) { pts.push([t, th]); break; }
    }
    const L = 56, R = 18, Tp = 44, B = 36, pw = W - L - R, ph = H - Tp - B;
    const X = (t) => L + t / T * pw, Y = (v) => Tp + (1 - (Math.max(-20, Math.min(20, v)) + 20) / 40) * ph;
    g.font = font(); g.lineWidth = 1; g.strokeStyle = cssVar("--border"); g.fillStyle = cssVar("--muted");
    [-20, -10, 0, 10, 20].forEach((v) => {
      const y = Y(v); g.beginPath(); g.moveTo(L, y); g.lineTo(W - R, y); g.stroke();
      g.textAlign = "right"; g.textBaseline = "middle"; g.fillText(v + "°", L - 8, y);
    });
    g.textAlign = "center"; g.textBaseline = "top";
    [0, 1, 2, 3].forEach((t) => g.fillText(t + " s", X(t), H - B + 10));

    const stable = kp > w2;
    g.strokeStyle = stable ? cssVar("--accent") : cssVar("--warm"); g.lineWidth = 2.5; g.beginPath();
    pts.forEach((p, i) => { const x = X(p[0]), y = Y(p[1]); i ? g.lineTo(x, y) : g.moveTo(x, y); });
    g.stroke();

    let status;
    if (!stable) status = "Unstable: Kp ≤ ω², the pendulum falls";
    else {
      const wn = Math.sqrt(kp - w2), z = kd / (2 * wn);
      let ts = null;
      for (let i = pts.length - 1; i >= 0; i--) if (Math.abs(pts[i][1]) > 0.2) { ts = pts[i][0]; break; }
      const os = z < 1 ? 100 * Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)) : 0;
      status = "ζ = " + z.toFixed(2) + "   overshoot ≈ " + os.toFixed(0) + "%   settling (±0.2°) ≈ " + (ts !== null && ts < T - 0.01 ? ts.toFixed(2) + " s" : "> 3 s");
    }
    g.textAlign = "left"; g.textBaseline = "top"; g.fillStyle = stable ? cssVar("--ink") : cssVar("--warm");
    g.fillText(status, L, 14);
  }

  function drawAll() {
    if (!$("#panel-diff").hidden) drawDiff();
    if (!$("#panel-knee").hidden) drawKnee();
    if (!$("#panel-pend").hidden) drawPend();
  }
  ["#nNeed", "#tDiff"].forEach((id) => $(id).addEventListener("input", drawDiff));
  $("#fKnee").addEventListener("input", drawKnee);
  ["#kp", "#kd"].forEach((id) => $(id).addEventListener("input", drawPend));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(drawAll);
  drawAll();
})();
