
export class Spring {
  constructor(stiffness = 25, damping = 8) {
    this.value = 0;
    this.velocity = 0;

    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(target, delta) {
    const dt = Math.min(delta, 1 / 30);

    // Federkraft: zieht zur Zielposition
    const springForce =
      (target - this.value) * this.stiffness;

    // Dämpfung: bremst die Bewegung
    const dampingForce =
      -this.velocity * this.damping;

    // Beschleunigung berechnen
    const acceleration = springForce + dampingForce;

    // Geschwindigkeit und Position aktualisieren
    this.velocity += acceleration * dt;
    this.value += this.velocity * dt;

    return this.value;
  }
}




const GAIT_PROFILES = {
  Rest: {
    frequency: 1.4,
    amplitude: 0.2,
    verticalAmplitude: 0.05
  },
  Walk: {
    frequency: 1.5,
    amplitude: 1.1,
    verticalAmplitude: 0.8
  },
  Trot: {
    frequency: 2.8,
    amplitude: 1.8,
    verticalAmplitude: 5.5
  },
  Gallop: {
    frequency: 4.0,
    amplitude: 2.5,
    verticalAmplitude: 8.0
  }
};




export class TailSimulation {
  constructor(horse, contactDetector) {
  this.contactDetector = contactDetector;
    this.time = 0;
    // Jeder Schweifabschnitt besitzt eine eigene Feder

this.sections = [
  {
    name: 'E_spine003',
    amplitude: 0.060,
    spring: new Spring(40, 13)
  },
  {
    name: 'E_spine002',
    amplitude: 0.065,
    spring: new Spring(34, 12)
  },
  {
    name: 'E_spine012',
    amplitude: 0.070,
    spring: new Spring(28, 10)
  },
  {
    name: 'E_spine001',
    amplitude: 0.080,
    spring: new Spring(23, 9)
  },
  {
    name: 'E_spine013',
    amplitude: 0.090,
    spring: new Spring(18, 8)
  },
  {
    name: 'E_spine',
    amplitude: 0.100,
    spring: new Spring(14, 7)
  }
];



    // Bones im Pferdemodell suchen
  
for (const section of this.sections) {
  section.bone = horse.getObjectByName(section.name);

  // Seitliche Bewegung (Z-Achse)
  section.lastAngle = 0;

  // Vertikale Bewegung (X-Achse)
  section.springVertical = new Spring(
    section.spring.stiffness,
    section.spring.damping
  );
  section.lastVerticalAngle = 0;

  if (!section.bone) {
    console.warn('Bone nicht gefunden:', section.name);
  }
}

  }



beforeMixerUpdate() {
  for (const section of this.sections) {
    if (!section.bone) continue;

    // Vorherige seitliche Bewegung entfernen
    section.bone.rotation.z -= section.lastAngle;

    // Vorherige vertikale Bewegung entfernen
    section.bone.rotation.x -= section.lastVerticalAngle;
  }
}





update(delta, settings, activeAction) {


  const dt = settings.paused ? 0 : delta * settings.speed;

  if (dt > 0) {
    this.time += dt;
  }

  const gait = GAIT_PROFILES[settings.currentAnimation]
    ?? GAIT_PROFILES.Rest;

  // Seitliches Schwingen


  for (const [index, section] of this.sections.entries()) {
    if (!section.bone) continue;

    // Zeitliche Verzögerung entlang des Schweifs

    // Zeitliche Verzögerung entlang des Schweifs
    const phase = index * 0.3;

    // Standardbewegung für Rest, Trot und Gallop
    let sideSignal = Math.sin(
      this.time * gait.frequency * 0.6 - phase
    );

    let verticalSignal = Math.sin(
      this.time * gait.frequency - phase - 0.2
    );

    if (
      settings.currentAnimation === 'Walk' ||
      settings.currentAnimation === 'Trot'
    ) {
      const left = this.contactDetector.hooves.HL;
      const right = this.contactDetector.hooves.HR;

      const legDifference =
        left.worldPosition.z - right.worldPosition.z;

      const legSignal = Math.max(
        -1,
        Math.min(1, legDifference / 0.7)
      );

      // Links/rechts folgt dem Wechsel der Hinterbeine
     
sideSignal = -legSignal;

if (settings.currentAnimation === 'Trot' && activeAction) {
  // Phase der aktuell abgespielten Trab-Animation
  const duration = activeAction.getClip().duration;
  const gaitPhase = (activeAction.time / duration) * Math.PI * 2;

  // Welle wandert vom Schweifansatz zur Spitze
  const wavePhase = index * 1.7;

  // Zwei vertikale Schwingungen pro Animationszyklus
  verticalSignal = Math.sin(
    2 * gaitPhase - wavePhase
  );
} else {
  // Bisherige Walk-Bewegung beibehalten
  verticalSignal = 2 * Math.abs(legSignal) - 1;
}

    }


if (settings.currentAnimation === 'Gallop' && activeAction) {
  const duration = activeAction.getClip().duration;

  // Aktuelle Position innerhalb des Galoppzyklus
  const gaitPhase =
    (activeAction.time / duration) * Math.PI * 2;

  // Langsamere, große Welle vom Ansatz zur Spitze
  const wavePhase = index * 0.75;

  verticalSignal = Math.sin(
    gaitPhase - wavePhase
  );

  // Kleinere seitliche Bewegung im Galopprhythmus
  sideSignal = 0.5 * Math.sin(
    gaitPhase - index * 0.35
  );
}


    let sideAngle = section.lastAngle;
    let verticalAngle = section.lastVerticalAngle;

    if (dt > 0) {
      // Zielwinkel für seitliche Bewegung
      const sideTarget =
        sideSignal * section.amplitude * gait.amplitude;

      

const tipBoost = settings.currentAnimation === 'Trot'
  ? [1.0, 1.1, 1.2, 1.4, 1.7, 2.0][index]
  : 1.0;

const verticalTarget =
  verticalSignal *
  section.amplitude *
  0.5 *
  gait.verticalAmplitude *
  tipBoost;



   
      // Seitliche Feder aktualisieren
      sideAngle = section.spring.update(sideTarget, dt);

      // Vertikale Feder je nach Gangart einstellen
      
if (settings.currentAnimation === 'Trot') {
  section.springVertical.stiffness = 170;

  // Weniger Dämpfung Richtung Schweifspitze
  section.springVertical.damping =
    [17, 16, 15, 13, 12, 10][index];
}
 else if (settings.currentAnimation === 'Gallop') {
  // Galopp: Federn reagieren schneller auf den Laufzyklus
  section.springVertical.stiffness =
    [260, 250, 240, 230, 220, 210][index];

  // Zur Spitze hin weniger Dämpfung
  section.springVertical.damping =
    [20, 19, 18, 17, 16, 15][index];

} else {
  // Rest und Walk unverändert
  section.springVertical.stiffness = section.spring.stiffness;
  section.springVertical.damping = section.spring.damping;
}

      // Vertikale Feder aktualisieren
      verticalAngle = section.springVertical.update(
        verticalTarget,
        dt
      );

    }

    // Bewegungen zusätzlich zur aktuellen Animation
    section.bone.rotation.z += sideAngle;
    section.bone.rotation.x += verticalAngle;

    // Werte für den nächsten Frame merken
    section.lastAngle = sideAngle;
    section.lastVerticalAngle = verticalAngle;
  }
}


}
