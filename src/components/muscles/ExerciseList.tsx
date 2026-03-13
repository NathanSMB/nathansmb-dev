import { For, Show } from "solid-js";
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
                <div class="exercise-list-search">
                    <TextInput
                        value={props.searchQuery}
                        onInput={props.onSearchChange}
                        placeholder="Search exercises…"
                        size="sm"
                        color="surface"
                    />
                </div>
                <div class="exercise-list-categories">
                    <button
                        class={`category-btn${props.activeCategory === null ? " active" : ""}`}
                        onClick={() => props.onCategoryChange(null)}
                        type="button"
                    >
                        All
                    </button>
                    <For each={CATEGORIES}>
                        {(cat) => (
                            <button
                                class={`category-btn${props.activeCategory === cat.id ? " active" : ""}`}
                                onClick={() =>
                                    props.onCategoryChange(
                                        props.activeCategory === cat.id
                                            ? null
                                            : cat.id,
                                    )
                                }
                                type="button"
                            >
                                {cat.label}
                            </button>
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
                                                <span class="exercise-item-tag primary-tag">
                                                    {muscleName(mid)}
                                                </span>
                                            )}
                                        </For>
                                        <For each={ex.secondary}>
                                            {(mid) => (
                                                <span class="exercise-item-tag secondary-tag">
                                                    {muscleName(mid)}
                                                </span>
                                            )}
                                        </For>
                                    </div>
                                </button>
                            )}
                        </For>
                    </Show>
                </div>
            </div>
        </>
    );
}
