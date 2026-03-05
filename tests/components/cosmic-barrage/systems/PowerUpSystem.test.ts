import {
    activatePowerUp,
    cleanupActivePowerUps,
    hasPowerUp,
} from "~/components/cosmic-barrage/systems/PowerUpSystem";
import type { ActivePowerUp } from "~/components/cosmic-barrage/engine/types";
import { POWERUP } from "~/components/cosmic-barrage/engine/constants";

describe("PowerUpSystem", () => {
    describe("activatePowerUp", () => {
        it("adds a new power-up", () => {
            const result = activatePowerUp("rapid-fire", [], 10);
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe("rapid-fire");
            expect(result[0].expiresAt).toBe(10 + POWERUP.duration);
        });

        it("refreshes timer on duplicate type", () => {
            const existing: ActivePowerUp[] = [
                { type: "rapid-fire", expiresAt: 15 },
            ];
            const result = activatePowerUp("rapid-fire", existing, 20);
            expect(result).toHaveLength(1);
            expect(result[0].expiresAt).toBe(20 + POWERUP.duration);
        });

        it("allows multiple different types", () => {
            let active: ActivePowerUp[] = [];
            active = activatePowerUp("rapid-fire", active, 10);
            active = activatePowerUp("spread-shot", active, 12);
            expect(active).toHaveLength(2);
        });

        it("returns unchanged array for shield-recharge", () => {
            const existing: ActivePowerUp[] = [
                { type: "rapid-fire", expiresAt: 20 },
            ];
            const result = activatePowerUp("shield-recharge", existing, 10);
            expect(result).toEqual(existing);
        });
    });

    describe("cleanupActivePowerUps", () => {
        it("removes expired power-ups", () => {
            const active: ActivePowerUp[] = [
                { type: "rapid-fire", expiresAt: 5 },
                { type: "spread-shot", expiresAt: 15 },
            ];
            const result = cleanupActivePowerUps(active, 10);
            expect(result).toHaveLength(1);
            expect(result[0].type).toBe("spread-shot");
        });

        it("keeps all when none expired", () => {
            const active: ActivePowerUp[] = [
                { type: "rapid-fire", expiresAt: 20 },
            ];
            const result = cleanupActivePowerUps(active, 10);
            expect(result).toHaveLength(1);
        });
    });

    describe("hasPowerUp", () => {
        it("returns true when active", () => {
            const active: ActivePowerUp[] = [
                { type: "piercing", expiresAt: 20 },
            ];
            expect(hasPowerUp(active, "piercing")).toBe(true);
        });

        it("returns false when not active", () => {
            expect(hasPowerUp([], "piercing")).toBe(false);
        });
    });
});
