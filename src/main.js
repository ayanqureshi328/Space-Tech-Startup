import * as THREE from 'three';
import './style.css';

const starCanvas = document.querySelector('#starfield');
const starContext = starCanvas.getContext('2d');
const stars = Array.from({ length: 180 }, () => ({ x: Math.random(), y: Math.random(), radius: Math.random() * 1.1 + 0.2, phase: Math.random() * 6.3, speed: Math.random() * 0.7 + 0.25 }));
let starFrame = 0;
let pointerX = 0;
let pointerY = 0;

function resizeStars() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  starCanvas.width = Math.floor(window.innerWidth * ratio);
  starCanvas.height = Math.floor(window.innerHeight * ratio);
  starCanvas.style.width = `${window.innerWidth}px`;
  starCanvas.style.height = `${window.innerHeight}px`;
  starContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}
function drawStars() {
  starContext.clearRect(0, 0, innerWidth, innerHeight);
  stars.forEach((star) => {
    const alpha = 0.35 + (Math.sin(starFrame * 0.012 * star.speed + star.phase) + 1) * 0.32;
    starContext.beginPath();
    starContext.arc(star.x * innerWidth + pointerX * star.radius * 3, star.y * innerHeight + pointerY * star.radius * 3, star.radius, 0, Math.PI * 2);
    starContext.fillStyle = `rgba(174, 219, 235, ${alpha})`;
    starContext.fill();
  });
  starFrame += 1;
  requestAnimationFrame(drawStars);
}
resizeStars();
drawStars();
window.addEventListener('resize', resizeStars);
window.addEventListener('pointermove', (event) => {
  pointerX = (event.clientX / innerWidth - 0.5) * 2;
  pointerY = (event.clientY / innerHeight - 0.5) * 2;
}, { passive: true });

const globeContainer = document.querySelector('#globe-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.z = 5.4;
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
globeContainer.appendChild(renderer.domElement);

function makeEarthTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const context = canvas.getContext('2d');
  context.fillStyle = '#091c2a';
  context.fillRect(0, 0, 1024, 512);
  context.strokeStyle = 'rgba(34,211,238,.14)';
  context.lineWidth = 1;
  for (let x = 0; x <= 1024; x += 64) { context.beginPath(); context.moveTo(x, 0); context.lineTo(x, 512); context.stroke(); }
  for (let y = 0; y <= 512; y += 42) { context.beginPath(); context.moveTo(0, y); context.lineTo(1024, y); context.stroke(); }
  const continents = [
    [[70,83],[104,62],[147,70],[164,91],[193,99],[212,124],[195,149],[170,150],[160,174],[137,190],[124,218],[108,213],[104,185],[85,170],[72,145],[55,132],[59,106]],
    [[179,216],[204,222],[217,247],[211,277],[198,304],[194,340],[174,375],[158,364],[161,329],[147,301],[153,267],[163,243]],
    [[445,91],[480,81],[502,93],[521,86],[546,94],[555,115],[542,129],[515,126],[499,142],[476,135],[462,119]],
    [[474,143],[508,140],[534,159],[529,184],[544,207],[533,247],[511,282],[493,267],[481,237],[464,214],[461,182]],
    [[532,99],[576,72],[632,81],[662,69],[696,89],[739,86],[771,111],[758,132],[725,127],[704,151],[667,141],[644,158],[620,144],[593,157],[565,137],[541,128]],
    [[704,160],[739,151],[762,171],[749,192],[722,189]],[[729,261],[762,245],[787,255],[798,272],[778,291],[746,286]],[[837,311],[869,298],[897,313],[902,334],[879,348],[851,341]],
  ];
  const land = context.createLinearGradient(0, 70, 0, 370);
  land.addColorStop(0, '#45d7da'); land.addColorStop(1, '#1385a4');
  context.fillStyle = land; context.strokeStyle = 'rgba(144,243,241,.75)'; context.lineWidth = 1.2;
  continents.forEach((shape) => {
    context.beginPath();
    shape.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y));
    context.closePath(); context.fill(); context.stroke();
  });
  for (let index = 0; index < 220; index += 1) {
    context.fillStyle = `rgba(112,238,244,${Math.random() * 0.55 + 0.12})`;
    context.fillRect(Math.random() * 1024, Math.random() * 512, 1.5, 1.5);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

const planet = new THREE.Group();
scene.add(planet);
const globe = new THREE.Mesh(new THREE.SphereGeometry(1.45, 72, 72), new THREE.MeshPhongMaterial({ map: makeEarthTexture(), shininess: 24, specular: new THREE.Color('#1888a0') }));
globe.rotation.z = -0.22;
planet.add(globe);
planet.add(new THREE.Mesh(new THREE.SphereGeometry(1.49, 64, 64), new THREE.MeshBasicMaterial({ color: '#22d3ee', transparent: true, opacity: 0.075, side: THREE.BackSide })));
scene.add(new THREE.AmbientLight('#7ab8ca', 1.2));
const keyLight = new THREE.DirectionalLight('#b6ffff', 2.1); keyLight.position.set(-3, 2, 4); scene.add(keyLight);
const rimLight = new THREE.PointLight('#16a6cc', 9, 10); rimLight.position.set(2, -1, -2); scene.add(rimLight);

function addOrbit(radius, rotationX, rotationY, opacity) {
  const points = Array.from({ length: 181 }, (_, index) => {
    const angle = index / 180 * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });
  const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: '#36cae0', transparent: true, opacity }));
  line.rotation.set(rotationX, rotationY, 0.18); planet.add(line); return line;
}
addOrbit(1.8, 1.12, 0.12, 0.45);
addOrbit(1.98, 0.45, 1.13, 0.22);
const satelliteOrbit = addOrbit(2.07, 1.72, 0.62, 0.52);
const satellite = new THREE.Mesh(new THREE.OctahedronGeometry(0.055), new THREE.MeshBasicMaterial({ color: '#b3fbff' }));
planet.add(satellite);

