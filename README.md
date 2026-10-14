# Three.js Dokumentation: Animiertes 3D-Pferd mit GLTF/GLB & GUI-Steuerung

Diese Dokumentation erklärt den modularen Aufbau der Three.js-Anwendung zur Darstellung und Steuerung eines geriggten 3D-Pferdemodells. Der Schwerpunkt liegt auf der Funktionsweise des Ladevorgangs von GLB-Dateien, der Szenengraph-Traversierung und der Skelettanimations-Pipeline.

---

## 1. Szenenaufbau, Rendering & Kamera

```javascript
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1b1d23);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

```

* **`PerspectiveCamera(fov, aspect, near, far)`:** Simuliert das menschliche Auge. Das Sichtfeld (*Field of View*) beträgt **75°**, Clipping-Ebenen liegen zwischen **0.1** und **1000** Welteinheiten.
* **`renderer.setPixelRatio(Math.min(..., 2))`:** Verhindert Performance-Einbrüche auf hochauflösenden Bildschirmen (Retina/4K), indem die Pixeldichte auf maximal das 2-fache limitiert wird.
* **`window.addEventListener('resize', ...)`:** Aktualisiert bei Größenänderungen des Fensters das Seitenverhältnis der Kamera (`aspect`) sowie die Projektionsmatrix (`updateProjectionMatrix()`), damit das Modell nicht verzerrt wird.

---

## 2. Beleuchtung & visuelle Referenzen

```javascript
scene.add(new THREE.GridHelper(20, 20, 0x555a66, 0x2c3038));
scene.add(new THREE.AxesHelper(3));

scene.add(new THREE.AmbientLight(0xffffff, 1));
const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
keyLight.position.set(5, 8, 5);
scene.add(keyLight);

```

* **`AmbientLight`:** Streulicht ohne feste Quelle, hellt alle Flächen des Modells gleichmäßig auf und verhindert komplett schwarze Schatten.
* **`DirectionalLight`:** Paralleles Licht (wie Sonnenlicht). Durch die Positionierung bei `(5, 8, 5)` entsteht ein plastischer Schattierungseffekt auf der Muskulatur des Modells.
* **`GridHelper` & `AxesHelper`:** Dienen als räumliche Referenz (Rot = X, Grün = Y, Blau = Z) zur Überprüfung von Bodenkontakt und Hufpositionen.

---

## 3. Textur-Pipeline & Farbmanagement

```javascript
const textureLoader = new THREE.TextureLoader();
const horseTexture = textureLoader.load('/textures/Dark.png');
horseTexture.flipY = false; 
horseTexture.colorSpace = THREE.SRGBColorSpace;

```

* **`flipY = false` (Kritisch für GLTF/GLB):** Standardmäßig spiegelt Three.js Texturen vertikal an der Y-Achse (entsprechend dem klassischen OpenGL-Standard). Die **glTF 2.0-Spezifikation** definiert den UV-Koordinatenursprung jedoch oben links. Ohne `flipY = false` läge die Textur spiegelverkehrt oder fehlerhaft auf dem Pferdekörper.
* **`colorSpace = THREE.SRGBColorSpace`:** Stellt sicher, dass die Textur im sRGB-Farbraum dekodiert und vom Shader im linearen Farbraum verarbeitet wird. Fehlt diese Angabe, wirkt das Modell verwaschen oder farblich verfälscht.

---

## 4. Deep-Dive: Die GLB-Ladelogik & Szenengraph (`GLTFLoader`)

Der Abschnitt rund um `gltfLoader.load(...)` ist das funktionale Herzstück der Anwendung.

```javascript
const gltfLoader = new GLTFLoader();

gltfLoader.load(
  'models/Horse.glb',
  (gltf) => {
    const horse = gltf.scene;

    horse.traverse((child) => {
      if (child.isMesh) {
        child.material.map = horseTexture;
        child.material.needsUpdate = true;
      }
    });

    scene.add(horse);
    // ...
  }
);

```

### Was ist eine GLB-Datei?

Eine `.glb`-Datei ist die binäre Container-Variante von glTF (*GL Transmission Format*). Sie packt alle 3D-Daten in ein einzelnes File:

* **JSON-Header:** Beschreibt die Hierarchie (Nodes, Kameras, Lichter, Bones).
* **Binär-Chunk:** Enthält Vertex-Puffer (Positionen, Normalen, UVs, Skin-Gewichte).
* **Animation-Tracks:** Enthält Keyframes für Knochenrotationen und -positionen.

### Die Komponenten des Ladevorgangs

