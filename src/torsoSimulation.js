import { Spring } from './tailSimulation.js';


const GAIT_PROFILES = {
  Rest:   { frequency: 0.8, amplitude: 0.001 },
  Walk:   { frequency: 1.5, amplitude: 0.004 },
  Trot:   { frequency: 2.8, amplitude: 0.012 },
  Gallop: { frequency: 4.0, amplitude: 0.032 }
};


export class TorsoSimulation {
  constructor(horse) {
    this.time = 0;

    


this.sections = [
  {
    name: 'E_spine005',
    amplitude: 1.0,
    phase: 0,
    spring: new Spring(60, 14)
  },
  {
    name: 'E_spine006',
    amplitude: -0.35,
    phase: 0.10,
    spring: new Spring(60, 14)
  },
  {
    name: 'E_spine007',
    amplitude: -0.65,
    phase: 0.18,
    spring: new Spring(60, 14)
  }
];




    for (const section of this.sections) {
      section.bone = horse.getObjectByName(section.name);
      section.lastAngle = 0;

      if (!section.bone) {
        console.warn('Body-Bone nicht gefunden:', section.name);
      }
    }
  }

  beforeMixerUpdate() {
    for (const section of this.sections) {
      if (!section.bone) continue;

      // Vorherige Zusatzrotation entfernen
      section.bone.rotation.x -= section.lastAngle;
    }
  }

  update(delta, settings, activeAction) {
    const dt = settings.paused ? 0 : delta * settings.speed;

    if (dt > 0) {
      this.time += dt;
    }

    const gait =
      GAIT_PROFILES[settings.currentAnimation] ??
      GAIT_PROFILES.Rest;

    let basePhase = this.time * gait.frequency;

    // Bei Trot / Gallop lieber an die echte Animationsphase koppeln
    if (
      (settings.currentAnimation === 'Trot' ||
        settings.currentAnimation === 'Gallop') &&
      activeAction
    ) {
      const duration = activeAction.getClip().duration || 1;
      basePhase = (activeAction.time / duration) * Math.PI * 2;
    }

    
for (const section of this.sections) {
  if (!section.bone) continue;

  const signal = Math.sin(basePhase - section.phase);

  const target =
    signal *
    gait.amplitude *
    section.amplitude;

  let angle = section.lastAngle;

  if (dt > 0) {
    angle = section.spring.update(target, dt);
  }

  section.bone.rotation.x += angle;
  section.lastAngle = angle;
}

  }
}