import {
    type JSX,
    batch,
    createEffect,
    createSignal,
    onCleanup,
    onMount,
} from "solid-js";
import css from "./BottomSheet.css?inline";

export type SnapPoint = "collapsed" | "half" | "full";

const SNAP_HEIGHTS: Record<SnapPoint, number> = {
    collapsed: 80,
    half: 0, // computed from vh
    full: 0, // computed from vh
};

function getSnapHeight(snap: SnapPoint): number {
    const vh = window.innerHeight;
    if (snap === "collapsed") return 80;
    if (snap === "half") return vh * 0.5;
    return vh * 0.85;
}

function nearestSnap(height: number, velocity: number): SnapPoint {
    const snaps: SnapPoint[] = ["collapsed", "half", "full"];
    const heights = snaps.map((s) => getSnapHeight(s));

    // velocity-based: if flicking up/down fast, go to next snap
    if (Math.abs(velocity) > 0.5) {
        const direction = velocity < 0 ? 1 : -1; // negative velocity = dragging up = increase height
        const currentIdx = heights.reduce(
            (best, h, i) =>
                Math.abs(h - height) < Math.abs(heights[best] - height)
                    ? i
                    : best,
            0,
        );
        const nextIdx = Math.max(
            0,
            Math.min(snaps.length - 1, currentIdx + direction),
        );
        return snaps[nextIdx];
    }

    // nearest snap point
    let bestIdx = 0;
    let bestDist = Math.abs(heights[0] - height);
    for (let i = 1; i < heights.length; i++) {
        const dist = Math.abs(heights[i] - height);
        if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
        }
    }
    return snaps[bestIdx];
}

interface BottomSheetProps {
    snap: SnapPoint;
    onSnapChange: (snap: SnapPoint) => void;
    children: JSX.Element;
}

export default function BottomSheet(props: BottomSheetProps) {
    let sheetRef!: HTMLDivElement;
    let scrollRef: HTMLElement | null = null;

    const [dragging, setDragging] = createSignal(false);
    const [currentHeight, setCurrentHeight] = createSignal(
        getSnapHeight(props.snap),
    );

    const DRAG_THRESHOLD = 5; // px of movement before we commit to a drag
    let pending = false; // pointerdown fired but threshold not yet reached
    let pendingPointerId = -1;
    let startY = 0;
    let startHeight = 0;
    let lastY = 0;
    let lastTime = 0;
    let velocity = 0;

    // Sync height when snap prop changes externally
    const updateHeight = () => {
        if (!dragging()) {
            setCurrentHeight(getSnapHeight(props.snap));
        }
    };

    onMount(() => {
        updateHeight();
        window.addEventListener("resize", updateHeight);
        onCleanup(() => window.removeEventListener("resize", updateHeight));
    });

    // Update height when snap prop changes externally
    createEffect(() => {
        const _snap = props.snap;
        if (!dragging()) {
            setCurrentHeight(getSnapHeight(_snap));
        }
    });

    function onPointerDown(e: PointerEvent) {
        // If the pointer started inside the scroll container and it's scrolled down, let it scroll
        const scrollEl = sheetRef.querySelector(
            ".exercise-list-scroll",
        ) as HTMLElement | null;
        scrollRef = scrollEl;

        if (scrollEl && scrollEl.contains(e.target as Node)) {
            if (scrollEl.scrollTop > 0) {
                return; // let native scroll handle it
            }
        }

        // Don't capture yet — wait until the pointer moves past the threshold
        // so taps/clicks on list items still work
        pending = true;
        pendingPointerId = e.pointerId;
        startY = e.clientY;
        startHeight = currentHeight();
        lastY = startY;
        lastTime = Date.now();
        velocity = 0;
    }

    function onPointerMove(e: PointerEvent) {
        if (pending) {
            if (Math.abs(e.clientY - startY) < DRAG_THRESHOLD) return;
            // Threshold exceeded — commit to drag
            pending = false;
            sheetRef.setPointerCapture(pendingPointerId);
            setDragging(true);
        }

        if (!dragging()) return;

        const y = e.clientY;
        const now = Date.now();
        const dt = now - lastTime;

        if (dt > 0) {
            velocity = (y - lastY) / dt; // px/ms, positive = dragging down
        }

        lastY = y;
        lastTime = now;

        const delta = startY - y; // positive = dragging up
        const newHeight = Math.max(
            60,
            Math.min(window.innerHeight * 0.92, startHeight + delta),
        );
        setCurrentHeight(newHeight);

        e.preventDefault();
    }

    function onPointerUp() {
        pending = false;
        if (!dragging()) return;
        const snap = nearestSnap(currentHeight(), velocity);
        batch(() => {
            setDragging(false);
            setCurrentHeight(getSnapHeight(snap));
        });
        props.onSnapChange(snap);
    }

    const translateY = () => {
        const h = currentHeight();
        return `translateY(calc(100% - ${h}px))`;
    };

    const showBackdrop = () =>
        props.snap !== "collapsed" && !dragging()
            ? true
            : dragging() && currentHeight() > getSnapHeight("collapsed") + 40;

    // Set max height for content to enable scrolling within the sheet
    const contentMaxHeight = () => {
        const h = currentHeight();
        // subtract handle height (~35px) and padding
        return `${Math.max(0, h - 45)}px`;
    };

    return (
        <>
            <style>{css}</style>
            <div
                class={`bottom-sheet-backdrop${showBackdrop() ? " visible" : ""}`}
                onClick={() => props.onSnapChange("collapsed")}
            />
            <div
                ref={sheetRef}
                class={`bottom-sheet${!dragging() ? " snapping" : ""}`}
                style={{ transform: translateY() }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            >
                <div class="bottom-sheet-handle">
                    <div class="bottom-sheet-handle-bar" />
                </div>
                <div
                    class="bottom-sheet-content"
                    style={{ "max-height": contentMaxHeight() }}
                >
                    {props.children}
                </div>
            </div>
        </>
    );
}