1. **`gltf.scene` (Root Node):**
Das vom Loader zurückgegebene Objekt ist eine hierarchische Baumstruktur (`THREE.Group` oder `THREE.Object3D`). Sie enthält alle Meshes, Knochenketten (*Armature*) und Transformationen des Modells.
2. **`horse.traverse(callback)` (Rekursive Traversierung):**
Ein GLB-Modell besteht fast nie aus nur einem einzelnen Objekt, sondern aus Untergruppen, Nodes und separaten Teil-Meshes (z. B. Körper, Mähne, Augen). `traverse` iteriert Tiefen-zuerst (*Depth-First*) durch jeden einzelnen Knoten des Modells:
* **`child.isMesh`:** Prüft, ob der aktuelle Knoten ein renderbares 3D-Gitter ist (oft ein `THREE.SkinnedMesh` bei geriggten Charakteren) und ignoriert reine Hilfsknoten wie Bones oder Transform-Gruppen.
* **`child.material.map = horseTexture`:** Weist dem Material des Teil-Meshes die geladene Textur zu.
* **`child.material.needsUpdate = true`:** Signalisiert Three.js, dass die Shader-Programme auf der GPU mit der neuen Textur-Bindung neu kompiliert bzw. aktualisiert werden müssen.



---

## 5. Skelettanimations-Pipeline & Weiche Übergänge

Three.js trennt Skelettanimationen in drei Ebenen: **Daten** (`AnimationClip`), **Verwaltung** (`AnimationMixer`) und **Zustand** (`AnimationAction`).

```
gltf.animations (Array aus AnimationClips)
       │
       ▼
THREE.AnimationMixer (Globale Zeitverwaltung des Pferdes)
       │
       ▼
actions[clip.name] = mixer.clipAction(clip) (Steuert Abspielstatus & Blending)

```

### Initialisierung der Aktionen

```javascript
mixer = new THREE.AnimationMixer(horse);

const animNames = [];
gltf.animations.forEach((clip) => {
  actions[clip.name] = mixer.clipAction(clip);
  animNames.push(clip.name);
});

settings.currentAnimation = animNames[0];
activeAction = actions[settings.currentAnimation];
activeAction.play();

```

* **`THREE.AnimationMixer(horse)`:** Der Treiber aller Skelettdeformationen. Er synchronisiert die Posen der Knochen (`THREE.Bone`) bezogen auf das `horse`-Objekt.
* **`mixer.clipAction(clip)`:** Erstellt aus einem statischen Rohdaten-Clip (`AnimationClip`) eine instanziierte Kontroll-Aktion (`AnimationAction`). Hierüber werden Loop-Modi, Gewichtung (*Weight*) und Zeitskalierung kontrolliert.

### Flüssiges Überblenden (Crossfading)

```javascript
function transitionTo(nextName) {
  const nextAction = actions[nextName];
  if (!nextAction || nextAction === activeAction) return;

  nextAction.reset();
  nextAction.enabled = true;
  nextAction.play();

  activeAction.crossFadeTo(nextAction, settings.crossfadeDuration, true);
  activeAction = nextAction;
}

```

* **Problem bei hartem Wechsel:** Stoppt man eine Gangart (z. B. Schritt) und startet sofort Galopp, springen die Knochen ruckartig von einer Pose in die nächste.
* **Lösung mit `crossFadeTo(nextAction, duration, warp)`:**
1. `nextAction` wird aktiviert und läuft parallel zur alten Animation an.
2. Über die Dauer `crossfadeDuration` (z. B. 0.5 Sekunden) blendet Three.js das Gewicht der aktuellen Aktion von **1 auf 0** herunter und gleichzeitig das Gewicht der Zielaktion von **0 auf 1** herauf.
3. Die Knochenpositionen und -rotationen werden in jedem Frame linear interpoliert (SLERP für Rotations-Quaternionen), wodurch ein nahtloser morphingartiger Bewegungsübergang entsteht.



---

## 6. GUI-Steuerung (`lil-gui`)

```javascript
const gui = new GUI({ title: 'Pferde-Steuerung' });

gui.add(settings, 'currentAnimation', animNames)
  .name('Gangart')
  .onChange((name) => transitionTo(name));

gui.add(settings, 'crossfadeDuration', 0.1, 2.0, 0.1)
  .name('Übergang (s)');

gui.add(settings, 'speed', 0.1, 2.5, 0.1)
  .name('Tempo')
  .onChange((val) => {
    if (mixer) mixer.timeScale = settings.paused ? 0 : val;
  });

gui.add(settings, 'paused')
  .name('Pausieren')
  .onChange((isPaused) => {
    if (mixer) mixer.timeScale = isPaused ? 0 : settings.speed;
  });

```

* **Dynamisches Dropdown:** Das Dropdown-Menü wird erst befüllt, sobald die GLB-Datei fertig geladen ist (`animNames`). So funktioniert der Code unabhängig davon, wie die Animationsspuren in Blender oder der 3D-Software benannt wurden (z. B. *Walk*, *Trot*, *Gallop*).
* **`mixer.timeScale`:** Skaliert die Ablaufgeschwindigkeit aller Aktionen des Mixers. Ein Wert von `2.0` verdoppelt die Schrittfrequenz, `0.0` pausiert die Animation framegenau.

