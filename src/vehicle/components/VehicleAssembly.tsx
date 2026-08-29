import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useVehicleStore } from '../../store';
import { VEHICLE_COMPONENTS } from '../vehicleTypes';
import {
  createCarPaint,
  createCarbonFiber,
  createTireRubber,
  createBrakeCeramic,
  createAnodizedMetal,
  createBrushedAluminum,
  createGlass,
  createLeather,
  createAlcantara,
  createLedEmissive,
  createBatteryMetal,
  createDarkPlastic,
} from '../../materials/automotiveMaterials';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const carPaint = createCarPaint('#1a1a2e');
const carbonFiber = createCarbonFiber();
const tireRubber = createTireRubber();
const brakeCeramic = createBrakeCeramic();
const anodizedMetal = createAnodizedMetal();
const brushedAluminum = createBrushedAluminum();
const glassMat = createGlass();
const leather = createLeather();
const alcantara = createAlcantara();
const ledWhite = createLedEmissive(0xffffff, 3);
const ledRed = createLedEmissive(0xff2200, 2);
const ledAmber = createLedEmissive(0xffaa00, 2);
const batteryMetal = createBatteryMetal();
const darkPlastic = createDarkPlastic();

function createChassisShape(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.85, 0);
  shape.lineTo(-0.85, 0.08);
  shape.lineTo(-0.7, 0.12);
  shape.lineTo(0.7, 0.12);
  shape.lineTo(0.85, 0.08);
  shape.lineTo(0.85, 0);
  shape.lineTo(-0.85, 0);

  const extrudeSettings = { depth: 2.8, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 };
  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.rotateY(Math.PI / 2);
  geo.translate(0, 0, 1.4);
  return geo;
}

function createBodyPanelGeo(width: number, height: number, depth: number, curve = 0.05): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(width, height, depth, 4, 2, 4);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const xOffset = Math.sin((z / depth) * Math.PI) * curve * (y > 0 ? 1 : 0);
    pos.setX(i, pos.getX(i) + xOffset);
    if (y > height * 0.3) {
      pos.setY(i, y - Math.abs(z) * 0.05);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

function createHoodGeo(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1.5, 0.04, 1.2, 8, 1, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const x = pos.getX(i);
    const bulge = 0.03 * (1 - (x / 0.75) * (x / 0.75));
    pos.setY(i, pos.getY(i) + bulge + Math.abs(z) * 0.02);
    const taper = 1 - (z / 0.6) * 0.08;
    pos.setX(i, x * taper);
  }
  geo.computeVertexNormals();
  return geo;
}

function createDoorGeo(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(0.05, 0.55, 1.5, 1, 4, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const curve = Math.sin((z / 0.75) * Math.PI * 0.5) * 0.03;
    pos.setX(i, pos.getX(i) + curve);
    if (y > 0.1) {
      pos.setX(i, pos.getX(i) * 0.97);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

function createBumperGeo(isFront: boolean): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  const w = 0.9;
  shape.moveTo(-w, 0);
  shape.quadraticCurveTo(-w, 0.15, -w * 0.8, 0.2);
  shape.lineTo(w * 0.8, 0.2);
  shape.quadraticCurveTo(w, 0.15, w, 0);
  shape.lineTo(-w, 0);

  const extSettings = { depth: 0.15, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2 };
  const geo = new THREE.ExtrudeGeometry(shape, extSettings);
  if (!isFront) geo.rotateY(Math.PI);
  return geo;
}

function createSplitterGeo(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1.7, 0.015, 0.3, 6, 1, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const edgeDip = Math.abs(x) > 0.6 ? -0.02 : 0;
    pos.setY(i, pos.getY(i) + edgeDip + z * 0.03);
  }
  geo.computeVertexNormals();
  return geo;
}

function createDiffuserGeo(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1.4, 0.08, 0.4, 6, 1, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const x = pos.getX(i);
    pos.setY(i, pos.getY(i) - z * 0.15 + Math.abs(x) * 0.02);
  }
  geo.computeVertexNormals();
  return geo;
}

function createRoofGeo(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(1.3, 0.03, 1.6, 6, 1, 6);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const crown = 0.04 * (1 - (x / 0.65) * (x / 0.65));
    pos.setY(i, pos.getY(i) + crown);
  }
  geo.computeVertexNormals();
  return geo;
}

function createSeatGeo(): THREE.BufferGeometry {
  const group = new THREE.BoxGeometry(0.4, 0.08, 0.5, 2, 1, 2);
  return group;
}

function createSeatBackGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.38, 0.5, 0.06, 2, 3, 1);
}

function createWheelGeo(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.33, 0.33, 0.22, 24);
  geo.rotateZ(Math.PI / 2);
  return geo;
}

function createTireGeo(): THREE.BufferGeometry {
  const geo = new THREE.TorusGeometry(0.34, 0.1, 12, 32);
  geo.rotateY(Math.PI / 2);
  return geo;
}

function createBrakeDiscGeo(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.21, 0.21, 0.03, 32);
}

function createCaliperGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.12, 0.08, 0.06);
}

