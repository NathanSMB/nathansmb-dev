import * as THREE from "three";
import type { PowerUpState, ActivePowerUp, PowerUpType } from "../engine/types";
import { POWERUP, COLORS } from "../engine/constants";
import { createNeonMaterial } from "../scene/materials";
import { createPowerUpModel } from "../entities/meshes";

const POWERUP_COLORS: Record<PowerUpType, number> = {
    "rapid-fire": COLORS.powerUpRapidFire,
    "spread-shot": COLORS.powerUpSpreadShot,
    "shield-recharge": COLORS.powerUpShieldRecharge,
    "score-multiplier": COLORS.powerUpScoreMultiplier,
    piercing: COLORS.powerUpPiercing,
};

const POWERUP_EMISSIVE: Record<PowerUpType, number> = {
    "rapid-fire": 1.5,
    "spread-shot": 1.5,
    "shield-recharge": 1.5,
    "score-multiplier": 1.5,
    piercing: 1.5,
};

export function createPowerUp(
    x: number,
    z: number,
    scene: THREE.Scene,
    prdCount: number,
): { powerUp: PowerUpState | null; prdCount: number } {
    const nextCount = prdCount + 1;
    const chance = POWERUP.prdC * nextCount;

    if (Math.random() > chance) {
        return { powerUp: null, prdCount: nextCount };
    }

    const type =
        POWERUP.types[Math.floor(Math.random() * POWERUP.types.length)];
    const color = POWERUP_COLORS[type];
    const mesh = createPowerUpModel(
        type,
        createNeonMaterial(color, POWERUP_EMISSIVE[type]),
    );
    mesh.position.set(x, 0.5, z);
    scene.add(mesh);

    return {
        powerUp: {
            mesh,
            velocity: new THREE.Vector3(0, 0, POWERUP.floatSpeed),
            active: true,
            type,
        },
        prdCount: 0,
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
): void {
    let write = 0;
    for (let read = 0; read < powerUps.length; read++) {
        const pu = powerUps[read];
        if (!pu.active || pu.mesh.position.z > 14) {
            scene.remove(pu.mesh);
        } else {
            if (write !== read) powerUps[write] = pu;
            write++;
        }
    }
    powerUps.length = write;
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
