import { DIFFICULTY } from "../engine/constants";
import type { EnemyType } from "../engine/types";

export interface DifficultyState {
    spawnInterval: number;
    speedMultiplier: number;
    availableTypes: EnemyType[];
    wave: number;
}

export function getDifficulty(elapsedTime: number): DifficultyState {
    const minutes = elapsedTime / 60;
    const wave = Math.floor(elapsedTime / DIFFICULTY.waveIncrementTime) + 1;

    const spawnInterval = Math.max(
        DIFFICULTY.minSpawnInterval,
        DIFFICULTY.baseSpawnInterval - minutes * 0.12,
    );

    const speedMultiplier = 1 + minutes * DIFFICULTY.speedScalePerMinute;

    const availableTypes: EnemyType[] = ["basic"];

    if (elapsedTime > 15) availableTypes.push("fast");
    if (elapsedTime > DIFFICULTY.swarmUnlockTime) availableTypes.push("swarm");
    if (elapsedTime > 90) availableTypes.push("shielded");
    if (elapsedTime > DIFFICULTY.bomberUnlockTime)
        availableTypes.push("bomber");
    if (elapsedTime > DIFFICULTY.eliteUnlockTime) availableTypes.push("elite");

    return { spawnInterval, speedMultiplier, availableTypes, wave };
}

export function shouldSpawnRare(
    elapsedTime: number,
    lastRareTime: number,
): boolean {
    return (
        elapsedTime - lastRareTime >= DIFFICULTY.rareInterval &&
        elapsedTime > 30
    );
}
