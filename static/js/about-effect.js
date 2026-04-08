import { prepareWithSegments, layoutNextLine } from 'https://esm.sh/@chenglou/pretext';

const paras   = document.querySelectorAll('.about-para');
const canvases = document.querySelectorAll('.about-canvas');
if (!paras.length) throw new Error('about-para elements missing');
if (window.matchMedia('(max-width: 640px)').matches) {
  throw 0; // mobile: leave paragraphs visible, skip canvas effect
}

let globalMouseX = -9999;
let globalMouseY = -9999;
window.addEventListener('mousemove', e => { globalMouseX = e.clientX; globalMouseY = e.clientY; });

// Extract { text, bold } segments from a paragraph's child nodes
function getSegments(el) {
  const segs = [];
  for (const node of el.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      segs.push({ text: node.textContent, bold: false });
    } else if (node.nodeName === 'STRONG' || node.nodeName === 'B') {
      segs.push({ text: node.textContent, bold: true });
    }
  }
  return segs;
}

function buildBoldMap(segments) {
  const map = [];
  for (const seg of segments) {
    for (let i = 0; i < seg.text.length; i++) map.push(seg.bold);
  }
  return map;
}

function createEffect(para, canvas) {
  const ctx    = canvas.getContext('2d');
  const dpr    = Math.min(window.devicePixelRatio || 1, 2);
  const style  = getComputedStyle(para);
  const fontSize = parseFloat(style.fontSize);
  const normalFont = `400 ${fontSize}px Inter, system-ui, sans-serif`;
  const boldFont   = `700 ${fontSize}px Inter, system-ui, sans-serif`;
  const lineHeight = Math.round(fontSize * 1.8);

  const segments = getSegments(para);
  const fullText = segments.map(s => s.text).join('');
  const boldMap  = buildBoldMap(segments);
  let prepared   = null; // set after fonts.ready

  const state = { chars: [], layoutW: 0, layoutH: 0 };

  function buildLayout(exclusion) {
    if (!prepared) return;
    const rect = para.getBoundingClientRect();
    state.layoutW = Math.ceil(rect.width);

    canvas.width  = state.layoutW * dpr;
    canvas.height = Math.ceil(state.layoutW * 4 * dpr); // generous height for reflow
    canvas.style.width = state.layoutW + 'px';
    // height determined by content below
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = normalFont;

    const chars = [];
    let cursor = { segmentIndex: 0, graphemeIndex: 0 };
    let lineIdx = 0;
    let globalIdx = 0;

    while (lineIdx < 120) {
      const lineTopY = lineIdx * lineHeight;
      const lineBotY = lineTopY + lineHeight;
      const baseline = lineTopY + Math.round(lineHeight * 0.78);

      // Compute line exclusion from rover position
      let offsetX = 0;
      let maxW = state.layoutW;

      if (exclusion && exclusion.active) {
        const pad = exclusion.r + 10;
        const closestY = Math.max(lineTopY, Math.min(exclusion.y, lineBotY));
        const distY = Math.abs(closestY - exclusion.y);
        if (distY < pad) {
          const halfChord = Math.sqrt(pad * pad - distY * distY);
          const exL = exclusion.x - halfChord;
          const exR = exclusion.x + halfChord;
          if (exL > state.layoutW * 0.55) {
            // Rover on right: trim right end
            maxW = Math.max(exL - 6, 60);
          } else if (exR < state.layoutW * 0.45) {
            // Rover on left: push text right
            offsetX = exR + 6;
            maxW = Math.max(state.layoutW - offsetX, 60);
          } else {
            // Rover in centre: split — use left side only
            maxW = Math.max(exL - 6, 60);
          }
        }
      }

      const line = layoutNextLine(prepared, cursor, maxW);
      if (!line) break;

      let x = offsetX;
      for (const char of line.text) {
        const isBold = boldMap[globalIdx] || false;
        ctx.font = isBold ? boldFont : normalFont;
        const w = ctx.measureText(char).width;
        chars.push({ char, x, y: baseline, w, bold: isBold });
        x += w;
        globalIdx++;
      }

      cursor = line.end;
      lineIdx++;
    }

    // Update canvas display height to match content
    const contentH = lineIdx * lineHeight + Math.round(lineHeight * 0.3);
    state.layoutH  = contentH;
    canvas.height  = contentH * dpr;
    canvas.style.height = contentH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    state.chars = chars;
  }

  function draw() {
    const { chars, layoutW, layoutH } = state;
    ctx.clearRect(0, 0, layoutW, layoutH);

    const rect   = canvas.getBoundingClientRect();
    const mouseX = globalMouseX - rect.left;
    const mouseY = globalMouseY - rect.top;

    const RADIUS = 90, MAX_LIFT = 5;
    const NR = 85, NG = 85, NB = 85;   // --muted #555
    const AR = 45, AG = 58, AB = 140;   // --accent #2d3a8c

    for (const { char, x, y, w, bold } of chars) {
      const cx   = x + w / 2;
      const dist = Math.hypot(cx - mouseX, y - mouseY);
      const t    = Math.max(0, 1 - dist / RADIUS);
      const e    = t * t * (3 - 2 * t); // smoothstep

      ctx.fillStyle = `rgb(${Math.round(NR+(AR-NR)*e)},${Math.round(NG+(AG-NG)*e)},${Math.round(NB+(AB-NB)*e)})`;
      ctx.font = bold ? boldFont : normalFont;
      ctx.fillText(char, x, y - e * MAX_LIFT);
    }
  }

  return {
    canvas,
    para,
    draw,
    init() {
      prepared = prepareWithSegments(fullText, normalFont);
      buildLayout(null);
    },
    rebuild() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      buildLayout(null);
    },
  };
}

document.fonts.ready.then(() => {
  const effects = [];

  for (let i = 0; i < paras.length; i++) {
    const eff = createEffect(paras[i], canvases[i]);
    eff.init();
    canvases[i].style.display = 'block';
    paras[i].classList.add('about-para-hidden');
    effects.push(eff);
  }

  function loop() {
    for (const eff of effects) eff.draw();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const eff of effects) eff.rebuild();
    }, 100);
  });
});
