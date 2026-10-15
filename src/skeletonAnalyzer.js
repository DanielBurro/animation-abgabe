import * as THREE from 'three';

/**
 * Vollständige anatomische Metadaten für alle 34 Knochen des Pferde-Skeletts
 */
export const BONE_METADATA = {
  // ── 1. Rumpf & Wirbelsäule (Spine) ──
  'E_spine004': { name: 'Rumpfzentrum (Root)', group: 'spine', icon: '🦴', color: '#f59e0b', desc: 'Zentraler Schwerpunkt & Wurzelknochen des Skeletts' },
  'E_spine005': { name: 'Lenden-Becken-Übergang', group: 'spine', icon: '🦴', color: '#f59e0b', desc: 'Verbindet Rumpf mit Becken und Hinterläufen' },
  'E_spine006': { name: 'Brustwirbelsäule Hinten', group: 'spine', icon: '🦴', color: '#f59e0b', desc: 'Hinterer Brustkorbabschnitt' },
  'E_spine007': { name: 'Brustwirbelsäule Mitte', group: 'spine', icon: '🦴', color: '#f59e0b', desc: 'Mittlerer Brustkorbabschnitt' },
  'E_spine008': { name: 'Widerrist / Schultergürtel', group: 'spine', icon: '🦴', color: '#f59e0b', desc: 'Höchster Rückenpunkt; Anker für Schultern & Hals' },

  // ── 2. Schweif (Tail) ──
  'E_spine003': { name: 'Schweifansatz (Kreuzbein)', group: 'tail', icon: '🐎', color: '#06b6d4', desc: 'Wurzel des Schweifs am Beckenausgang' },
  'E_spine002': { name: 'Schweif Oberes Glied', group: 'tail', icon: '🐎', color: '#06b6d4', desc: 'Oberer Bogen der Caudalwirbel' },
  'E_spine001': { name: 'Schweif Mittleres Glied', group: 'tail', icon: '🐎', color: '#06b6d4', desc: 'Mittelstück des Schweifs' },
  'E_spine':    { name: 'Schweifspitze', group: 'tail', icon: '🐎', color: '#06b6d4', desc: 'Ende der Schweifwirbelkette' },

  // ── 3. Becken (Pelvis) ──
  'E_pelvisL':  { name: 'Becken Links (Ilium)', group: 'pelvis', icon: '🩻', color: '#3b82f6', desc: 'Linke Beckenhälfte & Hüftbein' },
  'E_pelvisR':  { name: 'Becken Rechts (Ilium)', group: 'pelvis', icon: '🩻', color: '#3b82f6', desc: 'Rechte Beckenhälfte & Hüftbein' },

  // ── 4. Hinterlauf Links (HL) ──
  'E_thighL':   { name: 'Oberschenkel HL (Femur)', group: 'hind_left', icon: '🦵', color: '#6366f1', desc: 'Kraftvoller Oberschenkelknochen hinten links' },
  'E_shinL':    { name: 'Unterschenkel HL (Tibia)', group: 'hind_left', icon: '🦵', color: '#6366f1', desc: 'Schienbein hinten links' },
  'E_footL':    { name: 'Sprunggelenk HL (Tarsus)', group: 'hind_left', icon: '🦶', color: '#6366f1', desc: 'Fersengelenk & Mittelfuß hinten links' },
  'E_toeL':     { name: 'Hufzehe HL (Fessel/Huf)', group: 'hind_left', icon: '⚡', color: '#10b981', desc: 'Bodenkontaktpunkt hinten links' },

  // ── 5. Hinterlauf Rechts (HR) ──
  'E_thighR':   { name: 'Oberschenkel HR (Femur)', group: 'hind_right', icon: '🦵', color: '#8b5cf6', desc: 'Kraftvoller Oberschenkelknochen hinten rechts' },
  'E_shinR':    { name: 'Unterschenkel HR (Tibia)', group: 'hind_right', icon: '🦵', color: '#8b5cf6', desc: 'Schienbein hinten rechts' },
  'E_footR':    { name: 'Sprunggelenk HR (Tarsus)', group: 'hind_right', icon: '🦶', color: '#8b5cf6', desc: 'Fersengelenk & Mittelfuß hinten rechts' },
  'E_toeR':     { name: 'Hufzehe HR (Fessel/Huf)', group: 'hind_right', icon: '⚡', color: '#10b981', desc: 'Bodenkontaktpunkt hinten rechts' },

  // ── 6. Brust (Chest) ──
  'E_breastL':  { name: 'Brustmuskelansatz Links', group: 'chest', icon: '🫀', color: '#ec4899', desc: 'Vorderer Brustkorbbereich links' },
  'E_breastR':  { name: 'Brustmuskelansatz Rechts', group: 'chest', icon: '🫀', color: '#ec4899', desc: 'Vorderer Brustkorbbereich rechts' },

  // ── 7. Vorderlauf Links (VL) ──
  'E_shoulderL':    { name: 'Schulterblatt VL (Scapula)', group: 'fore_left', icon: '🦾', color: '#14b8a6', desc: 'Schulterblattaufhängung vorne links' },
  'E_front_thighL': { name: 'Oberarm VL (Humerus)', group: 'fore_left', icon: '🦾', color: '#14b8a6', desc: 'Oberarmknochen vorne links' },
  'E_front_shinL':  { name: 'Unterarm VL (Radius)', group: 'fore_left', icon: '🦾', color: '#14b8a6', desc: 'Unterarmknochen vorne links' },
  'E_front_footL':  { name: 'Vorderfußwurzel VL (Karpus)', group: 'fore_left', icon: '🦶', color: '#14b8a6', desc: 'Karpalgelenk vorne links' },
  'E_front_toeL':   { name: 'Hufzehe VL (Fessel/Huf)', group: 'fore_left', icon: '⚡', color: '#10b981', desc: 'Bodenkontaktpunkt vorne links' },

  // ── 8. Vorderlauf Rechts (VR) ──
  'E_shoulderR':    { name: 'Schulterblatt VR (Scapula)', group: 'fore_right', icon: '🦾', color: '#0ea5e9', desc: 'Schulterblattaufhängung vorne rechts' },
  'E_front_thighR': { name: 'Oberarm VR (Humerus)', group: 'fore_right', icon: '🦾', color: '#0ea5e9', desc: 'Oberarmknochen vorne rechts' },
  'E_front_shinR':  { name: 'Unterarm VR (Radius)', group: 'fore_right', icon: '🦾', color: '#0ea5e9', desc: 'Unterarmknochen vorne rechts' },
  'E_front_footR':  { name: 'Vorderfußwurzel VR (Karpus)', group: 'fore_right', icon: '🦶', color: '#0ea5e9', desc: 'Karpalgelenk vorne rechts' },
  'E_front_toeR':   { name: 'Hufzehe VR (Fessel/Huf)', group: 'fore_right', icon: '⚡', color: '#10b981', desc: 'Bodenkontaktpunkt vorne rechts' },

  // ── 9. Hals & Kopf (Neck & Head) ──
  'E_spine009': { name: 'Halsbasis (Cervicalwirbel)', group: 'head_neck', icon: '🦒', color: '#a855f7', desc: 'Untere Halswirbelsäule am Brustübergang' },
  'E_spine010': { name: 'Nacken / Obere Halswirbel', group: 'head_neck', icon: '🦒', color: '#a855f7', desc: 'Nackenwirbel & Mähnenansatz' },
  'E_spine011': { name: 'Kopf / Schädel & Maul', group: 'head_neck', icon: '🐴', color: '#d946ef', desc: 'Schädel, Augenhöhlen und Kieferknochen' }
};

export const BODY_GROUPS = [
  { id: 'all',        name: 'Alle (34)',       icon: '🌐' },
  { id: 'spine',      name: 'Wirbelsäule',     icon: '🦴', color: '#f59e0b' },
  { id: 'fore_legs',  name: 'Vorderbeine',     icon: '🦾', color: '#14b8a6' },
  { id: 'hind_legs',  name: 'Hinterbeine',     icon: '🦵', color: '#6366f1' },
  { id: 'head_neck',  name: 'Kopf & Hals',     icon: '🐴', color: '#a855f7' },
  { id: 'tail',       name: 'Schweif',         icon: '🐎', color: '#06b6d4' }
];

