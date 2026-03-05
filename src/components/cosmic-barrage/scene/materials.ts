import * as THREE from "three";

const neonCache = new Map<string, THREE.MeshStandardMaterial>();
const glowCache = new Map<number, THREE.MeshBasicMaterial>();

export function createNeonMaterial(
    color: number,
    emissiveIntensity = 2,
): THREE.MeshStandardMaterial {
    const key = `${color}_${emissiveIntensity}`;
    let mat = neonCache.get(key);
    if (mat) return mat;

    mat = new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity,
        roughness: 0.3,
        metalness: 0.7,
    });
    neonCache.set(key, mat);
    return mat;
}

export function createGlowMaterial(color: number): THREE.MeshBasicMaterial {
    let mat = glowCache.get(color);
    if (mat) return mat;

    mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
    });
    glowCache.set(color, mat);
    return mat;
}
