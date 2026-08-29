import { Box3, Vector3, Object3D } from 'three';

export function computeBoundingBox(obj: Object3D): Box3 {
  const box = new Box3();
  box.setFromObject(obj);
  return box;
}

export function getBoundingBoxCenter(obj: Object3D): Vector3 {
  const box = computeBoundingBox(obj);
  const center = new Vector3();
  box.getCenter(center);
  return center;
}

export function getBoundingBoxSize(obj: Object3D): Vector3 {
  const box = computeBoundingBox(obj);
  const size = new Vector3();
  box.getSize(size);
  return size;
}

export function computeObjectBounds(objects: Object3D[]): { center: Vector3; size: Vector3 } {
  const box = new Box3();
  for (const obj of objects) {
    box.expandByObject(obj);
  }
  const center = new Vector3();
  const size = new Vector3();
  box.getCenter(center);
  box.getSize(size);
  return { center, size };
}
