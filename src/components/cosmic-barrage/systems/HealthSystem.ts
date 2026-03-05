import type { PlayerState } from "../engine/types";
import { PLAYER } from "../engine/constants";

export function applyDamage(player: PlayerState, damage: number): boolean {
    player.shieldRechargeTimer = PLAYER.shieldRechargeDelay;

    if (player.shield > 0) {
        const absorbed = Math.min(player.shield, damage);
        player.shield -= absorbed;
        damage -= absorbed;
    }

    if (damage > 0) {
        player.hp -= damage;
    }

    return player.hp <= 0;
}

export function updateShieldRecharge(player: PlayerState, dt: number) {
    if (player.shield >= player.maxShield) return;

    player.shieldRechargeTimer -= dt;
    if (player.shieldRechargeTimer <= 0) {
        player.shield = Math.min(
            player.maxShield,
            player.shield + PLAYER.shieldRechargeRate * dt,
        );
    }
}

export function rechargeShieldFull(player: PlayerState) {
    player.shield = player.maxShield;
    player.shieldRechargeTimer = 0;
}
