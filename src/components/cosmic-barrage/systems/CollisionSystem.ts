import type { Entity } from "../engine/types";
import { COLLISION } from "../engine/constants";

export interface CollisionPair {
    a: number;
    b: number;
}

export function checkAABBOverlap(
    ax: number,
    az: number,
    ar: number,
    bx: number,
    bz: number,
    br: number,
): boolean {
    return Math.abs(ax - bx) < ar + br && Math.abs(az - bz) < ar + br;
}

export function detectCollisions(
    groupA: Entity[],
    radiusA: number,
    groupB: Entity[],
    radiusB: number,
): CollisionPair[] {
    const pairs: CollisionPair[] = [];
    for (let i = 0; i < groupA.length; i++) {
        if (!groupA[i].active) continue;
        const a = groupA[i].mesh.position;
        for (let j = 0; j < groupB.length; j++) {
            if (!groupB[j].active) continue;
            const b = groupB[j].mesh.position;
            if (checkAABBOverlap(a.x, a.z, radiusA, b.x, b.z, radiusB)) {
                pairs.push({ a: i, b: j });
            }
        }
    }
    return pairs;
}
