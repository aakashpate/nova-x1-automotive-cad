import React, { useRef, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useVehicleStore } from '../../store';
import { CAMERA_PRESETS } from '../../utils/cameraPresets';

export default function VehicleCamera() {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const { activeCameraPreset } = useVehicleStore();
  const [animating, setAnimating] = useState(false);
  const animRef = useRef({ start: new THREE.Vector3(), end: new THREE.Vector3(), t: 0, target: new THREE.Vector3(), startTarget: new THREE.Vector3() });

  useEffect(() => {
    const preset = CAMERA_PRESETS[activeCameraPreset];
    if (!preset || !controlsRef.current) return;

    const startPos = camera.position.clone();
    const endPos = preset.position.clone();
    const startTarget = controlsRef.current.target.clone();
    const endTarget = preset.target.clone();

    animRef.current = { start: startPos, end: endPos, t: 0, target: endTarget, startTarget };
    setAnimating(true);
  }, [activeCameraPreset, camera]);

  useFrame((_, delta) => {
    if (!animating || !controlsRef.current) return;

    animRef.current.t = Math.min(1, animRef.current.t + delta * 1.5);
    const t = animRef.current.t;
    const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    camera.position.lerpVectors(animRef.current.start, animRef.current.end, ease);
    controlsRef.current.target.lerpVectors(animRef.current.startTarget, animRef.current.target, ease);
    controlsRef.current.update();

    if (t >= 1) setAnimating(false);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={1.5}
      maxDistance={15}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      dampingFactor={0.08}
      enableDamping={true}
      target={[0, 0.5, 0]}
    />
  );
}
