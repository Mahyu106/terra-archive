/* ============================================================
   threeMap.js
   -------------------------------------------------------------
   Peta 3D sungguhan pakai Three.js. Bidang datar bertekstur
   gambar peta, dengan marker bola kecil sebagai titik interaktif.
   Kamera bisa diputar (drag), di-zoom (scroll), dan digeser
   (klik-kanan-drag) lewat OrbitControls bawaan Three.js.
============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let scene, camera, renderer, controls, raycaster, mouse, markerGroup;
const PLANE_RATIO = 2190 / 1240; // sesuaikan dengan rasio gambar terra-map.jpg

function initThreeMap() {
  const stage = document.getElementById('mapStage');
  stage.innerHTML = '';

  const width = stage.clientWidth;
  const height = stage.clientHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05070a);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 6, 7);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  stage.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 3;
  controls.maxDistance = 14;
  controls.maxPolarAngle = Math.PI / 2.1;

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(3, 8, 4);
  scene.add(dirLight);



// segments tinggi (200x200) supaya permukaan cukup halus saat "ditonjolkan"
const planeGeo = new THREE.PlaneGeometry(10, 10 / PLANE_RATIO, 200, 200);
applyProceduralTerrain(planeGeo);

const planeMat = new THREE.MeshStandardMaterial({
  vertexColors: true,
  side: THREE.DoubleSide
});

const plane = new THREE.Mesh(planeGeo, planeMat);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);
  markerGroup = new THREE.Group();
  scene.add(markerGroup);
  buildMarkers(planeGeo);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  renderer.domElement.addEventListener('click', onMapClick);

  window.addEventListener('resize', onResize);
  animate();
}

function buildMarkers(planeGeo) {
  const w = planeGeo.parameters.width;
  const h = planeGeo.parameters.height;

  DATA.forEach(item => {
    const localX = (item.pos_x / 100 - 0.5) * w;
    const localZ = (item.pos_y / 100 - 0.5) * h;

    const markerGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const markerMat = new THREE.MeshBasicMaterial({
      color: item.category === 'Organization' ? 0x4a8c96 : 0xf2a339
    });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.set(localX, 0.05, localZ);
    marker.userData.id = item.id;

    markerGroup.add(marker);
    TerraApp.nodeEls[item.id] = marker; // dipakai lagi oleh panel.js & filters.js
  });
}

function onMapClick(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(markerGroup.children);

  if (intersects.length > 0) {
    openPanel(intersects[0].object.userData.id);
  }
}

function onResize() {
  const stage = document.getElementById('mapStage');
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

// Tunggu sinyal dari app.js bahwa data dari database sudah selesai dimuat
document.addEventListener('terra-data-ready', initThreeMap);

// Noise sederhana berbasis sinus (tidak perlu library tambahan)
function noise2D(x, y) {
  return (
    Math.sin(x * 1.3 + y * 0.7) * 0.5 +
    Math.sin(x * 2.9 - y * 1.9) * 0.25 +
    Math.sin(x * 5.1 + y * 4.3) * 0.125
  );
}

function applyProceduralTerrain(geo) {
  const pos = geo.attributes.position;
  const elevations = [];

  const colorLow  = new THREE.Color(0x0d1420); // lembah — biru gelap
  const colorMid  = new THREE.Color(0x8a6a3a); // dataran — cokelat keemasan
  const colorHigh = new THREE.Color(0xf2e6c8); // puncak — krem terang

  let minZ = Infinity, maxZ = -Infinity;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const elevation = noise2D(x * 0.4, y * 0.4) * 0.5;
    pos.setZ(i, elevation);
    elevations.push(elevation);
    minZ = Math.min(minZ, elevation);
    maxZ = Math.max(maxZ, elevation);
  }

  const colors = [];
  for (let i = 0; i < pos.count; i++) {
    const t = (elevations[i] - minZ) / (maxZ - minZ); // dinormalisasi 0..1
    const c = new THREE.Color();
    if (t < 0.5) {
      c.lerpColors(colorLow, colorMid, t / 0.5);
    } else {
      c.lerpColors(colorMid, colorHigh, (t - 0.5) / 0.5);
    }
    colors.push(c.r, c.g, c.b);
  }

  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();
}