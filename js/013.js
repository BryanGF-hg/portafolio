import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

/* =========================================================
   DATOS
   ========================================================= */
const projects = [
  { title: "AutoCYP",   tags: ["Python","CLI"],          desc: "Herramienta en Python que genera estructuras predefinidas con cuatro puntos: introducción, desarrollo, aplicación y conclusión.", url: "https://github.com/BryanGF-hg/AutoCYP", image: "https://raw.githubusercontent.com/BryanGF-hg/Dir-Imagenes/refs/heads/main/Proyectos/AutoCYP/autocyp-preview.png" },
  { title: "WePlan",    tags: ["Web","Colaborativo"],    desc: "Proyecto en equipo con Ayman Mouzakki para recrear las fases del desarrollo de aplicaciones: conexión social de grupos locales con planificación de actividades.", url: "https://github.com/BryanGF-hg/WePlan", image: "https://raw.githubusercontent.com/BryanGF-hg/Dir-Imagenes/refs/heads/main/Proyectos/WePlan/pagina%20de%20inicio%20front-end%201.png" },
  { title: "FloMViDex", tags: ["Web","Audio"],           desc: "Reproductor musical web del género Maidcore. Proyecto en desarrollo durante el tercer trimestre, centrado en la experiencia de reproducción.", url: "https://github.com/BryanGF-hg/Proyecto-FloMViDex", image: "https://raw.githubusercontent.com/BryanGF-hg/Proyecto-FloMViDex/refs/heads/main/media/Images/paginas/landing-page.png" },
  { title: "Comanya",   tags: ["CRM"],                   desc: "CRM de competidores: organiza, compara y analiza información de mercado de otras empresas para equipos pequeños.", url: "https://github.com/BryanGF-hg/comanya", image: "https://raw.githubusercontent.com/BryanGF-hg/Dir-Imagenes/refs/heads/main/Proyectos/AutoCYP/autocyp-preview.png" },
  { title: "WAT",       tags: ["Python","Audio"],        desc: "Transcriptor de audios de WhatsApp: convierte mensajes de voz en texto útil para buscar información después.", url: "https://github.com/samonzfu/Transcriptor-Audios-WhatsApp", image: "https://raw.githubusercontent.com/BryanGF-hg/Dir-Imagenes/refs/heads/main/Proyectos/WePlan/pagina%20de%20actividades%20front-end.png" },
  { title: "Phosfytte", tags: ["Python","IA"],           desc: "Transcriptor de YouTube con resumen automático. Extrae la transcripción y genera los puntos principales del vídeo.", url: "https://github.com/BryanGF-hg/phosfytte-copilot", image: "https://raw.githubusercontent.com/BryanGF-hg/Proyecto-FloMViDex/refs/heads/main/media/Images/front-end/Frontend%20FLOMVIDEX.png" }
];

const N = projects.length;
const STEP = 360 / N;          // 60°
const RADIUS = 520;
const AUTO_MS = 3600;          // intervalo entre cambios automáticos

let currentIndex = 0;
let isPaused = false;
let autoTimer = null;
const cardObjects = [];

/* =========================================================
   1. UTILIDADES DE PÁGINA (reveal, count-up, copy)
   ========================================================= */
function setupReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
}

function setupCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach(el => io.observe(el));
}

function setupCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.classList.add('is-copied');
        const original = btn.textContent;
        btn.textContent = 'COPIADO ✓';
        setTimeout(() => {
          btn.classList.remove('is-copied');
          btn.textContent = original;
        }, 1600);
      } catch {
        btn.textContent = 'ERROR';
        setTimeout(() => { btn.textContent = 'COPIAR'; }, 1600);
      }
    });
  });
}

/* =========================================================
   2. WEBGL — partículas + suelo radial
   ========================================================= */
const stage = document.getElementById('carouselStage');
const canvas = document.getElementById('webgl-canvas');
const sceneW = new THREE.Scene();

const cameraW = new THREE.PerspectiveCamera(48, 1, 0.1, 3000);
cameraW.position.set(0, 30, 900);

const rendererW = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
rendererW.setPixelRatio(Math.min(window.devicePixelRatio, 2));
rendererW.setClearColor(0x000000, 0);

const floorGeo = new THREE.RingGeometry(200, 900, 96, 1);
const floorMat = new THREE.MeshBasicMaterial({
  color: 0x3E7C6B, transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false
});
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -240;
sceneW.add(floor);

