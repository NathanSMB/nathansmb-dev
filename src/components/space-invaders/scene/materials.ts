import * as THREE from "three";

export function createNeonMaterial(
    color: number,
    emissiveIntensity = 2,
): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
        color,
        emissive: new THREE.Color(color),
        emissiveIntensity,
        roughness: 0.3,
        metalness: 0.7,
    });
}

export function createGlowMaterial(color: number): THREE.MeshBasicMaterial {
    return new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.8,
    });
}
