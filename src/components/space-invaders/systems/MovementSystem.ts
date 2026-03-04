import type { Entity } from "../engine/types";

export function updateMovement(entities: Entity[], dt: number) {
    for (const entity of entities) {
        if (!entity.active) continue;
        entity.mesh.position.x += entity.velocity.x * dt;
        entity.mesh.position.y += entity.velocity.y * dt;
        entity.mesh.position.z += entity.velocity.z * dt;
    }
}
