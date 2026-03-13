export type ExerciseCategory =
    | "chest"
    | "back"
    | "shoulders"
    | "arms"
    | "legs"
    | "core";

export interface Exercise {
    name: string;
    category: ExerciseCategory;
    primary: string[]; // keys from MUSCLE_MAP
    secondary: string[];
}

export const EXERCISES: Exercise[] = [
    // Chest
    {
        name: "Bench Press",
        category: "chest",
        primary: ["chest"],
        secondary: ["deltoid-front", "triceps"],
    },
    {
        name: "Incline Bench Press",
        category: "chest",
        primary: ["chest", "deltoid-front"],
        secondary: ["triceps"],
    },
    {
        name: "Dumbbell Fly",
        category: "chest",
        primary: ["chest"],
        secondary: ["deltoid-front", "biceps"],
    },
    {
        name: "Push-Up",
        category: "chest",
        primary: ["chest"],
        secondary: ["triceps", "deltoid-front", "abs"],
    },

    // Back
    {
        name: "Pull-Up",
        category: "back",
        primary: ["lats", "biceps"],
        secondary: ["upper-back", "traps"],
    },
    {
        name: "Barbell Row",
        category: "back",
        primary: ["lats", "upper-back"],
        secondary: ["biceps", "traps", "hamstrings"],
    },
    {
        name: "Lat Pulldown",
        category: "back",
        primary: ["lats"],
        secondary: ["biceps", "upper-back"],
    },
    {
        name: "Face Pull",
        category: "back",
        primary: ["deltoid-rear", "upper-back"],
        secondary: ["traps"],
    },
    {
        name: "Seated Cable Row",
        category: "back",
        primary: ["lats", "upper-back"],
        secondary: ["biceps", "forearms"],
    },

    // Shoulders
    {
        name: "Overhead Press",
        category: "shoulders",
        primary: ["deltoid-front", "deltoid-side"],
        secondary: ["triceps", "traps"],
    },
    {
        name: "Lateral Raise",
        category: "shoulders",
        primary: ["deltoid-side"],
        secondary: [],
    },
    {
        name: "Front Raise",
        category: "shoulders",
        primary: ["deltoid-front"],
        secondary: ["traps"],
    },
    {
        name: "Reverse Fly",
        category: "shoulders",
        primary: ["deltoid-rear", "upper-back"],
        secondary: [],
    },
    {
        name: "Arnold Press",
        category: "shoulders",
        primary: ["deltoid-front", "deltoid-side", "deltoid-rear"],
        secondary: ["triceps"],
    },
    {
        name: "Neck Curl",
        category: "shoulders",
        primary: ["neck"],
        secondary: [],
    },
    {
        name: "Neck Extension",
        category: "shoulders",
        primary: ["neck"],
        secondary: ["traps"],
    },
    {
        name: "Barbell Shrug",
        category: "shoulders",
        primary: ["traps"],
        secondary: ["neck", "forearms"],
    },
    {
        name: "Dumbbell Shrug",
        category: "shoulders",
        primary: ["traps"],
        secondary: ["neck", "forearms"],
    },

    // Arms
    {
        name: "Bicep Curl",
        category: "arms",
        primary: ["biceps"],
        secondary: ["forearms"],
    },
    {
        name: "Hammer Curl",
        category: "arms",
        primary: ["biceps", "forearms"],
        secondary: [],
    },
    {
        name: "Tricep Pushdown",
        category: "arms",
        primary: ["triceps"],
        secondary: [],
    },
    {
        name: "Skull Crusher",
        category: "arms",
        primary: ["triceps"],
        secondary: ["forearms"],
    },
    {
        name: "Tricep Dip",
        category: "arms",
        primary: ["triceps"],
        secondary: ["chest", "deltoid-front"],
    },
    {
        name: "Wrist Curl",
        category: "arms",
        primary: ["forearms"],
        secondary: [],
    },

    // Legs
    {
        name: "Squat",
        category: "legs",
        primary: ["quadriceps", "glutes"],
        secondary: ["hamstrings", "calves"],
    },
    {
        name: "Deadlift",
        category: "legs",
        primary: ["hamstrings", "glutes", "lats"],
        secondary: ["quadriceps", "traps", "forearms"],
    },
    {
        name: "Romanian Deadlift",
        category: "legs",
        primary: ["hamstrings", "glutes"],
        secondary: ["lats", "forearms"],
    },
    {
        name: "Leg Press",
        category: "legs",
        primary: ["quadriceps"],
        secondary: ["glutes", "hamstrings"],
    },
    {
        name: "Leg Curl",
        category: "legs",
        primary: ["hamstrings"],
        secondary: [],
    },
    {
        name: "Leg Extension",
        category: "legs",
        primary: ["quadriceps"],
        secondary: [],
    },
    {
        name: "Calf Raise",
        category: "legs",
        primary: ["calves"],
        secondary: [],
    },
    {
        name: "Lunge",
        category: "legs",
        primary: ["quadriceps", "glutes"],
        secondary: ["hamstrings", "calves"],
    },
    {
        name: "Hip Thrust",
        category: "legs",
        primary: ["glutes"],
        secondary: ["hamstrings"],
    },
    {
        name: "Sumo Deadlift",
        category: "legs",
        primary: ["glutes", "adductors"],
        secondary: ["hamstrings", "quadriceps"],
    },
    {
        name: "Tibialis Raise",
        category: "legs",
        primary: ["tibialis"],
        secondary: [],
    },
    {
        name: "Walking Lunge",
        category: "legs",
        primary: ["quadriceps", "glutes"],
        secondary: ["hamstrings", "tibialis"],
    },
    {
        name: "Adductor Machine",
        category: "legs",
        primary: ["adductors"],
        secondary: [],
    },
    {
        name: "Cable Hip Adduction",
        category: "legs",
        primary: ["adductors"],
        secondary: [],
    },
    {
        name: "Copenhagen Plank",
        category: "legs",
        primary: ["adductors"],
        secondary: ["obliques", "abs"],
    },
    {
        name: "Cossack Squat",
        category: "legs",
        primary: ["adductors", "quadriceps", "glutes"],
        secondary: ["hamstrings"],
    },

    // Core
    {
        name: "Plank",
        category: "core",
        primary: ["abs"],
        secondary: ["obliques", "deltoid-front", "glutes"],
    },
    {
        name: "Russian Twist",
        category: "core",
        primary: ["obliques"],
        secondary: ["abs"],
    },
    {
        name: "Crunch",
        category: "core",
        primary: ["abs"],
        secondary: [],
    },
    {
        name: "Hanging Leg Raise",
        category: "core",
        primary: ["abs", "hip-flexors"],
        secondary: ["obliques"],
    },
    {
        name: "Cable Crunch",
        category: "core",
        primary: ["abs"],
        secondary: ["obliques"],
    },
];

export const CATEGORIES: { id: ExerciseCategory; label: string }[] = [
    { id: "chest", label: "Chest" },
    { id: "back", label: "Back" },
    { id: "shoulders", label: "Shoulders" },
    { id: "arms", label: "Arms" },
    { id: "legs", label: "Legs" },
    { id: "core", label: "Core" },
];
