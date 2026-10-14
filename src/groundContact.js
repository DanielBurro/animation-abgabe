import * as THREE from 'three';

/**
 * Konfiguration und Definition der 4 Hufe/Zehen des Pferdes:
 * - Vorne Links  (FL): 'E_front_toeL'
 * - Vorne Rechts (FR): 'E_front_toeR'
 * - Hinten Links (HL): 'E_toeL'
 * - Hinten Rechts (HR): 'E_toeR'
 */
export const HOOF_DEFINITIONS = [
  { id: 'FL', name: 'Vorne Links',  boneName: 'E_front_toeL', isFront: true },
  { id: 'FR', name: 'Vorne Rechts', boneName: 'E_front_toeR', isFront: true },
  { id: 'HL', name: 'Hinten Links', boneName: 'E_toeL',       isFront: false },
  { id: 'HR', name: 'Hinten Rechts',boneName: 'E_toeR',       isFront: false }
];

export class GroundContactDetector {
  /**
   * @param {THREE.Object3D} horseModel - Das geladene GLTF-Pferdemodell
   * @param {THREE.Scene} scene - Die Three.js-Szene für Hilfs-Visualisierungen
   * @param {Object} options - Initiale Konfiguration
   */
  constructor(horseModel, scene, options = {}) {
    this.horse = horseModel;
    this.scene = scene;

    // Empirisch ermittelte Schwellwerte für die Knochenhöhe (Y in Metern)
    // Front Toes liegen bei Bodenkontakt bei ca. 0.135 - 0.142 m
    // Rear Toes liegen bei Bodenkontakt bei ca. 0.241 - 0.254 m
    this.thresholdFront = options.thresholdFront ?? 0.155;
    this.thresholdBack = options.thresholdBack ?? 0.265;

    // Callbacks für Events (z. B. für spätere Erweiterungen wie Aufprall-Effekte)
    this.impactListeners = [];
    this.liftOffListeners = [];

    // Zustandstracker für jeden Huf
    this.hooves = {};
    this.hoofList = [];

    // 3D Visualisierungs-Objekte
    this.showGroundRings = options.showGroundRings ?? true;
    this.showHeightLines = options.showHeightLines ?? true;
    this.showBoneMarkers = options.showBoneMarkers ?? false;

    this.helpersGroup = new THREE.Group();
    this.helpersGroup.name = 'GroundContactHelpers';
    this.scene.add(this.helpersGroup);

    this._initHooves();
    this._createVisualHelpers();
    this._createHUD();
  }

  /**
   * Knochen im Skelett suchen und Datenstrukturen vorbereiten
   */
  _initHooves() {
    HOOF_DEFINITIONS.forEach((def) => {
      const bone = this.horse.getObjectByName(def.boneName);
      if (!bone) {
        console.warn(`[GroundContactDetector] Knochen nicht gefunden: ${def.boneName}`);
      }

      const hoofState = {
        id: def.id,
        name: def.name,
        boneName: def.boneName,
        isFront: def.isFront,
        bone: bone,
        worldPosition: new THREE.Vector3(),
        lastWorldPosition: new THREE.Vector3(),
        currentY: 0,
        isGrounded: false,
        wasGrounded: false,
        groundTime: 0,
        airTime: 0,
        threshold: def.isFront ? this.thresholdFront : this.thresholdBack,
        impactVelocity: 0,
        impactCount: 0
      };

      this.hooves[def.id] = hoofState;
      this.hoofList.push(hoofState);
    });
  }