export class SkeletonAnalyzer {
  /**
   * @param {Object} context - Verbindung zu Three.js Kernkomponenten
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

    // Zustand
    this.bones = [];
    this.bonesByName = {};
    this.rootBone = null;
    this.selectedBone = null;
    this.activeTab = 'tree'; // 'tree', 'editor', 'timeline', 'biomech', 'view'
    this.isOpen = true;
    this.searchQuery = '';
    this.selectedGroup = 'all';

    // Posing & FK Steuerung
    this.poseMode = 'additive'; // 'additive' (überlagert Animation) oder 'override' (vollständig fixiert)
    this.boneOverrides = {}; // { [boneName]: { rot: {x,y,z}, pos: {x,y,z}, scale: 1.0 } }
    this.isScrubbing = false;

    // Visualisierungs-Einstellungen
    this.showSkeletonHelper = false;
    this.showJointMarkers = false;
    this.showAxesHelper = false;
    this.meshMode = 'normal'; // 'normal', 'xray', 'wireframe', 'ghost'
    this.meshOpacity = 1.0;
    this.currentTextureName = 'Brown';

    // Biomechanik History für Phasen-Diagramm
    this.phaseHistory = [];
    this.maxPhaseHistory = 80;

    // 3D Visual Helpers
    this._initBones();
    this._setup3DHelpers();
    this._setupRaycasting();
    this._createDOM();
    this._bindKeyboardShortcuts();

    // Standardmäßig Root-Bone auswählen
    if (this.rootBone) {
      this.selectBone(this.rootBone.name, false);
    }
  }

  /**
   * 1. Knochen aus dem GLTF-Szenengraphen extrahieren und hierarchisieren
   */
  _initBones() {
    this.bones = [];
    this.bonesByName = {};

    this.horse.traverse((child) => {
      if (child.isBone) {
        this.bones.push(child);
        this.bonesByName[child.name] = child;
      }
    });

    // Wurzelknochen ermitteln (Elternknoten ist kein Knochen)
    this.rootBone = this.bones.find((b) => !b.parent || !b.parent.isBone) || this.bonesByName['E_spine004'] || this.bones[0];

    this._captureBaseTransforms();

    console.log(`[SkeletonAnalyzer] ${this.bones.length} Knochen registriert. Wurzel: ${this.rootBone?.name}`);
  }