const PCOUNT = 700;
const positions = new Float32Array(PCOUNT * 3);
const colors    = new Float32Array(PCOUNT * 3);
const cMenta    = new THREE.Color(0xA8E6CF);
const cAmanecer = new THREE.Color(0xF2C14E);
const cNaranja  = new THREE.Color(0xFF8A3D);

for (let i = 0; i < PCOUNT; i++) {
  positions[i*3]   = (Math.random() - 0.5) * 2600;
  positions[i*3+1] = (Math.random() - 0.5) * 1400;
  positions[i*3+2] = (Math.random() - 0.5) * 1800 - 400;
  const t = Math.random();
  const col = t < 0.6
    ? cMenta.clone().lerp(cAmanecer, Math.random() * 0.5)
    : cNaranja.clone().lerp(cAmanecer, Math.random());
  colors[i*3]   = col.r;
  colors[i*3+1] = col.g;
  colors[i*3+2] = col.b;
}

const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

const pMat = new THREE.PointsMaterial({
  size: 5, vertexColors: true, transparent: true, opacity: 0.55,
  sizeAttenuation: true, depthWrite: false
});
const particles = new THREE.Points(pGeo, pMat);
sceneW.add(particles);

/* =========================================================
   3. CSS3D — tarjetas en ángulos positivos
   ---------------------------------------------------------
   Card i en +STEP·i. Grupo rota a -STEP·index.
   Negativo = clockwise desde arriba (el frente barre a la izquierda).
   ========================================================= */
const container = document.getElementById('css3d-container');
const sceneC = new THREE.Scene();
const cameraC = new THREE.PerspectiveCamera(48, 1, 1, 4000);
cameraC.position.set(0, 30, 900);

const rendererC = new CSS3DRenderer();
rendererC.domElement.style.position = 'absolute';
rendererC.domElement.style.top = '0';
container.appendChild(rendererC.domElement);

const carouselGroup = new THREE.Group();
sceneC.add(carouselGroup);

projects.forEach((p, i) => {
  const card = document.createElement('div');
  card.className = 'card-3d';
  card.innerHTML = `
    <img src="${p.image}" alt="${p.title}" loading="lazy">
    <div class="overlay"><h3>${p.title}</h3><span>${p.tags.join(' · ')}</span></div>
  `;
  card.addEventListener('click', () => {
    if (i === currentIndex) window.location.href = p.url;
    else { goTo(i); resetAuto(); }
  });

  const obj = new CSS3DObject(card);
  const angleDeg = STEP * i;
  const angleRad = angleDeg * Math.PI / 180;
  obj.position.set(Math.sin(angleRad) * RADIUS, 0, Math.cos(angleRad) * RADIUS);
  obj.rotation.y = angleRad;

  carouselGroup.add(obj);
  cardObjects.push(obj);
});

/* =========================================================
   4. UI / ESTADO
   ========================================================= */
const panelInner   = document.getElementById('panelInner');
const panelCounter = document.getElementById('panelCounter');
const panelTags    = document.getElementById('panelTags');
const panelTitle   = document.getElementById('panelTitle');
const panelDesc    = document.getElementById('panelDesc');
const panelLink    = document.getElementById('panelLink');
const dotsWrap     = document.getElementById('dots');

projects.forEach((_, i) => {
  const d = document.createElement('button');
  d.className = 'dot';
  d.type = 'button';
  d.setAttribute('aria-label', `Ir al proyecto ${i+1}`);
  d.addEventListener('click', () => { goTo(i); resetAuto(); });
  dotsWrap.appendChild(d);
});

function updateUI() {
  panelInner.classList.add('is-changing');
  setTimeout(() => {
    const p = projects[currentIndex];
    panelCounter.textContent = `${String(currentIndex+1).padStart(2,'0')} / ${String(N).padStart(2,'0')}`;
    panelTags.innerHTML = p.tags.map(t => `<span class="panel-tag">${t}</span>`).join('');
    panelTitle.textContent = p.title;
    panelDesc.textContent  = p.desc;
    panelLink.href = p.url;
    panelInner.classList.remove('is-changing');
  }, 180);

  [...dotsWrap.children].forEach((d, i) =>
    d.classList.toggle('is-active', i === currentIndex));

  cardObjects.forEach((obj, i) => {
    obj.element.classList.toggle('is-active', i === currentIndex);
    const rel = ((i - currentIndex) % N + N) % N;
    obj.element.classList.toggle('is-near', rel === 1 || rel === N - 1);
  });
}