function createShockGeo(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.02, 0.025, 0.35, 8);
}

function createSuspensionArmGeo(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6);
}

function createMotorGeo(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.15, 0.15, 0.35, 16);
  geo.rotateZ(Math.PI / 2);
  return geo;
}

function createTransmissionGeo(): THREE.BufferGeometry {
  const geo = new THREE.BoxGeometry(0.25, 0.15, 0.2, 2, 2, 2);
  return geo;
}

function createBatteryPackGeo(): THREE.Group {
  const group = new THREE.Group();

  const enclosure = new THREE.BoxGeometry(1.5, 0.1, 2.2, 4, 1, 6);
  const encMesh = new THREE.Mesh(enclosure, batteryMetal);
  encMesh.name = 'battery_enclosure';
  group.add(encMesh);

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const mod = new THREE.BoxGeometry(0.32, 0.06, 0.45);
      const modMesh = new THREE.Mesh(mod, anodizedMetal);
      modMesh.position.set(-0.5 + col * 0.35, 0.02, -0.7 + row * 0.65);
      modMesh.name = `battery_module_${row * 4 + col + 1}`;
      group.add(modMesh);
    }
  }

  for (let i = 0; i < 3; i++) {
    const channel = new THREE.BoxGeometry(1.4, 0.005, 0.02);
    const chMesh = new THREE.Mesh(channel, createAnodizedMetal('#4466aa'));
    chMesh.position.set(0, 0.055, -0.4 + i * 0.5);
    chMesh.name = `cooling_channel_${i + 1}`;
    group.add(chMesh);
  }

  return group;
}

function createHeadlightGeo(): THREE.BufferGeometry {
  return new THREE.SphereGeometry(0.08, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
}

function createDrlStripGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.03, 0.015, 0.3);
}

function createRearLightBarGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.02, 0.03, 1.6);
}

function createIndicatorGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.02, 0.02, 0.1);
}

function createSteeringWheelGeo(): THREE.BufferGeometry {
  const outer = new THREE.TorusGeometry(0.16, 0.015, 8, 32);
  return outer;
}

function createDashboardGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(1.2, 0.15, 0.25, 4, 2, 2);
}

function createConsoleGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.25, 0.15, 0.8, 2, 2, 4);
}

function createMirrorGeo(): THREE.BufferGeometry {
  return new THREE.CylinderGeometry(0.03, 0.025, 0.05, 8);
}

function createMirrorHousingGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.06, 0.04, 0.08);
}

function createWindowGeo(): THREE.BufferGeometry {
  return new THREE.PlaneGeometry(0.4, 0.35);
}

function createWindshieldGeo(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1.2, 0.5, 6, 3);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setZ(i, Math.abs(y) * 0.2);
  }
  geo.computeVertexNormals();
  return geo;
}

function createRearGlassGeo(): THREE.BufferGeometry {
  const geo = new THREE.PlaneGeometry(1.0, 0.35, 4, 2);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    pos.setZ(i, -Math.abs(y) * 0.15);
  }
  geo.computeVertexNormals();
  return geo;
}

function createCoolingIntakeGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.15, 0.08, 0.12, 2, 1, 1);
}

function createCoolingDuctGeo(): THREE.BufferGeometry {
  return new THREE.BoxGeometry(0.3, 0.06, 0.2);
}

interface WheelAssemblyProps {
  position: [number, number, number];
  name: string;
  tireName: string;
  brakeDiscName: string;
  caliperName: string;
  shockName: string;
  side: 'left' | 'right';
  isRear: boolean;
  animProgress: number;
  xray: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
  exploded: boolean;
  wheelRotation: number;
  isFiltered: boolean;
  inspectMode: boolean;
  selectedId: string | null;
  wheelId: string;
  tireId: string;
  discId: string;
  caliperId: string;
  shockId: string;
  defaultPos: [number, number, number];
  explodedOff: [number, number, number];
}