  /**
   * 2. 3D-Helfer aufbauen: SkeletonHelper, Gelenk-Kugeln, lokales Achsenkreuz
   */
  _setup3DHelpers() {
    // 2.1 Three.js SkeletonHelper (Knochen-Linien im 3D-Raum)
    this.skeletonHelper = new THREE.SkeletonHelper(this.horse);
    this.skeletonHelper.name = 'SkeletonHelper_Analyzer';
    this.skeletonHelper.material.linewidth = 2;
    this.skeletonHelper.material.depthTest = false; // Röntgen-Effekt: immer sichtbar!
    this.skeletonHelper.material.transparent = true;
    this.skeletonHelper.material.opacity = 0.85;
    this.skeletonHelper.visible = this.showSkeletonHelper;
    this.scene.add(this.skeletonHelper);

    // 2.2 Gelenk-Kugeln (Joint Spheres an jedem Gelenk)
    this.jointGroup = new THREE.Group();
    this.jointGroup.name = 'JointMarkers_Analyzer';
    this.jointMeshes = {};

    const jointGeo = new THREE.SphereGeometry(0.024, 16, 16);

    this.bones.forEach((bone) => {
      const meta = BONE_METADATA[bone.name];
      const color = meta ? meta.color : 0x38bdf8;

      const jointMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8,
        depthTest: false
      });

      const sphere = new THREE.Mesh(jointGeo, jointMat);
      sphere.userData = { boneName: bone.name, bone: bone };
      this.jointGroup.add(sphere);
      this.jointMeshes[bone.name] = sphere;
    });

    this.jointGroup.visible = this.showJointMarkers;
    this.scene.add(this.jointGroup);

    // 2.3 Lokales Achsenkreuz für den aktuell ausgewählten Knochen
    this.axesHelper = new THREE.AxesHelper(0.18);
    this.axesHelper.renderOrder = 999;
    this.axesHelper.material.depthTest = false;
    this.axesHelper.visible = false;
    this.scene.add(this.axesHelper);

    // 2.4 Highlight-Ring / Glow um den selektierten Knochen
    const highlightGeo = new THREE.RingGeometry(0.04, 0.055, 32);
    const highlightMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
      depthTest: false
    });
    this.highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
    this.highlightMesh.visible = false;
    this.scene.add(this.highlightMesh);
  }

  /**
   * 3. Raycasting: Klick im 3D-Raum wählt Knochen direkt an
   */
  _setupRaycasting() {
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    let downTime = 0;
    let downX = 0;
    let downY = 0;

    const dom = this.renderer.domElement;

    dom.addEventListener('pointerdown', (e) => {
      downTime = performance.now();
      downX = e.clientX;
      downY = e.clientY;
    });

    dom.addEventListener('pointerup', (e) => {
      // Nur auswerten wenn kein Drag (OrbitControls) stattfand
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      const duration = performance.now() - downTime;
      if (dist > 5 || duration > 350) return;

      const rect = dom.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const objectsToTest = Object.values(this.jointMeshes);
      const intersects = this.raycaster.intersectObjects(objectsToTest, false);

      if (intersects.length > 0) {
        const hitBoneName = intersects[0].object.userData.boneName;
        if (hitBoneName) {
          this.selectBone(hitBoneName, true);
        }
      }
    });
  }

  /**
   * 4. Knochen auswählen & 3D Visuals aktualisieren
   */
  selectBone(boneName, switchToEditor = false) {
    const bone = this.bonesByName[boneName];
    if (!bone) return;

    this.selectedBone = bone;

    // Knochen-Override Struktur initialisieren falls noch nicht existent
    if (!this.boneOverrides[boneName]) {
      this.boneOverrides[boneName] = {
        enabled: false,
        rot: { x: 0, y: 0, z: 0 },
        pos: { x: 0, y: 0, z: 0 },
        scale: 1.0
      };
    }

    // 3D Highlight aktualisieren
    this._updateBoneHighlight();

    // UI aktualisieren
    this._updateTreeSelectionUI();
    this._updateEditorUI();

    if (switchToEditor && this.activeTab === 'tree') {
      this.switchTab('editor');
    }
  }

  _updateBoneHighlight() {
    if (!this.selectedBone) {
      this.axesHelper.visible = false;
      this.highlightMesh.visible = false;
      return;
    }

    const worldPos = new THREE.Vector3();
    const worldQuat = new THREE.Quaternion();
    this.selectedBone.getWorldPosition(worldPos);
    this.selectedBone.getWorldQuaternion(worldQuat);

    // Achsenkreuz am Knochen positionieren und rotieren
    this.axesHelper.position.copy(worldPos);
    this.axesHelper.quaternion.copy(worldQuat);
    this.axesHelper.visible = this.showAxesHelper;

    // Highlight-Marker am Knochen ausrichten
    this.highlightMesh.position.copy(worldPos);
    this.highlightMesh.quaternion.copy(this.camera.quaternion); // Immer zur Kamera blicken
    this.highlightMesh.visible = this.showJointMarkers || this.showAxesHelper;

    // Joint Spheres Farbhervorhebung
    Object.entries(this.jointMeshes).forEach(([name, mesh]) => {
      if (name === this.selectedBone.name) {
        mesh.scale.set(1.8, 1.8, 1.8);
        mesh.material.color.setHex(0xfacc15);
      } else {
        mesh.scale.set(1.0, 1.0, 1.0);
        const meta = BONE_METADATA[name];
        mesh.material.color.set(meta ? meta.color : 0x38bdf8);
      }
    });
  }

  /**
   * Kamera sanft auf den ausgewählten Knochen ausrichten
   */
  focusSelectedBone() {
    if (!this.selectedBone) return;
    const wp = new THREE.Vector3();
    this.selectedBone.getWorldPosition(wp);

    if (this.controls) {
      this.controls.target.copy(wp);
      this.camera.position.set(wp.x + 1.2, wp.y + 0.5, wp.z + 1.2);
      this.controls.update();
    }
  }

  _captureBaseTransforms() {
    this.bones.forEach((b) => {
      if (!b.userData.baseQuat) {
        b.userData.baseQuat = new THREE.Quaternion();
        b.userData.basePos = new THREE.Vector3();
        b.userData.baseScale = new THREE.Vector3(1, 1, 1);
      }
      b.userData.baseQuat.copy(b.quaternion);
      b.userData.basePos.copy(b.position);
      b.userData.baseScale.copy(b.scale);
    });
  }

  /**
   * 5. Haupt-Update in der Render-Schleife
   */
  update(delta) {
    // 5.0 Basistransformationen aus dem aktuellen Frame sichern
    if (!this.settings.paused && delta > 0) {
      this._captureBaseTransforms();
    }

    // 5.1 Knochen-Posen & Overrides auf das Skelett anwenden
    this._applyBoneTransforms();

    // 5.2 Gelenk-Kugeln Weltpositionen nachziehen
    if (this.jointGroup && this.jointGroup.visible) {
      const tempVec = new THREE.Vector3();
      this.bones.forEach((bone) => {
        const mesh = this.jointMeshes[bone.name];
        if (mesh) {
          bone.getWorldPosition(tempVec);
          mesh.position.copy(tempVec);
        }
      });
    }

    // Highlight-Marker & Achsenkreuz nachziehen
    if (this.selectedBone) {
      this._updateBoneHighlight();
    }

    // 5.3 Live-Telemetrie im UI aktualisieren
    if (this.isOpen) {
      if (this.activeTab === 'editor') {
        this._updateLiveTelemetry();
      } else if (this.activeTab === 'timeline') {
        this._updateTimelineUI();
      } else if (this.activeTab === 'biomech') {
        this._updateBiomechUI(delta);
      }
    }
  }

  /**
   * Knochenmanipulationen anwenden (FK / Pose-Engine)
   */
  _applyBoneTransforms() {
    let hasChanges = false;

    Object.entries(this.boneOverrides).forEach(([name, override]) => {
      if (!override.enabled) return;

      const bone = this.bonesByName[name];
      if (!bone) return;

      // Ausgangszustand vor Transformation wiederherstellen
      if (bone.userData.baseQuat) {
        bone.quaternion.copy(bone.userData.baseQuat);
        bone.position.copy(bone.userData.basePos);
        bone.scale.copy(bone.userData.baseScale);
      }

      hasChanges = true;

      // Rotation anwenden
      const radX = THREE.MathUtils.degToRad(override.rot.x);
      const radY = THREE.MathUtils.degToRad(override.rot.y);
      const radZ = THREE.MathUtils.degToRad(override.rot.z);
      const offsetEuler = new THREE.Euler(radX, radY, radZ, 'XYZ');
      const offsetQuat = new THREE.Quaternion().setFromEuler(offsetEuler);

      if (this.poseMode === 'additive') {
        // Überlagert flüssig die laufende Animation
        bone.quaternion.multiply(offsetQuat);
      } else {
        // Feste Überschreibung
        bone.quaternion.copy(offsetQuat);
      }

      // Positions-Offset anwenden
      if (override.pos.x !== 0 || override.pos.y !== 0 || override.pos.z !== 0) {
        bone.position.x += override.pos.x;
        bone.position.y += override.pos.y;
        bone.position.z += override.pos.z;
      }

      // Skalierung anwenden
      if (override.scale !== 1.0) {
        bone.scale.multiplyScalar(override.scale);
      }
    });

    if (hasChanges) {
      this.horse.updateMatrixWorld(true);
    }
  }

  /**
   * 6. DOM-Aufbau: Sidebar-Struktur mit Tabs & Panels
   */
  _createDOM() {
    // 6.1 Floating Toggle Button (falls minimiert)
    this.togglePill = document.createElement('button');
    this.togglePill.className = 'analyzer-toggle-pill';
    this.togglePill.innerHTML = `<span>🦴</span> Skelett-Studio`;
    this.togglePill.title = 'Skelett-Analyse-Tool öffnen (Taste B oder Tab)';
    this.togglePill.onclick = () => this.toggleSidebar();
    document.body.appendChild(this.togglePill);

    // 6.2 Sidebar Hauptcontainer
    this.sidebar = document.createElement('aside');
    this.sidebar.id = 'skeleton-analyzer-sidebar';
    this.sidebar.className = 'analyzer-sidebar open';

    // HTML-Grundgerüst der Sidebar
    this.sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="header-main">
          <div class="brand-badge">
            <span class="brand-icon">🦴</span>
            <div>
              <h2 class="brand-title">SKELETT-STUDIO</h2>
              <span class="brand-sub">Analyse & Rigg-Steuerung</span>
            </div>
          </div>
          <button class="icon-close-btn" id="btn-close-sidebar" title="Einklappen (B)">✕</button>
        </div>

        <nav class="sidebar-tabs">
          <button class="tab-btn active" data-tab="tree">
            <span class="tab-icon">🌳</span>
            <span class="tab-label">Hierarchie</span>
          </button>
          <button class="tab-btn" data-tab="editor">
            <span class="tab-icon">🎛️</span>
            <span class="tab-label">Knochen-FK</span>
          </button>
          <button class="tab-btn" data-tab="timeline">
            <span class="tab-icon">⏱️</span>
            <span class="tab-label">Timeline</span>
          </button>
          <button class="tab-btn" data-tab="biomech">
            <span class="tab-icon">📊</span>
            <span class="tab-label">Biomechanik</span>
          </button>
          <button class="tab-btn" data-tab="view">
            <span class="tab-icon">👁️</span>
            <span class="tab-label">Ansicht</span>
          </button>
        </nav>
      </div>

      <div class="sidebar-content">
        <!-- TAB 1: SKELETT-BAUM -->
        <section class="tab-pane active" id="pane-tree">
          <div class="pane-section">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input type="text" id="tree-search-input" placeholder="Knochen suchen (z.B. toe, shoulder, spine)..." />
              <button class="search-clear-btn" id="tree-search-clear">×</button>
            </div>
            
            <div class="chip-filter-row" id="tree-group-chips"></div>

            <div class="skeleton-tree-summary">
              <span id="tree-bone-count">34 Knochen</span>
              <span class="tree-hint">Klick auf Knochen zum Auswählen</span>
            </div>

            <div class="tree-container" id="tree-nodes-container"></div>
          </div>
        </section>

        <!-- TAB 2: KNOCHEN-EDITOR & FK STEUERUNG -->
        <section class="tab-pane" id="pane-editor">
          <div class="pane-section">
            <div class="selected-bone-card" id="bone-card-info">
              <div class="bone-card-header">
                <span class="bone-card-icon" id="bone-info-icon">🦴</span>
                <div>
                  <h3 class="bone-card-title" id="bone-info-name">Kein Knochen gewählt</h3>
                  <span class="bone-card-tech" id="bone-info-tech">E_spine004</span>
                </div>
                <button class="btn-focus-bone" id="btn-focus-bone" title="Kamera auf Knochen zentrieren">🎯 Fokus</button>
              </div>
              <p class="bone-card-desc" id="bone-info-desc">Wähle einen Knochen aus der Hierarchie oder klicke direkt ins 3D-Modell.</p>

              <div class="telemetry-grid">
                <div class="telem-item">
                  <span class="telem-label">Welt-Position Y</span>
                  <strong class="telem-val" id="telem-pos-y">0.000 m</strong>
                </div>
                <div class="telem-item">
                  <span class="telem-label">Tiefe im Rigg</span>
                  <strong class="telem-val" id="telem-depth">0</strong>
                </div>
                <div class="telem-item">
                  <span class="telem-label">Kinder-Knochen</span>
                  <strong class="telem-val" id="telem-children">2</strong>
                </div>
                <div class="telem-item">
                  <span class="telem-label">Elternteil</span>
                  <strong class="telem-val" id="telem-parent">rig</strong>
                </div>
              </div>
            </div>

            <!-- Modus-Umschalter -->
            <div class="control-box">
              <div class="box-header">
                <span class="box-title">🎛️ Manuelle Knochensteuerung (FK)</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="override-active-toggle" />
                  <span class="toggle-slider"></span>
                </label>
              </div>

              <div class="segmented-control" id="pose-mode-selector">
                <button class="seg-btn active" data-mode="additive" title="Überlagert die laufende Gangart flüssig">Additiver Offset</button>
                <button class="seg-btn" data-mode="override" title="Fixiert die Knochenpose absolut">Absolutes Posing</button>
              </div>

              <!-- Rotations-Slider -->
              <div class="slider-group">
                <div class="slider-header">
                  <label>Rotation X (Neigung / Pitch):</label>
                  <span class="slider-val" id="val-rot-x">0°</span>
                </div>
                <input type="range" id="slider-rot-x" min="-180" max="180" step="1" value="0" />
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <label>Rotation Y (Gieren / Yaw):</label>
                  <span class="slider-val" id="val-rot-y">0°</span>
                </div>
                <input type="range" id="slider-rot-y" min="-180" max="180" step="1" value="0" />
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <label>Rotation Z (Rollen / Roll):</label>
                  <span class="slider-val" id="val-rot-z">0°</span>
                </div>
                <input type="range" id="slider-rot-z" min="-180" max="180" step="1" value="0" />
              </div>

              <!-- Positions-Offset Slider -->
              <div class="accordion-sub">
                <details>
                  <summary>Positions-Offsets (X, Y, Z) & Skalierung</summary>
                  <div class="slider-group mt-2">
                    <div class="slider-header">
                      <label>Offset X:</label>
                      <span class="slider-val" id="val-pos-x">0.00 m</span>
                    </div>
                    <input type="range" id="slider-pos-x" min="-0.3" max="0.3" step="0.01" value="0" />
                  </div>
                  <div class="slider-group">
                    <div class="slider-header">
                      <label>Offset Y:</label>
                      <span class="slider-val" id="val-pos-y">0.00 m</span>
                    </div>
                    <input type="range" id="slider-pos-y" min="-0.3" max="0.3" step="0.01" value="0" />
                  </div>
                  <div class="slider-group">
                    <div class="slider-header">
                      <label>Offset Z:</label>
                      <span class="slider-val" id="val-pos-z">0.00 m</span>
                    </div>
                    <input type="range" id="slider-pos-z" min="-0.3" max="0.3" step="0.01" value="0" />
                  </div>
                  <div class="slider-group">
                    <div class="slider-header">
                      <label>Knochen-Skalierung:</label>
                      <span class="slider-val" id="val-scale">1.00x</span>
                    </div>
                    <input type="range" id="slider-scale" min="0.5" max="2.0" step="0.05" value="1.0" />
                  </div>
                </details>
              </div>

              <!-- Buttons -->
              <div class="btn-row mt-3">
                <button class="btn btn-secondary" id="btn-reset-bone">↺ Knochen zurücksetzen</button>
                <button class="btn btn-danger" id="btn-reset-all-bones">🔄 Alle zurücksetzen</button>
              </div>
            </div>

            <!-- Schnell-Posen (Pose Presets) -->
            <div class="control-box">
              <span class="box-title">⚡ Schnell-Posen (Presets)</span>
              <div class="preset-btn-grid">
                <button class="preset-btn" data-preset="proud">🦒 Stolzer Hals</button>
                <button class="preset-btn" data-preset="grazing">🌾 Grasen (Kopf tief)</button>
                <button class="preset-btn" data-preset="tail_up">🐎 Schweif erhoben</button>
                <button class="preset-btn" data-preset="rear">⚡ Aufbäumen / Pose</button>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 3: TIMELINE & PLAYBACK -->
        <section class="tab-pane" id="pane-timeline">
          <div class="pane-section">
            <div class="control-box">
              <span class="box-title">🎬 Animations-Scrubber</span>
              
              <!-- Timeline Track -->
              <div class="scrubber-card">
                <div class="scrubber-timecode">
                  <span class="time-current" id="scrubber-time-cur">0.00s</span>
                  <span class="time-divider">/</span>
                  <span class="time-total" id="scrubber-time-tot">1.20s</span>
                  <span class="frame-tag" id="scrubber-frame-tag">Frame 0</span>
                </div>

                <div class="scrubber-track-wrap">
                  <input type="range" id="scrubber-slider" min="0" max="100" step="0.1" value="0" class="timeline-range" />
                </div>

                <!-- Playback Buttons -->
                <div class="playback-controls">
                  <button class="btn-play-ctrl" id="btn-step-prev" title="1 Frame zurück (Taste ,)">⏮</button>
                  <button class="btn-play-ctrl btn-play-main" id="btn-play-pause" title="Play / Pause (Leertaste)">⏸</button>
                  <button class="btn-play-ctrl" id="btn-step-next" title="1 Frame vor (Taste .)">⏭</button>
                </div>
              </div>

              <!-- Gangart-Auswahl -->
              <div class="field-row mt-3">
                <label>Gangart (Clip):</label>
                <select id="select-gait" class="form-select"></select>
              </div>

              <!-- Geschwindigkeit -->
              <div class="slider-group mt-3">
                <div class="slider-header">
                  <label>Geschwindigkeit:</label>
                  <span class="slider-val" id="val-speed">1.0x</span>
                </div>
                <input type="range" id="slider-speed" min="0.05" max="2.5" step="0.05" value="1.0" />
                <div class="speed-presets">
                  <button class="mini-chip" data-speed="0.2">0.2x (Slow-Mo)</button>
                  <button class="mini-chip" data-speed="0.5">0.5x</button>
                  <button class="mini-chip" data-speed="1.0">1.0x</button>
                  <button class="mini-chip" data-speed="1.75">1.75x</button>
                </div>
              </div>

              <!-- Überblendung -->
              <div class="slider-group mt-3">
                <div class="slider-header">
                  <label>Crossfade-Dauer:</label>
                  <span class="slider-val" id="val-crossfade">0.5 s</span>
                </div>
                <input type="range" id="slider-crossfade" min="0.1" max="2.0" step="0.1" value="0.5" />
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 4: BIOMECHANIK & HUFKONTAKT -->
        <section class="tab-pane" id="pane-biomech">
          <div class="pane-section">
            <!-- Phasen-Diagramm -->
            <div class="control-box">
              <div class="box-header">
                <span class="box-title">📊 Gangart-Phasendiagramm</span>
                <span class="badge-gait" id="biomech-gait-name">Walk</span>
              </div>
              <p class="text-sub">Zeigt synchron die Stütz- (Grün) und Schwungphasen (Blau) der 4 Hufe:</p>

              <div class="gait-phase-canvas-wrap">
                <canvas id="gait-phase-canvas" width="360" height="90"></canvas>
              </div>

              <div class="phase-legend">
                <span class="legend-item"><span class="legend-dot dot-ground"></span> Stützphase (Boden)</span>
                <span class="legend-item"><span class="legend-dot dot-air"></span> Schwungphase (Luft)</span>
              </div>

              <div class="impact-ticker-card mt-2">
                <span class="ticker-label">⚡ Letzter Hufaufprall:</span>
                <strong class="ticker-text" id="biomech-last-impact">Warte auf Touchdown...</strong>
              </div>
            </div>

            <!-- Live 4-Huf Telemetrie -->
            <div class="control-box">
              <span class="box-title">🐎 4-Huf-Telemetrie</span>
              <div class="biomech-hoof-list" id="biomech-hoof-list"></div>
            </div>

            <!-- Schwellwerte & Kalibrierung -->
            <div class="control-box">
              <span class="box-title">⚙️ Schwellwert-Steuerung</span>
              
              <div class="slider-group">
                <div class="slider-header">
                  <label>Schwelle Vorne (VL / VR):</label>
                  <span class="slider-val" id="val-thresh-front">0.155 m</span>
                </div>
                <input type="range" id="slider-thresh-front" min="0.10" max="0.22" step="0.002" value="0.155" />
              </div>

              <div class="slider-group">
                <div class="slider-header">
                  <label>Schwelle Hinten (HL / HR):</label>
                  <span class="slider-val" id="val-thresh-back">0.265 m</span>
                </div>
                <input type="range" id="slider-thresh-back" min="0.20" max="0.32" step="0.002" value="0.265" />
              </div>

              <button class="btn btn-secondary mt-2" id="btn-auto-calibrate">
                🎯 Schwellwerte kalibrieren (Auto-Fit)
              </button>
            </div>
          </div>
        </section>

        <!-- TAB 5: VISUALISIERUNG & ANSICHT -->
        <section class="tab-pane" id="pane-view">
          <div class="pane-section">
            <!-- 3D Rigg-Helfer -->
            <div class="control-box">
              <span class="box-title">🦴 3D-Rigg & Knochenanzeige</span>
              <div class="toggle-list">
                <label class="toggle-row">
                  <span>SkeletonHelper (Skelett-Linien)</span>
                  <input type="checkbox" id="chk-show-skeleton" />
                </label>
                <label class="toggle-row">
                  <span>Gelenk-Kugeln (Joint Markers)</span>
                  <input type="checkbox" id="chk-show-joints" />
                </label>
                <label class="toggle-row">
                  <span>Lokales Achsenkreuz (RGB=XYZ)</span>
                  <input type="checkbox" id="chk-show-axes" />
                </label>
                <label class="toggle-row">
                  <span>3D Bodenringe & Höhenlinien</span>
                  <input type="checkbox" id="chk-show-ground-rings" checked />
                </label>
                <label class="toggle-row">
                  <span>2D Hufkontakt-HUD (Overlay)</span>
                  <input type="checkbox" id="chk-show-hud" />
                </label>
              </div>
            </div>

            <!-- Mesh-Modi & Röntgen -->
            <div class="control-box">
              <span class="box-title">🐎 Mesh-Darstellung & Röntgen</span>
              <div class="segmented-control" id="mesh-mode-selector">
                <button class="seg-btn active" data-mesh="normal">Normal</button>
                <button class="seg-btn" data-mesh="xray">Röntgen (X-Ray)</button>
                <button class="seg-btn" data-mesh="wireframe">Wireframe</button>
                <button class="seg-btn" data-mesh="ghost">Geist</button>
              </div>

              <div class="slider-group mt-3">
                <div class="slider-header">
                  <label>Mesh-Transparenz / Opazität:</label>
                  <span class="slider-val" id="val-mesh-opacity">100%</span>
                </div>
                <input type="range" id="slider-mesh-opacity" min="0.1" max="1.0" step="0.05" value="1.0" />
              </div>

              <!-- Textur-Auswahl -->
              <div class="field-row mt-3">
                <label>Pferdefell-Textur:</label>
                <select id="select-texture" class="form-select">
                  <option value="Brown">Brauner (Brown.png)</option>
                  <option value="Dark Brown">Dunkelbraun (Dark Brown.png)</option>
                  <option value="Black">Rappe (Black.png)</option>
                  <option value="Grey">Schimmel (Grey.png)</option>
                  <option value="White">Weiß (White.png)</option>
                </select>
              </div>
            </div>

            <!-- Kamera-Perspektiven -->
            <div class="control-box">
              <span class="box-title">🎥 Kamera-Presets</span>
              <div class="preset-btn-grid">
                <button class="preset-btn" data-cam="lateral">📐 Seite (Sagittal)</button>
                <button class="preset-btn" data-cam="frontal">👀 Vorne (Kranial)</button>
                <button class="preset-btn" data-cam="dorsal">⬆️ Oben (Dorsal)</button>
                <button class="preset-btn" data-cam="iso">🌐 Isometrisch</button>
                <button class="preset-btn" data-cam="hoof">⚡ Huf-Nahaufnahme</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Footer Statusbar -->
      <footer class="sidebar-footer">
        <span class="footer-keyhint"><kbd>Tab</kbd> oder <kbd>B</kbd> Sidebar umschalten</span>
        <span class="footer-keyhint"><kbd>Leertaste</kbd> Play/Pause</span>
      </footer>
    `;

    document.body.appendChild(this.sidebar);

    // DOM-Events verdrahten
    this._bindDOMEvents();
    this._renderBodyGroupChips();
    this._renderSkeletonTree();
    this._populateGaitDropdown();
  }

  /**
   * 7. DOM-Events & Interaktivität verdrahten
   */
  _bindDOMEvents() {
    // 7.1 Sidebar auf-/zuklappen
    document.getElementById('btn-close-sidebar').onclick = () => this.toggleSidebar();

    // 7.2 Tab-Wechsel
    const tabBtns = this.sidebar.querySelectorAll('.tab-btn');
    tabBtns.forEach((btn) => {
      btn.onclick = () => {
        const tab = btn.dataset.tab;
        this.switchTab(tab);
      };
    });

    // 7.3 Suchfeld im Skelett-Baum
    const searchInput = document.getElementById('tree-search-input');
    const clearBtn = document.getElementById('tree-search-clear');
    searchInput.oninput = (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      clearBtn.style.display = this.searchQuery ? 'block' : 'none';
      this._filterTreeNodes();
    };
    clearBtn.onclick = () => {
      searchInput.value = '';
      this.searchQuery = '';
      clearBtn.style.display = 'none';
      this._filterTreeNodes();
    };

    // 7.4 Knochen-FK Steuerung
    const overrideToggle = document.getElementById('override-active-toggle');
    overrideToggle.onchange = (e) => {
      if (!this.selectedBone) return;
      this.boneOverrides[this.selectedBone.name].enabled = e.target.checked;
      this._updateEditorSliders();
    };

    // Posing Modus Umschalter (Additive vs Override)
    const modeBtns = this.sidebar.querySelectorAll('#pose-mode-selector .seg-btn');
    modeBtns.forEach((btn) => {
      btn.onclick = () => {
        modeBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.poseMode = btn.dataset.mode;
      };
    });

    // Rotations-Slider
    ['x', 'y', 'z'].forEach((axis) => {
      const slider = document.getElementById(`slider-rot-${axis}`);
      const valDisp = document.getElementById(`val-rot-${axis}`);
      slider.oninput = (e) => {
        if (!this.selectedBone) return;
        const val = parseFloat(e.target.value);
        valDisp.innerText = `${val}°`;
        this.boneOverrides[this.selectedBone.name].rot[axis] = val;
        this.boneOverrides[this.selectedBone.name].enabled = true;
        overrideToggle.checked = true;
      };
    });

    // Positions-Offset Slider
    ['x', 'y', 'z'].forEach((axis) => {
      const slider = document.getElementById(`slider-pos-${axis}`);
      const valDisp = document.getElementById(`val-pos-${axis}`);
      slider.oninput = (e) => {
        if (!this.selectedBone) return;
        const val = parseFloat(e.target.value);
        valDisp.innerText = `${val.toFixed(2)} m`;
        this.boneOverrides[this.selectedBone.name].pos[axis] = val;
        this.boneOverrides[this.selectedBone.name].enabled = true;
        overrideToggle.checked = true;
      };
    });

    // Skalierungs-Slider
    const scaleSlider = document.getElementById('slider-scale');
    const scaleDisp = document.getElementById('val-scale');
    scaleSlider.oninput = (e) => {
      if (!this.selectedBone) return;
      const val = parseFloat(e.target.value);
      scaleDisp.innerText = `${val.toFixed(2)}x`;
      this.boneOverrides[this.selectedBone.name].scale = val;
      this.boneOverrides[this.selectedBone.name].enabled = true;
      overrideToggle.checked = true;
    };

    // Knochen zurücksetzen Buttons
    document.getElementById('btn-reset-bone').onclick = () => {
      if (!this.selectedBone) return;
      this.resetBone(this.selectedBone.name);
    };

    document.getElementById('btn-reset-all-bones').onclick = () => {
      this.resetAllBones();
    };

    document.getElementById('btn-focus-bone').onclick = () => {
      this.focusSelectedBone();
    };

    // Schnell-Posen (Presets)
    const presetBtns = this.sidebar.querySelectorAll('.preset-btn[data-preset]');
    presetBtns.forEach((btn) => {
      btn.onclick = () => {
        this.applyPosePreset(btn.dataset.preset);
      };
    });

    // 7.5 Timeline & Playback Events
    const playPauseBtn = document.getElementById('btn-play-pause');
    playPauseBtn.onclick = () => this.togglePlayPause();

    document.getElementById('btn-step-prev').onclick = () => this.stepFrame(-1);
    document.getElementById('btn-step-next').onclick = () => this.stepFrame(1);

    const scrubber = document.getElementById('scrubber-slider');
    scrubber.oninput = (e) => {
      this.isScrubbing = true;
      this.scrubToPercent(parseFloat(e.target.value));
    };
    scrubber.onchange = () => {
      this.isScrubbing = false;
    };

    // Speed Slider & Presets
    const speedSlider = document.getElementById('slider-speed');
    const speedDisp = document.getElementById('val-speed');
    speedSlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      speedDisp.innerText = `${val.toFixed(2)}x`;
      this.settings.speed = val;
      if (this.mixer) this.mixer.timeScale = this.settings.paused ? 0 : val;
    };

    this.sidebar.querySelectorAll('.mini-chip[data-speed]').forEach((chip) => {
      chip.onclick = () => {
        const val = parseFloat(chip.dataset.speed);
        speedSlider.value = val;
        speedDisp.innerText = `${val.toFixed(2)}x`;
        this.settings.speed = val;
        if (this.mixer) this.mixer.timeScale = this.settings.paused ? 0 : val;
      };
    });

    // Crossfade Slider
    const crossfadeSlider = document.getElementById('slider-crossfade');
    const crossfadeDisp = document.getElementById('val-crossfade');
    crossfadeSlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      crossfadeDisp.innerText = `${val.toFixed(1)} s`;
      this.settings.crossfadeDuration = val;
    };

    // Gangart Dropdown
    document.getElementById('select-gait').onchange = (e) => {
      const nextGait = e.target.value;
      if (this.transitionTo) {
        this.transitionTo(nextGait);
      }
    };

    // 7.6 Biomechanik Schwellwert Slider
    const frontSlider = document.getElementById('slider-thresh-front');
    const frontDisp = document.getElementById('val-thresh-front');
    frontSlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      frontDisp.innerText = `${val.toFixed(3)} m`;
      this.settings.thresholdFront = val;
      if (this.contactDetector) {
        this.contactDetector.setThresholds(val, this.settings.thresholdBack);
      }
    };

    const backSlider = document.getElementById('slider-thresh-back');
    const backDisp = document.getElementById('val-thresh-back');
    backSlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      backDisp.innerText = `${val.toFixed(3)} m`;
      this.settings.thresholdBack = val;
      if (this.contactDetector) {
        this.contactDetector.setThresholds(this.settings.thresholdFront, val);
      }
    };

    document.getElementById('btn-auto-calibrate').onclick = () => {
      this.autoCalibrateThresholds();
    };

    // 7.7 3D Visualisierungs-Toggles
    document.getElementById('chk-show-skeleton').onchange = (e) => {
      this.showSkeletonHelper = e.target.checked;
      this.skeletonHelper.visible = this.showSkeletonHelper;
    };

    document.getElementById('chk-show-joints').onchange = (e) => {
      this.showJointMarkers = e.target.checked;
      this.jointGroup.visible = this.showJointMarkers;
    };

    document.getElementById('chk-show-axes').onchange = (e) => {
      this.showAxesHelper = e.target.checked;
      if (this.axesHelper) this.axesHelper.visible = this.showAxesHelper && !!this.selectedBone;
    };

    document.getElementById('chk-show-ground-rings').onchange = (e) => {
      const checked = e.target.checked;
      this.settings.showGroundRings = checked;
      this.settings.showHeightLines = checked;
      if (this.contactDetector) {
        this.contactDetector.setHelpersVisibility(checked, checked, this.settings.showBoneMarkers);
      }
    };

    const chkHud = document.getElementById('chk-show-hud');
    if (chkHud) {
      chkHud.onchange = (e) => {
        if (this.contactDetector) {
          this.contactDetector.toggleHUD(e.target.checked);
        }
      };
    }

    // Mesh-Modus Umschalter
    const meshBtns = this.sidebar.querySelectorAll('#mesh-mode-selector .seg-btn');
    meshBtns.forEach((btn) => {
      btn.onclick = () => {
        meshBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.setMeshMode(btn.dataset.mesh);
      };
    });

    // Mesh Opazität Slider
    const opacitySlider = document.getElementById('slider-mesh-opacity');
    const opacityDisp = document.getElementById('val-mesh-opacity');
    opacitySlider.oninput = (e) => {
      const val = parseFloat(e.target.value);
      opacityDisp.innerText = `${Math.round(val * 100)}%`;
      this.meshOpacity = val;
      this._applyMeshMaterialSettings();
    };

    // Textur-Auswahl
    document.getElementById('select-texture').onchange = (e) => {
      this.loadTexture(e.target.value);
    };

    // Kamera-Presets
    this.sidebar.querySelectorAll('.preset-btn[data-cam]').forEach((btn) => {
      btn.onclick = () => {
        this.setCameraPreset(btn.dataset.cam);
      };
    });
  }

  /**
   * 8. Tastatur-Shortcuts
   */
  _bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Wenn in Eingabefeld fokussiert, ignorieren
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      if (e.key === 'b' || e.key === 'B' || e.key === 'Tab') {
        e.preventDefault();
        this.toggleSidebar();
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.key === ',' || e.key === '<') {
        e.preventDefault();
        this.stepFrame(-1);
      } else if (e.key === '.' || e.key === '>') {
        e.preventDefault();
        this.stepFrame(1);
      } else if (e.key === 'f' || e.key === 'F') {
        this.focusSelectedBone();
      }
    });
  }

  /**
   * Sidebar umschalten
   */
  toggleSidebar(open = null) {
    this.isOpen = open !== null ? open : !this.isOpen;
    if (this.isOpen) {
      this.sidebar.classList.add('open');
      this.togglePill.style.display = 'none';
    } else {
      this.sidebar.classList.remove('open');
      this.togglePill.style.display = 'flex';
    }
  }

  /**
   * Tab wechseln
   */
  switchTab(tabId) {
    this.activeTab = tabId;

    // Tabs Buttons aktualisieren
    this.sidebar.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Tab Panes aktualisieren
    this.sidebar.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.id === `pane-${tabId}`);
    });
  }

  /**
   * 9. Filter-Chips für Körpergruppen rendern
   */
  _renderBodyGroupChips() {
    const container = document.getElementById('tree-group-chips');
    container.innerHTML = '';

    BODY_GROUPS.forEach((grp) => {
      const chip = document.createElement('button');
      chip.className = `chip-btn ${grp.id === this.selectedGroup ? 'active' : ''}`;
      chip.innerHTML = `${grp.icon} ${grp.name}`;
      chip.onclick = () => {
        this.selectedGroup = grp.id;
        container.querySelectorAll('.chip-btn').forEach((c) => c.classList.remove('active'));
        chip.classList.add('active');
        this._filterTreeNodes();
      };
      container.appendChild(chip);
    });
  }

  /**
   * 10. Hierarchischen Skelettbaum im DOM aufbauen
   */
  _renderSkeletonTree() {
    const container = document.getElementById('tree-nodes-container');
    container.innerHTML = '';

    if (!this.rootBone) {
      container.innerHTML = `<div class="empty-state">Kein Skelett gefunden.</div>`;
      return;
    }

    // Rekursiv Baum ab Wurzel aufbauen
    const treeHTML = this._buildNodeHTML(this.rootBone, 0);
    container.innerHTML = treeHTML;

    // Klick-Events auf Baum-Knoten binden
    container.querySelectorAll('.tree-node-row').forEach((row) => {
      row.onclick = (e) => {
        // Wenn Klick auf Toggle-Pfeil
        if (e.target.classList.contains('tree-toggle-arrow')) {
          const node = row.closest('.tree-node');
          node.classList.toggle('collapsed');
          e.stopPropagation();
          return;
        }

        const boneName = row.dataset.bone;
        this.selectBone(boneName, false);
      };
    });
  }

  /**
   * Rekursiver HTML-Generator für Skelettknoten
   */
  _buildNodeHTML(bone, depth) {
    const name = bone.name;
    const meta = BONE_METADATA[name] || { name: name, group: 'other', icon: '🦴', color: '#94a3b8', desc: '' };
    const childBones = bone.children.filter((c) => c.isBone);
    const hasChildren = childBones.length > 0;

    // Prüfen ob Huf
    const isHoof = ['E_front_toeL', 'E_front_toeR', 'E_toeL', 'E_toeR'].includes(name);

    let html = `
      <div class="tree-node" data-bone="${name}" data-group="${meta.group}">
        <div class="tree-node-row ${this.selectedBone?.name === name ? 'selected' : ''}" data-bone="${name}" style="padding-left: ${depth * 14 + 8}px;">
          <span class="tree-toggle-arrow ${hasChildren ? '' : 'leaf'}">${hasChildren ? '▼' : '•'}</span>
          <span class="tree-bone-icon" style="color: ${meta.color};">${meta.icon}</span>
          <div class="tree-node-text">
            <span class="tree-tech-name">${name}</span>
            <span class="tree-friendly-name">${meta.name}</span>
          </div>
          ${isHoof ? '<span class="hoof-pill">HUF</span>' : ''}
        </div>
    `;

    if (hasChildren) {
      html += `<div class="tree-node-children">`;
      childBones.forEach((child) => {
        html += this._buildNodeHTML(child, depth + 1);
      });
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  /**
   * Filterung der Baum-Knoten nach Suchbegriff und Gruppe
   */
  _filterTreeNodes() {
    const nodes = this.sidebar.querySelectorAll('.tree-node');
    let visibleCount = 0;

    nodes.forEach((node) => {
      const boneName = node.dataset.bone;
      const group = node.dataset.group;
      const meta = BONE_METADATA[boneName];

      const matchesSearch = !this.searchQuery || 
        boneName.toLowerCase().includes(this.searchQuery) || 
        (meta && meta.name.toLowerCase().includes(this.searchQuery));

      let matchesGroup = true;
      if (this.selectedGroup === 'spine') matchesGroup = group === 'spine';
      else if (this.selectedGroup === 'fore_legs') matchesGroup = group === 'fore_left' || group === 'fore_right';
      else if (this.selectedGroup === 'hind_legs') matchesGroup = group === 'hind_left' || group === 'hind_right' || group === 'pelvis';
      else if (this.selectedGroup === 'head_neck') matchesGroup = group === 'head_neck';
      else if (this.selectedGroup === 'tail') matchesGroup = group === 'tail';

      const isVisible = matchesSearch && matchesGroup;
      node.style.display = isVisible ? 'block' : 'none';
      if (isVisible) visibleCount++;
    });

    document.getElementById('tree-bone-count').innerText = `${visibleCount} von ${this.bones.length} Knochen`;
  }

  /**
   * UI des ausgewählten Knochens im Baum hervorheben
   */
  _updateTreeSelectionUI() {
    this.sidebar.querySelectorAll('.tree-node-row').forEach((row) => {
      row.classList.toggle('selected', row.dataset.bone === this.selectedBone?.name);
    });
  }

  /**
   * 11. Knochen-Editor UI befüllen
   */
  _updateEditorUI() {
    if (!this.selectedBone) return;

    const name = this.selectedBone.name;
    const meta = BONE_METADATA[name] || { name: name, group: 'other', icon: '🦴', color: '#38bdf8', desc: 'Keine Beschreibung' };

    document.getElementById('bone-info-icon').innerText = meta.icon;
    document.getElementById('bone-info-name').innerText = meta.name;
    document.getElementById('bone-info-tech').innerText = name;
    document.getElementById('bone-info-desc').innerText = meta.desc || 'Bestandteil des Skeletts.';

    // Tiefe & Hierarchie berechnen
    let depth = 0;
    let curr = this.selectedBone;
    while (curr.parent && curr.parent.isBone) {
      depth++;
      curr = curr.parent;
    }

    document.getElementById('telem-depth').innerText = depth;
    document.getElementById('telem-children').innerText = this.selectedBone.children.filter((c) => c.isBone).length;
    document.getElementById('telem-parent').innerText = this.selectedBone.parent?.name || 'Root';

    this._updateEditorSliders();
  }

  /**
   * Slider-Werte des aktiven Knochens setzen
   */
  _updateEditorSliders() {
    if (!this.selectedBone) return;

    const override = this.boneOverrides[this.selectedBone.name] || {
      enabled: false,
      rot: { x: 0, y: 0, z: 0 },
      pos: { x: 0, y: 0, z: 0 },
      scale: 1.0
    };

    document.getElementById('override-active-toggle').checked = override.enabled;

    ['x', 'y', 'z'].forEach((axis) => {
      const slider = document.getElementById(`slider-rot-${axis}`);
      const valDisp = document.getElementById(`val-rot-${axis}`);
      slider.value = override.rot[axis];
      valDisp.innerText = `${override.rot[axis]}°`;

      const posSlider = document.getElementById(`slider-pos-${axis}`);
      const posDisp = document.getElementById(`val-pos-${axis}`);
      posSlider.value = override.pos[axis];
      posDisp.innerText = `${override.pos[axis].toFixed(2)} m`;
    });

    document.getElementById('slider-scale').value = override.scale;
    document.getElementById('val-scale').innerText = `${override.scale.toFixed(2)}x`;
  }

  /**
   * Live-Telemetrie (Y-Koordinate) im Knochen-Editor aktualisieren
   */
  _updateLiveTelemetry() {
    if (!this.selectedBone) return;
    const wp = new THREE.Vector3();
    this.selectedBone.getWorldPosition(wp);
    const telemY = document.getElementById('telem-pos-y');
    if (telemY) telemY.innerText = `${wp.y.toFixed(3)} m`;
  }

  /**
   * 12. Timeline & Animations-Playback
   */
  _populateGaitDropdown() {
    const select = document.getElementById('select-gait');
    if (!select || !this.actions) return;

    select.innerHTML = '';
    Object.keys(this.actions).forEach((name) => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.innerText = name;
      if (name === this.settings.currentAnimation) opt.selected = true;
      select.appendChild(opt);
    });
  }

  _updateTimelineUI() {
    if (this.isScrubbing || !this.actions || !this.settings.currentAnimation) return;

    const action = this.actions[this.settings.currentAnimation];
    if (!action) return;

    const clip = action.getClip();
    const duration = clip.duration || 1.0;
    const time = (action.time % duration);
    const percent = (time / duration) * 100;
    const currentFrame = Math.round(time * 30);
    const totalFrames = Math.round(duration * 30);

    const scrubber = document.getElementById('scrubber-slider');
    if (scrubber) scrubber.value = percent;

    const curDisp = document.getElementById('scrubber-time-cur');
    if (curDisp) curDisp.innerText = `${time.toFixed(2)}s`;

    const totDisp = document.getElementById('scrubber-time-tot');
    if (totDisp) totDisp.innerText = `${duration.toFixed(2)}s`;

    const frameTag = document.getElementById('scrubber-frame-tag');
    if (frameTag) frameTag.innerText = `Frame ${currentFrame} / ${totalFrames}`;

    const playBtn = document.getElementById('btn-play-pause');
    if (playBtn) playBtn.innerText = this.settings.paused ? '▶' : '⏸';
  }

  scrubToPercent(percent) {
    if (!this.actions || !this.settings.currentAnimation) return;

    const action = this.actions[this.settings.currentAnimation];
    if (!action) return;

    const clip = action.getClip();
    const duration = clip.duration;
    const targetTime = (percent / 100) * duration;

    // Mixer pausieren während des Schrubbens
    if (!this.settings.paused) {
      this.togglePlayPause(true);
    }

    action.time = targetTime;
    if (this.mixer) this.mixer.update(0);
    this._captureBaseTransforms();
    this.horse.updateMatrixWorld(true);

    if (this.contactDetector) {
      this.contactDetector.update(0, this.settings.currentAnimation);
    }

    const curDisp = document.getElementById('scrubber-time-cur');
    if (curDisp) curDisp.innerText = `${targetTime.toFixed(2)}s`;

    const frameTag = document.getElementById('scrubber-frame-tag');
    if (frameTag) frameTag.innerText = `Frame ${Math.round(targetTime * 30)}`;
  }

  togglePlayPause(forcePause = null) {
    if (forcePause !== null) {
      this.settings.paused = forcePause;
    } else {
      this.settings.paused = !this.settings.paused;
    }

    if (this.mixer) {
      this.mixer.timeScale = this.settings.paused ? 0 : this.settings.speed;
    }

    const playBtn = document.getElementById('btn-play-pause');
    if (playBtn) playBtn.innerText = this.settings.paused ? '▶' : '⏸';
  }

  stepFrame(direction) {
    if (!this.actions || !this.settings.currentAnimation) return;

    // Zuerst pausieren falls noch am Laufen
    if (!this.settings.paused) {
      this.togglePlayPause(true);
    }

    const action = this.actions[this.settings.currentAnimation];
    if (!action) return;

    const clip = action.getClip();
    const duration = clip.duration;
    const frameStep = 1 / 30; // 30 FPS Standard Frame-Schritt

    let newTime = action.time + direction * frameStep;
    if (newTime < 0) newTime += duration;
    newTime = newTime % duration;

    action.time = newTime;
    if (this.mixer) this.mixer.update(0);
    this._captureBaseTransforms();
    this.horse.updateMatrixWorld(true);

    if (this.contactDetector) {
      this.contactDetector.update(0, this.settings.currentAnimation);
    }

    this._updateTimelineUI();
  }

  /**
   * 13. Biomechanik & Phasen-Diagramm
   */
  _updateBiomechUI(delta) {
    if (!this.contactDetector) return;

    const gaitBadge = document.getElementById('biomech-gait-name');
    if (gaitBadge) gaitBadge.innerText = this.settings.currentAnimation || 'Walk';

    // 13.1 Huf-Status abrufen
    const hooves = this.contactDetector.hoofList;
    if (!hooves || hooves.length === 0) return;

    // Snapshot für das rollende Phasen-Diagramm speichern
    const snapshot = {
      FL: hooves.find((h) => h.id === 'FL')?.isGrounded ?? false,
      FR: hooves.find((h) => h.id === 'FR')?.isGrounded ?? false,
      HL: hooves.find((h) => h.id === 'HL')?.isGrounded ?? false,
      HR: hooves.find((h) => h.id === 'HR')?.isGrounded ?? false
    };

    this.phaseHistory.push(snapshot);
    if (this.phaseHistory.length > this.maxPhaseHistory) {
      this.phaseHistory.shift();
    }

    this._drawGaitPhaseCanvas();
    this._renderBiomechHoofList(hooves);

    // Letzten Aufprall aktualisieren
    const lastImpactEl = document.getElementById('biomech-last-impact');
    if (lastImpactEl && this.contactDetector.lastImpact) {
      const imp = this.contactDetector.lastImpact;
      lastImpactEl.innerHTML = `<span style="color:#34d399;">${imp.name}</span> (${imp.gait || '-'}, ${imp.velocity.toFixed(2)} m/s)`;
    }
  }

  _drawGaitPhaseCanvas() {
    const canvas = document.getElementById('gait-phase-canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    const hoofOrder = [
      { id: 'FL', label: 'VL' },
      { id: 'FR', label: 'VR' },
      { id: 'HL', label: 'HL' },
      { id: 'HR', label: 'HR' }
    ];

    const rowH = h / 4;
    const colW = (w - 38) / this.maxPhaseHistory;

    hoofOrder.forEach((hoof, rowIdx) => {
      const y = rowIdx * rowH;

      // Huf-Label links
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(hoof.label, 8, y + rowH / 2 + 4);

      // Horizontale Trennlinie
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(32, y + rowH);
      ctx.lineTo(w, y + rowH);
      ctx.stroke();

      // Historie zeichnen
      this.phaseHistory.forEach((snap, colIdx) => {
        const x = 34 + colIdx * colW;
        const isGrounded = snap[hoof.id];

        ctx.fillStyle = isGrounded ? '#10b981' : '#1e293b';
        ctx.fillRect(x, y + 2, Math.max(1, colW - 0.5), rowH - 4);
      });
    });
  }

  _renderBiomechHoofList(hooves) {
    const container = document.getElementById('biomech-hoof-list');
    if (!container) return;

    const maxBarHeight = 0.5;

    // Falls die 4 Huf-Karten noch nicht existieren, initial erzeugen
    if (container.children.length !== hooves.length) {
      container.innerHTML = '';
      hooves.forEach((hoof) => {
        const card = document.createElement('div');
        card.id = `biomech-hoof-${hoof.id}`;
        card.className = 'biomech-hoof-row';
        card.title = `Klick, um ${hoof.name} (${hoof.boneName}) auszuwählen`;
        card.onclick = () => {
          if (hoof.boneName) {
            this.selectBone(hoof.boneName, true);
          }
        };

        card.innerHTML = `
          <div class="hoof-row-header">
            <div class="hoof-row-left">
              <strong class="hoof-id-badge">${hoof.id}</strong>
              <span class="hoof-full-name">${hoof.name}</span>
            </div>
            <div class="hoof-row-right">
              <span class="hoof-thresh-hint">Schwelle: <strong class="hoof-thresh-val">${hoof.threshold.toFixed(3)} m</strong></span>
              <span class="status-badge">LUFT</span>
            </div>
          </div>
          <div class="hoof-row-meter">
            <span class="hoof-height-val">0.000 m</span>
            <div class="meter-bar">
              <div class="meter-fill"></div>
              <div class="meter-threshold"></div>
            </div>
            <span class="meter-max-label">0.5m</span>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // 60-FPS Live-Update aller Huf-Pegelbalken & Schwellwert-Markierungen
    hooves.forEach((hoof) => {
      const card = document.getElementById(`biomech-hoof-${hoof.id}`);
      if (!card) return;

      const isGrounded = hoof.isGrounded;
      const percent = Math.min(100, Math.max(0, (hoof.currentY / maxBarHeight) * 100));
      const threshPercent = Math.min(100, Math.max(0, (hoof.threshold / maxBarHeight) * 100));

      // Visueller Zustand der Karte
      if (isGrounded) {
        if (!card.classList.contains('ground')) {
          card.classList.add('ground');
          card.classList.remove('air');
        }
      } else {
        if (!card.classList.contains('air')) {
          card.classList.add('air');
          card.classList.remove('ground');
        }
      }

      // Status-Badge
      const badge = card.querySelector('.status-badge');
      if (badge) {
        const text = isGrounded ? 'BODEN' : 'LUFT';
        if (badge.innerText !== text) {
          badge.innerText = text;
          badge.className = `status-badge ${isGrounded ? 'badge-ground' : 'badge-air'}`;
        }
      }

      // Live Zehen-Höhe (Y)
      const heightVal = card.querySelector('.hoof-height-val');
      if (heightVal) {
        heightVal.innerText = `${hoof.currentY.toFixed(3)} m`;
      }

      // Schwellwert-Anzeige
      const threshVal = card.querySelector('.hoof-thresh-val');
      if (threshVal) {
        threshVal.innerText = `${hoof.threshold.toFixed(3)} m`;
      }

      // Füllbalken (abhängig von Toe-Höhe)
      const fill = card.querySelector('.meter-fill');
      if (fill) {
        fill.style.width = `${percent.toFixed(1)}%`;
        const fillClass = `meter-fill ${isGrounded ? 'fill-ground' : 'fill-air'}`;
        if (fill.className !== fillClass) {
          fill.className = fillClass;
        }
      }

      // Schwellwert-Marker auf dem Balken
      const threshMarker = card.querySelector('.meter-threshold');
      if (threshMarker) {
        threshMarker.style.left = `${threshPercent.toFixed(1)}%`;
      }

      const meterBar = card.querySelector('.meter-bar');
      if (meterBar) {
        meterBar.title = `Höhe: ${hoof.currentY.toFixed(3)} m | Schwelle: ${hoof.threshold.toFixed(3)} m`;
      }
    });
  }

  /**
   * Automatische Schwellwert-Kalibrierung basierend auf aktuellen Extremwerten
   */
  autoCalibrateThresholds() {
    if (!this.contactDetector) return;

    // Erhöhte Toleranz für weichen Bodenkontakt
    const recommendedFront = 0.155;
    const recommendedBack = 0.265;

    this.settings.thresholdFront = recommendedFront;
    this.settings.thresholdBack = recommendedBack;

    document.getElementById('slider-thresh-front').value = recommendedFront;
    document.getElementById('val-thresh-front').innerText = `${recommendedFront.toFixed(3)} m`;

    document.getElementById('slider-thresh-back').value = recommendedBack;
    document.getElementById('val-thresh-back').innerText = `${recommendedBack.toFixed(3)} m`;

    this.contactDetector.setThresholds(recommendedFront, recommendedBack);

    alert(`Kalibrierung erfolgreich!\nEmpfohlene Schwellwerte gesetzt:\n- Vorne: ${recommendedFront} m\n- Hinten: ${recommendedBack} m`);
  }

  /**
   * 14. Mesh- & Material-Steuerung (Wireframe, Röntgen, Ghost)
   */
  setMeshMode(mode) {
    this.meshMode = mode;
    this._applyMeshMaterialSettings();
  }

  _applyMeshMaterialSettings() {
    this.horse.traverse((child) => {
      if (!child.isMesh) return;

      const mat = child.material;
      if (!mat) return;

      if (this.meshMode === 'normal') {
        mat.wireframe = false;
        mat.transparent = this.meshOpacity < 1.0;
        mat.opacity = this.meshOpacity;
      } else if (this.meshMode === 'xray') {
        // Röntgen-Effekt: Semitransparent damit das Skelett hindurchscheint
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = 0.3 * this.meshOpacity;
      } else if (this.meshMode === 'wireframe') {
        mat.wireframe = true;
        mat.transparent = false;
        mat.opacity = 1.0;
      } else if (this.meshMode === 'ghost') {
        mat.wireframe = false;
        mat.transparent = true;
        mat.opacity = 0.12 * this.meshOpacity;
      }

      mat.needsUpdate = true;
    });
  }

  loadTexture(textureName) {
    this.currentTextureName = textureName;
    const loader = new THREE.TextureLoader();
    const texturePath = `/textures/${textureName}.png`;

    loader.load(texturePath, (tex) => {
      tex.flipY = false;
      tex.colorSpace = THREE.SRGBColorSpace;

      this.horse.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.map = tex;
          child.material.needsUpdate = true;
        }
      });
      console.log(`[SkeletonAnalyzer] Neue Textur geladen: ${texturePath}`);
    });
  }

  /**
   * 15. Kamera-Presets
   */
  setCameraPreset(preset) {
    if (!this.camera || !this.controls) return;

    if (preset === 'lateral') {
      // Sagittalebene (Seite)
      this.camera.position.set(4.5, 1.5, 0);
      this.controls.target.set(0, 1.0, 0);
    } else if (preset === 'frontal') {
      // Kranial (Vorne)
      this.camera.position.set(0, 1.6, 4.5);
      this.controls.target.set(0, 1.1, 0);
    } else if (preset === 'dorsal') {
      // Oben
      this.camera.position.set(0.1, 5.0, 0.1);
      this.controls.target.set(0, 0.8, 0);
    } else if (preset === 'iso') {
      // Isometrisch
      this.camera.position.set(3.5, 2.5, 3.5);
      this.controls.target.set(0, 1.0, 0);
    } else if (preset === 'hoof') {
      // Huf-Nahaufnahme am Boden
      this.camera.position.set(1.8, 0.35, 1.5);
      this.controls.target.set(0.3, 0.15, 0.3);
    }

    this.controls.update();
  }

  /**
   * 16. Schnell-Posen (Pose Presets)
   */
  applyPosePreset(presetName) {
    this.resetAllBones();

    if (presetName === 'proud') {
      // Stolzer aufrechter Hals & Kopf
      this._setBoneOverride('E_spine008', { rot: { x: -15, y: 0, z: 0 } });
      this._setBoneOverride('E_spine009', { rot: { x: -25, y: 0, z: 0 } });
      this._setBoneOverride('E_spine010', { rot: { x: -15, y: 0, z: 0 } });
      this._setBoneOverride('E_spine011', { rot: { x: 30, y: 0, z: 0 } });
    } else if (presetName === 'grazing') {
      // Grasen: Kopf und Hals tief zum Boden geneigt
      this._setBoneOverride('E_spine008', { rot: { x: 20, y: 0, z: 0 } });
      this._setBoneOverride('E_spine009', { rot: { x: 45, y: 0, z: 0 } });
      this._setBoneOverride('E_spine010', { rot: { x: 30, y: 0, z: 0 } });
      this._setBoneOverride('E_spine011', { rot: { x: -20, y: 0, z: 0 } });
    } else if (presetName === 'tail_up') {
      // Schweif hoch aufgerichtet
      this._setBoneOverride('E_spine003', { rot: { x: -45, y: 0, z: 0 } });
      this._setBoneOverride('E_spine002', { rot: { x: -30, y: 0, z: 0 } });
      this._setBoneOverride('E_spine001', { rot: { x: 20, y: 0, z: 0 } });
    } else if (presetName === 'rear') {
      // Aufbäumen
      this._setBoneOverride('E_spine004', { rot: { x: -35, y: 0, z: 0 } });
      this._setBoneOverride('E_spine009', { rot: { x: -20, y: 0, z: 0 } });
      this._setBoneOverride('E_shoulderL', { rot: { x: 30, y: 0, z: 0 } });
      this._setBoneOverride('E_shoulderR', { rot: { x: 30, y: 0, z: 0 } });
    }

    this._updateEditorSliders();
  }

  _setBoneOverride(boneName, values) {
    if (!this.boneOverrides[boneName]) {
      this.boneOverrides[boneName] = {
        enabled: true,
        rot: { x: 0, y: 0, z: 0 },
        pos: { x: 0, y: 0, z: 0 },
        scale: 1.0
      };
    }
    this.boneOverrides[boneName].enabled = true;
    if (values.rot) Object.assign(this.boneOverrides[boneName].rot, values.rot);
    if (values.pos) Object.assign(this.boneOverrides[boneName].pos, values.pos);
    if (values.scale !== undefined) this.boneOverrides[boneName].scale = values.scale;
  }

  resetBone(boneName) {
    if (this.boneOverrides[boneName]) {
      this.boneOverrides[boneName] = {
        enabled: false,
        rot: { x: 0, y: 0, z: 0 },
        pos: { x: 0, y: 0, z: 0 },
        scale: 1.0
      };
    }
    this._updateEditorSliders();
  }

  resetAllBones() {
    this.boneOverrides = {};
    this.bones.forEach((b) => {
      this.boneOverrides[b.name] = {
        enabled: false,
        rot: { x: 0, y: 0, z: 0 },
        pos: { x: 0, y: 0, z: 0 },
        scale: 1.0
      };
    });
    this._updateEditorSliders();
  }
}
