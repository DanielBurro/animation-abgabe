import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './style.css';
import { GroundContactDetector } from './groundContact.js';
import { SkeletonAnalyzer } from './skeletonAnalyzer.js';

// 1. Szene, Kamera & Renderer aufsetzen ────────────────────────
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1d23);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(5, 1.8, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// 1.1 Auf Fenstergröße reagieren ───────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 1.2 Orientierung im Raum: Gitter und Achsen ──────────────────
scene.add(new THREE.GridHelper(20, 20, 0x555a66, 0x2c3038));
scene.add(new THREE.AxesHelper(3));

// 2. Licht hinzufügen ──────────────────────────────────────────
scene.add(new THREE.AmbientLight(0xffffff, 1));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 8, 5); // Schräg von oben für plastischere Schatten
scene.add(keyLight);

// 3. Separate Textur laden ─────────────────────────────────────
const textureLoader = new THREE.TextureLoader();
const horseTexture = textureLoader.load('/textures/Brown.png');
horseTexture.flipY = false; 
horseTexture.colorSpace = THREE.SRGBColorSpace;

// ── 3.1 Animations-, Kontakt- und Studio-Setup ────────────────
const timer = new THREE.Timer();
let mixer;
let horse;
let contactDetector;
let skeletonAnalyzer;
const actions = {};
let activeAction;

const settings = {
  currentAnimation: '',
  crossfadeDuration: 0.5,
  speed: 1.0,
  paused: false,

  // ── Bodenkontakt & Schwellwerte ──
  thresholdFront: 0.155,
  thresholdBack: 0.265,
  showGroundRings: true,
  showHeightLines: true,
  showBoneMarkers: false
};

// Weicher Übergang zwischen Animationen
function transitionTo(nextName) {
  const nextAction = actions[nextName];
  if (!nextAction || nextAction === activeAction) return;

  nextAction.reset();
  nextAction.enabled = true;
  nextAction.play();

  activeAction.crossFadeTo(nextAction, settings.crossfadeDuration, true);
  activeAction = nextAction;
  settings.currentAnimation = nextName;
}

// 3.2 Kamerasteuerung ──────────────────────────────────────────
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0.7, 0);
controls.enableDamping = true;
controls.update();

// 4. GLB-Modell laden ──────────────────────────────────────────
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'models/Horse.glb',
  (gltf) => {
    horse = gltf.scene;

    horse.traverse((child) => {
      if (child.isMesh) {
        child.material.map = horseTexture;
        child.material.needsUpdate = true;
      }
    });

    scene.add(horse);
    console.log('Modell geladen:', gltf);

    // ── 4.1 Bodenkontakt-Erkennung initialisieren ──────────────────
    contactDetector = new GroundContactDetector(horse, scene, {
      thresholdFront: settings.thresholdFront,
      thresholdBack: settings.thresholdBack,
      showGroundRings: settings.showGroundRings,
      showHeightLines: settings.showHeightLines,
      showBoneMarkers: settings.showBoneMarkers
    });

    // ── 4.2 Animationen einrichten ─────────────────────────────────
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(horse);

      const animNames = [];
      gltf.animations.forEach((clip) => {
        actions[clip.name] = mixer.clipAction(clip);
        animNames.push(clip.name);
      });

      // Erste gefundene Animation abspielen
      settings.currentAnimation = animNames[0];
      activeAction = actions[settings.currentAnimation];
      activeAction.play();
    } else {
      console.warn('Keine Animationen in der GLB-Datei gefunden.');
    }

    // ── 4.3 Umfassendes Skelett- & Rigg-Analyse-Studio initialisieren ──
    skeletonAnalyzer = new SkeletonAnalyzer({
      horse,
      scene,
      camera,
      renderer,
      controls,
      mixer,
      actions,
      settings,
      contactDetector,
      transitionTo
    });
  },
  (progress) => {
    console.log(`Ladefortschritt: ${(progress.loaded / progress.total) * 100}%`);
  },
  (error) => {
    console.error('Fehler beim Laden des Modells:', error);
  }
);

// 5. Render-Schleife ───────────────────────────────────────────
function animate(timestamp) {
  requestAnimationFrame(animate);

  // Aktualisiert die interne Zeitmessung
  timer.update(timestamp);
  const delta = timer.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  if (horse) {
    horse.updateMatrixWorld(true);
  }

  // Bodenkontakt-Erkennung und Anzeige aktualisieren
  if (contactDetector) {
    try {
      contactDetector.update(delta, settings.currentAnimation);
    } catch (err) {
      console.error('[GroundContactDetector] Update-Fehler:', err);
    }
  }

  // Skelett-Studio & Posing-Engine aktualisieren
  if (skeletonAnalyzer) {
    try {
      skeletonAnalyzer.update(delta);
    } catch (err) {
      console.error('[SkeletonAnalyzer] Update-Fehler:', err);
    }
  }

  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);