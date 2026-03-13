export interface MuscleDefinition {
    displayName: string;
    svgIds: string[];
}

export const MUSCLE_MAP: Record<string, MuscleDefinition> = {
    chest: {
        displayName: "Pectoralis",
        svgIds: [
            "pectoralis-major",
            "pectoralis-minor",
            "chest-middle-black-area",
        ],
    },
    lats: {
        displayName: "Latissimus Dorsi",
        svgIds: ["latissimus-dorsi", "latimus-dorsi-front"],
    },
    "upper-back": {
        displayName: "Upper Back",
        svgIds: ["infraspinatus", "teres-minor", "teres"],
    },
    traps: {
        displayName: "Trapezius",
        svgIds: ["trapezius1", "sternocleidomastoid"],
    },
    "deltoid-front": {
        displayName: "Front Deltoid",
        svgIds: ["deltoid-anterior-head-left", "deltoid-anterior-head-right"],
    },
    "deltoid-side": {
        displayName: "Side Deltoid",
        svgIds: ["deltoid-middle-head-left", "deltoid-middle-head-right"],
    },
    "deltoid-rear": {
        displayName: "Rear Deltoid",
        svgIds: ["posterior-head"],
    },
    biceps: {
        displayName: "Biceps",
        svgIds: [
            "biceps-brachii-long",
            "biceps-brachii-short-head",
            "brachialis",
        ],
    },
    triceps: {
        displayName: "Triceps",
        svgIds: ["triceps", "triceps-brachii-lateral-head", "medial-head"],
    },
    forearms: {
        displayName: "Forearms",
        svgIds: [
            "brachioradialis",
            "brachioradialis-back",
            "palmaris-longus",
            "extensor-carpi-ulnaris",
            "extensor-carpi-ulnaris-back",
            "flexor-carpi-ulnaris",
            "pronatur-teres",
            "abductor-pollicis-longus",
            "abductor-pollicis-longus-right1",
        ],
    },
    abs: {
        displayName: "Abs",
        svgIds: [
            "mucle-rectus-abdominis",
            "tendinous-inscriptions",
            "end-of-middle-abs",
        ],
    },
    obliques: {
        displayName: "Obliques & Serratus",
        svgIds: ["external-oblique", "external-oblique1", "serratus-anterior"],
    },
    glutes: {
        displayName: "Glutes",
        svgIds: ["gluteous-maximus", "gluteus-medius", "gluteus-medius1"],
    },
    quadriceps: {
        displayName: "Quadriceps",
        svgIds: ["rectus-femoris", "vastus", "mediais", "vastus-lateralis"],
    },
    hamstrings: {
        displayName: "Hamstrings",
        svgIds: ["biceos", "semimembranosus", "semitendinosus"],
    },
    adductors: {
        displayName: "Inner Thigh",
        svgIds: [
            "adductor-magnus",
            "adductor-longus",
            "pectineus",
            "gracilis",
            "gracilis1",
        ],
    },
    "hip-flexors": {
        displayName: "Hip Flexors",
        svgIds: ["tensor-fasciae-latae"],
    },
    calves: {
        displayName: "Calves",
        svgIds: [
            "gastrocnemius",
            "grastocneus",
            "soleus",
            "soleus1",
            "peroneous-longus",
            "peroneus-longus",
            "peroneus-brevis",
            "flexor-hallucis-longus",
        ],
    },
    tibialis: {
        displayName: "Tibialis Anterior",
        svgIds: ["tibialis-anterior"],
    },
    neck: {
        displayName: "Neck",
        svgIds: ["stemocleidomastoid", "omohyoid"],
    },
};

// Reverse map: SVG element ID → muscle key
export const SVG_ID_TO_MUSCLE: Record<string, string> = Object.entries(
    MUSCLE_MAP,
).reduce(
    (acc, [key, def]) => {
        for (const id of def.svgIds) {
            acc[id] = key;
        }
        return acc;
    },
    {} as Record<string, string>,
);
