import { createSignal, onMount, onCleanup, For } from "solid-js";
import * as THREE from "three";
import type { EnemyType, PowerUpType } from "../engine/types";
import { ENEMY, COLORS } from "../engine/constants";
import { createEnemyModel, createPowerUpModel } from "../entities/meshes";
import { createNeonMaterial } from "../scene/materials";
import css from "./HelpScreen.css?inline";

interface HelpItem {
    type: string;
    name: string;
    color: string;
    colorHex: number;
    description: string;
    stats?: string;
    cameraDistance: number;
}

const ENEMY_ITEMS: HelpItem[] = [
    {
        type: "basic",
        name: "BASIC",
        color: "#ff00ff",
        colorHex: COLORS.enemyBasic,
        description: "Standard fighter. Flies straight toward you.",
        stats: `HP: ${ENEMY.basic.hp} | Speed: ${ENEMY.basic.speed} | Score: ${ENEMY.basic.score}`,
        cameraDistance: 1.8,
    },
    {
        type: "fast",
        name: "FAST",
        color: "#c0c0c0",
        colorHex: COLORS.enemyFast,
        description: "High-speed missile with erratic side-to-side movement.",
        stats: `HP: ${ENEMY.fast.hp} | Speed: ${ENEMY.fast.speed} | Score: ${ENEMY.fast.score}`,
        cameraDistance: 2.2,
    },
    {
        type: "shielded",
        name: "SHIELDED",
        color: "#00ff88",
        colorHex: COLORS.enemyShielded,
        description: "Protected by an energy cage. Takes 3 hits.",
        stats: `HP: ${ENEMY.shielded.hp} | Speed: ${ENEMY.shielded.speed} | Score: ${ENEMY.shielded.score}`,
        cameraDistance: 2.0,
    },
    {
        type: "bomber",
        name: "BOMBER",
        color: "#ff4400",
        colorHex: COLORS.enemyBomber,
        description: "Armed gunship that fires projectiles at you.",
        stats: `HP: ${ENEMY.bomber.hp} | Speed: ${ENEMY.bomber.speed} | Score: ${ENEMY.bomber.score}`,
        cameraDistance: 2.0,
    },
    {
        type: "rare",
        name: "RARE",
        color: "#ffd700",
        colorHex: COLORS.enemyRare,
        description: "Golden disc that crosses the screen. High value.",
        stats: `HP: ${ENEMY.rare.hp} | Speed: ${ENEMY.rare.speed} | Score: ${ENEMY.rare.score}`,
        cameraDistance: 1.6,
    },
    {
        type: "elite",
        name: "ELITE",
        color: "#ff0044",
        colorHex: COLORS.enemyElite,
        description: "Heavy assault unit. Tracks you and fires rapidly.",
        stats: `HP: ${ENEMY.elite.hp} | Speed: ${ENEMY.elite.speed} | Score: ${ENEMY.elite.score}`,
        cameraDistance: 3.0,
    },
    {
        type: "swarm",
        name: "SWARM",
        color: "#4488ff",
        colorHex: COLORS.enemySwarm,
        description: "Tiny drones that attack in groups.",
        stats: `HP: ${ENEMY.swarm.hp} | Speed: ${ENEMY.swarm.speed} | Score: ${ENEMY.swarm.score}`,
        cameraDistance: 1.2,
    },
];

const POWERUP_ITEMS: HelpItem[] = [
    {
        type: "rapid-fire",
        name: "RAPID FIRE",
        color: "#ff8800",
        colorHex: COLORS.powerUpRapidFire,
        description: "2.5x fire rate for 8 seconds.",
        cameraDistance: 1.4,
    },
    {
        type: "spread-shot",
        name: "SPREAD SHOT",
        color: "#00ff00",
        colorHex: COLORS.powerUpSpreadShot,
        description: "Fires 3 projectiles in a spread pattern for 8 seconds.",
        cameraDistance: 1.4,
    },
    {
        type: "shield-recharge",
        name: "SHIELD RECHARGE",
        color: "#0088ff",
        colorHex: COLORS.powerUpShieldRecharge,
        description: "Instantly restores shield to full.",
        cameraDistance: 1.4,
    },
    {
        type: "score-multiplier",
        name: "SCORE MULTIPLIER",
        color: "#ffdd00",
        colorHex: COLORS.powerUpScoreMultiplier,
        description: "2x point multiplier for 8 seconds.",
        cameraDistance: 1.4,
    },
    {
        type: "piercing",
        name: "PIERCING",
        color: "#ff00ff",
        colorHex: COLORS.powerUpPiercing,
        description: "Shots pass through enemies for 8 seconds.",
        cameraDistance: 1.4,
    },
];

interface HelpScreenProps {
    onClose: () => void;
}

