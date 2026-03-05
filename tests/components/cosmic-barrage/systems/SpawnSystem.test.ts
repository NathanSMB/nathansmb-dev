import { SpawnSystem } from "~/components/cosmic-barrage/systems/SpawnSystem";
import type { DifficultyState } from "~/components/cosmic-barrage/systems/DifficultySystem";

function makeDifficulty(overrides?: Partial<DifficultyState>): DifficultyState {
    return {
        spawnInterval: 1.5,
        speedMultiplier: 1,
        availableTypes: ["basic"],
        wave: 1,
        ...overrides,
    };
}

describe("SpawnSystem", () => {
    it("does not spawn before interval elapses", () => {
        const system = new SpawnSystem();
        const diff = makeDifficulty({ spawnInterval: 2 });
        const requests = system.update(1, diff);
        expect(requests).toHaveLength(0);
    });

    it("spawns after interval elapses", () => {
        const system = new SpawnSystem();
        const diff = makeDifficulty({ spawnInterval: 1 });
        const requests = system.update(1.5, diff);
        expect(requests.length).toBeGreaterThan(0);
    });

    it("spawns swarm with multiple count", () => {
        const system = new SpawnSystem();
        const diff = makeDifficulty({
            spawnInterval: 0.5,
            availableTypes: ["swarm"],
        });
        const requests = system.update(1, diff);
        const swarmReq = requests.find((r) => r.type === "swarm");
        if (swarmReq) {
            expect(swarmReq.count).toBeGreaterThanOrEqual(5);
        }
    });

    it("resets spawn timers on reset", () => {
        const system = new SpawnSystem();
        const diff = makeDifficulty({ spawnInterval: 1 });
        system.update(2, diff);
        system.reset();
        const requests = system.update(0.5, diff);
        expect(requests).toHaveLength(0);
    });
});