function WheelAssembly({
  position, name, tireName, brakeDiscName, caliperName, shockName, side,
  animProgress, xray, onSelect, exploded, wheelRotation, isFiltered,
  inspectMode, _selectedId, wheelId, tireId, discId, caliperId, shockId,
  defaultPos, explodedOff,
}: WheelAssemblyProps) {
  const wheelRef = useRef<THREE.Group>(null);

  const targetPos = useMemo(() => {
    if (!exploded) return new THREE.Vector3(...defaultPos);
    return new THREE.Vector3(
      defaultPos[0] + explodedOff[0],
      defaultPos[1] + explodedOff[1],
      defaultPos[2] + explodedOff[2]
    );
  }, [exploded, defaultPos, explodedOff]);

  useFrame(() => {
    if (!wheelRef.current) return;
    const p = easeInOutCubic(Math.min(animProgress, 1));
    wheelRef.current.position.lerp(targetPos, p < 0.01 ? 1 : 0.08);
    if (wheelRef.current.children[0]) {
      (wheelRef.current.children[0] as THREE.Group).rotation.x = wheelRotation;
    }
  });

  return (
    <group ref={wheelRef} position={position} name={name}>
      <group rotation={[wheelRotation, 0, 0]} name={tireName}
        onClick={(e) => { e.stopPropagation(); onSelect(tireId); }}>
        <mesh geometry={createTireGeo()} material={tireRubber}
          visible={isFiltered || (!inspectMode)} />
      </group>
      <group name={name.replace('tire', 'wheel').replace('vehicle_tire', 'vehicle_wheel')}
        onClick={(e) => { e.stopPropagation(); onSelect(wheelId); }}>
        <mesh geometry={createWheelGeo()} material={brushedAluminum}
          visible={isFiltered || (!inspectMode)} />
      </group>
      <group name={brakeDiscName}
        onClick={(e) => { e.stopPropagation(); onSelect(discId); }}>
        <mesh geometry={createBrakeDiscGeo()} material={brakeCeramic}
          position={[side === 'left' ? 0.05 : -0.05, 0, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          visible={isFiltered || xray || (!inspectMode)} />
      </group>
      <group name={caliperName}
        onClick={(e) => { e.stopPropagation(); onSelect(caliperId); }}>
        <mesh geometry={createCaliperGeo()} material={anodizedMetal}
          position={[side === 'left' ? 0.06 : -0.06, 0.12, 0]}
          visible={isFiltered || xray || (!inspectMode)} />
      </group>
      <group name={shockName}
        onClick={(e) => { e.stopPropagation(); onSelect(shockId); }}>
        <mesh geometry={createShockGeo()} material={anodizedMetal}
          position={[0, 0.25, 0]}
          visible={isFiltered || xray || (!inspectMode)} />
      </group>
    </group>
  );
}

interface ArticulatingPartProps {
  children: React.ReactNode;
  isOpen: boolean;
  hingeOffset: [number, number, number];
  rotationAxis: 'x' | 'z';
  maxAngle: number;
  animProgress: number;
}

function ArticulatingPart({ children, isOpen, hingeOffset, rotationAxis, maxAngle }: ArticulatingPartProps) {
  const ref = useRef<THREE.Group>(null);
  const targetAngle = isOpen ? maxAngle : 0;

  useFrame(() => {
    if (!ref.current) return;
    const current = rotationAxis === 'x' ? ref.current.rotation.x : ref.current.rotation.z;
    const next = lerp(current, targetAngle, 0.08);
    if (rotationAxis === 'x') ref.current.rotation.x = next;
    else ref.current.rotation.z = next;
  });

  return (
    <group position={hingeOffset}>
      <group ref={ref}>
        <group position={[-hingeOffset[0], -hingeOffset[1], -hingeOffset[2]]}>
          {children}
        </group>
      </group>
    </group>
  );
}

export default function VehicleAssembly() {
  const groupRef = useRef<THREE.Group>(null);
  const {
    selectedComponent, exploded, xrayMode, activeSystemFilter,
    doorsOpen, hoodOpen, trunkOpen, lightsEnabled, roofTint,
    wheelRotation, inspectMode, setSelectedComponent,
  } = useVehicleStore();

  const animProgressRef = useRef(0);
  const prevExploded = useRef(exploded);
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    if (prevExploded.current !== exploded) {
      animProgressRef.current = 0;
      prevExploded.current = exploded;
    }
  }, [exploded]);

  useFrame((_, delta) => {
    if (animProgressRef.current < 1) {
      animProgressRef.current = Math.min(1, animProgressRef.current + delta * 1.5);
      setAnimProgress(animProgressRef.current);
    }
  });

  const handleSelect = (id: string) => {
    setSelectedComponent(selectedComponent === id ? null : id);
  };

  const isSystemVisible = (category: string): boolean => {
    if (activeSystemFilter === 'all') return true;
    return category === activeSystemFilter;
  };

  const p = easeInOutCubic(animProgress);

  const getExplodedPos = (id: string): [number, number, number] => {
    const comp = VEHICLE_COMPONENTS.find((c) => c.id === id);
    if (!comp) return [0, 0, 0];
    return comp.defaultPosition;
  };

  const roofTintOpacity = roofTint === 'clear' ? 0.3 : roofTint === 'tinted' ? 0.55 : 0.8;

  const roofGlassMaterial = useMemo(() => {
    const mat = createGlass(0x88ccff).clone() as THREE.MeshPhysicalMaterial;
    mat.opacity = roofTintOpacity;
    return mat;
  }, [roofTintOpacity]);

  return (
    <group ref={groupRef} name="vehicle_root">
      {/* CHASSIS */}
      <group
        name="vehicle_chassis"
        position={getExplodedPos('chassis')}
        onClick={(e) => { e.stopPropagation(); handleSelect('chassis'); }}
      >
        <mesh geometry={createChassisShape()} material={carbonFiber} />
      </group>

      {/* FRONT CRASH STRUCTURE */}
      <group
        name="vehicle_front_crash_structure"
        position={getExplodedPos('frontCrashStructure')}
        onClick={(e) => { e.stopPropagation(); handleSelect('frontCrashStructure'); }}
      >
        <mesh material={anodizedMetal} position={[0, 0, 0]}>
          <boxGeometry args={[0.5, 0.12, 0.4]} />
        </mesh>
        <mesh material={anodizedMetal} position={[-0.2, 0, -0.15]} rotation={[0, 0.15, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.3]} />
        </mesh>
        <mesh material={anodizedMetal} position={[0.2, 0, -0.15]} rotation={[0, -0.15, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.3]} />
        </mesh>
      </group>

      {/* REAR FRAME */}
      <group
        name="vehicle_rear_frame"
        position={getExplodedPos('rearFrame')}
        onClick={(e) => { e.stopPropagation(); handleSelect('rearFrame'); }}
      >
        <mesh material={anodizedMetal}>
          <boxGeometry args={[0.6, 0.1, 0.5]} />
        </mesh>
        <mesh material={anodizedMetal} position={[-0.22, 0, 0]}>
          <boxGeometry args={[0.05, 0.08, 0.45]} />
        </mesh>
        <mesh material={anodizedMetal} position={[0.22, 0, 0]}>
          <boxGeometry args={[0.05, 0.08, 0.45]} />
        </mesh>
      </group>

      {/* UNDERBODY PANEL */}
      <group
        name="vehicle_underbody_panel"
        position={getExplodedPos('underbodyPanel')}
        onClick={(e) => { e.stopPropagation(); handleSelect('underbodyPanel'); }}
      >
        <mesh geometry={new THREE.BoxGeometry(1.6, 0.015, 3.0)} material={carbonFiber} />
      </group>

      {/* FRONT BODY SHELL */}
      <group
        name="vehicle_front_body"
        position={getExplodedPos('frontBodyShell')}
        onClick={(e) => { e.stopPropagation(); handleSelect('frontBodyShell'); }}
      >
        <mesh geometry={createBodyPanelGeo(1.5, 0.25, 0.8, 0.06)} material={carPaint} />
        <mesh material={carPaint} position={[0, 0.12, 0]}>
          <boxGeometry args={[1.4, 0.02, 0.7]} />
        </mesh>
      </group>

      {/* MID BODY SHELL */}
      <group
        name="vehicle_mid_body"
        position={getExplodedPos('midBodyShell')}
        onClick={(e) => { e.stopPropagation(); handleSelect('midBodyShell'); }}
      >
        <mesh material={carPaint}>
          <boxGeometry args={[1.7, 0.4, 1.8, 4, 3, 6]} />
        </mesh>
        <mesh material={carPaint} position={[0, 0.15, 0]}>
          <boxGeometry args={[1.75, 0.08, 1.8]} />
        </mesh>
      </group>

      {/* REAR BODY SHELL */}
      <group
        name="vehicle_rear_body"
        position={getExplodedPos('rearBodyShell')}
        onClick={(e) => { e.stopPropagation(); handleSelect('rearBodyShell'); }}
      >
        <mesh geometry={createBodyPanelGeo(1.5, 0.3, 0.7, 0.05)} material={carPaint} />
        <mesh material={carPaint} position={[0, 0.15, 0]}>
          <boxGeometry args={[1.55, 0.05, 0.65]} />
        </mesh>
      </group>

      {/* HOOD */}
      <ArticulatingPart isOpen={hoodOpen} hingeOffset={[0, 0.82, -1.9]} rotationAxis="x" maxAngle={-0.7} animProgress={p}>
        <group
          name="vehicle_hood"
          position={getExplodedPos('hood')}
          onClick={(e) => { e.stopPropagation(); handleSelect('hood'); }}
        >
          <mesh geometry={createHoodGeo()} material={carPaint} />
        </group>
      </ArticulatingPart>

      {/* TRUNK */}
      <ArticulatingPart isOpen={trunkOpen} hingeOffset={[0, 0.85, 1.8]} rotationAxis="x" maxAngle={0.6} animProgress={p}>
        <group
          name="vehicle_trunk"
          position={getExplodedPos('trunk')}
          onClick={(e) => { e.stopPropagation(); handleSelect('trunk'); }}
        >
          <mesh geometry={createHoodGeo()} material={carPaint} />
        </group>
      </ArticulatingPart>

      {/* LEFT DOOR */}
      <ArticulatingPart isOpen={doorsOpen} hingeOffset={[-0.95, 1.05, -0.1]} rotationAxis="z" maxAngle={0.8} animProgress={p}>
        <group
          name="vehicle_door_left"
          position={getExplodedPos('doorLeft')}
          onClick={(e) => { e.stopPropagation(); handleSelect('doorLeft'); }}
        >
          <mesh geometry={createDoorGeo()} material={carPaint} />
        </group>
      </ArticulatingPart>

      {/* RIGHT DOOR */}
      <ArticulatingPart isOpen={doorsOpen} hingeOffset={[0.95, 1.05, -0.1]} rotationAxis="z" maxAngle={-0.8} animProgress={p}>
        <group
          name="vehicle_door_right"
          position={getExplodedPos('doorRight')}
          onClick={(e) => { e.stopPropagation(); handleSelect('doorRight'); }}
        >
          <mesh geometry={createDoorGeo()} material={carPaint} />
        </group>
      </ArticulatingPart>

      {/* FRONT BUMPER */}
      <group
        name="vehicle_front_bumper"
        position={getExplodedPos('frontBumper')}
        onClick={(e) => { e.stopPropagation(); handleSelect('frontBumper'); }}
      >
        <mesh geometry={createBumperGeo(true)} material={carPaint} />
      </group>

      {/* FRONT SPLITTER */}
      <group
        name="vehicle_front_splitter"
        position={getExplodedPos('frontSplitter')}
        onClick={(e) => { e.stopPropagation(); handleSelect('frontSplitter'); }}
      >
        <mesh geometry={createSplitterGeo()} material={carbonFiber} />
      </group>

      {/* REAR BUMPER */}
      <group
        name="vehicle_rear_bumper"
        position={getExplodedPos('rearBumper')}
        onClick={(e) => { e.stopPropagation(); handleSelect('rearBumper'); }}
      >
        <mesh geometry={createBumperGeo(false)} material={carPaint} />
      </group>

      {/* REAR DIFFUSER */}
      <group
        name="vehicle_rear_diffuser"
        position={getExplodedPos('rearDiffuser')}
        onClick={(e) => { e.stopPropagation(); handleSelect('rearDiffuser'); }}
      >
        <mesh geometry={createDiffuserGeo()} material={carbonFiber} />
      </group>

      {/* ROOF */}
      <group
        name="vehicle_roof"
        position={getExplodedPos('roof')}
        onClick={(e) => { e.stopPropagation(); handleSelect('roof'); }}
      >
        <mesh geometry={createRoofGeo()} material={roofGlassMaterial} />
      </group>

      {/* HEADLIGHTS */}
      <group
        name="vehicle_headlight_left"
        position={getExplodedPos('headlightLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('headlightLeft'); }}
      >
        <mesh geometry={createHeadlightGeo()} material={lightsEnabled ? ledWhite : darkPlastic} />
        <mesh material={darkPlastic} position={[0, -0.02, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.1]} />
        </mesh>
      </group>

      <group
        name="vehicle_headlight_right"
        position={getExplodedPos('headlightRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('headlightRight'); }}
      >
        <mesh geometry={createHeadlightGeo()} material={lightsEnabled ? ledWhite : darkPlastic} />
        <mesh material={darkPlastic} position={[0, -0.02, 0]}>
          <boxGeometry args={[0.18, 0.04, 0.1]} />
        </mesh>
      </group>

      {/* DRL STRIPS */}
      <group
        name="vehicle_drl_left"
        position={getExplodedPos('drlLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('drlLeft'); }}
      >
        <mesh geometry={createDrlStripGeo()} material={lightsEnabled ? ledWhite : darkPlastic} />
      </group>

      <group
        name="vehicle_drl_right"
        position={getExplodedPos('drlRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('drlRight'); }}
      >
        <mesh geometry={createDrlStripGeo()} material={lightsEnabled ? ledWhite : darkPlastic} />
      </group>

      {/* REAR LIGHT BAR */}
      <group
        name="vehicle_rear_lightbar"
        position={getExplodedPos('rearLightBar')}
        onClick={(e) => { e.stopPropagation(); handleSelect('rearLightBar'); }}
      >
        <mesh geometry={createRearLightBarGeo()} material={lightsEnabled ? ledRed : darkPlastic} />
      </group>

      {/* INDICATORS */}
      <group
        name="vehicle_indicator_left"
        position={getExplodedPos('indicatorLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('indicatorLeft'); }}
      >
        <mesh geometry={createIndicatorGeo()} material={lightsEnabled ? ledAmber : darkPlastic} />
      </group>

      <group
        name="vehicle_indicator_right"
        position={getExplodedPos('indicatorRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('indicatorRight'); }}
      >
        <mesh geometry={createIndicatorGeo()} material={lightsEnabled ? ledAmber : darkPlastic} />
      </group>

      {/* INTERIOR COMPONENTS */}
      <group
        name="vehicle_interior_dashboard"
        position={getExplodedPos('interiorDashboard')}
        onClick={(e) => { e.stopPropagation(); handleSelect('interiorDashboard'); }}
      >
        <mesh geometry={createDashboardGeo()} material={leather} />
        <mesh material={darkPlastic} position={[0, 0.08, -0.05]}>
          <boxGeometry args={[1.1, 0.02, 0.15]} />
        </mesh>
      </group>

      <group
        name="vehicle_dashboard"
        position={getExplodedPos('dashboard')}
        onClick={(e) => { e.stopPropagation(); handleSelect('dashboard'); }}
      >
        <mesh material={darkPlastic}>
          <boxGeometry args={[0.8, 0.06, 0.18]} />
        </mesh>
        <mesh material={lightsEnabled ? ledWhite : darkPlastic} position={[0, 0.04, 0]}>
          <boxGeometry args={[0.7, 0.005, 0.1]} />
        </mesh>
      </group>

      <group
        name="vehicle_instrument_cluster"
        position={getExplodedPos('instrumentCluster')}
        onClick={(e) => { e.stopPropagation(); handleSelect('instrumentCluster'); }}
      >
        <mesh material={darkPlastic}>
          <boxGeometry args={[0.35, 0.12, 0.05]} />
        </mesh>
        <mesh material={lightsEnabled ? ledWhite : darkPlastic} position={[0, 0, 0.03]}>
          <boxGeometry args={[0.3, 0.08, 0.005]} />
        </mesh>
      </group>

      <group
        name="vehicle_hud"
        position={getExplodedPos('hud')}
        onClick={(e) => { e.stopPropagation(); handleSelect('hud'); }}
      >
        <mesh material={lightsEnabled ? new THREE.MeshStandardMaterial({ color: 0x00ff88, emissive: 0x00ff88, emissiveIntensity: 1, transparent: true, opacity: 0.3 }) : darkPlastic}>
          <boxGeometry args={[0.3, 0.1, 0.01]} />
        </mesh>
      </group>

      <group
        name="vehicle_steering_wheel"
        position={getExplodedPos('steeringWheel')}
        onClick={(e) => { e.stopPropagation(); handleSelect('steeringWheel'); }}
      >
        <mesh geometry={createSteeringWheelGeo()} material={leather} rotation={[0.4, 0, 0]} />
        <mesh material={brushedAluminum} position={[0, 0, 0]} rotation={[0.4, 0, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.015]} />
        </mesh>
      </group>

      <group
        name="vehicle_steering_column"
        position={getExplodedPos('steeringColumn')}
        onClick={(e) => { e.stopPropagation(); handleSelect('steeringColumn'); }}
      >
        <mesh material={brushedAluminum} rotation={[0.4, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.25, 8]} />
        </mesh>
      </group>

      {/* SEATS */}
      <group
        name="vehicle_seat_driver"
        position={getExplodedPos('seatDriver')}
        onClick={(e) => { e.stopPropagation(); handleSelect('seatDriver'); }}
      >
        <mesh geometry={createSeatGeo()} material={carbonFiber} position={[0, -0.05, 0]} />
        <mesh geometry={createSeatBackGeo()} material={carbonFiber} position={[0, 0.2, -0.22]} rotation={[0.2, 0, 0]} />
        <mesh material={alcantara} position={[0, -0.01, 0]}>
          <boxGeometry args={[0.36, 0.02, 0.46]} />
        </mesh>
      </group>

      <group
        name="vehicle_seat_passenger"
        position={getExplodedPos('seatPassenger')}
        onClick={(e) => { e.stopPropagation(); handleSelect('seatPassenger'); }}
      >
        <mesh geometry={createSeatGeo()} material={carbonFiber} position={[0, -0.05, 0]} />
        <mesh geometry={createSeatBackGeo()} material={carbonFiber} position={[0, 0.2, -0.22]} rotation={[0.2, 0, 0]} />
        <mesh material={alcantara} position={[0, -0.01, 0]}>
          <boxGeometry args={[0.36, 0.02, 0.46]} />
        </mesh>
      </group>

      <group
        name="vehicle_center_console"
        position={getExplodedPos('centerConsole')}
        onClick={(e) => { e.stopPropagation(); handleSelect('centerConsole'); }}
      >
        <mesh geometry={createConsoleGeo()} material={darkPlastic} />
        <mesh material={brushedAluminum} position={[0, 0.08, 0.1]}>
          <boxGeometry args={[0.18, 0.005, 0.12]} />
        </mesh>
      </group>

      <group
        name="vehicle_door_panel_left"
        position={getExplodedPos('doorPanelLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('doorPanelLeft'); }}
      >
        <mesh material={alcantara}>
          <boxGeometry args={[0.03, 0.4, 0.8]} />
        </mesh>
        <mesh material={lightsEnabled ? createLedEmissive(0x4488ff, 1) : darkPlastic} position={[0.02, -0.1, 0]}>
          <boxGeometry args={[0.005, 0.01, 0.6]} />
        </mesh>
      </group>

      <group
        name="vehicle_door_panel_right"
        position={getExplodedPos('doorPanelRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('doorPanelRight'); }}
      >
        <mesh material={alcantara}>
          <boxGeometry args={[0.03, 0.4, 0.8]} />
        </mesh>
        <mesh material={lightsEnabled ? createLedEmissive(0x4488ff, 1) : darkPlastic} position={[-0.02, -0.1, 0]}>
          <boxGeometry args={[0.005, 0.01, 0.6]} />
        </mesh>
      </group>

      {/* WHEELS */}
      <WheelAssembly
        position={[-0.82, 0.34, -1.4]} name="vehicle_wheel_fl" tireName="vehicle_tire_fl"
        brakeDiscName="vehicle_brake_disc_fl" caliperName="vehicle_caliper_fl"
        shockName="vehicle_shock_fl" side="left" isRear={false}
        animProgress={p} xray={xrayMode} selected={selectedComponent}
        onSelect={handleSelect} exploded={exploded} wheelRotation={wheelRotation}
        isFiltered={isSystemVisible('wheels') || isSystemVisible('brakes') || isSystemVisible('suspension')}
        inspectMode={inspectMode} selectedId={selectedComponent}
        wheelId="wheelFL" tireId="tireFL" discId="brakeDiscFL" caliperId="caliperFL" shockId="shockFL"
        defaultPos={[-0.82, 0.34, -1.4]} explodedOff={[-1.5, 0, -0.5]}
      />

      <WheelAssembly
        position={[0.82, 0.34, -1.4]} name="vehicle_wheel_fr" tireName="vehicle_tire_fr"
        brakeDiscName="vehicle_brake_disc_fr" caliperName="vehicle_caliper_fr"
        shockName="vehicle_shock_fr" side="right" isRear={false}
        animProgress={p} xray={xrayMode} selected={selectedComponent}
        onSelect={handleSelect} exploded={exploded} wheelRotation={wheelRotation}
        isFiltered={isSystemVisible('wheels') || isSystemVisible('brakes') || isSystemVisible('suspension')}
        inspectMode={inspectMode} selectedId={selectedComponent}
        wheelId="wheelFR" tireId="tireFR" discId="brakeDiscFR" caliperId="caliperFR" shockId="shockFR"
        defaultPos={[0.82, 0.34, -1.4]} explodedOff={[1.5, 0, -0.5]}
      />

      <WheelAssembly
        position={[-0.81, 0.34, 1.4]} name="vehicle_wheel_rl" tireName="vehicle_tire_rl"
        brakeDiscName="vehicle_brake_disc_rl" caliperName="vehicle_caliper_rl"
        shockName="vehicle_shock_rl" side="left" isRear={true}
        animProgress={p} xray={xrayMode} selected={selectedComponent}
        onSelect={handleSelect} exploded={exploded} wheelRotation={wheelRotation}
        isFiltered={isSystemVisible('wheels') || isSystemVisible('brakes') || isSystemVisible('suspension')}
        inspectMode={inspectMode} selectedId={selectedComponent}
        wheelId="wheelRL" tireId="tireRL" discId="brakeDiscRL" caliperId="caliperRL" shockId="shockRL"
        defaultPos={[-0.81, 0.34, 1.4]} explodedOff={[-1.5, 0, 0.5]}
      />

      <WheelAssembly
        position={[0.81, 0.34, 1.4]} name="vehicle_wheel_rr" tireName="vehicle_tire_rr"
        brakeDiscName="vehicle_brake_disc_rr" caliperName="vehicle_caliper_rr"
        shockName="vehicle_shock_rr" side="right" isRear={true}
        animProgress={p} xray={xrayMode} selected={selectedComponent}
        onSelect={handleSelect} exploded={exploded} wheelRotation={wheelRotation}
        isFiltered={isSystemVisible('wheels') || isSystemVisible('brakes') || isSystemVisible('suspension')}
        inspectMode={inspectMode} selectedId={selectedComponent}
        wheelId="wheelRR" tireId="tireRR" discId="brakeDiscRR" caliperId="caliperRR" shockId="shockRR"
        defaultPos={[0.81, 0.34, 1.4]} explodedOff={[1.5, 0, 0.5]}
      />

      {/* SUSPENSION ASSEMBLIES */}
      <group
        name="vehicle_suspension_front"
        position={getExplodedPos('suspensionFront')}
        onClick={(e) => { e.stopPropagation(); handleSelect('suspensionFront'); }}
      >
        <mesh geometry={createSuspensionArmGeo()} material={anodizedMetal} position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={createSuspensionArmGeo()} material={anodizedMetal} position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={createSuspensionArmGeo()} material={anodizedMetal} position={[0, 0, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]} />
        <mesh material={anodizedMetal} position={[0, -0.05, 0]}>
          <boxGeometry args={[0.7, 0.02, 0.05]} />
        </mesh>
      </group>

      <group
        name="vehicle_suspension_rear"
        position={getExplodedPos('suspensionRear')}
        onClick={(e) => { e.stopPropagation(); handleSelect('suspensionRear'); }}
      >
        <mesh geometry={createSuspensionArmGeo()} material={anodizedMetal} position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={createSuspensionArmGeo()} material={anodizedMetal} position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]} />
        <mesh geometry={createSuspensionArmGeo()} material={anodizedMetal} position={[0, 0, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]} />
        <mesh material={anodizedMetal} position={[0, -0.05, 0]}>
          <boxGeometry args={[0.6, 0.02, 0.05]} />
        </mesh>
      </group>

      {/* BATTERY PACK */}
      <group
        name="vehicle_battery_pack"
        position={getExplodedPos('batteryPack')}
        onClick={(e) => { e.stopPropagation(); handleSelect('batteryPack'); }}
      >
        <primitive object={createBatteryPackGeo()} />
      </group>

      {/* MOTORS */}
      <group
        name="vehicle_motor_front"
        position={getExplodedPos('motorFront')}
        onClick={(e) => { e.stopPropagation(); handleSelect('motorFront'); }}
      >
        <mesh geometry={createMotorGeo()} material={anodizedMetal} />
        <mesh material={darkPlastic} position={[0.12, 0, 0]}>
          <boxGeometry args={[0.08, 0.1, 0.15]} />
        </mesh>
      </group>

      <group
        name="vehicle_motor_rear"
        position={getExplodedPos('motorRear')}
        onClick={(e) => { e.stopPropagation(); handleSelect('motorRear'); }}
      >
        <mesh geometry={createMotorGeo()} material={anodizedMetal} />
        <mesh material={darkPlastic} position={[0.12, 0, 0]}>
          <boxGeometry args={[0.08, 0.1, 0.15]} />
        </mesh>
      </group>

      {/* TRANSMISSIONS */}
      <group
        name="vehicle_transmission_front"
        position={getExplodedPos('transmissionFront')}
        onClick={(e) => { e.stopPropagation(); handleSelect('transmissionFront'); }}
      >
        <mesh geometry={createTransmissionGeo()} material={anodizedMetal} />
      </group>

      <group
        name="vehicle_transmission_rear"
        position={getExplodedPos('transmissionRear')}
        onClick={(e) => { e.stopPropagation(); handleSelect('transmissionRear'); }}
      >
        <mesh geometry={createTransmissionGeo()} material={anodizedMetal} />
      </group>

      {/* COOLING */}
      <group
        name="vehicle_cooling_intake_left"
        position={getExplodedPos('coolingIntakeLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('coolingIntakeLeft'); }}
      >
        <mesh geometry={createCoolingIntakeGeo()} material={darkPlastic} />
      </group>

      <group
        name="vehicle_cooling_intake_right"
        position={getExplodedPos('coolingIntakeRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('coolingIntakeRight'); }}
      >
        <mesh geometry={createCoolingIntakeGeo()} material={darkPlastic} />
      </group>

      <group
        name="vehicle_cooling_duct_front"
        position={getExplodedPos('coolingDuctFront')}
        onClick={(e) => { e.stopPropagation(); handleSelect('coolingDuctFront'); }}
      >
        <mesh geometry={createCoolingDuctGeo()} material={darkPlastic} />
      </group>

      <group
        name="vehicle_cooling_duct_rear"
        position={getExplodedPos('coolingDuctRear')}
        onClick={(e) => { e.stopPropagation(); handleSelect('coolingDuctRear'); }}
      >
        <mesh geometry={createCoolingDuctGeo()} material={darkPlastic} />
      </group>

      {/* GLASS */}
      <group
        name="vehicle_windshield"
        position={getExplodedPos('windshield')}
        rotation={[-0.35, 0, 0]}
        onClick={(e) => { e.stopPropagation(); handleSelect('windshield'); }}
      >
        <mesh geometry={createWindshieldGeo()} material={glassMat} />
      </group>

      <group
        name="vehicle_rear_glass"
        position={getExplodedPos('rearGlass')}
        rotation={[0.4, 0, 0]}
        onClick={(e) => { e.stopPropagation(); handleSelect('rearGlass'); }}
      >
        <mesh geometry={createRearGlassGeo()} material={glassMat} />
      </group>

      <group
        name="vehicle_window_left"
        position={getExplodedPos('windowLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('windowLeft'); }}
      >
        <mesh geometry={createWindowGeo()} material={glassMat} rotation={[0, Math.PI / 2, 0]} />
      </group>

      <group
        name="vehicle_window_right"
        position={getExplodedPos('windowRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('windowRight'); }}
      >
        <mesh geometry={createWindowGeo()} material={glassMat} rotation={[0, -Math.PI / 2, 0]} />
      </group>

      {/* DIGITAL MIRRORS */}
      <group
        name="vehicle_mirror_left"
        position={getExplodedPos('mirrorLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('mirrorLeft'); }}
      >
        <mesh geometry={createMirrorGeo()} material={darkPlastic} rotation={[0, 0, Math.PI / 2]} />
        <mesh material={ledWhite} position={[-0.02, 0, 0]}>
          <boxGeometry args={[0.005, 0.02, 0.03]} />
        </mesh>
      </group>

      <group
        name="vehicle_mirror_right"
        position={getExplodedPos('mirrorRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('mirrorRight'); }}
      >
        <mesh geometry={createMirrorGeo()} material={darkPlastic} rotation={[0, 0, Math.PI / 2]} />
        <mesh material={ledWhite} position={[0.02, 0, 0]}>
          <boxGeometry args={[0.005, 0.02, 0.03]} />
        </mesh>
      </group>

      <group
        name="vehicle_mirror_housing_left"
        position={getExplodedPos('mirrorHousingLeft')}
        onClick={(e) => { e.stopPropagation(); handleSelect('mirrorHousingLeft'); }}
      >
        <mesh geometry={createMirrorHousingGeo()} material={darkPlastic} />
      </group>

      <group
        name="vehicle_mirror_housing_right"
        position={getExplodedPos('mirrorHousingRight')}
        onClick={(e) => { e.stopPropagation(); handleSelect('mirrorHousingRight'); }}
      >
        <mesh geometry={createMirrorHousingGeo()} material={darkPlastic} />
      </group>
    </group>
  );
}