---

## 7. Render-Loop & Frame-Timing (`THREE.Timer`)

```javascript
const timer = new THREE.Timer();

function animate(timestamp) {
  requestAnimationFrame(animate);

  timer.update(timestamp);
  const delta = timer.getDelta();

  if (mixer) {
    mixer.update(delta);
  }

  controls.update();
  renderer.render(scene, camera);
}
requestAnimationFrame(animate);

```

* **`THREE.Timer` vs. `requestAnimationFrame`:** `requestAnimationFrame` liefert zwar einen Zeitstempel, aber die Bildwiederholrate variiert je nach Monitor (60 Hz, 144 Hz) oder Last.
* **`timer.update(timestamp)` & `timer.getDelta()`:** Ermittelt exakt die vergangene Zeit $\Delta t$ (in Sekunden) seit dem letzten Frame.
* **`mixer.update(delta)`:** Rechnet die Keyframe-Transformationen exakt um das Zeitintervall weiter. Dadurch läuft die Animation auf einem 60-Hz- und einem 144-Hz-Display physikalisch exakt gleich schnell ab (*Frame-Rate Independence*).
* **`controls.update()`:** Berechnet das träge Nachschwingen der Kamera (*Damping*).

---

## 8. Hufkontakt-Analyse & Schwellwert-Ermittlung

Um präzise zu erkennen, wann die Hufe den Boden ($Y = 0$) berühren und wann sie sich in der Luft befinden, werden die Knochenkoordinaten der Zehenglieder kontinuierlich ausgewertet.

### 8.1 Knochenhierarchie & anatomische Ursachen für zwei Schwellwerte

Eine messtechnische Abtastung der Knochenkoordinaten (`getWorldPosition`) über alle Animations-Keyframes ergab folgende Wertebereiche:

| Huf / Knochen | Knochenname | Ruhelage (Rest) | Min. Höhe (Boden) | Max. Höhe (Luft) | Empfohlener Schwellwert |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Vorne Links (VL)** | `E_front_toeL` | `0.1416 m` | `0.1352 m` | `0.4665 m` | **`0.155 m`** |
| **Vorne Rechts (VR)** | `E_front_toeR` | `0.1416 m` | `0.1360 m` | `0.4374 m` | **`0.155 m`** |
| **Hinten Links (HL)** | `E_toeL` | `0.2512 m` | `0.2416 m` | `0.6068 m` | **`0.265 m`** |
| **Hinten Rechts (HR)** | `E_toeR` | `0.2512 m` | `0.2416 m` | `0.6068 m` | **`0.265 m`** |

#### Warum zwei unterschiedliche Schwellwerte?
1. **Unterschiedliche Knochenhöhe im Rig:** Das 3D-Gitter (*Mesh*) der Hufe schließt an allen vier Hufen bei exakt $Y = 0.000$ mit dem Boden ab. Die Knochenursprünge (*Bone Origins*) der Zehenglieder sitzen im Skelett jedoch auf unterschiedlichen Höhen:
   * Die vorderen Zehenknochen (`E_front_toeL / R`) sitzen tiefer im Huf auf ca. **`0.14 m`**.
   * Die hinteren Zehenknochen (`E_toeL / R`) sitzen anatomisch bedingt (Fesselgelenk-Geometrie des Rigs) höher auf ca. **`0.25 m`**.
2. **Schwellwert-Logik:**
   * Ein Huf gilt als **am Boden**, wenn $Y_{\text{Knochen}} \le \text{Schwellwert}$.
   * Ein Huf gilt als **in der Luft**, wenn $Y_{\text{Knochen}} > \text{Schwellwert}$.
   * Durch `thresholdFront = 0.155 m` und `thresholdBack = 0.265 m` wird ein robuster Toleranzbereich von ca. $1.5\text{ cm}$ über dem minimalen Bodenwert gewährleistet.

### 8.2 Visuelle 3D- und 2D-Anzeige

* **2D Glassmorphism-HUD:** Ein modulares Info-Panel am oberen linken Bildschirmrand visualisiert alle 4 Hufe (VL, VR, HL, HR) in Echtzeit mit Status-Badges (`BODEN` in Grün vs. `LUFT` in Blau), Live-$Y$-Werten, Schwellwertmarkierungen und einer Aufprall-Ereignisanzeige.
* **3D-Bodenringe & Höhenlinien:** Direkt unter jedem Huf wird ein Kontaktring auf den Boden ($Y = 0.002$) projiziert. Bei Bodenkontakt leuchtet der Ring grün mit gefüllter Scheibe; in der Luft wird er transparent und zeigt als Schatten die Bodenprojektion. Eine dynamische Höhenlinie visualisiert die Distanz zum Boden.
* **lil-gui Steuerung:** Beide Schwellwerte sowie alle visuellen Hilfen lassen sich über Slider framegenau justieren und austesten.