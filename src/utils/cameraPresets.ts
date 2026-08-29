import { Vector3, PerspectiveCamera } from 'three';

export interface CameraPreset {
  name: string;
  position: Vector3;
  target: Vector3;
  fov: number;
}

export const CAMERA_PRESETS: Record<string, CameraPreset> = {
  orbit: {
    name: 'Orbit',
    position: new Vector3(5, 3, 5),
    target: new Vector3(0, 0.5, 0),
    fov: 45,
  },
  front: {
    name: 'Front',
    position: new Vector3(0, 1.2, -6),
    target: new Vector3(0, 0.5, 0),
    fov: 45,
  },
  rear: {
    name: 'Rear',
    position: new Vector3(0, 1.2, 6),
    target: new Vector3(0, 0.5, 0),
    fov: 45,
  },
  left: {
    name: 'Left Side',
    position: new Vector3(-6, 1.0, 0),
    target: new Vector3(0, 0.5, 0),
    fov: 45,
  },
  right: {
    name: 'Right Side',
    position: new Vector3(6, 1.0, 0),
    target: new Vector3(0, 0.5, 0),
    fov: 45,
  },
  top: {
    name: 'Top',
    position: new Vector3(0, 7, 0.5),
    target: new Vector3(0, 0.3, 0),
    fov: 45,
  },
  interior: {
    name: 'Interior',
    position: new Vector3(-0.3, 0.8, -0.5),
    target: new Vector3(0, 0.75, -1.2),
    fov: 60,
  },
  powertrain: {
    name: 'Powertrain',
    position: new Vector3(3, 1.5, 2),
    target: new Vector3(0, 0.3, 0),
    fov: 50,
  },
  battery: {
    name: 'Battery',
    position: new Vector3(3, -0.5, 0),
    target: new Vector3(0, 0.18, 0),
    fov: 40,
  },
  exploded: {
    name: 'Exploded',
    position: new Vector3(8, 5, 8),
    target: new Vector3(0, 0.5, 0),
    fov: 50,
  },
};

export function animateCamera(
  camera: PerspectiveCamera,
  targetPos: Vector3,
  targetLookAt: Vector3,
  duration = 1000
): Promise<void> {
  return new Promise((resolve) => {
    const startPos = camera.position.clone();
    const startTime = performance.now();

    const currentTarget = new Vector3();
    camera.getWorldDirection(currentTarget);
    currentTarget.multiplyScalar(10).add(startPos);

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      camera.position.lerpVectors(startPos, targetPos, ease);

      const lookTarget = new Vector3().lerpVectors(currentTarget, targetLookAt, ease);
      camera.lookAt(lookTarget);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    };

    requestAnimationFrame(animate);
  });
}
