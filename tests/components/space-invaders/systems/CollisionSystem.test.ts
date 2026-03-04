import {
    checkAABBOverlap,
    detectCollisions,
} from "~/components/space-invaders/systems/CollisionSystem";
import * as THREE from "three";
import type { Entity } from "~/components/space-invaders/engine/types";

function makeEntity(x: number, z: number, active = true): Entity {
    const mesh = new THREE.Object3D();
    mesh.position.set(x, 0, z);
    return { mesh, velocity: new THREE.Vector3(), active };
}

describe("CollisionSystem", () => {
    describe("checkAABBOverlap", () => {
        it("detects overlapping objects", () => {
            expect(checkAABBOverlap(0, 0, 1, 0.5, 0.5, 1)).toBe(true);
        });

        it("returns false for distant objects", () => {
            expect(checkAABBOverlap(0, 0, 0.5, 5, 5, 0.5)).toBe(false);
        });

        it("returns false for objects touching at edge", () => {
            expect(checkAABBOverlap(0, 0, 0.5, 1, 0, 0.5)).toBe(false);
        });

        it("detects same-position objects", () => {
            expect(checkAABBOverlap(3, 3, 0.5, 3, 3, 0.5)).toBe(true);
        });
    });

    describe("detectCollisions", () => {
        it("finds collision pairs", () => {
            const groupA = [makeEntity(0, 0)];
            const groupB = [makeEntity(0.3, 0.3)];
            const pairs = detectCollisions(groupA, 0.5, groupB, 0.5);
            expect(pairs).toHaveLength(1);
            expect(pairs[0]).toEqual({ a: 0, b: 0 });
        });

        it("ignores inactive entities", () => {
            const groupA = [makeEntity(0, 0, false)];
            const groupB = [makeEntity(0.3, 0.3)];
            const pairs = detectCollisions(groupA, 0.5, groupB, 0.5);
            expect(pairs).toHaveLength(0);
        });

        it("returns empty for non-overlapping groups", () => {
            const groupA = [makeEntity(0, 0)];
            const groupB = [makeEntity(10, 10)];
            const pairs = detectCollisions(groupA, 0.5, groupB, 0.5);
            expect(pairs).toHaveLength(0);
        });

        it("handles multiple collisions", () => {
            const groupA = [makeEntity(0, 0), makeEntity(5, 5)];
            const groupB = [makeEntity(0.1, 0.1), makeEntity(5.1, 5.1)];
            const pairs = detectCollisions(groupA, 0.5, groupB, 0.5);
            expect(pairs).toHaveLength(2);
        });
    });
});