export default function HelpScreen(props: HelpScreenProps) {
    const [tab, setTab] = createSignal<"enemies" | "powerups">("enemies");

    const canvasRefs = new Map<string, HTMLCanvasElement>();
    let renderer: THREE.WebGLRenderer | undefined;
    let scene: THREE.Scene | undefined;
    let camera: THREE.PerspectiveCamera | undefined;
    let animId = 0;
    let models = new Map<string, THREE.Object3D>();

    function buildModels() {
        const allItems = [...ENEMY_ITEMS, ...POWERUP_ITEMS];
        for (const item of allItems) {
            const mat = createNeonMaterial(item.colorHex, 2).clone();
            let model: THREE.Object3D;
            if (ENEMY_ITEMS.includes(item)) {
                model = createEnemyModel(item.type as EnemyType, mat);
            } else {
                model = createPowerUpModel(item.type as PowerUpType, mat);
            }
            models.set(item.type, model);
        }
    }

    function startRendering() {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(128, 128);

        scene = new THREE.Scene();
        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
        dirLight.position.set(2, 3, 4);
        scene.add(dirLight);

        camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

        buildModels();

        let rotation = 0;
        function animate() {
            animId = requestAnimationFrame(animate);
            rotation += 0.02;

            const currentTab = tab();
            const items =
                currentTab === "enemies" ? ENEMY_ITEMS : POWERUP_ITEMS;

            for (const item of items) {
                const canvas = canvasRefs.get(item.type);
                const model = models.get(item.type);
                if (!canvas || !model || !renderer || !scene || !camera)
                    continue;

                // Clear previous children (except lights)
                for (let i = scene.children.length - 1; i >= 0; i--) {
                    const child = scene.children[i];
                    if (!(child instanceof THREE.Light)) {
                        scene.remove(child);
                    }
                }

                model.rotation.y = rotation;
                scene.add(model);

                camera.position.set(0, 0.3, item.cameraDistance);
                camera.lookAt(0, 0, 0);

                renderer.render(scene, camera);

                const ctx = canvas.getContext("2d");
                if (ctx) {
                    ctx.clearRect(0, 0, 80, 80);
                    ctx.drawImage(renderer.domElement, 0, 0, 80, 80);
                }

                scene.remove(model);
            }
        }
        animate();
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            e.preventDefault();
            e.stopImmediatePropagation();
            props.onClose();
        }
        if (e.key === " ") {
            e.preventDefault();
            e.stopImmediatePropagation();
        }
    }

    onMount(() => {
        window.addEventListener("keydown", handleKeyDown, { capture: true });
        startRendering();
    });

    onCleanup(() => {
        window.removeEventListener("keydown", handleKeyDown, {
            capture: true,
        });
        cancelAnimationFrame(animId);
        if (renderer) {
            renderer.dispose();
            renderer = undefined;
        }
        for (const model of models.values()) {
            model.traverse((child) => {
                if ((child as THREE.Mesh).isMesh) {
                    const mesh = child as THREE.Mesh;
                    mesh.geometry?.dispose();
                    if (mesh.material) {
                        const mat = mesh.material as THREE.Material;
                        if ((mat as any).__helpClone) mat.dispose();
                    }
                }
            });
        }
        models.clear();
        canvasRefs.clear();
        scene = undefined;
        camera = undefined;
    });

    function renderItems(items: HelpItem[]) {
        return (
            <For each={items}>
                {(item) => (
                    <div class="cb-help-card">
                        <canvas
                            class="cb-help-preview"
                            width={80}
                            height={80}
                            ref={(el) => canvasRefs.set(item.type, el)}
                        />
                        <div class="cb-help-info">
                            <div
                                class="cb-help-name"
                                style={{ color: item.color }}
                            >
                                {item.name}
                            </div>
                            <div class="cb-help-desc">{item.description}</div>
                            {item.stats && (
                                <div class="cb-help-stats">{item.stats}</div>
                            )}
                        </div>
                    </div>
                )}
            </For>
        );
    }

    return (
        <>
            <style>{css}</style>
            <div class="cb-help">
                <div class="cb-help-header">
                    <div class="cb-help-title">HELP</div>
                    <button class="cb-help-close" onClick={props.onClose}>
                        &times;
                    </button>
                </div>
                <div class="cb-help-tabs">
                    <button
                        class={`cb-help-tab${tab() === "enemies" ? " cb-help-tab--active" : ""}`}
                        onClick={() => setTab("enemies")}
                    >
                        ENEMIES
                    </button>
                    <button
                        class={`cb-help-tab${tab() === "powerups" ? " cb-help-tab--active" : ""}`}
                        onClick={() => setTab("powerups")}
                    >
                        POWER-UPS
                    </button>
                </div>
                <div class="cb-help-content">
                    {tab() === "enemies"
                        ? renderItems(ENEMY_ITEMS)
                        : renderItems(POWERUP_ITEMS)}
                </div>
            </div>
        </>
    );
}
