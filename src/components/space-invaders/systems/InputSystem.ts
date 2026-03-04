export class InputSystem {
    private keys = new Set<string>();
    private onKeyDown: (e: KeyboardEvent) => void;
    private onKeyUp: (e: KeyboardEvent) => void;

    constructor() {
        this.onKeyDown = (e: KeyboardEvent) => {
            this.keys.add(e.code);
            if (
                e.code === "Space" ||
                e.code === "ArrowLeft" ||
                e.code === "ArrowRight" ||
                e.code === "ArrowUp" ||
                e.code === "ArrowDown"
            ) {
                e.preventDefault();
            }
        };
        this.onKeyUp = (e: KeyboardEvent) => {
            this.keys.delete(e.code);
        };
    }

    attach() {
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
    }

    detach() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
        this.keys.clear();
    }

    isDown(code: string): boolean {
        return this.keys.has(code);
    }

    get left(): boolean {
        return this.isDown("ArrowLeft") || this.isDown("KeyA");
    }

    get right(): boolean {
        return this.isDown("ArrowRight") || this.isDown("KeyD");
    }

    get shoot(): boolean {
        return this.isDown("Space");
    }

    get start(): boolean {
        return this.isDown("Space");
    }

    clearAll() {
        this.keys.clear();
    }
}
