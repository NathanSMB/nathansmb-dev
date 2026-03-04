import * as THREE from "three";
import { PLAYFIELD, COLORS } from "../engine/constants";

export function createPlayfield(scene: THREE.Scene) {
    createGrid(scene);
    createBoundaries(scene);
    createStarfield(scene);
}

function createGrid(scene: THREE.Scene) {
    const gridMaterial = new THREE.LineBasicMaterial({
        color: COLORS.gridLines,
        transparent: true,
        opacity: 0.15,
    });

    const step = 2;
    const points: THREE.Vector3[] = [];

    for (let x = -PLAYFIELD.halfWidth; x <= PLAYFIELD.halfWidth; x += step) {
        points.push(new THREE.Vector3(x, 0, -PLAYFIELD.halfDepth));
        points.push(new THREE.Vector3(x, 0, PLAYFIELD.halfDepth));
    }
    for (let z = -PLAYFIELD.halfDepth; z <= PLAYFIELD.halfDepth; z += step) {
        points.push(new THREE.Vector3(-PLAYFIELD.halfWidth, 0, z));
        points.push(new THREE.Vector3(PLAYFIELD.halfWidth, 0, z));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const grid = new THREE.LineSegments(geometry, gridMaterial);
    grid.position.y = -0.01;
    scene.add(grid);
}

function createBoundaries(scene: THREE.Scene) {
    const borderMaterial = new THREE.LineBasicMaterial({
        color: COLORS.gridLines,
        transparent: true,
        opacity: 0.4,
    });

    const hw = PLAYFIELD.halfWidth;
    const hd = PLAYFIELD.halfDepth;
    const corners = [
        new THREE.Vector3(-hw, 0, -hd),
        new THREE.Vector3(hw, 0, -hd),
        new THREE.Vector3(hw, 0, hd),
        new THREE.Vector3(-hw, 0, hd),
        new THREE.Vector3(-hw, 0, -hd),
    ];

    const geometry = new THREE.BufferGeometry().setFromPoints(corners);
    const border = new THREE.Line(geometry, borderMaterial);
    scene.add(border);
}

function createStarfield(scene: THREE.Scene) {
    const count = 500;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = Math.random() * 40 + 5;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.1,
        transparent: true,
        opacity: 0.6,
    });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}
