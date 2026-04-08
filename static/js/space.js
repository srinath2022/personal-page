// Exported rocket state — about-effect.js reads this each frame for text reflow
export const roverState = { x: -9999, y: -9999, r: 26, active: false };

// ── Sizes ──────────────────────────────────────────────────────────────────
const EARTH_R     = 42;
const MOON_R      = 11;   // larger so crescent is visible; moon > rocket
const MOON_A      = 80;
const MOON_B      = 48;
const MOON_PERIOD = 14;   // seconds per orbit

const MARS_R    = 21;
const ROCKET_OA = 64;     // rocket orbit semi-major
const ROCKET_OB = 38;

// ── Journey timing (seconds) ───────────────────────────────────────────────
const T_EARTH = 6;
const T_OUT   = 22;
const T_MARS  = 18;   // longer: 4-5 orbits
const T_BACK  = 14;
const T_TOTAL = T_EARTH + T_OUT + T_MARS + T_BACK; // 60 s

// ── Canvas ─────────────────────────────────────────────────────────────────
const canvas = document.getElementById('space-canvas');
const IS_MOBILE = window.matchMedia('(max-width: 640px)').matches;
if (IS_MOBILE) {
  canvas.style.display = 'none';
  throw 0; // abort module on mobile — leave roverState at its inert default
}
const ctx    = canvas.getContext('2d');
const dpr    = Math.min(window.devicePixelRatio || 1, 2);