let dragging = false;
let lastX = 0;
let lastY = 0;
let targetX = -0.08;
let targetY = 0.28;
globeContainer.addEventListener('pointerdown', (event) => {
  dragging = true; lastX = event.clientX; lastY = event.clientY;
  globeContainer.classList.add('is-dragging'); globeContainer.setPointerCapture(event.pointerId);
});
globeContainer.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  targetY += (event.clientX - lastX) * 0.006; targetX += (event.clientY - lastY) * 0.004;
  lastX = event.clientX; lastY = event.clientY;
});
function stopDragging() { dragging = false; globeContainer.classList.remove('is-dragging'); }
globeContainer.addEventListener('pointerup', stopDragging);
globeContainer.addEventListener('pointercancel', stopDragging);
function resizeGlobe() {
  const width = Math.max(globeContainer.clientWidth, 1);
  const height = Math.max(globeContainer.clientHeight, 1);
  camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height);
}
new ResizeObserver(resizeGlobe).observe(globeContainer);
const clock = new THREE.Clock();
function animateGlobe() {
  const elapsed = clock.getElapsedTime();
  if (!dragging) targetY += 0.0015;
  planet.rotation.y += (targetY - planet.rotation.y) * 0.06;
  planet.rotation.x += (targetX - planet.rotation.x) * 0.06;
  satellite.position.set(Math.cos(elapsed * 0.6) * 2.07, Math.sin(elapsed * 0.6) * 2.07, 0);
  satellite.rotation.set(elapsed, elapsed * 0.7, 0);
  satelliteOrbit.rotation.z = elapsed * 0.12;
  renderer.render(scene, camera); requestAnimationFrame(animateGlobe);
}
resizeGlobe(); animateGlobe();

const orbitSection = document.querySelector('#orbit-draw');
const orbitPaths = [...document.querySelectorAll('.orbit-path')];
orbitPaths.forEach((path) => { const length = path.getTotalLength(); path.style.strokeDasharray = length; path.style.strokeDashoffset = length; });
let scrollFrame = 0;
function drawOrbitsOnScroll() {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    const bounds = orbitSection.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, (innerHeight - bounds.top) / (bounds.height + innerHeight * 0.25)));
    orbitPaths.forEach((path, index) => {
      const length = path.getTotalLength();
      path.style.strokeDashoffset = length * (1 - Math.max(0, Math.min(1, progress * 1.12 - index * 0.04)));
    });
    scrollFrame = 0;
  });
}
window.addEventListener('scroll', drawOrbitsOnScroll, { passive: true }); drawOrbitsOnScroll();

const revealObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target); }
}), { threshold: 0.14 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.main-nav');
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !open);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); navigation.classList.remove('is-open');
}));
document.querySelector('.contact-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = new FormData(event.currentTarget).get('name').trim();
  document.querySelector('.form-feedback').textContent = `Thanks, ${name}. We’ll be in touch soon.`;
  event.currentTarget.reset();
});