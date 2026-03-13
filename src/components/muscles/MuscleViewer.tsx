import { Show, createMemo, createSignal } from "solid-js";
import BottomSheet, { type SnapPoint } from "./BottomSheet";
import ExerciseList from "./ExerciseList";
import MuscleTooltip from "./MuscleTooltip";
import MuscleSvg from "./MuscleSvg";
import SideDrawer from "./SideDrawer";
import { type Exercise, type ExerciseCategory } from "./exercise-data";
import { MUSCLE_MAP } from "./muscle-map";
import css from "./MuscleViewer.css?inline";

type Layout = "desktop" | "portrait" | "landscape";

function useLayout(): () => Layout {
    const portraitQuery = "(max-aspect-ratio: 1/1)";
    const landscapeQuery = "(max-height: 500px) and (orientation: landscape)";

    const [isPortrait, setIsPortrait] = createSignal(
        typeof window !== "undefined"
            ? window.matchMedia(portraitQuery).matches
            : false,
    );
    const [isShortLandscape, setIsShortLandscape] = createSignal(
        typeof window !== "undefined"
            ? window.matchMedia(landscapeQuery).matches
            : false,
    );

    if (typeof window !== "undefined") {
        const portraitMql = window.matchMedia(portraitQuery);
        portraitMql.addEventListener("change", (e) => setIsPortrait(e.matches));

        const landscapeMql = window.matchMedia(landscapeQuery);
        landscapeMql.addEventListener("change", (e) =>
            setIsShortLandscape(e.matches),
        );
    }

    return () => {
        if (isShortLandscape()) return "landscape";
        if (isPortrait()) return "portrait";
        return "desktop";
    };
}

export default function MuscleViewer() {
    const [selectedExercise, setSelectedExercise] =
        createSignal<Exercise | null>(null);
    const [hoveredMuscleId, setHoveredMuscleId] = createSignal<string | null>(
        null,
    );
    const [mousePos, setMousePos] = createSignal({ x: 0, y: 0 });
    const [searchQuery, setSearchQuery] = createSignal("");
    const [activeCategory, setActiveCategory] =
        createSignal<ExerciseCategory | null>(null);
    const [muscleFilter, setMuscleFilter] = createSignal<string | null>(null);
    const [sheetSnap, setSheetSnap] = createSignal<SnapPoint>("collapsed");

    const layout = useLayout();
    const isMobile = () => layout() !== "desktop";

    function handleMuscleClick(muscleId: string) {
        if (muscleFilter() === muscleId) {
            setMuscleFilter(null);
        } else {
            setMuscleFilter(muscleId);
            setSelectedExercise(null);
            if (isMobile()) setSheetSnap("half");
        }
    }

    function handleExerciseSelect(ex: Exercise | null) {
        setSelectedExercise(ex);
        if (isMobile() && ex) {
            setSheetSnap("collapsed");
        }
    }

    const primarySvgIds = createMemo(() => {
        const ex = selectedExercise();
        if (ex)
            return ex.primary.flatMap((mid) => MUSCLE_MAP[mid]?.svgIds ?? []);
        const filter = muscleFilter();
        if (filter) return MUSCLE_MAP[filter]?.svgIds ?? [];
        return [];
    });

    const secondarySvgIds = createMemo(() => {
        const ex = selectedExercise();
        if (!ex) return [];
        return ex.secondary.flatMap((mid) => MUSCLE_MAP[mid]?.svgIds ?? []);
    });

    const hoveredMuscleName = createMemo(() => {
        const id = hoveredMuscleId();
        if (!id) return null;
        return MUSCLE_MAP[id]?.displayName ?? null;
    });

    const legend = (
        <div class="muscle-viewer-legend">
            <div class="legend-item">
                <div class="legend-swatch primary" />
                Primary muscle
            </div>
            <div class="legend-item">
                <div class="legend-swatch secondary" />
                Secondary muscle
            </div>
            <div class="legend-item">
                <div class="legend-swatch hover" />
                Hover
            </div>
        </div>
    );

    const exerciseListProps = () =>
        ({
            selected: selectedExercise(),
            onSelect: handleExerciseSelect,
            searchQuery: searchQuery(),
            onSearchChange: setSearchQuery,
            activeCategory: activeCategory(),
            onCategoryChange: setActiveCategory,
            muscleFilter: muscleFilter(),
        }) as const;

    return (
        <>
            <style>{css}</style>
            <div class={`muscle-viewer${isMobile() ? " mobile" : ""}`}>
                <Show when={!isMobile()}>
                    <div class="muscle-viewer-sidebar">
                        <p class="muscle-viewer-title">Exercises</p>
                        <ExerciseList {...exerciseListProps()} />
                        {legend}
                    </div>
                </Show>
                <div class="muscle-viewer-svg-area">
                    <MuscleSvg
                        primaryIds={primarySvgIds()}
                        secondaryIds={secondarySvgIds()}
                        onMuscleHover={setHoveredMuscleId}
                        onMuscleClick={handleMuscleClick}
                        onMouseMove={(x, y) => setMousePos({ x, y })}
                    />
                    <MuscleTooltip
                        name={hoveredMuscleName()}
                        x={mousePos().x}
                        y={mousePos().y}
                    />
                </div>
                <Show when={layout() === "portrait"}>
                    <BottomSheet snap={sheetSnap()} onSnapChange={setSheetSnap}>
                        <ExerciseList
                            {...exerciseListProps()}
                            searchColor="page"
                        />
                        {legend}
                    </BottomSheet>
                </Show>
                <Show when={layout() === "landscape"}>
                    <SideDrawer
                        open={sheetSnap() !== "collapsed"}
                        onOpenChange={(open) =>
                            setSheetSnap(open ? "half" : "collapsed")
                        }
                    >
                        <ExerciseList
                            {...exerciseListProps()}
                            searchColor="page"
                        />
                        {legend}
                    </SideDrawer>
                </Show>
            </div>
        </>
    );
}
