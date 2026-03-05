import * as THREE from "three";
import type { EnemyState, EnemyType } from "../engine/types";
import { ENEMY, COLORS, PLAYFIELD } from "../engine/constants";
import { createNeonMaterial } from "../scene/materials";
import { createEnemyModel } from "./meshes";

const ENEMY_COLORS: Record<EnemyType, number> = {
    basic: COLORS.enemyBasic,
    fast: COLORS.enemyFast,
    shielded: COLORS.enemyShielded,
    bomber: COLORS.enemyBomber,
    rare: COLORS.enemyRare,
    elite: COLORS.enemyElite,
    swarm: COLORS.enemySwarm,
};

const ENEMY_EMISSIVE: Record<EnemyType, number> = {
    basic: 2.0,
    fast: 1.5,
    shielded: 1.0,
    bomber: 2.0,
    rare: 1.0,
    elite: 2.0,
    swarm: 2.0,
};

function createEnemyMesh(type: EnemyType): THREE.Object3D {
    const color = ENEMY_COLORS[type];
    const mat = createNeonMaterial(color, ENEMY_EMISSIVE[type]);
    return createEnemyModel(type, mat);
}

export function createEnemy(
    type: EnemyType,
    x: number,
    z: number,
    speedMultiplier: number,
    scene: THREE.Scene,
    time: number,
): EnemyState {
    const config = ENEMY[type];
    const mesh = createEnemyMesh(type);
    mesh.position.set(x, 0.4, z);
    scene.add(mesh);

    let vx = 0;
    let vz = config.speed * speedMultiplier;

    if (type === "fast") {
        vx = (Math.random() < 0.5 ? -1 : 1) * 3;
    } else if (type === "rare") {
        vx =
            x > 0
                ? -config.speed * speedMultiplier
                : config.speed * speedMultiplier;
        vz = 0;
    } else if (type === "elite") {
        vz = config.speed * speedMultiplier * 0.5;
    }

    return {
        mesh,
        velocity: new THREE.Vector3(vx, 0, vz),
        active: true,
        type,
        hp: config.hp,
        maxHp: config.hp,
        scoreValue: config.score,
        lastShotTime: time,
        canShoot: "fireRate" in config,
        spawnTime: time,
        collisionRadius: config.radius,
    };
}

export function updateEnemyBehavior(
    enemy: EnemyState,
    playerX: number,
    dt: number,
    time: number,
) {
    if (!enemy.active) return;

    if (enemy.type === "fast") {
        if (
            enemy.mesh.position.x > PLAYFIELD.halfWidth - 1 ||
            enemy.mesh.position.x < -PLAYFIELD.halfWidth + 1
        ) {
            enemy.velocity.x *= -1;
        }
    }

    if (enemy.type === "elite") {
        const dx = playerX - enemy.mesh.position.x;
        enemy.velocity.x = Math.sign(dx) * 2;
    }

    enemy.mesh.rotation.y += dt * 1.5;
}

export function isEnemyOffscreen(enemy: EnemyState): boolean {
    const pos = enemy.mesh.position;
    if (enemy.type === "rare") {
        return Math.abs(pos.x) > PLAYFIELD.halfWidth + 3;
    }
    return pos.z > PLAYFIELD.halfDepth + 2;
}
