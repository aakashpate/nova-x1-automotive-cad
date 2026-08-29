import * as THREE from 'three';

const materialCache = new Map<string, THREE.Material>();

function getCached(key: string, factory: () => THREE.Material): THREE.Material {
  if (!materialCache.has(key)) {
    materialCache.set(key, factory());
  }
  return materialCache.get(key)!;
}

export function createCarPaint(color = '#1a1a2e'): THREE.MeshPhysicalMaterial {
  return getCached(`carPaint_${color}`, () => {
    const m = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(color),
      metalness: 0.8,
      roughness: 0.15,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 1.5,
      reflectivity: 0.9,
    });
    return m;
  }) as THREE.MeshPhysicalMaterial;
}

export function createCarbonFiber(): THREE.MeshStandardMaterial {
  return getCached('carbonFiber', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#111111';
    ctx.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        const shade = ((x + y) % 2 === 0) ? '#1a1a1a' : '#0a0a0a';
        ctx.fillStyle = shade;
        ctx.fillRect(x * 4, y * 4, 4, 4);
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(8, 8);
    return new THREE.MeshStandardMaterial({
      map: tex,
      color: 0x222222,
      metalness: 0.3,
      roughness: 0.4,
    });
  }) as THREE.MeshStandardMaterial;
}

export function createTireRubber(): THREE.MeshStandardMaterial {
  return getCached('tireRubber', () =>
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.9,
      metalness: 0.0,
    })
  ) as THREE.MeshStandardMaterial;
}

export function createBrakeCeramic(): THREE.MeshStandardMaterial {
  return getCached('brakeCeramic', () =>
    new THREE.MeshStandardMaterial({
      color: 0x444444,
      roughness: 0.6,
      metalness: 0.2,
    })
  ) as THREE.MeshStandardMaterial;
}

export function createAnodizedMetal(color = '#555566'): THREE.MeshStandardMaterial {
  return getCached(`anodized_${color}`, () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      metalness: 0.85,
      roughness: 0.25,
    })
  ) as THREE.MeshStandardMaterial;
}

export function createBrushedAluminum(): THREE.MeshStandardMaterial {
  return getCached('brushedAluminum', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createLinearGradient(0, 0, 64, 0);
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const v = 180 + Math.random() * 30;
      grad.addColorStop(t, `rgb(${v},${v},${v})`);
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return new THREE.MeshStandardMaterial({
      map: tex,
      metalness: 0.9,
      roughness: 0.3,
    });
  }) as THREE.MeshStandardMaterial;
}

export function createGlass(tint = 0x88ccff): THREE.MeshPhysicalMaterial {
  return getCached(`glass_${tint}`, () =>
    new THREE.MeshPhysicalMaterial({
      color: tint,
      metalness: 0.0,
      roughness: 0.05,
      transmission: 0.9,
      transparent: true,
      opacity: 0.35,
      ior: 1.5,
      envMapIntensity: 1.0,
    })
  ) as THREE.MeshPhysicalMaterial;
}

export function createLeather(color = '#2a2a2a'): THREE.MeshStandardMaterial {
  return getCached(`leather_${color}`, () =>
    new THREE.MeshStandardMaterial({
      color: new THREE.Color(color),
      roughness: 0.7,
      metalness: 0.0,
    })
  ) as THREE.MeshStandardMaterial;
}

export function createAlcantara(color = '#1e1e1e'): THREE.MeshStandardMaterial {
  return getCached(`alcantara_${color}`, () => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 500; i++) {
      const x = Math.random() * 64;
      const y = Math.random() * 64;
      const bright = Math.random() * 20 - 10;
      const r = parseInt(color.slice(1, 3), 16) + bright;
      const g = parseInt(color.slice(3, 5), 16) + bright;
      const b = parseInt(color.slice(5, 7), 16) + bright;
      ctx.fillStyle = `rgb(${Math.max(0, Math.min(255, r))},${Math.max(0, Math.min(255, g))},${Math.max(0, Math.min(255, b))})`;
      ctx.fillRect(x, y, 1, 1);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(4, 4);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.85,
      metalness: 0.0,
    });
  }) as THREE.MeshStandardMaterial;
}

export function createLedEmissive(color = 0xffffff, intensity = 2): THREE.MeshStandardMaterial {
  return getCached(`led_${color}_${intensity}`, () =>
    new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: intensity,
      metalness: 0.0,
      roughness: 0.3,
    })
  ) as THREE.MeshStandardMaterial;
}

export function createBatteryMetal(): THREE.MeshStandardMaterial {
  return getCached('batteryMetal', () =>
    new THREE.MeshStandardMaterial({
      color: 0x333340,
      metalness: 0.7,
      roughness: 0.35,
    })
  ) as THREE.MeshStandardMaterial;
}

export function createDarkPlastic(): THREE.MeshStandardMaterial {
  return getCached('darkPlastic', () =>
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      metalness: 0.0,
      roughness: 0.6,
    })
  ) as THREE.MeshStandardMaterial;
}

export function getMaterialByType(type: string): THREE.Material {
  switch (type) {
    case 'car_paint': return createCarPaint();
    case 'carbon_fiber': return createCarbonFiber();
    case 'tire_rubber': return createTireRubber();
    case 'brake_ceramic': return createBrakeCeramic();
    case 'anodized_metal': return createAnodizedMetal();
    case 'brushed_aluminum': return createBrushedAluminum();
    case 'glass': return createGlass();
    case 'leather': return createLeather();
    case 'alcantara': return createAlcantara();
    case 'led_emissive': return createLedEmissive();
    case 'battery_metal': return createBatteryMetal();
    case 'dark_plastic': return createDarkPlastic();
    default: return createDarkPlastic();
  }
}

export function disposeMaterials() {
  materialCache.forEach((m) => m.dispose());
  materialCache.clear();
}
