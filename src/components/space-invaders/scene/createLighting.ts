import * as THREE from "three";

export function createLighting(scene: THREE.Scene) {
    const ambient = new THREE.AmbientLight(0x220044, 0.3);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0x4444ff, 0.5);
    directional.position.set(0, 10, 5);
    scene.add(directional);
}
