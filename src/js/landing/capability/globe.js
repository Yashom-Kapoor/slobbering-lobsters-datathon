// Palette anchors: --c1, --c3, --c5, --accent (hex → normalised RGB)
const C1 = [0x16/255, 0x4e/255, 0x63/255];
const C3 = [0x08/255, 0x91/255, 0xb2/255];
const C5 = [0x67/255, 0xe8/255, 0xf9/255];
const CA = [0x38/255, 0xbd/255, 0xf8/255];

function lerpColor(a, b, t) {
  return [a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];
}

export function initGlobe() {
  const container = document.getElementById('cap-right');
  const canvas    = document.getElementById('globe-canvas');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 2.6;

  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Particle sphere (Fibonacci lattice for even distribution) ─────────────────
  const N         = 4000;
  const positions = new Float32Array(N * 3);
  const colors    = new Float32Array(N * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < N; i++) {
    const y     = 1 - (i / (N - 1)) * 2;   // south pole (-1) → north pole (+1)
    const r     = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    positions[i*3]   = r * Math.cos(theta);
    positions[i*3+1] = y;
    positions[i*3+2] = r * Math.sin(theta);

    const t   = (y + 1) / 2;               // normalise to 0–1
    const col = Math.random() < 0.05
      ? CA
      : (t < 0.5 ? lerpColor(C1, C3, t * 2) : lerpColor(C3, C5, (t - 0.5) * 2));
    colors[i*3]   = col[0];
    colors[i*3+1] = col[1];
    colors[i*3+2] = col[2];
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  const mat   = new THREE.PointsMaterial({ size: 0.014, vertexColors: true, transparent: true, opacity: 0.85 });
  const globe = new THREE.Points(geo, mat);
  scene.add(globe);

  // ── Faint lat/lon wireframe grid ──────────────────────────────────────────────
  const gridMat = new THREE.LineBasicMaterial({ color: 0x164e63, transparent: true, opacity: 0.25 });

  [-60, -30, 0, 30, 60].forEach(lat => {
    const pts = [];
    for (let lon = 0; lon <= 360; lon += 4) {
      const phi = (90 - lat) * Math.PI / 180;
      pts.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(lon * Math.PI / 180),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(lon * Math.PI / 180)
      ));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  });

  for (let lon = 0; lon < 360; lon += 30) {
    const pts = [];
    for (let lat = -90; lat <= 90; lat += 3) {
      const phi = (90 - lat) * Math.PI / 180;
      pts.push(new THREE.Vector3(
        Math.sin(phi) * Math.cos(lon * Math.PI / 180),
        Math.cos(phi),
        Math.sin(phi) * Math.sin(lon * Math.PI / 180)
      ));
    }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), gridMat));
  }

  // ── Scroll-driven rotation ────────────────────────────────────────────────────
  let scrollRotation = 0;
  ScrollTrigger.create({
    trigger: '#capability',
    start: 'top bottom', end: 'bottom top',
    onUpdate: self => { scrollRotation = self.progress * Math.PI * 1.4; },
  });

  // ── Mouse-reactive tilt (desktop only) ───────────────────────────────────────
  if (window.innerWidth > 768) {
    const tiltX = gsap.quickTo(globe.rotation, 'x', { duration: 1.4, ease: 'power2' });
    const tiltY = gsap.quickTo(globe.rotation, 'y', { duration: 1.4, ease: 'power2' });
    window.addEventListener('mousemove', e => {
      tiltX(-(e.clientY / window.innerHeight - 0.5) * 0.3);
      tiltY((e.clientX / window.innerWidth  - 0.5) * 0.4 + scrollRotation);
    });
  }

  // ── Render loop ───────────────────────────────────────────────────────────────
  let baseRotation = 0;
  (function animate() {
    requestAnimationFrame(animate);
    baseRotation += 0.0025;
    globe.rotation.y = baseRotation + scrollRotation;
    renderer.render(scene, camera);
  })();
}
