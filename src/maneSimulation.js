
const OUTWARD_LEFT = 1;
const OUTWARD_RIGHT = -1;

const MOTION_PROFILES = {
  Rest: {
    speed: 1.8,
    amplitudes: [0.003, 0.012, 0.030],
    liftScale: 0.7,
    tipBoost: 1.0
  },

  Walk: {
    speed: 4.5,
    amplitudes: [0.012, 0.055, 0.140],
    liftScale: 0.9,
    tipBoost: 1.0
  },

  Trot: {
    speed: 9.0,
    amplitudes: [0.030, 0.120, 0.580],
    liftScale: 1.0,
    tipBoost: 1.8
  },

  Gallop: {
    speed: 11.0,
    amplitudes: [0.060, 0.240, 0.700],
    liftScale: 1.25,
    tipBoost: 1.8
  }
};

export class ManeSimulation {
  constructor(horse) {
    this.time = 0;

    const maneBones = [];

    // Alle Mähnen-Bones finden
    horse.traverse((object) => {
      if (
        object.isBone &&
        object.name.startsWith('Mane_')
      ) {
        maneBones.push(object);
      }
    });

    // Haaransätze finden
    const roots = maneBones.filter(
      (bone) => !bone.parent?.name.startsWith('Mane_')
    );

    this.strands = roots.map((root, strandIndex) => {
      const bones = [root];
      let current = root;

      // Drei Bones pro Strähne
      while (bones.length < 3) {
        const next = current.children.find(
          (child) =>
            child.isBone &&
            child.name.startsWith('Mane_')
        );

        if (!next) break;

        bones.push(next);
        current = next;
      }

      // Linke und rechte Strähnen unterscheiden
      let outwardSign = 0;

      if (root.name.includes('_L_')) {
        outwardSign = OUTWARD_LEFT;
      } else if (root.name.includes('_R_')) {
        outwardSign = OUTWARD_RIGHT;
      }

      return {
        bones,
        outwardSign,

        // Unterschiedliche Bewegung pro Strähne
        phase: strandIndex * 0.20,

        isCenter:
          root.name.startsWith('Mane_Center_'),

        // Letzte Zusatzrotationen speichern
        lastForward: bones.map(() => 0),
        lastSide: bones.map(() => 0)
      };
    });

    console.log(
      'Mähnensträhnen gefunden:',
      this.strands.length
    );
  }

  beforeMixerUpdate() {
    // Zusatzrotationen des letzten Frames entfernen
    for (const strand of this.strands) {
      strand.bones.forEach((bone, i) => {
        bone.rotation.x -= strand.lastSide[i];
        bone.rotation.z -= strand.lastForward[i];
      });
    }
  }

  update(delta, settings) {
    const dt = settings.paused
      ? 0
      : Math.min(delta * settings.speed, 0.05);

    if (dt > 0) {
      this.time += dt;
    }

    const gaitName = settings.currentAnimation;

    const motion =
      MOTION_PROFILES[gaitName] ??
      MOTION_PROFILES.Rest;

    for (const strand of this.strands) {
      const sign = strand.outwardSign;

      strand.bones.forEach((bone, i) => {

        // Unterschiedliche Phase für jeden Bone
        const phase =
          this.time * motion.speed -
          i * 0.95 +
          strand.phase;

        // ===================================
        // 1. X: Vorwärts-/Rückwärtsschwingen
        // ===================================

        let xAngle =
          Math.sin(phase) *
          motion.amplitudes[i];

        // Center-Strähne:
        // Bewegung in den Hals begrenzen
        if (strand.isCenter) {
          const inwardLimits = [
            0.005, 0.018, 0.035
          ];

          xAngle = Math.max(
            -inwardLimits[i],
            xAngle
          );
        }

        // ===================================
        // 2. Z: Bewegung vom Hals weg
        // ===================================

        const liftStrength =
          sign === OUTWARD_RIGHT
            ? [0.025, 0.065, 0.120][i]
            : [0.025, 0.065, 0.095][i];

        const liftFactor =
          sign === OUTWARD_RIGHT
            ? 0.65 +
              0.35 * Math.abs(Math.sin(phase))
            : 0.40 +
              0.60 * Math.abs(Math.sin(phase));

        let zAngle = 0;

        if (sign !== 0) {
          const tipBoost =
            i === 2 ? motion.tipBoost : 1.0;

          zAngle =
            -sign *
            liftStrength *
            liftFactor *
            motion.liftScale *
            tipBoost;
        }

        // ===================================
        // 3. Rotationen anwenden
        // ===================================

        bone.rotation.x += xAngle;
        bone.rotation.z += zAngle;

        // Für nächsten Frame merken
        strand.lastSide[i] = xAngle;
        strand.lastForward[i] = zAngle;
      });
    }
  }
}
