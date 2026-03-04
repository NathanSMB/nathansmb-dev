import * as THREE from "three";
import type { EnemyState, EnemyType } from "../engine/types";
import { ENEMY, COLORS, PLAYFIELD } from "../engine/constants";
import { createNeonMaterial } from "../scene/materials";

const ENEMY_COLORS: Record<EnemyType, number> = {
    basic: COLORS.enemyBasic,
    fast: COLORS.enemyFast,
    shielded: COLORS.enemyShielded,
    bomber: COLORS.enemyBomber,
    rare: COLORS.enemyRare,
    elite: COLORS.enemyElite,
    swarm: COLORS.enemySwarm,
};

function createEnemyMesh(type: EnemyType): THREE.Object3D {
    const color = ENEMY_COLORS[type];
    const mat = createNeonMaterial(color, 2.5);

    switch (type) {
        case "basic": {
            const geo = new THREE.BoxGeometry(0.7, 0.3, 0.7);
            return new THREE.Mesh(geo, mat);
        }
        case "fast": {
            const geo = new THREE.ConeGeometry(0.35, 0.8, 3);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI / 2;
            return mesh;
        }
        case "shielded": {
            const group = new THREE.Group();
            const core = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.3, 0.6),
                mat,
            );
            group.add(core);
            const shieldGeo = new THREE.RingGeometry(0.5, 0.6, 6);
            const shieldMat = createNeonMaterial(color, 1);
            shieldMat.transparent = true;
            shieldMat.opacity = 0.4;
            const shield = new THREE.Mesh(shieldGeo, shieldMat);
            shield.rotation.x = -Math.PI / 2;
            shield.position.y = 0.2;
            group.add(shield);
            return group;
        }
        case "bomber": {
            const geo = new THREE.OctahedronGeometry(0.45, 0);
            return new THREE.Mesh(geo, mat);
        }
        case "rare": {
            const geo = new THREE.TorusGeometry(0.35, 0.12, 6, 8);
            const mesh = new THREE.Mesh(geo, mat);
            mesh.rotation.x = Math.PI / 2;
            return mesh;
        }
        case "elite": {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.DodecahedronGeometry(0.45, 0),
                mat,
            );
            group.add(body);
            const spike1 = new THREE.Mesh(
                new THREE.ConeGeometry(0.15, 0.4, 4),
                mat,
            );
            spike1.position.set(0.5, 0, 0);
            spike1.rotation.z = -Math.PI / 2;
            group.add(spike1);
            const spike2 = spike1.clone();
            spike2.position.set(-0.5, 0, 0);
            spike2.rotation.z = Math.PI / 2;
            group.add(spike2);
            return group;
        }
        case "swarm": {
            const geo = new THREE.TetrahedronGeometry(0.25, 0);
            return new THREE.Mesh(geo, mat);
        }
    }
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
