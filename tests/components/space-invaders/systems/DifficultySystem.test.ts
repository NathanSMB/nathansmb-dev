import {
    getDifficulty,
    shouldSpawnRare,
} from "~/components/space-invaders/systems/DifficultySystem";
import { DIFFICULTY } from "~/components/space-invaders/engine/constants";

describe("DifficultySystem", () => {
    describe("getDifficulty", () => {
        it("starts with only basic enemies", () => {
            const diff = getDifficulty(0);
            expect(diff.availableTypes).toEqual(["basic"]);
        });

        it("unlocks fast enemies after 15s", () => {
            const diff = getDifficulty(16);
            expect(diff.availableTypes).toContain("fast");
        });

        it("unlocks swarm enemies after 60s", () => {
            const diff = getDifficulty(61);
            expect(diff.availableTypes).toContain("swarm");
        });

        it("unlocks elite enemies after 120s", () => {
            const diff = getDifficulty(121);
            expect(diff.availableTypes).toContain("elite");
        });

        it("increases speed multiplier over time", () => {
            const early = getDifficulty(0);
            const late = getDifficulty(300);
            expect(late.speedMultiplier).toBeGreaterThan(early.speedMultiplier);
        });

        it("decreases spawn interval over time", () => {
            const early = getDifficulty(0);
            const late = getDifficulty(300);
            expect(late.spawnInterval).toBeLessThan(early.spawnInterval);
        });

        it("spawn interval never goes below minimum", () => {
            const diff = getDifficulty(10000);
            expect(diff.spawnInterval).toBeGreaterThanOrEqual(
                DIFFICULTY.minSpawnInterval,
            );
        });

        it("wave increments every 30s", () => {
            expect(getDifficulty(0).wave).toBe(1);
            expect(getDifficulty(30).wave).toBe(2);
            expect(getDifficulty(60).wave).toBe(3);
        });
    });

    describe("shouldSpawnRare", () => {
        it("returns false before 30s", () => {
            expect(shouldSpawnRare(20, 0)).toBe(false);
        });

        it("returns true when enough time has passed", () => {
            expect(shouldSpawnRare(50, 30)).toBe(true);
        });

        it("returns false if spawned too recently", () => {
            expect(shouldSpawnRare(50, 45)).toBe(false);
        });
    });
});
