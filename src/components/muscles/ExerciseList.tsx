import { For, Show } from "solid-js";
import Banner from "~/components/ui/Banner";
import Button from "~/components/ui/Button";
import Pill from "~/components/ui/Pill";
import TextInput from "~/components/ui/TextInput";
import {
    CATEGORIES,
    EXERCISES,
    type Exercise,
    type ExerciseCategory,
} from "./exercise-data";
import { MUSCLE_MAP } from "./muscle-map";
import css from "./ExerciseList.css?inline";

interface ExerciseListProps {
    selected: Exercise | null;
    onSelect: (exercise: Exercise | null) => void;
    searchQuery: string;
    onSearchChange: (q: string) => void;
    activeCategory: ExerciseCategory | null;
    onCategoryChange: (cat: ExerciseCategory | null) => void;
    muscleFilter: string | null;
    searchColor?: "surface" | "page" | "transparent";
}

export default function ExerciseList(props: ExerciseListProps) {
    const filtered = () => {
        const q = props.searchQuery.toLowerCase();
        const cat = props.activeCategory;
        const muscle = props.muscleFilter;
        return EXERCISES.filter((ex) => {
            const matchesCat = !cat || ex.category === cat;
            const matchesSearch = !q || ex.name.toLowerCase().includes(q);
            const matchesMuscle =
                !muscle ||
                ex.primary.includes(muscle) ||
                ex.secondary.includes(muscle);
            return matchesCat && matchesSearch && matchesMuscle;
        });
    };

    function handleSelect(ex: Exercise) {
        if (props.selected?.name === ex.name) {
            props.onSelect(null);
        } else {
            props.onSelect(ex);
        }
    }

    function muscleName(id: string) {
        return MUSCLE_MAP[id]?.displayName ?? id;
    }

    return (
        <>
            <style>{css}</style>
            <div class="exercise-list-panel">
                <Banner
                    variant="info"
                    message={
                        props.muscleFilter
                            ? `Showing exercises for ${MUSCLE_MAP[props.muscleFilter]?.displayName} — click again to deselect`
                            : null
                    }
                    class="exercise-list-filter-banner"
                />
                <div class="exercise-list-search">
                    <TextInput
                        value={props.searchQuery}
                        onInput={props.onSearchChange}
                        size="lg"
                        placeholder="Search exercises…"
                        color={props.searchColor ?? "surface"}
                    />
                </div>
                <div class="exercise-list-categories">
                    <Button
                        variant="pill"
                        color={
                            props.activeCategory === null
                                ? "primary"
                                : "neutral"
                        }
                        onClick={() => props.onCategoryChange(null)}
                    >
                        All
                    </Button>
                    <For each={CATEGORIES}>
                        {(cat) => (
                            <Button
                                variant="pill"
                                color={
                                    props.activeCategory === cat.id
                                        ? "primary"
                                        : "neutral"
                                }
                                onClick={() =>
                                    props.onCategoryChange(
                                        props.activeCategory === cat.id
                                            ? null
                                            : cat.id,
                                    )
                                }
                            >
                                {cat.label}
                            </Button>
                        )}
                    </For>
                </div>
                <div class="exercise-list-scroll">
                    <Show
                        when={filtered().length > 0}
                        fallback={
                            <div class="exercise-list-empty">
                                No exercises found
                            </div>
                        }
                    >
                        <For each={filtered()}>
                            {(ex) => (
                                <button
                                    class={`exercise-item${props.selected?.name === ex.name ? " selected" : ""}`}
                                    onClick={() => handleSelect(ex)}
                                    type="button"
                                >
                                    <span class="exercise-item-name">
                                        {ex.name}
                                    </span>
                                    <div class="exercise-item-muscles">
                                        <For each={ex.primary}>
                                            {(mid) => (
                                                <Pill color="danger">
                                                    {muscleName(mid)}
                                                </Pill>
                                            )}
                                        </For>
                                        <For each={ex.secondary}>
                                            {(mid) => (
                                                <Pill color="warning">
                                                    {muscleName(mid)}
                                                </Pill>
                                            )}
                                        </For>
                                    </div>
                                </button>
                            )}
                        </For>
                    </Show>
                </div>
                <Banner
                    variant="info"
                    message={
                        props.selected
                            ? `${props.selected.name} — click again to deselect`
                            : null
                    }
                    class="exercise-list-selected-banner"
                />
            </div>
        </>
    );
}
