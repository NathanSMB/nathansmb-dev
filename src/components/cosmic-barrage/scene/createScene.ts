import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { COLORS, BLOOM, PLAYFIELD } from "../engine/constants";
import { createLighting } from "./createLighting";
import { createPlayfield } from "./createPlayfield";

export interface SceneContext {
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    composer: EffectComposer;
    resize: () => void;
    dispose: () => void;
}

export function createGameScene(canvas: HTMLCanvasElement): SceneContext {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(COLORS.background);

    const camera = new THREE.PerspectiveCamera(
        60,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        200,
    );
    camera.position.set(0, 24, 22);
    camera.lookAt(0, 0, -2);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(
            Math.floor(canvas.clientWidth / 2),
            Math.floor(canvas.clientHeight / 2),
        ),
        BLOOM.strength,
        BLOOM.radius,
        BLOOM.threshold,
    );
    composer.addPass(bloomPass);

    createLighting(scene);
    createPlayfield(scene);

    const BASE_FOV = 60;

    // Horizontal tangent needed to keep grid corners visible.
    // Camera at (0,24,22) looking at (0,0,-2); critical corner (halfWidth, 0, halfDepth).
    // viewDepth = (24 + halfDepth) / √2,  viewX = halfWidth
    // tan(requiredHalfH) = halfWidth / viewDepth, with ~5% padding
    const viewDepth = (24 + PLAYFIELD.halfDepth) / Math.SQRT2;
    const REQUIRED_H_TAN = (PLAYFIELD.halfWidth / viewDepth) * 1.05;

    const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        const aspect = w / h;
        camera.aspect = aspect;

        // Widen FOV on narrow (portrait) screens so the full grid stays visible
        const requiredVFov =
            2 * Math.atan(REQUIRED_H_TAN / aspect) * (180 / Math.PI);
        camera.fov = Math.max(BASE_FOV, requiredVFov);

        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        composer.setSize(w, h);
        bloomPass.resolution.set(Math.floor(w / 2), Math.floor(h / 2));
    };

    const dispose = () => {
        renderer.dispose();
        composer.dispose();
    };

    return { scene, camera, renderer, composer, resize, dispose };
}
