import * as THREE from "three";
import { spawnEnemies } from "~/components/space-invaders/entities/EnemyFactory";
import type { SpawnRequest } from "~/components/space-invaders/systems/SpawnSystem";

function makeScene(): THREE.Scene {
    return new THREE.Scene();
}

describe("EnemyFactory", () => {
    it("spawns a single basic enemy", () => {
        const requests: SpawnRequest[] = [
            { type: "basic", x: 0, z: -13, count: 1 },
        ];
        const enemies = spawnEnemies(requests, 1, makeScene(), 0);
        expect(enemies).toHaveLength(1);
        expect(enemies[0].type).toBe("basic");
    });

    it("spawns swarm as multiple enemies", () => {
        const requests: SpawnRequest[] = [
            { type: "swarm", x: 0, z: -13, count: 6 },
        ];
        const enemies = spawnEnemies(requests, 1, makeScene(), 0);
        expect(enemies).toHaveLength(6);
        enemies.forEach((e) => expect(e.type).toBe("swarm"));
    });

    it("applies speed multiplier", () => {
        const normal = spawnEnemies(
            [{ type: "basic", x: 0, z: -13, count: 1 }],
            1,
            makeScene(),
            0,
        );
        const fast = spawnEnemies(
            [{ type: "basic", x: 0, z: -13, count: 1 }],
            2,
            makeScene(),
            0,
        );
        expect(fast[0].velocity.z).toBeGreaterThan(normal[0].velocity.z);
    });

    it("handles multiple requests", () => {
        const requests: SpawnRequest[] = [
            { type: "basic", x: -3, z: -13, count: 1 },
            { type: "fast", x: 3, z: -13, count: 1 },
        ];
        const enemies = spawnEnemies(requests, 1, makeScene(), 0);
        expect(enemies).toHaveLength(2);
        expect(enemies[0].type).toBe("basic");
        expect(enemies[1].type).toBe("fast");
    });

    it("creates enemies with correct score values", () => {
        const enemies = spawnEnemies(
            [{ type: "elite", x: 0, z: -13, count: 1 }],
            1,
            makeScene(),
            0,
        );
        expect(enemies[0].scoreValue).toBe(400);
    });
});
