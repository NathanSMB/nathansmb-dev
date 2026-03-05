import * as THREE from "three";
import type { PlayerState } from "~/components/cosmic-barrage/engine/types";
import { PLAYER } from "~/components/cosmic-barrage/engine/constants";
import {
    applyDamage,
    updateShieldRecharge,
    rechargeShieldFull,
} from "~/components/cosmic-barrage/systems/HealthSystem";

function makePlayer(overrides?: Partial<PlayerState>): PlayerState {
    return {
        mesh: new THREE.Object3D(),
        velocity: new THREE.Vector3(),
        active: true,
        hp: PLAYER.hp,
        maxHp: PLAYER.hp,
        shield: PLAYER.shield,
        maxShield: PLAYER.shield,
        shieldRechargeTimer: 0,
        lastShotTime: 0,
        fireRate: PLAYER.fireRate,
        ...overrides,
    };
}

describe("HealthSystem", () => {
    describe("applyDamage", () => {
        it("absorbs damage with shield first", () => {
            const p = makePlayer({ shield: 50 });
            applyDamage(p, 30);
            expect(p.shield).toBe(20);
            expect(p.hp).toBe(PLAYER.hp);
        });

        it("overflows damage to HP when shield depleted", () => {
            const p = makePlayer({ shield: 20 });
            applyDamage(p, 50);
            expect(p.shield).toBe(0);
            expect(p.hp).toBe(PLAYER.hp - 30);
        });

        it("applies all damage to HP when no shield", () => {
            const p = makePlayer({ shield: 0 });
            applyDamage(p, 25);
            expect(p.hp).toBe(PLAYER.hp - 25);
        });

        it("returns true when HP reaches zero", () => {
            const p = makePlayer({ shield: 0, hp: 10 });
            const dead = applyDamage(p, 10);
            expect(dead).toBe(true);
        });

        it("returns false when still alive", () => {
            const p = makePlayer();
            const dead = applyDamage(p, 10);
            expect(dead).toBe(false);
        });

        it("resets shield recharge timer on damage", () => {
            const p = makePlayer({ shieldRechargeTimer: 0 });
            applyDamage(p, 5);
            expect(p.shieldRechargeTimer).toBe(PLAYER.shieldRechargeDelay);
        });
    });

    describe("updateShieldRecharge", () => {
        it("does not recharge during delay", () => {
            const p = makePlayer({ shield: 50, shieldRechargeTimer: 2 });
            updateShieldRecharge(p, 1);
            expect(p.shield).toBe(50);
            expect(p.shieldRechargeTimer).toBe(1);
        });

        it("recharges shield after delay expires", () => {
            const p = makePlayer({ shield: 50, shieldRechargeTimer: 0 });
            updateShieldRecharge(p, 1);
            expect(p.shield).toBeGreaterThan(50);
        });

        it("does not exceed max shield", () => {
            const p = makePlayer({ shield: 99, shieldRechargeTimer: 0 });
            updateShieldRecharge(p, 100);
            expect(p.shield).toBe(PLAYER.shield);
        });

        it("does nothing at full shield", () => {
            const p = makePlayer();
            updateShieldRecharge(p, 1);
            expect(p.shield).toBe(PLAYER.shield);
        });
    });

    describe("rechargeShieldFull", () => {
        it("sets shield to max and clears timer", () => {
            const p = makePlayer({ shield: 10, shieldRechargeTimer: 5 });
            rechargeShieldFull(p);
            expect(p.shield).toBe(PLAYER.shield);
            expect(p.shieldRechargeTimer).toBe(0);
        });
    });
});
