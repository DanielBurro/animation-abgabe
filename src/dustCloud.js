import * as THREE from 'three';

/**
 * Typische reale Gangart-Geschwindigkeiten eines Pferdes (in m/s):
 * - Walk:   ~1.6 m/s (~5.8 km/h)
 * - Trot:   ~3.8 m/s (~13.7 km/h)
 * - Gallop: ~8.5 m/s (~30.6 km/h)
 * - Rest:    0.0 m/s
 */
export const GAIT_SPEEDS = {
  Walk: 1.6,
  Trot: 3.8,
  Trott: 3.8,
  Gallop: 8.5,
  Galopp: 8.5,
  Rest: 0.0
};

/**
 * Physikalisch basierte Staubwolken-Simulation mit natürlicher Rückwärts-Schubdynamik
 * 
 * Physikalische Gesetzmäßigkeiten:
 * 1. Laufrichtung & Geschwindigkeit:
 *    - Ermittelt die 3D-Blick-/Laufrichtung des Pferdes (Forward-Vektor).
 *    - Bezieht die Vorwärtsgeschwindigkeit des Pferdes (abhängig von Gangart & Wiedergaberate
 *      oder tatsächlicher Weltbewegung) als entgegengesetzten Rückwärtsimpuls (Backward-Kick) ein.
 *    - Erzeugt eine physikalisch authentische, nach hinten wehende Staubspur/Schleppe.
 * 2. Ring- & Fächerstreuung:
 *    - Gleichmäßige Winkelverteilung mit lateraler Streuung (Fächerbildung nach hinten).
 *    - Hinterhufe erhalten durch den Hufabstoß (Propulsion) einen etwas stärkeren Abfußungs-Schub.
 * 3. Leicht nach oben gerichtet:
 *    - Initialer Aufwärtsimpuls (Vy > 0) für aufgewirbelte Sand- und Staubpartikel.
 * 4. Luftwiderstand (Stokes-Reibung F_drag = -c_drag * v):
 *    - Bremst die Partikel auf allen drei Achsen exponentiell ab: v(t + dt) = v(t) * exp(-c_drag * dt).
 *    - Die Staubwolke breitet sich nach hinten aus, verlangsamt sich im Flug und verweilt in der Luft.
 * 5. Schwerkraft (g):
 *    - Zieht die Partikel nach dem Scheitelpunkt sanft wieder zum Boden (Ay = -g).
 * 6. Bodenkollision & Ausrollen:
 *    - Stoppt bei Y <= 0.005 m mit Bodenreibung.
 * 7. Verblassen & volumetrische Expansion:
 *    - Weicher, quadratischer Alpha-Fadeout über die Lebensdauer bei kontinuierlicher Größenvergrößerung.
 */
export class DustCloud {
  /**
   * @param {THREE.Scene} scene - Die Three.js-Szene
   * @param {Object} options - Konfigurationsoptionen
   */
  constructor(scene, options = {}) {
    this.scene = scene;
    this.horse = options.horse ?? null;
    this.settings = options.settings ?? null;

    // Maximale Partikelanzahl im statischen Puffer
    this.maxParticles = options.maxParticles ?? 1800;

    // Physik- & Animations-Parameter
    this.enabled = options.enabled ?? true;
    this.baseCount = options.baseCount ?? 32;          // Basis-Partikelanzahl pro Hufaufprall
    this.radialSpeed = options.radialSpeed ?? 1.1;     // Horizontale Ring-Expansionsgeschwindigkeit (m/s)
    this.upwardSpeed = options.upwardSpeed ?? 0.85;    // Vertikaler Impuls nach oben (m/s)
    this.backwardKick = options.backwardKick ?? 0.48;  // Faktor für den Rückwärts-Schub (Laufrichtung)
    this.drag = options.drag ?? 2.6;                   // Luftwiderstandsbeiwert c_drag (1/s)
    this.gravity = options.gravity ?? 6.5;             // Erdbeschleunigung g (m/s²)
    this.lifetime = options.lifetime ?? 1.25;          // Lebensdauer der Partikel (s)
    this.particleSize = options.particleSize ?? 0.09;  // Basis-Partikelgröße (m)
    this.ringRadius = options.ringRadius ?? 0.06;      // Huf-Startradius (m)
    this.groundFriction = 0.82;                        // Reibung beim Auftreffen auf dem Boden

    // Geschwindigkeits-Tracking für reale Bewegung im 3D-Raum
    this.actualWorldSpeed = 0;
    this._lastHorsePos = null;

    // Farb-Definition (Erdiger Sand-/Staubton)
    this.colorHex = options.color ?? '#c4a882';
    this._baseColor = new THREE.Color(this.colorHex);

    // Partikel-Pool (Array of Objects)
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push({
        x: 0,
        y: -1000,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        maxLife: 1.0,
        baseSize: this.particleSize,
        initialAlpha: 0.7,
        r: 0.76,
        g: 0.65,
        b: 0.51,
        active: false
      });
    }

