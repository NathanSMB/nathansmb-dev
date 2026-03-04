import { render } from "@solidjs/testing-library";
import HUD from "~/components/space-invaders/ui/HUD";
import type { GameStateSnapshot } from "~/components/space-invaders/engine/types";

function makeState(overrides?: Partial<GameStateSnapshot>): GameStateSnapshot {
    return {
        phase: "playing",
        score: 1500,
        wave: 3,
        hp: 80,
        maxHp: 100,
        shield: 60,
        maxShield: 100,
        activePowerUps: [],
        ...overrides,
    };
}

describe("HUD", () => {
    it("renders score", () => {
        const { getByText } = render(() => <HUD state={makeState()} />);
        expect(getByText("1,500")).toBeTruthy();
    });

    it("renders wave number", () => {
        const { getByText } = render(() => (
            <HUD state={makeState({ wave: 5 })} />
        ));
        expect(getByText("WAVE 5")).toBeTruthy();
    });

    it("renders HP and shield bars", () => {
        const { container } = render(() => <HUD state={makeState()} />);
        const hpBar = container.querySelector(
            ".si-hud-bar-fill--hp",
        ) as HTMLElement;
        const shieldBar = container.querySelector(
            ".si-hud-bar-fill--shield",
        ) as HTMLElement;
        expect(hpBar).toBeTruthy();
        expect(shieldBar).toBeTruthy();
        expect(hpBar.style.width).toBe("80%");
        expect(shieldBar.style.width).toBe("60%");
    });

    it("renders active power-ups", () => {
        const state = makeState({
            activePowerUps: [{ type: "rapid-fire", expiresAt: 20 }],
        });
        const { getByText } = render(() => <HUD state={state} />);
        expect(getByText("RAPID")).toBeTruthy();
    });

    it("hides power-ups section when none active", () => {
        const { container } = render(() => <HUD state={makeState()} />);
        expect(container.querySelector(".si-hud-powerups")).toBeFalsy();
    });
});