/* =========================================================
   5. ROTACIÓN CLOCKWISE
   ---------------------------------------------------------
   targetRad = -STEP·index  (negativo) => giro clockwise.
   Duración y easing hacen el movimiento visible y dinámico.
   ========================================================= */
function rotateTo(index) {
  const targetRad = -(STEP * index) * Math.PI / 180;
  gsap.to(carouselGroup.rotation, {
    y: targetRad,
    duration: 1.35,
    ease: "power3.inOut",
    overwrite: true
  });
}

function goTo(index) {
  currentIndex = ((index % N) + N) % N;
  rotateTo(currentIndex);
  updateUI();
}
function next() { goTo(currentIndex + 1); }
function prev() { goTo(currentIndex - 1); }

/* =========================================================
   6. AUTO-ROTACIÓN — arranca YA, sin gate de visibilidad
   ---------------------------------------------------------
   Sólo se detiene si:
     - la pestaña está oculta (document.hidden)
     - el usuario tiene el ratón sobre el carrusel (isPaused)
   Cuando el usuario navega manualmente, resetAuto() reinicia
   el temporizador para no chocar con su acción.
   ========================================================= */
function autoTick() {
  if (document.hidden) return;
  if (isPaused) return;
  next();
}

function startAuto() {
  clearInterval(autoTimer);
  autoTimer = setInterval(autoTick, AUTO_MS);
}
function resetAuto() { startAuto(); }

// Arranca nada más cargar (incluso si el carrusel está fuera del viewport)
startAuto();

// Pausa al pasar el ratón por encima
const carouselWrapper = document.getElementById('carouselWrapper');
if (carouselWrapper) {
  carouselWrapper.addEventListener('mouseenter', () => { isPaused = true; });
  carouselWrapper.addEventListener('mouseleave', () => { isPaused = false; });
}

// Pausa si el documento se oculta; reanuda al volver
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // No hace falta limpiar el interval, autoTick ya comprueba document.hidden
  } else {
    resetAuto();
  }
});

/* =========================================================
   7. CONTROLES (botones, teclado, swipe)
   ========================================================= */
document.getElementById('btnNext').addEventListener('click', () => { next(); resetAuto(); });
document.getElementById('btnPrev').addEventListener('click', () => { prev(); resetAuto(); });

document.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea, select')) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); next(); resetAuto(); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); resetAuto(); }
});

let tx = 0, ty = 0;
if (carouselWrapper) {
  carouselWrapper.addEventListener('touchstart', (e) => {
    if (!e.touches[0]) return;
    tx = e.touches[0].clientX;
    ty = e.touches[0].clientY;
  }, { passive: true });

  carouselWrapper.addEventListener('touchend', (e) => {
    if (!e.changedTouches[0]) return;
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) next(); else prev();
      resetAuto();
    }
  }, { passive: true });
}

/* =========================================================
   8. RESIZE — canvas desde el stage (no desde el viewport)
   ========================================================= */
function resize() {
  if (!stage) return;
  const w = stage.clientWidth;
  const h = stage.clientHeight;
  if (w === 0 || h === 0) return;

  cameraW.aspect = w / h; cameraW.updateProjectionMatrix();
  cameraC.aspect = w / h; cameraC.updateProjectionMatrix();
  rendererW.setSize(w, h);
  rendererC.setSize(w, h);
}

let rt;
window.addEventListener('resize', () => {
  clearTimeout(rt);
  rt = setTimeout(resize, 120);
});

/* =========================================================
   9. LOOP
   ========================================================= */
function animate() {
  requestAnimationFrame(animate);
  particles.rotation.y += 0.00012;
  particles.rotation.x += 0.00003;
  rendererW.render(sceneW, cameraW);
  rendererC.render(sceneC, cameraC);
}

/* =========================================================
   10. BOOT
   ========================================================= */
setupReveal();
setupCountUp();
setupCopyButtons();
updateUI();
rotateTo(0);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    resize();
    animate();
    // Por si acaso startAuto se llamó antes de tener dimensiones,
    // se vuelve a lanzar (no acumula porque hacemos clearInterval)
    startAuto();
  });
});
