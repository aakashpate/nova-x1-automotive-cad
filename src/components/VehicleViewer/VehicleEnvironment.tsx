import { useMemo } from 'react';
import * as THREE from 'three';
import { useVehicleStore } from '../../store';

export default function VehicleEnvironment() {
  const { lightsEnabled } = useVehicleStore();

  const floorMaterial = useMemo(() =>
    new THREE.MeshStandardMaterial({
      color: 0x111118,
      metalness: 0.8,
      roughness: 0.2,
    }), []);

  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow material={floorMaterial}>
        <planeGeometry args={[30, 30]} />
      </mesh>

      {/* Grid helper */}
      <gridHelper args={[30, 60, 0x222233, 0x181825]} position={[0, 0, 0]} />

      {/* Main key light */}
      <directionalLight
        position={[5, 8, 3]}
        intensity={lightsEnabled ? 2.5 : 1.0}
        color={0xffeedd}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />

      {/* Fill light */}
      <directionalLight
        position={[-4, 5, -3]}
        intensity={lightsEnabled ? 1.2 : 0.4}
        color={0xccddff}
      />

      {/* Rim light */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={lightsEnabled ? 1.5 : 0.5}
        color={0xffffff}
      />

      {/* Back rim */}
      <directionalLight
        position={[0, 4, 6]}
        intensity={lightsEnabled ? 0.8 : 0.3}
        color={0xddddff}
      />

      {/* Ambient */}
      <ambientLight intensity={lightsEnabled ? 0.4 : 0.15} color={0x8888aa} />

      {/* Hemisphere */}
      <hemisphereLight
        args={[0x445566, 0x111122, lightsEnabled ? 0.6 : 0.2]}
      />

      {/* Floor spot for reflection feel */}
      <spotLight
        position={[0, 6, 0]}
        angle={0.8}
        penumbra={0.5}
        intensity={lightsEnabled ? 1.5 : 0.5}
        color={0xffffff}
        castShadow={false}
      />
    </>
  );
}