function resize() {
  canvas.width  = Math.round(window.innerWidth  * dpr);
  canvas.height = Math.round(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
resize();
let _rt;
window.addEventListener('resize', () => { clearTimeout(_rt); _rt = setTimeout(resize, 100); });

// ── Crescent moon — pre-rendered once ─────────────────────────────────────
const MOON_IMG_R = MOON_R * 3;
function makeCrescent() {
  const size = Math.ceil(MOON_IMG_R * 2);
  const off  = new OffscreenCanvas(size, size);
  const oc   = off.getContext('2d');
  const cx   = size / 2, cy = size / 2;
  oc.fillStyle = '#c8c8c8';
  oc.beginPath(); oc.arc(cx, cy, MOON_R, 0, Math.PI * 2); oc.fill();
  oc.globalCompositeOperation = 'destination-out';
  oc.beginPath(); oc.arc(cx + MOON_R * 0.45, cy - MOON_R * 0.05, MOON_R * 0.82, 0, Math.PI * 2); oc.fill();
  return off;
}
const crescentImg = makeCrescent();

// ── Position helpers (gentle sinusoidal drift) ─────────────────────────────
function getEarthVP(t) {
  const r = document.getElementById('hero').getBoundingClientRect();
  return {
    x: r.left + r.width  * 0.84 + Math.sin(t * 0.28) * 2.5,
    y: r.top  + r.height * 0.52 + Math.cos(t * 0.21) * 3.5,
  };
}
function getMarsVP(t) {
  const r = document.getElementById('about').getBoundingClientRect();
  return {
    x: r.left + r.width  * 0.08 + Math.cos(t * 0.23) * 3,
    y: r.top  + r.height * 0.50 + Math.sin(t * 0.31) * 2.5,
  };
}

// ── Bezier ─────────────────────────────────────────────────────────────────
function bez(p0, p1, p2, p3, u) {
  const m = 1 - u;
  return {
    x: m*m*m*p0.x + 3*m*m*u*p1.x + 3*m*u*u*p2.x + u*u*u*p3.x,
    y: m*m*m*p0.y + 3*m*m*u*p1.y + 3*m*u*u*p2.y + u*u*u*p3.y,
  };
}
function bezTan(p0, p1, p2, p3, u) {
  const m = 1 - u;
  return {
    x: 3*(m*m*(p1.x-p0.x) + 2*m*u*(p2.x-p1.x) + u*u*(p3.x-p2.x)),
    y: 3*(m*m*(p1.y-p0.y) + 2*m*u*(p2.y-p1.y) + u*u*(p3.y-p2.y)),
  };
}

// Transit out: Earth bottom → Mars top
// Both exit/entry tangents point LEFT → bezier with horizontal left-pointing controls
// The path goes upper-right to lower-left and crosses inPath in the middle = figure-8 node
function outPath(ev, mv) {
  const p0   = { x: ev.x, y: ev.y + ROCKET_OB };  // Earth bottom
  const p3   = { x: mv.x, y: mv.y - ROCKET_OB };  // Mars top
  const ctrl = Math.hypot(p3.x - p0.x, p3.y - p0.y) * 0.48;
  return {
    p0,
    p1: { x: p0.x - ctrl, y: p0.y },  // depart LEFT (CW Earth bottom tangent)
    p2: { x: p3.x + ctrl, y: p3.y },  // arrive from RIGHT going LEFT (CCW Mars top entry)
    p3,
  };
}

// Transit back: Mars bottom → Earth top
// Both exit/entry tangents point RIGHT → inverse of outPath
// The path goes lower-left to upper-right and crosses outPath in the middle = figure-8 node
function inPath(mv, ev) {
  const p0   = { x: mv.x, y: mv.y + ROCKET_OB };  // Mars bottom
  const p3   = { x: ev.x, y: ev.y - ROCKET_OB };  // Earth top
  const ctrl = Math.hypot(p3.x - p0.x, p3.y - p0.y) * 0.48;
  return {
    p0,
    p1: { x: p0.x + ctrl, y: p0.y },  // depart RIGHT (CCW Mars bottom tangent)
    p2: { x: p3.x - ctrl, y: p3.y },  // arrive from LEFT going RIGHT (CW Earth top entry)
    p3,
  };
}

// Ease-in only — rocket departs gently then travels at constant speed into orbit
// No ease-out: zero velocity on arrival causes a visible freeze before orbit starts
function transitEase(u) {
  if (u < 0.1) return 5 * u * u;
  return 0.05 + (u - 0.1) * (0.95 / 0.90);
}

// ── Drawing: Earth ─────────────────────────────────────────────────────────
function drawEarth(cx, cy) {
  // Atmospheric glow
  const glow = ctx.createRadialGradient(cx, cy, EARTH_R*0.9, cx, cy, EARTH_R*1.45);
  glow.addColorStop(0, 'rgba(100,180,240,0.12)');
  glow.addColorStop(1, 'rgba(100,180,240,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, EARTH_R*1.45, 0, Math.PI*2); ctx.fill();

  // Pale blue body
  const body = ctx.createRadialGradient(cx - EARTH_R*0.30, cy - EARTH_R*0.30, 0, cx, cy, EARTH_R);
  body.addColorStop(0,    '#b8dff0');  // icy pale highlight
  body.addColorStop(0.38, '#5da8cc');  // sky blue
  body.addColorStop(0.72, '#2b6a9a');  // ocean mid
  body.addColorStop(1,    '#14355a');  // dark limb
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(cx, cy, EARTH_R, 0, Math.PI*2); ctx.fill();

  // Clipped interior: soft green land wash + cloud glow
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, EARTH_R, 0, Math.PI*2); ctx.clip();
  ctx.translate(cx, cy);

  // Soft green wash (no distinct shapes)
  const landGrad = ctx.createRadialGradient(-EARTH_R*0.18, EARTH_R*0.08, 0, -EARTH_R*0.18, EARTH_R*0.08, EARTH_R*0.48);
  landGrad.addColorStop(0, 'rgba(90,160,75,0.36)');
  landGrad.addColorStop(1, 'rgba(90,160,75,0)');
  ctx.fillStyle = landGrad;
  ctx.fillRect(-EARTH_R, -EARTH_R, EARTH_R*2, EARTH_R*2);

  // Soft cloud glow (upper right)
  const cloudGrad = ctx.createRadialGradient(EARTH_R*0.12, -EARTH_R*0.32, 0, EARTH_R*0.12, -EARTH_R*0.32, EARTH_R*0.52);
  cloudGrad.addColorStop(0, 'rgba(255,255,255,0.26)');
  cloudGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = cloudGrad;
  ctx.fillRect(-EARTH_R, -EARTH_R, EARTH_R*2, EARTH_R*2);

  ctx.restore();
}

// ── Drawing: Moon (crescent) ───────────────────────────────────────────────
function moonPos(cx, cy, angle) {
  return { x: cx + MOON_A * Math.cos(angle), y: cy + MOON_B * Math.sin(angle) };
}

function drawMoon(mx, my) {
  const glow = ctx.createRadialGradient(mx, my, MOON_R*0.5, mx, my, MOON_R*2.2);
  glow.addColorStop(0, 'rgba(200,200,200,0.12)');
  glow.addColorStop(1, 'rgba(200,200,200,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(mx, my, MOON_R*2.2, 0, Math.PI*2); ctx.fill();

  const imgSize = crescentImg.width;
  ctx.drawImage(crescentImg, mx - imgSize/2, my - imgSize/2);
}

// ── Drawing: Mars ──────────────────────────────────────────────────────────
function drawMars(cx, cy) {
  // Warm dust glow
  const glow = ctx.createRadialGradient(cx, cy, MARS_R*0.9, cx, cy, MARS_R*1.4);
  glow.addColorStop(0, 'rgba(210,120,70,0.09)');
  glow.addColorStop(1, 'rgba(210,120,70,0)');
  ctx.fillStyle = glow;
  ctx.beginPath(); ctx.arc(cx, cy, MARS_R*1.4, 0, Math.PI*2); ctx.fill();

  // Light dusty terracotta body
  const body = ctx.createRadialGradient(cx - MARS_R*0.28, cy - MARS_R*0.28, 0, cx, cy, MARS_R);
  body.addColorStop(0,    '#edc4a8');  // pale dusty highlight
  body.addColorStop(0.38, '#c47850');  // warm terracotta
  body.addColorStop(0.72, '#8a4020');  // deeper rust
  body.addColorStop(1,    '#401808');  // dark limb
  ctx.fillStyle = body;
  ctx.beginPath(); ctx.arc(cx, cy, MARS_R, 0, Math.PI*2); ctx.fill();
}

// ── Drawing: Rocket ────────────────────────────────────────────────────────
function drawRocket(x, y, angle, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle + Math.PI / 2);
  ctx.scale(scale, scale);

  const h = 14, w = 5;  // smaller than moon (MOON_R=11, diameter=22)

  // Flame exhaust
  const flameGrad = ctx.createLinearGradient(0, h * 0.4, 0, h * 1.1);
  flameGrad.addColorStop(0,   'rgba(255,200,60,0.90)');
  flameGrad.addColorStop(0.4, 'rgba(255,100,20,0.60)');
  flameGrad.addColorStop(1,   'rgba(255,60,0,0)');
  ctx.fillStyle = flameGrad;
  ctx.beginPath();
  ctx.moveTo(-w * 0.55, h * 0.35);
  ctx.quadraticCurveTo(0, h * 1.05, w * 0.55, h * 0.35);
  ctx.closePath();
  ctx.fill();

  // Body
  const bodyGrad = ctx.createLinearGradient(-w/2, 0, w/2, 0);
  bodyGrad.addColorStop(0,   '#d0d0d0');
  bodyGrad.addColorStop(0.4, '#f5f5f5');
  bodyGrad.addColorStop(1,   '#a0a0a0');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.roundRect(-w/2, -h*0.35, w, h*0.72, 2);
  ctx.fill();

  // Nose cone
  ctx.fillStyle = '#e8e8e8';
  ctx.beginPath();
  ctx.moveTo(-w/2, -h*0.35);
  ctx.quadraticCurveTo(0, -h*0.65, 0, -h*0.65);
  ctx.quadraticCurveTo(0, -h*0.65, w/2, -h*0.35);
  ctx.closePath();
  ctx.fill();

  // Nose tip
  ctx.fillStyle = '#cc2200';
  ctx.beginPath();
  ctx.arc(0, -h*0.62, 1.2, 0, Math.PI*2);
  ctx.fill();

  // Fins
  ctx.fillStyle = '#b0b0b0';
  ctx.beginPath();
  ctx.moveTo(-w/2, h*0.28);
  ctx.lineTo(-w/2 - 3.5, h*0.42);
  ctx.lineTo(-w/2, h*0.10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(w/2, h*0.28);
  ctx.lineTo(w/2 + 3.5, h*0.42);
  ctx.lineTo(w/2, h*0.10);
  ctx.closePath();
  ctx.fill();

  // Window
  ctx.fillStyle = 'rgba(100,200,255,0.7)';
  ctx.beginPath();
  ctx.arc(0, -h*0.15, 1.8, 0, Math.PI*2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.restore();
}

// ── Trail — persists full loop, clears only on loop restart ───────────────
// Trail points are stored in DOCUMENT coordinates (y includes scrollY) so they
// stay attached to Earth/Mars (which are anchored to #hero / #about via
// getBoundingClientRect, i.e. they also live in document space).
const trail = [];
const TRAIL_MAX = 3600;  // 60fps × 60s = full loop
let lastLoopIdx = 0;

function pushTrail(x, y, loopIdx) {
  if (loopIdx !== lastLoopIdx) {
    trail.length = 0;
    lastLoopIdx = loopIdx;
  }
  trail.push({ x, y: y + window.scrollY });
  if (trail.length > TRAIL_MAX) trail.shift();
}

function drawTrail() {
  if (trail.length < 2) return;
  const sy = window.scrollY;
  ctx.save();
  ctx.setLineDash([3, 7]);
  ctx.lineWidth = 1;
  ctx.lineCap   = 'round';
  for (let i = 1; i < trail.length; i++) {
    const alpha = 0.04 + 0.12 * (i / trail.length);
    ctx.strokeStyle = `rgba(180,180,180,${alpha.toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(trail[i-1].x, trail[i-1].y - sy);
    ctx.lineTo(trail[i].x,   trail[i].y   - sy);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

// ── Main loop ──────────────────────────────────────────────────────────────
let _start = null;

function frame(ts) {
  if (!_start) _start = ts;
  const t       = (ts - _start) / 1000;
  const phase   = t % T_TOTAL;
  const loopIdx = Math.floor(t / T_TOTAL);

  const ev = getEarthVP(t);
  const mv = getMarsVP(t);

  const moonAngle  = (t / MOON_PERIOD) * Math.PI * 2;
  const moonP      = moonPos(ev.x, ev.y, moonAngle);
  const moonBehind = Math.sin(moonAngle) < 0;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // ── Rocket position ──
  let rx, ry, rangle;
  let behindEarth = false, behindMars = false;

  if (phase < T_EARTH) {
    // Orbit Earth CW: starts at top (θ=3π/2), ends at bottom after 1.5 laps (θ=9π/2)
    // Top entry tangent = RIGHT; bottom exit tangent = LEFT
    const θ = 3*Math.PI/2 + (phase / T_EARTH) * Math.PI * 3;
    rx = ev.x + ROCKET_OA * Math.cos(θ);
    ry = ev.y + ROCKET_OB * Math.sin(θ);
    rangle = Math.atan2(ROCKET_OB * Math.cos(θ), -ROCKET_OA * Math.sin(θ));
    behindEarth = Math.sin(θ) < 0;

  } else if (phase < T_EARTH + T_OUT) {
    // Transit: Earth bottom → Mars top (both tangents LEFT, crossing inPath)
    const u   = transitEase((phase - T_EARTH) / T_OUT);
    const b   = outPath(ev, mv);
    const p   = bez(b.p0, b.p1, b.p2, b.p3, u);
    const tan = bezTan(b.p0, b.p1, b.p2, b.p3, u);
    rx = p.x; ry = p.y;
    rangle = Math.atan2(tan.y, tan.x);

  } else if (phase < T_EARTH + T_OUT + T_MARS) {
    // Orbit Mars CCW: starts at top (θ=-π/2), ends at bottom after 4.5 laps (θ=-19π/2)
    // Top entry tangent = LEFT; bottom exit tangent = RIGHT
    const θ = -Math.PI/2 - ((phase - T_EARTH - T_OUT) / T_MARS) * Math.PI * 2 * 4.5;
    rx = mv.x + ROCKET_OA * Math.cos(θ);
    ry = mv.y + ROCKET_OB * Math.sin(θ);
    // CCW tangent: d(pos)/dt ∝ (ROCKET_OA*sin(θ), -ROCKET_OB*cos(θ))
    rangle = Math.atan2(-ROCKET_OB * Math.cos(θ), ROCKET_OA * Math.sin(θ));
    behindMars = Math.sin(θ) < 0;

  } else {
    // Transit: Mars bottom → Earth top (both tangents RIGHT, crossing outPath)
    const u   = transitEase((phase - T_EARTH - T_OUT - T_MARS) / T_BACK);
    const b   = inPath(mv, ev);
    const p   = bez(b.p0, b.p1, b.p2, b.p3, u);
    const tan = bezTan(b.p0, b.p1, b.p2, b.p3, u);
    rx = p.x; ry = p.y;
    rangle = Math.atan2(tan.y, tan.x);
  }

  pushTrail(rx, ry, loopIdx);

  // Export for text reflow
  roverState.x = rx;
  roverState.y = ry;
  roverState.active = true;

  // ── Draw — back to front ──
  drawTrail();

  // Rocket behind Earth (back half of Earth orbit)
  if (behindEarth) drawRocket(rx, ry, rangle, 1);

  // Moon + Earth
  if (moonBehind)  drawMoon(moonP.x, moonP.y);
  drawEarth(ev.x, ev.y);
  if (!moonBehind) drawMoon(moonP.x, moonP.y);

  // Rocket behind Mars (back half of Mars orbit), not already drawn behind Earth
  if (!behindEarth && behindMars) drawRocket(rx, ry, rangle, 1);
  drawMars(mv.x, mv.y);

  // Rocket in front of everything
  if (!behindEarth && !behindMars) drawRocket(rx, ry, rangle, 1);

  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
