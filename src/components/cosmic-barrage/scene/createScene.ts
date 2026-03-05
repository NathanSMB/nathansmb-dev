import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { COLORS, BLOOM } from "../engine/constants";
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

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
        BLOOM.strength,
        BLOOM.radius,
        BLOOM.threshold,
    );
    composer.addPass(bloomPass);

    createLighting(scene);
    createPlayfield(scene);

    const resize = () => {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
        composer.setSize(w, h);
        bloomPass.resolution.set(w, h);
    };

    const dispose = () => {
        renderer.dispose();
        composer.dispose();
    };

    return { scene, camera, renderer, composer, resize, dispose };
}
