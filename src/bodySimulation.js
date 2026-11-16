
import * as THREE from 'three';
import { Spring } from './tailSimulation.js';


const BODY_PROFILES = {
  Rest: {
    base: 0.003,
    lower: 0.008,
    upper: 0.012,
    head: -0.010,
    cycles: 1
  },
  Walk: {
    base: 0.010,
    lower: 0.012,
    upper: 0.020,
    head: -0.025,
    cycles: 1
  },
  Trot: {
    base: 0.015,
    lower: 0.020,
    upper: 0.025,
    head: -0.035,
    cycles: 2
  },
  Gallop: {
    base: 0.050,
    lower: 0.075,
    upper: 0.085,
    head: -0.130,
    cycles: 1
  }
};


export class BodySimulation {
  constructor(horse) {
    this.time = 0;

    // Lokale X-Achse für die Nickbewegung
    this.axis = new THREE.Vector3(1, 0, 0);
    this.tempQuaternion = new THREE.Quaternion();

    this.sections = [
      {
        name: 'E_spine008',
        key: 'base',
        phase: -0.2,
        spring: new Spring(220, 20)
      },
      {
        name: 'E_spine009',
        key: 'lower',
        phase: 0,
        spring: new Spring(220, 20)
      },
      {
        name: 'E_spine010',
        key: 'upper',
        phase: 0.2,
        spring: new Spring(220, 19)
      },
      {
        name: 'E_spine011',
        key: 'head',
        phase: 0.4,
        spring: new Spring(200, 18)
      }
    ];

    for (const section of this.sections) {
      section.bone = horse.getObjectByName(section.name);
      section.lastAngle = 0;

      if (!section.bone) {
        console.warn('Körper-Bone nicht gefunden:', section.name);
      }
    }
  }

  beforeMixerUpdate() {
    for (const section of this.sections) {
      if (!section.bone) continue;

      // Zusatzrotation des letzten Frames entfernen
      this.tempQuaternion.setFromAxisAngle(
        this.axis,
        -section.lastAngle
      );

      section.bone.quaternion.multiply(this.tempQuaternion);
    }
  }

  update(delta, settings, activeAction) {
    const dt = settings.paused
      ? 0
      : delta * settings.speed;

    if (dt > 0) {
      this.time += dt;
    }

    const profile =
      BODY_PROFILES[settings.currentAnimation]
      ?? BODY_PROFILES.Rest;

    let phase = this.time * 1.2;

    // Mit dem tatsächlich abgespielten Laufzyklus synchronisieren
    if (
      settings.currentAnimation !== 'Rest' &&
      activeAction
    ) {
      const duration = activeAction.getClip().duration;

      if (duration > 0) {
        phase =
          (activeAction.time / duration) *
          Math.PI * 2 *
          profile.cycles;
      }
    }

    for (const section of this.sections) {
      if (!section.bone) continue;

      // Hals beginnt, Kopf reagiert leicht verzögert
      const signal = Math.sin(phase - section.phase);

      const target = signal * profile[section.key];

      const angle = dt > 0
        ? section.spring.update(target, dt)
        : section.lastAngle;

      // Rotation zusätzlich zur normalen Pferdeanimation
      this.tempQuaternion.setFromAxisAngle(
        this.axis,
        angle
      );

      section.bone.quaternion.multiply(this.tempQuaternion);

      section.lastAngle = angle;
    }
  }
}
