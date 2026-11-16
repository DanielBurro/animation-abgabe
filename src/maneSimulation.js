
import { Spring } from './tailSimulation.js';

export class ManeSimulation {
  constructor(horse) {
    this.time = 0;

    // Alle Mähnen-Bones im Pferdemodell finden
    const maneBones = [];

    horse.traverse((object) => {
      if (object.isBone && object.name.startsWith('Mane_')) {
        maneBones.push(object);
      }
    });

    // Die ersten Bones der einzelnen Strähnen finden
    const roots = maneBones.filter((bone) =>
      !bone.parent?.name.startsWith('Mane_')
    );

    // Jede Strähne besteht aus einer Kette von drei Bones
    this.strands = roots.map((root, index) => {
      const bones = [root];
      let current = root;

      while (bones.length < 3) {
        const next = current.children.find(
          (child) => child.isBone && child.name.startsWith('Mane_')
        );

        if (!next) break;

        bones.push(next);
        current = next;
      }

      return {
        bones,

        // Eine Feder pro Bone
        springs: bones.map((bone, i) => {
          const stiffness = [40, 25, 15][i];
          const damping = [12, 8, 5][i];

          return new Spring(stiffness, damping);
        }),

        lastAngles: bones.map(() => 0),

        // Kleine Unterschiede zwischen den Haarsträhnen
        phase: index * 0.35
      };
    });

    console.log('Mähnensträhnen gefunden:', this.strands.length);
    console.table(
      this.strands.map((strand) => ({
        Ansatz: strand.bones[0]?.name,
        BoneAnzahl: strand.bones.length
      }))
    );
  }

  beforeMixerUpdate() {
    for (const strand of this.strands) {
      strand.bones.forEach((bone, index) => {
        bone.rotation.z -= strand.lastAngles[index];
      });
    }
  }

  update(delta, settings) {
    const dt = settings.paused ? 0 : delta * settings.speed;

    if (dt > 0) {
      this.time += dt;
    }

    // Vorläufiges Bewegungsprofil zum Testen
    const profiles = {
      Rest:   { frequency: 1, amplitude: 0.01 },
      Walk:   { frequency: 2, amplitude: 0.04 },
      Trot:   { frequency: 4, amplitude: 0.07 },
      Gallop: { frequency: 6, amplitude: 0.12 }
    };

    const gait = profiles[settings.currentAnimation] ?? profiles.Rest;

    for (const strand of this.strands) {
      strand.bones.forEach((bone, index) => {
        // Spitze bewegt sich stärker als der Ansatz
        const strength = [0.25, 0.65, 1.0][index];

        const target = Math.sin(
          this.time * gait.frequency
          - index * 0.45
          + strand.phase
        ) * gait.amplitude * strength;

        const angle = dt > 0
          ? strand.springs[index].update(target, dt)
          : strand.lastAngles[index];

        bone.rotation.z += angle;
        strand.lastAngles[index] = angle;
      });
    }
  }
}
