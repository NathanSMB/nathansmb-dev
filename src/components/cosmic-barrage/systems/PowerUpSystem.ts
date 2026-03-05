import * as THREE from "three";
import type { PowerUpState, ActivePowerUp, PowerUpType } from "../engine/types";
import { POWERUP, COLORS } from "../engine/constants";
import { createNeonMaterial } from "../scene/materials";

const POWERUP_COLORS: Record<PowerUpType, number> = {
    "rapid-fire": COLORS.powerUpRapidFire,
    "spread-shot": COLORS.powerUpSpreadShot,
    "shield-recharge": COLORS.powerUpShieldRecharge,
    "score-multiplier": COLORS.powerUpScoreMultiplier,
    piercing: COLORS.powerUpPiercing,
};

const powerUpGeo = new THREE.OctahedronGeometry(0.3, 0);

export function createPowerUp(
    x: number,
    z: number,
    scene: THREE.Scene,
): PowerUpState | null {
    if (Math.random() > POWERUP.dropChance) return null;

    const type =
        POWERUP.types[Math.floor(Math.random() * POWERUP.types.length)];
    const color = POWERUP_COLORS[type];
    const mesh = new THREE.Mesh(powerUpGeo, createNeonMaterial(color, 3));
    mesh.position.set(x, 0.5, z);
    scene.add(mesh);

    return {
        mesh,
        velocity: new THREE.Vector3(0, 0, POWERUP.floatSpeed),
        active: true,
        type,
    };
}

export function updatePowerUpVisuals(powerUps: PowerUpState[], time: number) {
    for (const pu of powerUps) {
        if (!pu.active) continue;
        pu.mesh.rotation.y = time * 3;
        pu.mesh.position.y = 0.5 + Math.sin(time * 4) * 0.15;
    }
}

export function cleanupPowerUps(
    powerUps: PowerUpState[],
    scene: THREE.Scene,
): PowerUpState[] {
    return powerUps.filter((pu) => {
        if (!pu.active || pu.mesh.position.z > 14) {
            scene.remove(pu.mesh);
            return false;
        }
        return true;
    });
}

export function activatePowerUp(
    type: PowerUpType,
    activePowerUps: ActivePowerUp[],
    time: number,
): ActivePowerUp[] {
    if (type === "shield-recharge") return activePowerUps;

    const existing = activePowerUps.find((p) => p.type === type);
    if (existing) {
        existing.expiresAt = time + POWERUP.duration;
        return activePowerUps;
    }

    return [...activePowerUps, { type, expiresAt: time + POWERUP.duration }];
}

export function cleanupActivePowerUps(
    active: ActivePowerUp[],
    time: number,
): ActivePowerUp[] {
    return active.filter((p) => p.expiresAt > time);
}

export function hasPowerUp(
    active: ActivePowerUp[],
    type: PowerUpType,
): boolean {
    return active.some((p) => p.type === type);
}
