import * as THREE from "three";
import { InputSystem } from "~/components/cosmic-barrage/systems/InputSystem";

describe("InputSystem", () => {
    let input: InputSystem;
    let canvas: HTMLCanvasElement;
    let camera: THREE.PerspectiveCamera;

    beforeEach(() => {
        input = new InputSystem();
        canvas = document.createElement("canvas");
        camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
        input.attach(canvas, camera);
    });

    afterEach(() => {
        input.detach();
    });

    function press(code: string) {
        window.dispatchEvent(new KeyboardEvent("keydown", { code }));
    }

    function release(code: string) {
        window.dispatchEvent(new KeyboardEvent("keyup", { code }));
    }

    it("tracks keydown state", () => {
        expect(input.isDown("KeyA")).toBe(false);
        press("KeyA");
        expect(input.isDown("KeyA")).toBe(true);
    });

    it("tracks keyup state", () => {
        press("KeyA");
        release("KeyA");
        expect(input.isDown("KeyA")).toBe(false);
    });

    it("reports left for ArrowLeft", () => {
        press("ArrowLeft");
        expect(input.left).toBe(true);
        expect(input.right).toBe(false);
    });

    it("reports left for KeyA", () => {
        press("KeyA");
        expect(input.left).toBe(true);
    });

    it("reports right for ArrowRight", () => {
        press("ArrowRight");
        expect(input.right).toBe(true);
    });

    it("reports right for KeyD", () => {
        press("KeyD");
        expect(input.right).toBe(true);
    });

    it("reports shoot for Space", () => {
        press("Space");
        expect(input.shoot).toBe(true);
    });

    it("clearAll removes all keys", () => {
        press("KeyA");
        press("Space");
        input.clearAll();
        expect(input.left).toBe(false);
        expect(input.shoot).toBe(false);
    });

    it("detach stops tracking events", () => {
        input.detach();
        press("KeyA");
        expect(input.isDown("KeyA")).toBe(false);
    });
});
