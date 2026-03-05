import * as THREE from "three";
import type { EnemyState } from "../engine/types";
import type { SpawnRequest } from "../systems/SpawnSystem";
import { createEnemy } from "./Enemy";

export function spawnEnemies(
    requests: SpawnRequest[],
    speedMultiplier: number,
    scene: THREE.Scene,
    time: number,
): EnemyState[] {
    const spawned: EnemyState[] = [];

    for (const req of requests) {
        if (req.type === "swarm") {
            for (let i = 0; i < req.count; i++) {
                const offsetX = (i - req.count / 2) * 1.2;
                const offsetZ = Math.floor(i / 4) * -1;
                spawned.push(
                    createEnemy(
                        req.type,
                        req.x + offsetX,
                        req.z + offsetZ,
                        speedMultiplier,
                        scene,
                        time,
                    ),
                );
            }
        } else {
            spawned.push(
                createEnemy(
                    req.type,
                    req.x,
                    req.z,
                    speedMultiplier,
                    scene,
                    time,
                ),
            );
        }
    }

    return spawned;
}