    this.activeCount = 0;

    // Wiederverwendbare Hilfsvektoren zur Vermeidung von Garbage Collection
    this._tempForward = new THREE.Vector3();
    this._tempBackward = new THREE.Vector3();
    this._tempRight = new THREE.Vector3();
    this._tempUp = new THREE.Vector3(0, 1, 0);
    this._tempPos = new THREE.Vector3();

    // GPU-Puffergeometrie vorbereiten
    this._initGPUResources();
  }

  /**
   * Erzeugt ShaderMaterial & BufferGeometry für performantes Punkt-Rendering
   */
  _initGPUResources() {
    this.geometry = new THREE.BufferGeometry();

    this.positions = new Float32Array(this.maxParticles * 3);
    this.sizes = new Float32Array(this.maxParticles);
    this.alphas = new Float32Array(this.maxParticles);
    this.colors = new Float32Array(this.maxParticles * 3);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(this.alphas, 1));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.setDrawRange(0, 0);

    // Spezialisierter Shader für flauschige, weich auslaufende Staubwolken
    const vertexShader = /* glsl */ `
      attribute float aSize;
      attribute float aAlpha;
      attribute vec3 aColor;

      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        vAlpha = aAlpha;
        vColor = aColor;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float depth = max(0.1, -mvPosition.z);

        // Perspektivische Größenanpassung mit Distanzdämpfung
        gl_PointSize = aSize * (360.0 / depth);
        gl_PointSize = clamp(gl_PointSize, 1.0, 190.0);

        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = /* glsl */ `
      varying float vAlpha;
      varying vec3 vColor;

      void main() {
        if (vAlpha <= 0.002) discard;

        // Radialer Abstand vom Punktzentrum (0..0.5)
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // Weicher, gradueller Staub-Falloff (Gauss-ähnlich)
        float softness = smoothstep(0.5, 0.0, dist);
        softness = pow(softness, 1.35);

        gl_FragColor = vec4(vColor, vAlpha * softness);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false, // Verhindert Artefakte bei überlappendem Staub
      depthTest: true,
      blending: THREE.NormalBlending
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 10;
    this.points.raycast = () => {}; // Keine Interferenz mit OrbitControls / Klicks

    this.scene.add(this.points);
  }

  /**
   * Setzt das Pferdemodell für Richtungs- und Geschwindigkeitsabfragen
   * @param {THREE.Object3D} horse 
   */
  setHorse(horse) {
    this.horse = horse;
  }

  /**
   * Setzt die Grundfarbe des Staubs
   * @param {string|number|THREE.Color} hex 
   */
  setColor(hex) {
    this.colorHex = hex;
    this._baseColor.set(hex);
  }

  /**
   * Ermittelt die normalisierte horizontale Laufrichtung des Pferdes (Vorwärtsvektor)
   * @param {THREE.Vector3} [target]
   * @returns {THREE.Vector3}
   */
  getForwardDirection(target = this._tempForward) {
    if (this.horse) {
      this.horse.getWorldDirection(target);
      target.y = 0;
      if (target.lengthSq() > 0.0001) {
        return target.normalize();
      }
    }
    return target.set(0, 0, 1);
  }

  /**
   * Ermittelt die Richtung nach hinten (entgegengesetzt zur Laufrichtung)
   * @param {THREE.Vector3} [target]
   * @returns {THREE.Vector3}
   */
  getBackwardDirection(target = this._tempBackward) {
    this.getForwardDirection(target);
    return target.negate();
  }

  /**
   * Ermittelt den Quer-Vektor (nach rechts relativ zur Laufrichtung)
   * @param {THREE.Vector3} [target]
   * @returns {THREE.Vector3}
   */
  getRightDirection(target = this._tempRight) {
    const forward = this.getForwardDirection();
    return target.crossVectors(this._tempUp, forward).normalize();
  }

  /**
   * Berechnet die physikalisch wirksame Vorwärtsgeschwindigkeit des Pferdes (m/s)
   * @param {string} [gait] - Gangart ('Walk', 'Trot', 'Gallop', 'Rest')
   * @returns {number}
   */
  getHorseSpeed(gait) {
    // Falls sich das Modell real im Raum bewegt:
    if (this.actualWorldSpeed > 0.15) {
      return this.actualWorldSpeed;
    }

    // Virtuelle Gangart-Geschwindigkeit:
    const currentGait = gait || this.settings?.currentAnimation || 'Trot';
    const baseSpeed = GAIT_SPEEDS[currentGait] ?? 3.8;
    const playbackSpeed = this.settings?.speed ?? 1.0;
    const paused = this.settings?.paused ?? false;

    // Bei Pause im GUI-Standbild wird dennoch die Grundgeschwindigkeit der Gangart genutzt
    const effectiveSpeed = baseSpeed * (paused ? 1.0 : playbackSpeed);
    return effectiveSpeed;
  }

  /**
   * Löst eine Staubwolke basierend auf einem Bodenaufprall-Event aus
   * @param {Object} impactEvent - Event von GroundContactDetector
   */
  emit(impactEvent) {
    if (!this.enabled) return;
    if (!impactEvent || !impactEvent.position) return;

    // Gangart, Aufprallgeschwindigkeit & Huf-Typ ermitteln
    const gait = impactEvent.gait || this.settings?.currentAnimation || 'Trot';
    const intensity = impactEvent.intensity ?? 1.0;
    const velocity = impactEvent.velocity ?? 1.0;
    const hoofId = impactEvent.hoof || '';

    // Hinterhufe treiben das Pferd stärker an (hohe Schubkraft nach hinten)
    const isHind = hoofId.startsWith('H') || hoofId.includes('rear');
    const driveBonus = isHind ? 1.15 : 0.95;

    const velFactor = Math.min(1.5, Math.max(0.7, velocity / 1.4));
    const gaitFactor = Math.min(1.8, Math.max(0.5, intensity));
    const finalScale = gaitFactor * velFactor * driveBonus;

    // Dynamische Partikelanzahl: Walk (~12), Trot (~32), Gallop (~55-65)
    const count = Math.min(70, Math.max(8, Math.round(this.baseCount * finalScale)));

    this.emitAt(impactEvent.position, finalScale, count, gait, isHind);
  }

  /**
   * Erzeugt eine Staubwolke an einer beliebigen 3D-Position
   * @param {THREE.Vector3} position - Zentrum des Aufpralls (X, Y, Z)
   * @param {number} scale - Intensitätsskalierung (default 1.0)
   * @param {number} count - Partikelanzahl (default berechnet)
   * @param {string} [gait] - Gangart ('Walk', 'Trot', 'Gallop')
   * @param {boolean} [isHindHoof] - Ob es sich um einen Hinterhuf handelt
   */
  emitAt(position, scale = 1.0, count = null, gait = null, isHindHoof = false) {
    if (!this.enabled) return;

    const numToSpawn = count ?? Math.round(this.baseCount * scale);
    const originX = position.x;
    const originY = Math.max(0.005, position.y);
    const originZ = position.z;

    // ── 1. Laufrichtung & Geschwindigkeit berechnen ──────────────
    const forward = this.getForwardDirection(new THREE.Vector3());
    const backward = forward.clone().negate();
    const right = new THREE.Vector3().crossVectors(this._tempUp, forward).normalize();

    const horseSpeed = this.getHorseSpeed(gait);

    // Grund-Rückwärtsgeschwindigkeit der Partikel durch die Bewegung des Pferdes
    const baseBackwardSpeed = horseSpeed * this.backwardKick;

    const hsl = {};
    this._baseColor.getHSL(hsl);

    for (let i = 0; i < numToSpawn; i++) {
      if (this.activeCount >= this.maxParticles) {
        break; // Pool voll
      }

      const p = this.particles[this.activeCount];
      this.activeCount++;

      // ── 2. Ringförmige & fächerförmige Verteilung ─────────────
      // Winkel relativ zur Vorwärtsachse des Pferdes
      const angleFraction = i / numToSpawn;
      const angle = angleFraction * Math.PI * 2 + (Math.random() - 0.5) * (Math.PI * 2 / numToSpawn) * 0.75;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Startposition knapp am Hufrand
      const spawnRadius = this.ringRadius * (0.7 + Math.random() * 0.6);
      p.x = originX + (forward.x * cosA + right.x * sinA) * spawnRadius;
      p.y = originY + Math.random() * 0.015;
      p.z = originZ + (forward.z * cosA + right.z * sinA) * spawnRadius;

      // Radiale Geschwindigkeitskomponente (Ringexpansion)
      const radialMag = this.radialSpeed * (0.7 + Math.random() * 0.55) * Math.sqrt(scale);
      const vxRadial = (forward.x * cosA + right.x * sinA) * radialMag;
      const vzRadial = (forward.z * cosA + right.z * sinA) * radialMag;

      // ── 3. Rückwärts-Schub (Laufrichtung & Geschwindigkeit) ──
      // Partikel, die nach hinten gerichtet sind (cosA < 0), erhalten zusätzlichen
      // Abstoßungs-Impuls (Huf-Abfußen gegen den Boden)
      const rearBias = Math.max(0, -cosA); // 0 (vorne) bis 1 (direkt nach hinten)
      const hoofThrustBonus = rearBias * horseSpeed * (isHindHoof ? 0.32 : 0.22);

      const totalBackwardSpeed = (baseBackwardSpeed * (0.75 + Math.random() * 0.5) + hoofThrustBonus) * Math.sqrt(scale);

      const vxBack = backward.x * totalBackwardSpeed;
      const vzBack = backward.z * totalBackwardSpeed;

      // Gesamte Horizontalgeschwindigkeit = Ringkomponente + Rückwärts-Impuls
      p.vx = vxRadial + vxBack;
      p.vz = vzRadial + vzBack;

      // ── 4. Leicht nach oben ───────────────────────────────────
      // Positiver vertikaler Impuls, nach hinten wehende Partikel steigen leicht steiler auf
      const upwardBonus = rearBias * 0.18 * this.upwardSpeed;
      p.vy = (this.upwardSpeed * (0.65 + Math.random() * 0.7) + upwardBonus) * Math.sqrt(scale);

      // ── 5. Lebensdauer & Erscheinungsbild ─────────────────────
      p.life = 0;
      // Bei höherer Geschwindigkeit verweilt die nach hinten wehende Spur etwas länger
      p.maxLife = this.lifetime * (0.8 + Math.random() * 0.45) * (1.0 + Math.min(0.3, horseSpeed * 0.03));
      p.baseSize = this.particleSize * (0.75 + Math.random() * 0.55);
      p.initialAlpha = 0.55 + Math.random() * 0.25;

      // Feine Farbvariation für volumetrische Tiefe
      const tempColor = new THREE.Color().setHSL(
        hsl.h + (Math.random() - 0.5) * 0.04,
        Math.max(0.05, Math.min(1.0, hsl.s * (0.85 + Math.random() * 0.3))),
        Math.max(0.15, Math.min(0.9, hsl.l * (0.82 + Math.random() * 0.36)))
      );
      p.r = tempColor.r;
      p.g = tempColor.g;
      p.b = tempColor.b;
      p.active = true;
    }
  }

  /**
   * Löst manuell eine Test-Staubwolke aus (z. B. via GUI-Button)
   * Nutzt die aktuelle Orientierung und Gangart des Pferdes
   */
  emitTestCloud() {
    let spawnPos = new THREE.Vector3(0, 0, 0);
    if (this.horse) {
      this.horse.getWorldPosition(spawnPos);
      spawnPos.y = 0;
    }
    const currentGait = this.settings?.currentAnimation || 'Gallop';
    this.emitAt(spawnPos, 1.4, 45, currentGait, true);
  }

  /**
   * Physikalischer Simulationsschritt (Euler-Integration)
   * Wird in der Render-Schleife aufgerufen
   * @param {number} delta - Frame-Dauer in Sekunden
   */
  update(delta) {
    // Reales Geschwindigkeits-Tracking für den Fall, dass das Pferd im Raum wandert
    if (this.horse && delta > 0) {
      this.horse.getWorldPosition(this._tempPos);
      if (this._lastHorsePos) {
        const dist = this._tempPos.distanceTo(this._lastHorsePos);
        this.actualWorldSpeed = dist / delta;
      } else {
        this._lastHorsePos = new THREE.Vector3();
      }
      this._lastHorsePos.copy(this._tempPos);
    }

    if (this.activeCount === 0) {
      if (this.geometry.drawRange.count !== 0) {
        this.geometry.setDrawRange(0, 0);
      }
      return;
    }

    // Zeitschritt deckeln, um Sprünge bei Hintergrund-Tabs zu verhindern
    const dt = Math.min(delta, 0.05);

    // Exakter exponentieller Dämpfungsfaktor für Stokes-Luftwiderstand
    // v(t + dt) = v(t) * exp(-drag * dt)
    const dragDamping = Math.exp(-this.drag * dt);

    for (let i = 0; i < this.activeCount; i++) {
      const p = this.particles[i];
      p.life += dt;

      // Partikel abgelaufen? -> O(1) Swap mit dem letzten aktiven Element
      if (p.life >= p.maxLife) {
        this.activeCount--;
        if (i < this.activeCount) {
          this._swapParticles(i, this.activeCount);
          i--; // Selben Index mit dem neu hergezogenen Partikel erneut prüfen
        }
        continue;
      }

      // ── 6. Luftwiderstand (bremst horizontale & vertikale Bewegung) ──
      // Bremst den anfänglichen Rückwärts-Schub stetig ab, sodass die Wolke
      // in der Luft stehen bleibt und eine natürliche Schleppe bildet
      p.vx *= dragDamping;
      p.vz *= dragDamping;

      // ── 7. Schwerkraft (zieht nach unten) ─────────────────────────
      p.vy = (p.vy - this.gravity * dt) * dragDamping;

      // Position aktualisieren (semi-impliziter Euler)
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;

      // ── 8. Bodenkollision ────────────────────────────────────────
      if (p.y <= 0.005) {
        p.y = 0.005;
        p.vy = 0; // Bleibt am Boden
        p.vx *= this.groundFriction;
        p.vz *= this.groundFriction;
      }

      // ── 9. Langsam verblassen & volumetrisch expandieren ─────────
      const progress = p.life / p.maxLife; // 0 bis 1

      // Sanftes Einblenden zu Beginn, danach kontinuierliches weiches Ausblenden
      let alpha = 0;
      if (progress < 0.12) {
        alpha = (progress / 0.12) * p.initialAlpha;
      } else {
        const fadeP = (progress - 0.12) / 0.88;
        // Quadratisch-weicher Fadeout
        alpha = p.initialAlpha * Math.pow(1.0 - fadeP, 1.4);
      }

      // Der Partikel wächst mit der Zeit (Staub verteilt sich in der Luft)
      const currentSize = p.baseSize * (1.0 + 1.8 * Math.sqrt(progress));

      // In GPU-Puffer schreiben
      const i3 = i * 3;
      this.positions[i3] = p.x;
      this.positions[i3 + 1] = p.y;
      this.positions[i3 + 2] = p.z;

      this.sizes[i] = currentSize;
      this.alphas[i] = Math.max(0.0, alpha);

      this.colors[i3] = p.r;
      this.colors[i3 + 1] = p.g;
      this.colors[i3 + 2] = p.b;
    }

    // GPU-Attribute aktualisieren
    this.geometry.setDrawRange(0, this.activeCount);
    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
    this.geometry.attributes.aAlpha.needsUpdate = true;
    this.geometry.attributes.aColor.needsUpdate = true;
  }

  /**
   * Hilfsfunktion zum Tausch zweier Partikel im Pool (O(1) Deletion)
   */
  _swapParticles(a, b) {
    const pa = this.particles[a];
    const pb = this.particles[b];

    this.particles[a] = pb;
    this.particles[b] = pa;
  }

  /**
   * Setzt alle aktiven Partikel zurück
   */
  clear() {
    this.activeCount = 0;
    this.geometry.setDrawRange(0, 0);
  }

  /**
   * Gibt alle Three.js Ressourcen frei
   */
  dispose() {
    this.clear();
    if (this.points) {
      this.scene.remove(this.points);
    }
    if (this.geometry) {
      this.geometry.dispose();
    }
    if (this.material) {
      this.material.dispose();
    }
  }
}
