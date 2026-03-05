import * as THREE from "three";

export class InputSystem {
    private keys = new Set<string>();
    private onKeyDown: (e: KeyboardEvent) => void;
    private onKeyUp: (e: KeyboardEvent) => void;

    pointerX: number | null = null;
    pointerShoot = false;
    touchMoveX: number | null = null;
    touchShoot = false;

    private _vec3 = new THREE.Vector3();
    private canvas: HTMLCanvasElement | null = null;
    private camera: THREE.PerspectiveCamera | null = null;
    private moveTouchId: number | null = null;

    private onMouseMove: (e: MouseEvent) => void;
    private onMouseLeave: () => void;
    private onMouseDown: (e: MouseEvent) => void;
    private onMouseUp: (e: MouseEvent) => void;
    private onContextMenu: (e: Event) => void;
    private onTouchStart: (e: TouchEvent) => void;
    private onTouchMove: (e: TouchEvent) => void;
    private onTouchEnd: (e: TouchEvent) => void;

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

        this.onMouseMove = (e: MouseEvent) => {
            this.pointerX = this.screenToWorldX(e.clientX, e.clientY);
        };
        this.onMouseLeave = () => {
            this.pointerX = null;
        };
        this.onMouseDown = (e: MouseEvent) => {
            if (e.button === 0) this.pointerShoot = true;
        };
        this.onMouseUp = (e: MouseEvent) => {
            if (e.button === 0) this.pointerShoot = false;
        };
        this.onContextMenu = (e: Event) => {
            e.preventDefault();
        };

        this.onTouchStart = (e: TouchEvent) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (this.moveTouchId === null) {
                    this.moveTouchId = touch.identifier;
                    this.touchMoveX = this.screenToWorldX(
                        touch.clientX,
                        touch.clientY,
                    );
                } else {
                    this.touchShoot = true;
                }
            }
        };
        this.onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.moveTouchId) {
                    this.touchMoveX = this.screenToWorldX(
                        touch.clientX,
                        touch.clientY,
                    );
                }
            }
        };
        this.onTouchEnd = (e: TouchEvent) => {
            for (let i = 0; i < e.changedTouches.length; i++) {
                const touch = e.changedTouches[i];
                if (touch.identifier === this.moveTouchId) {
                    this.moveTouchId = null;
                    this.touchMoveX = null;
                    // Reassign movement finger if other touches remain
                    if (e.touches.length > 0) {
                        const remaining = e.touches[0];
                        this.moveTouchId = remaining.identifier;
                        this.touchMoveX = this.screenToWorldX(
                            remaining.clientX,
                            remaining.clientY,
                        );
                        // Only keep shooting if there's a third+ finger
                        this.touchShoot = e.touches.length > 1;
                    } else {
                        this.touchShoot = false;
                    }
                } else {
                    // Non-movement finger lifted
                    const nonMoveCount = Array.from(e.touches).filter(
                        (t) => t.identifier !== this.moveTouchId,
                    ).length;
                    this.touchShoot = nonMoveCount > 0;
                }
            }
        };
    }

    private screenToWorldX(screenX: number, screenY: number): number | null {
        if (!this.canvas || !this.camera) return null;

        const rect = this.canvas.getBoundingClientRect();
        const ndcX = ((screenX - rect.left) / rect.width) * 2 - 1;
        const ndcY = -((screenY - rect.top) / rect.height) * 2 + 1;

        const v = this._vec3.set(ndcX, ndcY, 0.5).unproject(this.camera);
        const camPos = this.camera.position;
        const dir = v.sub(camPos).normalize();

        // Intersect with Y=0.4 plane (player height)
        const t = (0.4 - camPos.y) / dir.y;
        const worldX = camPos.x + dir.x * t;

        return worldX;
    }

    attach(canvas: HTMLCanvasElement, camera: THREE.PerspectiveCamera) {
        this.canvas = canvas;
        this.camera = camera;

        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);

        canvas.addEventListener("mousemove", this.onMouseMove);
        canvas.addEventListener("mouseleave", this.onMouseLeave);
        canvas.addEventListener("mousedown", this.onMouseDown);
        canvas.addEventListener("mouseup", this.onMouseUp);
        canvas.addEventListener("contextmenu", this.onContextMenu);

        canvas.addEventListener("touchstart", this.onTouchStart);
        canvas.addEventListener("touchmove", this.onTouchMove);
        canvas.addEventListener("touchend", this.onTouchEnd);
        canvas.addEventListener("touchcancel", this.onTouchEnd);
    }

    detach() {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);

        if (this.canvas) {
            this.canvas.removeEventListener("mousemove", this.onMouseMove);
            this.canvas.removeEventListener("mouseleave", this.onMouseLeave);
            this.canvas.removeEventListener("mousedown", this.onMouseDown);
            this.canvas.removeEventListener("mouseup", this.onMouseUp);
            this.canvas.removeEventListener("contextmenu", this.onContextMenu);

            this.canvas.removeEventListener("touchstart", this.onTouchStart);
            this.canvas.removeEventListener("touchmove", this.onTouchMove);
            this.canvas.removeEventListener("touchend", this.onTouchEnd);
            this.canvas.removeEventListener("touchcancel", this.onTouchEnd);
        }

        this.keys.clear();
        this.pointerX = null;
        this.pointerShoot = false;
        this.touchMoveX = null;
        this.touchShoot = false;
        this.moveTouchId = null;
        this.canvas = null;
        this.camera = null;
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
        return this.isDown("Space") || this.pointerShoot || this.touchShoot;
    }

    get start(): boolean {
        return this.isDown("Space") || this.pointerShoot || this.touchShoot;
    }

    get pointerWorldX(): number | null {
        return this.pointerX ?? this.touchMoveX;
    }

    clearAll() {
        this.keys.clear();
        this.pointerX = null;
        this.pointerShoot = false;
        this.touchMoveX = null;
        this.touchShoot = false;
        this.moveTouchId = null;
    }
}