  /**
   * 3D-Marker auf dem Boden und Höhenlinien erstellen
   */
  _createVisualHelpers() {
    this.visuals = {};

    this.hoofList.forEach((hoof) => {
      const group = new THREE.Group();

      // 1. Bodenring / Kontakt-Scheibe auf Y = 0.002 (knapp über dem Grid zur Vermeidung von Z-Fighting)
      const ringGeo = new THREE.RingGeometry(0.04, 0.09, 32);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide,
        depthWrite: false
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);

      // Innere gefüllte Scheibe bei Kontakt
      const discGeo = new THREE.CircleGeometry(0.04, 24);
      discGeo.rotateX(-Math.PI / 2);
      const discMat = new THREE.MeshBasicMaterial({
        color: 0x34d399,
        transparent: true,
        opacity: 0.5,
        depthWrite: false
      });
      const disc = new THREE.Mesh(discGeo, discMat);
      ring.add(disc);

      // 2. Vertikale Höhenlinie vom Knochen zum Boden
      const linePositions = new Float32Array([0, 0, 0, 0, 0.2, 0]);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6
      });
      const line = new THREE.Line(lineGeo, lineMat);

      // 3. Knochen-Kugel-Marker
      const sphereGeo = new THREE.SphereGeometry(0.025, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: false
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.visible = this.showBoneMarkers;

      group.add(ring);
      group.add(line);
      group.add(sphere);
      this.helpersGroup.add(group);

      this.visuals[hoof.id] = {
        group,
        ring,
        ringMat,
        disc,
        discMat,
        line,
        lineGeo,
        lineMat,
        sphere,
        sphereMat
      };
    });
  }

  /**
   * Modernes HTML-HUD für die Anzeige erstellen
   */
  _createHUD() {
    this.hudContainer = document.createElement('div');
    this.hudContainer.id = 'ground-contact-hud';
    this.hudContainer.className = 'contact-hud';

    this.hudContainer.innerHTML = `
      <div class="hud-header">
        <div class="hud-title">
          <span class="hud-icon">🐎</span> Hufkontakt
        </div>
        <div class="hud-gait-badge" id="hud-gait">Gangart: -</div>
      </div>

      <div class="hud-list">
        <div class="hud-card" id="card-FL">
          <div class="card-row">
            <div class="card-title">
              <span class="card-tag">VL</span>
              <span class="card-label">Vorne Links</span>
            </div>
            <span class="status-badge badge-air" id="badge-FL">LUFT</span>
          </div>
          <div class="card-sub-row">
            <span class="metric-value" id="val-FL">0.000 m</span>
            <div class="meter-bar">
              <div class="meter-fill" id="fill-FL"></div>
              <div class="meter-threshold" id="thresh-FL" style="left: ${(this.thresholdFront / 0.5 * 100).toFixed(1)}%;"></div>
            </div>
          </div>
        </div>

        <div class="hud-card" id="card-FR">
          <div class="card-row">
            <div class="card-title">
              <span class="card-tag">VR</span>
              <span class="card-label">Vorne Rechts</span>
            </div>
            <span class="status-badge badge-air" id="badge-FR">LUFT</span>
          </div>
          <div class="card-sub-row">
            <span class="metric-value" id="val-FR">0.000 m</span>
            <div class="meter-bar">
              <div class="meter-fill" id="fill-FR"></div>
              <div class="meter-threshold" id="thresh-FR" style="left: ${(this.thresholdFront / 0.5 * 100).toFixed(1)}%;"></div>
            </div>
          </div>
        </div>

        <div class="hud-card" id="card-HL">
          <div class="card-row">
            <div class="card-title">
              <span class="card-tag">HL</span>
              <span class="card-label">Hinten Links</span>
            </div>
            <span class="status-badge badge-air" id="badge-HL">LUFT</span>
          </div>
          <div class="card-sub-row">
            <span class="metric-value" id="val-HL">0.000 m</span>
            <div class="meter-bar">
              <div class="meter-fill" id="fill-HL"></div>
              <div class="meter-threshold" id="thresh-HL" style="left: ${(this.thresholdBack / 0.5 * 100).toFixed(1)}%;"></div>
            </div>
          </div>
        </div>

        <div class="hud-card" id="card-HR">
          <div class="card-row">
            <div class="card-title">
              <span class="card-tag">HR</span>
              <span class="card-label">Hinten Rechts</span>
            </div>
            <span class="status-badge badge-air" id="badge-HR">LUFT</span>
          </div>
          <div class="card-sub-row">
            <span class="metric-value" id="val-HR">0.000 m</span>
            <div class="meter-bar">
              <div class="meter-fill" id="fill-HR"></div>
              <div class="meter-threshold" id="thresh-HR" style="left: ${(this.thresholdBack / 0.5 * 100).toFixed(1)}%;"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="hud-footer">
        <div class="threshold-info">
          <div class="threshold-row">
            <span>Schwelle Vorne:</span>
            <strong id="thresh-info-front">${this.thresholdFront.toFixed(3)} m</strong>
          </div>
          <div class="threshold-row">
            <span>Schwelle Hinten:</span>
            <strong id="thresh-info-back">${this.thresholdBack.toFixed(3)} m</strong>
          </div>
        </div>
        <div class="impact-event-ticker" id="hud-impact-ticker">
          Bereit für Erkennung...
        </div>
      </div>
    `;

    document.body.appendChild(this.hudContainer);

    // DOM-Referenzen cachen für maximale Performance
    this.domElements = {
      gait: document.getElementById('hud-gait'),
      ticker: document.getElementById('hud-impact-ticker'),
      threshFront: document.getElementById('thresh-info-front'),
      threshBack: document.getElementById('thresh-info-back'),
      cards: {},
      badges: {},
      values: {},
      fills: {},
      threshNotches: {
        FL: document.getElementById('thresh-FL'),
        FR: document.getElementById('thresh-FR'),
        HL: document.getElementById('thresh-HL'),
        HR: document.getElementById('thresh-HR')
      }
    };

    ['FL', 'FR', 'HL', 'HR'].forEach((id) => {
      this.domElements.cards[id] = document.getElementById(`card-${id}`);
      this.domElements.badges[id] = document.getElementById(`badge-${id}`);
      this.domElements.values[id] = document.getElementById(`val-${id}`);
      this.domElements.fills[id] = document.getElementById(`fill-${id}`);
    });
  }

  /**
   * Registriert einen Listener für den Aufprall (Touchdown / Bodenkontakt)
   * @param {Function} callback - ({ hoof, position, gait, velocity, intensity }) => void
   */
  onImpact(callback) {
    this.impactListeners.push(callback);
  }

  /**
   * Registriert einen Listener für das Abheben (Lift-Off)
   * @param {Function} callback - ({ hoof, position, gait }) => void
   */
  onLiftOff(callback) {
    this.liftOffListeners.push(callback);
  }

  /**
   * Aktualisiert die Schwellwerte (z. B. über lil-gui)
   */
  setThresholds(front, back) {
    if (typeof front === 'number') this.thresholdFront = front;
    if (typeof back === 'number') this.thresholdBack = back;

    this.hoofList.forEach((hoof) => {
      hoof.threshold = hoof.isFront ? this.thresholdFront : this.thresholdBack;
    });

    if (this.domElements.threshFront) {
      this.domElements.threshFront.innerText = `${this.thresholdFront.toFixed(3)} m`;
    }
    if (this.domElements.threshBack) {
      this.domElements.threshBack.innerText = `${this.thresholdBack.toFixed(3)} m`;
    }

    // Schwellwert-Markierungen auf den Meter-Bars aktualisieren
    if (this.domElements.threshNotches) {
      const frontPct = `${Math.min(100, Math.max(0, (this.thresholdFront / 0.5) * 100)).toFixed(1)}%`;
      const backPct = `${Math.min(100, Math.max(0, (this.thresholdBack / 0.5) * 100)).toFixed(1)}%`;
      if (this.domElements.threshNotches.FL) this.domElements.threshNotches.FL.style.left = frontPct;
      if (this.domElements.threshNotches.FR) this.domElements.threshNotches.FR.style.left = frontPct;
      if (this.domElements.threshNotches.HL) this.domElements.threshNotches.HL.style.left = backPct;
      if (this.domElements.threshNotches.HR) this.domElements.threshNotches.HR.style.left = backPct;
    }
  }

  /**
   * Setzt die Sichtbarkeit der 3D-Helfer
   */
  setHelpersVisibility(groundRings, heightLines, boneMarkers) {
    this.showGroundRings = groundRings;
    this.showHeightLines = heightLines;
    this.showBoneMarkers = boneMarkers;

    this.hoofList.forEach((hoof) => {
      const vis = this.visuals[hoof.id];
      if (vis) {
        vis.ring.visible = this.showGroundRings;
        vis.line.visible = this.showHeightLines;
        vis.sphere.visible = this.showBoneMarkers;
      }
    });
  }

  /**
   * Haupt-Update-Methode: Wird in der Render-Schleife aufgerufen
   * @param {number} delta - Vergangene Frame-Zeit in Sekunden
   * @param {string} currentGait - Aktuelle Animation ('Walk', 'Trot', 'Gallop', 'Rest')
   */
  update(delta, currentGait = '') {
    if (this.domElements.gait && currentGait) {
      this.domElements.gait.innerText = `${currentGait}`;
    }

    const tempVec = new THREE.Vector3();

    this.hoofList.forEach((hoof) => {
      if (!hoof.bone) return;

      // Vorherige Position sichern
      hoof.lastWorldPosition.copy(hoof.worldPosition);

      // Aktuelle Welt-Position des Huf-Knochens abfragen
      hoof.bone.getWorldPosition(hoof.worldPosition);
      hoof.currentY = hoof.worldPosition.y;

      // Schwellwertprüfung: Berührt der Huf den Boden?
      const threshold = hoof.isFront ? this.thresholdFront : this.thresholdBack;
      hoof.threshold = threshold;

      hoof.wasGrounded = hoof.isGrounded;
      hoof.isGrounded = hoof.currentY <= threshold;

      // Zeitzähler aktualisieren
      if (hoof.isGrounded) {
        hoof.groundTime += delta;
        hoof.airTime = 0;
      } else {
        hoof.airTime += delta;
        hoof.groundTime = 0;
      }

      // Vertikale Geschwindigkeit beim Aufprall berechnen (Y-Differenz / delta)
      const vertVelocity = delta > 0 ? (hoof.worldPosition.y - hoof.lastWorldPosition.y) / delta : 0;

      // ── Event: Aufprall (Touchdown: vorher in der Luft, jetzt am Boden) ──
      if (!hoof.wasGrounded && hoof.isGrounded) {
        hoof.impactCount++;
        hoof.impactVelocity = Math.abs(vertVelocity);

        // Intensitätsfaktor je nach Gangart
        let intensity = 1.0;
        if (currentGait === 'Walk') intensity = 0.5;
        else if (currentGait === 'Trot') intensity = 1.0;
        else if (currentGait === 'Gallop') intensity = 2.0;

        const impactEvent = {
          hoof: hoof.id,
          name: hoof.name,
          boneName: hoof.boneName,
          position: new THREE.Vector3(hoof.worldPosition.x, 0, hoof.worldPosition.z),
          bonePosition: hoof.worldPosition.clone(),
          gait: currentGait,
          velocity: hoof.impactVelocity,
          intensity: intensity,
          timestamp: performance.now()
        };

        // Event-Ticker im HUD aktualisieren
        if (this.domElements.ticker) {
          this.domElements.ticker.innerHTML = `Aufprall: <strong style="color: #34d399;">${hoof.name}</strong> (${currentGait})`;
        }

        // Registrierte Listener benachrichtigen
        this.impactListeners.forEach((fn) => fn(impactEvent));
      }

      // ── Event: Abheben (Lift-Off: vorher am Boden, jetzt in der Luft) ──
      if (hoof.wasGrounded && !hoof.isGrounded) {
        const liftOffEvent = {
          hoof: hoof.id,
          name: hoof.name,
          position: hoof.worldPosition.clone(),
          gait: currentGait
        };
        this.liftOffListeners.forEach((fn) => fn(liftOffEvent));
      }

      // ── 3D-Visualisierung aktualisieren ───────────────────────────
      this._updateVisual(hoof);

      // ── HUD-Anzeige aktualisieren ─────────────────────────────────
      this._updateHUDHoof(hoof);
    });
  }

  /**
   * Aktualisiert die 3D-Helfer im Raum
   */
  _updateVisual(hoof) {
    const vis = this.visuals[hoof.id];
    if (!vis) return;

    const wx = hoof.worldPosition.x;
    const wy = hoof.worldPosition.y;
    const wz = hoof.worldPosition.z;

    // 1. Bodenring am Aufprallpunkt (x, 0.002, z) positionieren
    vis.ring.position.set(wx, 0.002, wz);

    if (hoof.isGrounded) {
      // Am Boden: Kräftiges Grün mit leuchtender gefüllter Scheibe
      vis.ringMat.color.setHex(0x10b981);
      vis.ringMat.opacity = 0.9;
      vis.discMat.color.setHex(0x34d399);
      vis.discMat.opacity = 0.6;
      vis.ring.scale.set(1.1, 1.1, 1.1);
    } else {
      // In der Luft: Sanftes Cyan/Blau, transparenter Schatten-Indikator
      vis.ringMat.color.setHex(0x38bdf8);
      vis.ringMat.opacity = Math.max(0.2, 0.6 - wy * 0.8);
      vis.discMat.opacity = 0.05;
      vis.ring.scale.set(0.85, 0.85, 0.85);
    }

    // 2. Vertikale Höhenlinie (vom Boden (0) bis zur aktuellen Knochenhöhe)
    const positions = vis.lineGeo.attributes.position.array;
    positions[0] = wx;
    positions[1] = 0.002;
    positions[2] = wz;
    positions[3] = wx;
    positions[4] = wy;
    positions[5] = wz;
    vis.lineGeo.attributes.position.needsUpdate = true;

    if (hoof.isGrounded) {
      vis.lineMat.color.setHex(0x10b981);
      vis.lineMat.opacity = 0.4;
    } else {
      vis.lineMat.color.setHex(0x38bdf8);
      vis.lineMat.opacity = 0.7;
    }

    // 3. Knochen-Kugel-Marker
    vis.sphere.position.set(wx, wy, wz);
    if (hoof.isGrounded) {
      vis.sphereMat.color.setHex(0x10b981);
    } else {
      vis.sphereMat.color.setHex(0xf59e0b);
    }
  }

  /**
   * Aktualisiert eine Huf-Karte im DOM-HUD
   */
  _updateHUDHoof(hoof) {
    const id = hoof.id;
    const badge = this.domElements.badges[id];
    const val = this.domElements.values[id];
    const fill = this.domElements.fills[id];
    const card = this.domElements.cards[id];

    if (!badge || !val || !fill || !card) return;

    // Y-Wert formatieren
    val.innerText = `${hoof.currentY.toFixed(3)} m`;

    // Visueller Balken (max. Höhe ca. 0.5m)
    const percent = Math.min(100, Math.max(0, (hoof.currentY / 0.5) * 100));
    fill.style.width = `${percent}%`;

    if (hoof.isGrounded) {
      badge.innerText = 'BODEN';
      badge.className = 'status-badge badge-ground';
      fill.className = 'meter-fill fill-ground';
      card.classList.add('card-grounded');
      card.classList.remove('card-air');
    } else {
      badge.innerText = 'LUFT';
      badge.className = 'status-badge badge-air';
      fill.className = 'meter-fill fill-air';
      card.classList.remove('card-grounded');
      card.classList.add('card-air');
    }
  }

  /**
   * HUD ein- oder ausblenden
   */
  toggleHUD(visible) {
    if (this.hudContainer) {
      this.hudContainer.style.display = visible ? 'block' : 'none';
    }
  }
}

