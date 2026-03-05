import type { EnemyType } from "../engine/types";
import type { DifficultyState } from "./DifficultySystem";
import { PLAYFIELD } from "../engine/constants";

export interface SpawnRequest {
    type: EnemyType;
    x: number;
    z: number;
    count: number;
}

export class SpawnSystem {
    private lastSpawnTime = 0;
    private lastRareTime = 0;

    reset() {
        this.lastSpawnTime = 0;
        this.lastRareTime = 0;
    }

    update(elapsedTime: number, difficulty: DifficultyState): SpawnRequest[] {
        const requests: SpawnRequest[] = [];

        if (elapsedTime - this.lastSpawnTime < difficulty.spawnInterval) {
            return requests;
        }

        this.lastSpawnTime = elapsedTime;

        const type = pickType(difficulty.availableTypes);
        const hw = PLAYFIELD.halfWidth - 1;

        if (type === "swarm") {
            const count = 5 + Math.floor(Math.random() * 4);
            const baseX = (Math.random() - 0.5) * hw;
            requests.push({
                type: "swarm",
                x: baseX,
                z: -PLAYFIELD.halfDepth - 1,
                count,
            });
        } else if (type === "rare") {
            const side = Math.random() < 0.5 ? -1 : 1;
            requests.push({
                type: "rare",
                x: side * (PLAYFIELD.halfWidth + 1),
                z: (Math.random() - 0.5) * 4,
                count: 1,
            });
            this.lastRareTime = elapsedTime;
        } else {
            requests.push({
                type,
                x: (Math.random() - 0.5) * hw * 2,
                z: -PLAYFIELD.halfDepth - 1,
                count: 1,
            });
        }

        return requests;
    }

    get lastRare() {
        return this.lastRareTime;
    }
    set lastRare(t: number) {
        this.lastRareTime = t;
    }
}

function pickType(available: EnemyType[]): EnemyType {
    return available[Math.floor(Math.random() * available.length)];
}
