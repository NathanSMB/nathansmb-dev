import * as THREE from "three";
import type { PlayerState } from "../engine/types";
import { PLAYER, COLORS } from "../engine/constants";
import { createNeonMaterial } from "../scene/materials";

export function createPlayer(scene: THREE.Scene): PlayerState {
    const group = new THREE.Group();

    const bodyGeo = new THREE.ConeGeometry(0.5, 1.2, 4);
    const body = new THREE.Mesh(
        bodyGeo,
        createNeonMaterial(COLORS.player, 1.5),
    );
    body.rotation.x = -Math.PI / 2;
    group.add(body);

    const wingGeo = new THREE.BoxGeometry(1.6, 0.05, 0.4);
    const wing = new THREE.Mesh(
        wingGeo,
        createNeonMaterial(COLORS.player, 1.2),
    );
    wing.position.z = 0.2;
    group.add(wing);

    group.position.set(PLAYER.startX, 0.4, PLAYER.startZ);
    scene.add(group);

    return {
        mesh: group,
        velocity: new THREE.Vector3(),
        active: true,
        hp: PLAYER.hp,
        maxHp: PLAYER.hp,
        shield: PLAYER.shield,
        maxShield: PLAYER.shield,
        shieldRechargeTimer: 0,
        lastShotTime: 0,
        fireRate: PLAYER.fireRate,
    };
}

export function resetPlayer(player: PlayerState) {
    player.mesh.position.set(PLAYER.startX, 0.4, PLAYER.startZ);
    player.velocity.set(0, 0, 0);
    player.hp = PLAYER.hp;
    player.shield = PLAYER.shield;
    player.shieldRechargeTimer = 0;
    player.lastShotTime = 0;
    player.fireRate = PLAYER.fireRate;
    player.active = true;
}
