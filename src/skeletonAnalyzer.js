import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

/**
 * Standard-HUD mit Huf-Ausschlagbalken & Schwellwert
 * - Standard-HUD links (#hud) mit Live-Messbalken für Toe-Höhe und Schwellwert-Markierung
 * - Standard lil-gui rechts für Parameter
 * - Hierarchie & Knochen-FK vollständig entfernt
 */
export class SkeletonAnalyzer {
  /**
   * @param {Object} context
   */
  constructor(context) {
    this.horse = context.horse;
    this.scene = context.scene;
    this.camera = context.camera;
    this.renderer = context.renderer;
    this.controls = context.controls;
    this.mixer = context.mixer;
    this.actions = context.actions;
    this.settings = context.settings;
    this.contactDetector = context.contactDetector;
    this.transitionTo = context.transitionTo;

    // 1. Standard-HUD Element mit Ausschlagbalken initialisieren
    this._initHUD();

    // 2. 3D-Skeletthelfer (optional über GUI zuschaltbar)
    this.skeletonHelper = new THREE.SkeletonHelper(this.horse);
    this.skeletonHelper.visible = false;
    this.scene.add(this.skeletonHelper);

    // 3. Standard lil-gui Bedienpanel
    this._initGUI();

    // 4. Tastatur-Shortcut (Leertaste für Play/Pause)
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        this.settings.paused = !this.settings.paused;
        if (this.mixer) this.mixer.timeScale = this.settings.paused ? 0 : this.settings.speed;
        this.gui.controllersRecursive().forEach((c) => c.updateDisplay());
      }
    });
  }

  /**
   * Standard-HUD DOM mit Balken und Schwellwert-Markierungen aufbauen
   */
  _initHUD() {
    this.hud = document.getElementById('hud');
    if (!this.hud) {
      this.hud = document.createElement('div');
      this.hud.id = 'hud';
      document.body.appendChild(this.hud);
    }

    this.hud.innerHTML = `
      <div class="hud-line"><span>Gangart</span><span id="hud-val-gait">Walk</span></div>
      <div class="hud-line"><span>Zeit</span><span id="hud-val-time">0.000 / 1.200 s</span></div>

      <div class="hud-section-title">HUF-HÖHEN (TOE Y) & SCHWELLWERT</div>

      <div class="hud-hoof-item" id="hud-hoof-FL">
        <div class="hud-hoof-row">
          <span class="hud-hoof-name">VL (Vorne L)</span>
          <span class="hud-hoof-val" id="hud-val-FL">0.000 m</span>
          <span class="hud-status-air" id="hud-status-FL">[LUFT]</span>
        </div>
        <div class="hud-meter-track">
          <div class="hud-meter-fill" id="hud-fill-FL"></div>
          <div class="hud-meter-notch" id="hud-notch-FL" title="Schwellwert Vorne"></div>
        </div>
      </div>

      <div class="hud-hoof-item" id="hud-hoof-FR">
        <div class="hud-hoof-row">
          <span class="hud-hoof-name">VR (Vorne R)</span>
          <span class="hud-hoof-val" id="hud-val-FR">0.000 m</span>
          <span class="hud-status-air" id="hud-status-FR">[LUFT]</span>
        </div>
        <div class="hud-meter-track">
          <div class="hud-meter-fill" id="hud-fill-FR"></div>
          <div class="hud-meter-notch" id="hud-notch-FR" title="Schwellwert Vorne"></div>
        </div>
      </div>

      <div class="hud-hoof-item" id="hud-hoof-HL">
        <div class="hud-hoof-row">
          <span class="hud-hoof-name">HL (Hinten L)</span>
          <span class="hud-hoof-val" id="hud-val-HL">0.000 m</span>
          <span class="hud-status-air" id="hud-status-HL">[LUFT]</span>
        </div>
        <div class="hud-meter-track">
          <div class="hud-meter-fill" id="hud-fill-HL"></div>
          <div class="hud-meter-notch" id="hud-notch-HL" title="Schwellwert Hinten"></div>
        </div>
      </div>

      <div class="hud-hoof-item" id="hud-hoof-HR">
        <div class="hud-hoof-row">
          <span class="hud-hoof-name">HR (Hinten R)</span>
          <span class="hud-hoof-val" id="hud-val-HR">0.000 m</span>
          <span class="hud-status-air" id="hud-status-HR">[LUFT]</span>
        </div>
        <div class="hud-meter-track">
          <div class="hud-meter-fill" id="hud-fill-HR"></div>
          <div class="hud-meter-notch" id="hud-notch-HR" title="Schwellwert Hinten"></div>
        </div>
      </div>

      <div class="hud-section-title">TELEMETRIE</div>
      <div class="hud-line"><span>Schwelle Vorne</span><span id="hud-thresh-front">0.155 m</span></div>
      <div class="hud-line"><span>Schwelle Hinten</span><span id="hud-thresh-back">0.265 m</span></div>
      <div class="hud-line-small"><span>Letzter Kontakt</span><span id="hud-last-impact">-</span></div>
    `;

    this.dom = {
      gait: document.getElementById('hud-val-gait'),
      time: document.getElementById('hud-val-time'),
      threshFront: document.getElementById('hud-thresh-front'),
      threshBack: document.getElementById('hud-thresh-back'),
      lastImpact: document.getElementById('hud-last-impact'),
      hooves: {
        FL: {
          val: document.getElementById('hud-val-FL'),
          status: document.getElementById('hud-status-FL'),
          fill: document.getElementById('hud-fill-FL'),
          notch: document.getElementById('hud-notch-FL')
        },
        FR: {
          val: document.getElementById('hud-val-FR'),
          status: document.getElementById('hud-status-FR'),
          fill: document.getElementById('hud-fill-FR'),
          notch: document.getElementById('hud-notch-FR')
        },
        HL: {
          val: document.getElementById('hud-val-HL'),
          status: document.getElementById('hud-status-HL'),
          fill: document.getElementById('hud-fill-HL'),
          notch: document.getElementById('hud-notch-HL')
        },
        HR: {
          val: document.getElementById('hud-val-HR'),
          status: document.getElementById('hud-status-HR'),
          fill: document.getElementById('hud-fill-HR'),
          notch: document.getElementById('hud-notch-HR')
        }
      }
    };
  }

  /**
   * Standard lil-gui initialisieren
   */
  _initGUI() {
    this.gui = new GUI({ title: 'Parameter' });

    // ── Animation & Playback ──────────────────────────────────
    const animFolder = this.gui.addFolder('Animation');
    const clipNames = Object.keys(this.actions || {});
    if (clipNames.length > 0) {
      animFolder
        .add(this.settings, 'currentAnimation', clipNames)
        .name('Gangart')
        .onChange((name) => {
          if (this.transitionTo) this.transitionTo(name);
        });
    }

    animFolder
      .add(this.settings, 'paused')
      .name('Pause')
      .onChange((paused) => {
        if (this.mixer) this.mixer.timeScale = paused ? 0 : this.settings.speed;
      });

    animFolder
      .add(this.settings, 'speed', 0.1, 2.5, 0.05)
      .name('Geschwindigkeit')
      .onChange((speed) => {
        if (this.mixer && !this.settings.paused) this.mixer.timeScale = speed;
      });

    animFolder
      .add(this.settings, 'crossfadeDuration', 0.1, 2.0, 0.1)
      .name('Crossfade (s)');

    // ── Biomechanik & Schwellwerte ────────────────────────────
    const bioFolder = this.gui.addFolder('Biomechanik');
    bioFolder
      .add(this.settings, 'thresholdFront', 0.1, 0.22, 0.005)
      .name('Schwelle Vorne (m)')
      .onChange((val) => {
        if (this.contactDetector) this.contactDetector.setThresholds(val, this.settings.thresholdBack);
      });

    bioFolder
      .add(this.settings, 'thresholdBack', 0.2, 0.32, 0.005)
      .name('Schwelle Hinten (m)')
      .onChange((val) => {
        if (this.contactDetector) this.contactDetector.setThresholds(this.settings.thresholdFront, val);
      });

    bioFolder
      .add({
        kalibrieren: () => {
          this.settings.thresholdFront = 0.155;
          this.settings.thresholdBack = 0.265;
          if (this.contactDetector) this.contactDetector.setThresholds(0.155, 0.265);
          this.gui.controllersRecursive().forEach((c) => c.updateDisplay());
        }
      }, 'kalibrieren')
      .name('Auto-Kalibrieren');

    // ── Ansicht & Helfer ──────────────────────────────────────
    const viewFolder = this.gui.addFolder('Ansicht');
    viewFolder
      .add(this.settings, 'showGroundRings')
      .name('Bodenringe & Linien')
      .onChange((val) => {
        this.settings.showHeightLines = val;
        if (this.contactDetector) this.contactDetector.setHelpersVisibility(val, val, false);
      });

    viewFolder
      .add({ skelett: false }, 'skelett')
      .name('Skelett (Bones)')
      .onChange((val) => {
        this.skeletonHelper.visible = val;
      });

    viewFolder
      .add({ drahtgitter: false }, 'drahtgitter')
      .name('Drahtgitter')
      .onChange((val) => {
        this.horse.traverse((child) => {
          if (child.isMesh && child.material) child.material.wireframe = val;
        });
      });

    viewFolder
      .add({ textur: 'Brown' }, 'textur', ['Brown', 'Dark Brown', 'Black', 'Grey', 'White'])
      .name('Felltextur')
      .onChange((val) => {
        const loader = new THREE.TextureLoader();
        loader.load(`/textures/${val}.png`, (tex) => {
          tex.flipY = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          this.horse.traverse((child) => {
            if (child.isMesh && child.material) {
              child.material.map = tex;
              child.material.needsUpdate = true;
            }
          });
        });
      });
  }

  /**
   * Wird jeden Frame aus der Render-Schleife aufgerufen
   */
  update(delta) {
    this._updateHUD();
  }

  /**
   * Biomechanik-Daten & Ausschlagbalken im Standard-HUD links aktualisieren
   */
  _updateHUD() {
    if (!this.dom || !this.contactDetector) return;

    const hooves = this.contactDetector.hoofList || [];
    const action = this.actions?.[this.settings.currentAnimation];
    const clipDuration = action ? (action.getClip().duration || 1.0) : 1.0;
    const clipTime = action ? (action.time % clipDuration) : 0.0;

    if (this.dom.gait) this.dom.gait.textContent = this.settings.currentAnimation || '-';
    if (this.dom.time) this.dom.time.textContent = `${clipTime.toFixed(3)} / ${clipDuration.toFixed(3)} s`;
    if (this.dom.threshFront) this.dom.threshFront.textContent = `${this.settings.thresholdFront.toFixed(3)} m`;
    if (this.dom.threshBack) this.dom.threshBack.textContent = `${this.settings.thresholdBack.toFixed(3)} m`;

    if (this.dom.lastImpact) {
      if (this.contactDetector.lastImpact) {
        const imp = this.contactDetector.lastImpact;
        this.dom.lastImpact.textContent = `${imp.name} (${imp.velocity.toFixed(2)} m/s)`;
      } else {
        this.dom.lastImpact.textContent = '-';
      }
    }

    // 60-FPS Update der 4 Huf-Ausschlagbalken & Schwellwertkerben
    hooves.forEach((h) => {
      const hoofDom = this.dom.hooves[h.id];
      if (!hoofDom) return;

      const isGrounded = h.isGrounded;
      const maxH = h.isFront ? 0.50 : 0.65;
      const percent = Math.min(100, Math.max(0, (h.currentY / maxH) * 100));
      const threshPercent = Math.min(100, Math.max(0, (h.threshold / maxH) * 100));

      hoofDom.val.textContent = `${h.currentY.toFixed(3)} m`;
      hoofDom.status.textContent = isGrounded ? '[BODEN]' : '[LUFT]';
      hoofDom.status.className = isGrounded ? 'hud-status-ground' : 'hud-status-air';

      // Ausschlagbalken: Breite folgt kontinuierlich der Hufhöhe
      hoofDom.fill.style.width = `${percent.toFixed(1)}%`;
      hoofDom.fill.className = isGrounded ? 'hud-meter-fill is-ground' : 'hud-meter-fill';

      // Schwellwertkerbe: Markiert exakt die Grenze Boden/Luft
      hoofDom.notch.style.left = `${threshPercent.toFixed(1)}%`;
    });
  }
}
