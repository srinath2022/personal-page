import { prepareWithSegments, layoutWithLines } from 'https://esm.sh/@chenglou/pretext';

const h1 = document.querySelector('.hero-title');
const canvas = document.getElementById('hero-canvas');
if (!h1 || !canvas) throw new Error('hero elements missing');

const ctx = canvas.getContext('2d');
const dpr = Math.min(window.devicePixelRatio || 1, 2);
const text = h1.textContent.trim();

let mouseX = -9999;
let mouseY = -9999;
let chars = [];
let layoutW = 0;
let layoutH = 0;
let currentFont = '';
let currentLineHeight = 0;

function buildLayout() {
  const style = getComputedStyle(h1);
  const fontSize = parseFloat(style.fontSize);
  currentFont = `700 ${fontSize}px Inter, system-ui, sans-serif`;
  currentLineHeight = Math.round(fontSize * 1.3);

  const rect = h1.getBoundingClientRect();
  layoutW = Math.ceil(rect.width);

  const prepared = prepareWithSegments(text, currentFont);
  const result = layoutWithLines(prepared, layoutW, currentLineHeight);
  layoutH = Math.ceil(result.height) + Math.round(currentLineHeight * 0.3);

  canvas.width = layoutW * dpr;
  canvas.height = layoutH * dpr;
  canvas.style.width = layoutW + 'px';
  canvas.style.height = layoutH + 'px';

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = currentFont;

  // Build per-character positions from Pretext lines
  chars = [];
  for (let i = 0; i < result.lines.length; i++) {
    const line = result.lines[i];
    // approximate baseline: ~78% down the line height
    const baseline = i * currentLineHeight + Math.round(currentLineHeight * 0.78);
    let x = 0;
    for (const char of line.text) {
      const w = ctx.measureText(char).width;
      if (char.trim() !== '') {
        chars.push({ char, x, y: baseline, w });
      }
      x += w;
    }
  }
}

function draw() {
  ctx.clearRect(0, 0, layoutW, layoutH);
  ctx.font = currentFont;

  const RADIUS = 90;
  const MAX_LIFT = 7;
  // accent color: #2d3a8c, normal: #111111
  const AR = 45, AG = 58, AB = 140;
  const NR = 17, NG = 17, NB = 17;

  for (const { char, x, y, w } of chars) {
    const cx = x + w / 2;
    const dist = Math.hypot(cx - mouseX, y - mouseY);
    const t = Math.max(0, 1 - dist / RADIUS);
    const ease = t * t * (3 - 2 * t); // smoothstep

    const r = Math.round(NR + (AR - NR) * ease);
    const g = Math.round(NG + (AG - NG) * ease);
    const b = Math.round(NB + (AB - NB) * ease);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillText(char, x, y - ease * MAX_LIFT);
  }

  requestAnimationFrame(draw);
}

document.fonts.ready.then(() => {
  buildLayout();
  canvas.style.display = 'block';
  h1.classList.add('hero-h1-hidden');
  requestAnimationFrame(draw);
});

window.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

window.addEventListener('mouseleave', () => {
  mouseX = -9999;
  mouseY = -9999;
});

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    buildLayout();
  }, 100);
});
