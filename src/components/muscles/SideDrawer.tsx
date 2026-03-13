import { type JSX, createEffect, createSignal } from "solid-js";
import css from "./SideDrawer.css?inline";

interface SideDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: JSX.Element;
}

export default function SideDrawer(props: SideDrawerProps) {
    let drawerRef!: HTMLDivElement;

    const [dragging, setDragging] = createSignal(false);
    const [dragOffset, setDragOffset] = createSignal(0);

    const DRAG_THRESHOLD = 5;
    let pending = false;
    let pendingPointerId = -1;
    let startX = 0;
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;

    // Reset drag offset when open state changes externally
    createEffect(() => {
        const _open = props.open;
        if (!dragging()) {
            setDragOffset(0);
        }
    });

    function drawerWidth(): number {
        return drawerRef?.offsetWidth ?? 300;
    }

    function onPointerDown(e: PointerEvent) {
        pending = true;
        pendingPointerId = e.pointerId;
        startX = e.clientX;
        lastX = startX;
        lastTime = Date.now();
        velocity = 0;
    }

    function onPointerMove(e: PointerEvent) {
        if (pending) {
            if (Math.abs(e.clientX - startX) < DRAG_THRESHOLD) return;
            pending = false;
            drawerRef.setPointerCapture(pendingPointerId);
            setDragging(true);
        }

        if (!dragging()) return;

        const x = e.clientX;
        const now = Date.now();
        const dt = now - lastTime;

        if (dt > 0) {
            velocity = (x - lastX) / dt; // positive = dragging right (toward close)
        }

        lastX = x;
        lastTime = now;

        const delta = x - startX; // positive = rightward
        if (props.open) {
            // Dragging to close: clamp 0..drawerWidth
            setDragOffset(Math.max(0, Math.min(drawerWidth(), delta)));
        } else {
            // Dragging to open from handle: clamp -drawerWidth..0
            setDragOffset(Math.min(0, Math.max(-drawerWidth(), delta)));
        }

        e.preventDefault();
    }

    function onPointerUp() {
        pending = false;
        if (!dragging()) return;

        const offset = dragOffset();
        const width = drawerWidth();

        let shouldOpen: boolean;
        if (Math.abs(velocity) > 0.5) {
            // Velocity-based: fast swipe decides
            shouldOpen = velocity < 0; // swipe left = open
        } else if (props.open) {
            // Position-based when closing
            shouldOpen = offset < width * 0.5;
        } else {
            // Position-based when opening
            shouldOpen = Math.abs(offset) > width * 0.5;
        }

        setDragging(false);
        setDragOffset(0);
        props.onOpenChange(shouldOpen);
    }

    const transform = () => {
        const offset = dragOffset();
        if (dragging()) {
            if (props.open) {
                return `translateX(${offset}px)`;
            }
            // Closed + dragging left to open: start at 100%, reduce by drag
            return `translateX(calc(100% + ${offset}px))`;
        }
        return undefined; // let CSS classes handle it
    };

    const showBackdrop = () => {
        if (dragging()) {
            // Show backdrop proportional to how open the drawer is
            if (props.open) {
                return dragOffset() < drawerWidth() * 0.5;
            }
            return Math.abs(dragOffset()) > drawerWidth() * 0.3;
        }
        return props.open;
    };

    return (
        <>
            <style>{css}</style>
            <div
                class={`side-drawer-backdrop${showBackdrop() ? " visible" : ""}`}
                onClick={() => props.onOpenChange(false)}
            />
            <div
                ref={drawerRef}
                class={`side-drawer${props.open && !dragging() ? " open" : ""}${dragging() ? " dragging" : ""}`}
                style={transform() ? { transform: transform() } : undefined}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <div
                    class="side-drawer-handle"
                    onClick={(e) => {
                        if (!dragging()) {
                            e.stopPropagation();
                            props.onOpenChange(!props.open);
                        }
                    }}
                >
                    <div class="side-drawer-handle-bar" />
                </div>
                <div class="side-drawer-content">{props.children}</div>
            </div>
        </>
    );
}
