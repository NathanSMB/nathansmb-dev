import * as THREE from "three";
import type { ProjectileState } from "../engine/types";
import { PLAYFIELD, COLORS } from "../engine/constants";
import { createGlowMaterial } from "../scene/materials";

const playerProjectileGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.5, 6);
const enemyProjectileGeo = new THREE.SphereGeometry(0.12, 8, 8);

export function createPlayerProjectile(
    x: number,
    z: number,
    speed: number,
    scene: THREE.Scene,
    piercing = false,
): ProjectileState {
    const mesh = new THREE.Mesh(
        playerProjectileGeo,
        createGlowMaterial(COLORS.playerProjectile),
    );
    mesh.position.set(x, 0.3, z);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);

    return {
        mesh,
        velocity: new THREE.Vector3(0, 0, -speed),
        active: true,
        isPlayerProjectile: true,
        damage: 1,
        piercing,
    };
}

export function createSpreadProjectiles(
    x: number,
    z: number,
    speed: number,
    scene: THREE.Scene,
    piercing = false,
): ProjectileState[] {
    const angles = [-0.2, 0, 0.2];
    return angles.map((angle) => {
        const mesh = new THREE.Mesh(
            playerProjectileGeo,
            createGlowMaterial(COLORS.playerProjectile),
        );
        mesh.position.set(x, 0.3, z);
        mesh.rotation.x = Math.PI / 2;
        scene.add(mesh);
        return {
            mesh,
            velocity: new THREE.Vector3(
                Math.sin(angle) * speed,
                0,
                -Math.cos(angle) * speed,
            ),
            active: true,
            isPlayerProjectile: true,
            damage: 1,
            piercing,
        };
    });
}

export function createEnemyProjectile(
    x: number,
    z: number,
    speed: number,
    scene: THREE.Scene,
    dirX = 0,
): ProjectileState {
    const mesh = new THREE.Mesh(
        enemyProjectileGeo,
        createGlowMaterial(COLORS.enemyProjectile),
    );
    mesh.position.set(x, 0.3, z);
    scene.add(mesh);

    return {
        mesh,
        velocity: new THREE.Vector3(dirX * speed * 0.3, 0, speed),
        active: true,
        isPlayerProjectile: false,
        damage: 15,
        piercing: false,
    };
}

export function cleanupProjectilesInPlace(
    projectiles: ProjectileState[],
    scene: THREE.Scene,
): void {
    let write = 0;
    for (let read = 0; read < projectiles.length; read++) {
        const p = projectiles[read];
        if (
            !p.active ||
            Math.abs(p.mesh.position.z) > PLAYFIELD.halfDepth + 2
        ) {
            scene.remove(p.mesh);
        } else {
            if (write !== read) projectiles[write] = p;
            write++;
        }
    }
    projectiles.length = write;
}
