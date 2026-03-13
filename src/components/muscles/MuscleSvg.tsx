import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { MUSCLE_MAP, SVG_ID_TO_MUSCLE } from "./muscle-map";
import css from "./MuscleSvg.css?inline";

interface MuscleSvgProps {
    primaryIds: string[];
    secondaryIds: string[];
    onMuscleHover: (muscleId: string | null) => void;
    onMouseMove: (x: number, y: number) => void;
}

export default function MuscleSvg(props: MuscleSvgProps) {
    let containerRef: HTMLDivElement | undefined;
    const [svgElement, setSvgElement] = createSignal<SVGSVGElement | null>(
        null,
    );
    let hoveredEls: Element[] = [];
    let hoveredMuscleKey: string | null = null;

    onMount(async () => {
        const res = await fetch("/Muscles.svg");
        const text = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svg = doc.documentElement as unknown as SVGSVGElement;

        // Strip existing fill classes from all color-layer paths so our CSS takes over
        const colorGroup = svg.querySelector("#color");
        if (colorGroup) {
            colorGroup.querySelectorAll("path").forEach((path) => {
                path.removeAttribute("class");
            });
        }

        containerRef!.appendChild(svg);
        setSvgElement(svg);

        // Event delegation on the color group
        const liveColorGroup = svg.querySelector("#color");
        if (liveColorGroup) {
            liveColorGroup.addEventListener("mouseover", handleMouseOver);
            liveColorGroup.addEventListener("mouseout", handleMouseOut);
        }
        containerRef!.addEventListener("mousemove", handleMouseMove);

        onCleanup(() => {
            if (liveColorGroup) {
                liveColorGroup.removeEventListener(
                    "mouseover",
                    handleMouseOver,
                );
                liveColorGroup.removeEventListener("mouseout", handleMouseOut);
            }
            containerRef?.removeEventListener("mousemove", handleMouseMove);
        });
    });

    function findMuscleElement(target: Element): Element | null {
        let el: Element | null = target;
        while (el && el.id !== "color") {
            if (el.id && SVG_ID_TO_MUSCLE[el.id]) {
                return el;
            }
            el = el.parentElement;
        }
        return null;
    }

    function handleMouseOver(e: Event) {
        const muscleEl = findMuscleElement(e.target as Element);
        const muscleKey = muscleEl ? SVG_ID_TO_MUSCLE[muscleEl.id] : null;
        if (muscleKey === hoveredMuscleKey) return;

        for (const el of hoveredEls) el.classList.remove("muscle-hover");
        hoveredEls = [];
        hoveredMuscleKey = muscleKey;

        if (muscleKey) {
            const svg = svgElement();
            if (svg) {
                for (const id of MUSCLE_MAP[muscleKey].svgIds) {
                    const el = svg.querySelector(`[id="${id}"]`);
                    if (el) {
                        el.classList.add("muscle-hover");
                        hoveredEls.push(el);
                    }
                }
            }
            props.onMuscleHover(muscleKey);
        } else {
            props.onMuscleHover(null);
        }
    }

    function handleMouseOut(e: Event) {
        const related = (e as MouseEvent).relatedTarget as Element | null;
        // Only clear hover if leaving the color group entirely
        const colorGroup = svgElement()?.querySelector("#color");
        if (colorGroup && related && colorGroup.contains(related)) return;

        for (const el of hoveredEls) el.classList.remove("muscle-hover");
        hoveredEls = [];
        hoveredMuscleKey = null;
        props.onMuscleHover(null);
    }

    function handleMouseMove(e: MouseEvent) {
        props.onMouseMove(e.clientX, e.clientY);
    }

    // Sync active muscle classes whenever props or SVG change
    createEffect(() => {
        const svg = svgElement();
        if (!svg) return;

        const primary = props.primaryIds;
        const secondary = props.secondaryIds;

        // Clear previous active classes
        svg.querySelectorAll(".muscle-primary, .muscle-secondary").forEach(
            (el) => {
                el.classList.remove("muscle-primary", "muscle-secondary");
            },
        );

        for (const id of primary) {
            const el = svg.querySelector(`[id="${id}"]`);
            if (el) el.classList.add("muscle-primary");
        }
        for (const id of secondary) {
            // Don't overwrite primary
            const el = svg.querySelector(`[id="${id}"]`);
            if (el && !el.classList.contains("muscle-primary")) {
                el.classList.add("muscle-secondary");
            }
        }
    });

    return (
        <>
            <style>{css}</style>
            <div class="muscle-svg-container" ref={containerRef} />
        </>
    );
}
