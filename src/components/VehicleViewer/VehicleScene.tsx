import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import VehicleAssembly from '../../vehicle/components/VehicleAssembly';
import VehicleCamera from './VehicleCamera';
import VehicleEnvironment from './VehicleEnvironment';

export default function VehicleScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [5, 3, 5], fov: 45, near: 0.1, far: 100 }}
      gl={{ antialias: true, toneMapping: 3, toneMappingExposure: 1.2 }}
      dpr={[1, 2]}
      style={{ background: '#0a0a12' }}
    >
      <fog attach="fog" args={[0x0a0a12, 15, 30]} />
      <Suspense fallback={null}>
        <VehicleEnvironment />
        <VehicleAssembly />
      </Suspense>
      <VehicleCamera />
    </Canvas>
  );
}
