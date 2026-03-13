import { createMemo, createSignal, Show } from "solid-js";
import ExerciseList from "./ExerciseList";
import MuscleTooltip from "./MuscleTooltip";
import MuscleSvg from "./MuscleSvg";
import { type Exercise, type ExerciseCategory } from "./exercise-data";
import { MUSCLE_MAP } from "./muscle-map";
import css from "./MuscleViewer.css?inline";

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

    const primarySvgIds = createMemo(() => {
        const ex = selectedExercise();
        if (!ex) return [];
        return ex.primary.flatMap((mid) => MUSCLE_MAP[mid]?.svgIds ?? []);
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

    return (
        <>
            <style>{css}</style>
            <div class="muscle-viewer">
                <div class="muscle-viewer-sidebar">
                    <p class="muscle-viewer-title">Exercises</p>
                    <ExerciseList
                        selected={selectedExercise()}
                        onSelect={setSelectedExercise}
                        searchQuery={searchQuery()}
                        onSearchChange={setSearchQuery}
                        activeCategory={activeCategory()}
                        onCategoryChange={setActiveCategory}
                    />
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
                    <Show when={selectedExercise()}>
                        {(ex) => (
                            <div class="muscle-viewer-selected-info">
                                {ex().name} — click again to deselect
                            </div>
                        )}
                    </Show>
                </div>
                <div class="muscle-viewer-svg-area">
                    <MuscleSvg
                        primaryIds={primarySvgIds()}
                        secondaryIds={secondarySvgIds()}
                        onMuscleHover={setHoveredMuscleId}
                        onMouseMove={(x, y) => setMousePos({ x, y })}
                    />
                    <MuscleTooltip
                        name={hoveredMuscleName()}
                        x={mousePos().x}
                        y={mousePos().y}
                    />
                </div>
            </div>
        </>
    );
}
