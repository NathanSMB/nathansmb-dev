import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import type { EnemyType, PowerUpType } from "../engine/types";

const enemyGeoCache = new Map<EnemyType, THREE.BufferGeometry>();
const powerUpGeoCache = new Map<PowerUpType, THREE.BufferGeometry>();

function bakeGroupToGeometry(group: THREE.Group): THREE.BufferGeometry {
    const geometries: THREE.BufferGeometry[] = [];
    group.updateMatrixWorld(true);
    group.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const geo = mesh.geometry.clone();
            geo.applyMatrix4(mesh.matrixWorld);
            geometries.push(geo);
        }
    });
    const merged = mergeGeometries(geometries, false);
    for (const geo of geometries) geo.dispose();
    if (!merged) {
        return new THREE.SphereGeometry(0.2, 8, 8);
    }
    return merged;
}

function buildEnemyGroup(type: EnemyType): THREE.Group {
    const mat = new THREE.MeshBasicMaterial(); // dummy, not used in merged geo
    switch (type) {
        case "basic": {
            const group = new THREE.Group();
            const upper = new THREE.Mesh(
                new THREE.ConeGeometry(0.25, 0.35, 6),
                mat,
            );
            upper.position.y = 0.175;
            group.add(upper);
            const lower = new THREE.Mesh(
                new THREE.ConeGeometry(0.25, 0.35, 6),
                mat,
            );
            lower.position.y = -0.175;
            lower.rotation.x = Math.PI;
            group.add(lower);
            const finGeo = new THREE.BoxGeometry(0.08, 0.1, 0.04);
            for (let i = 0; i < 4; i++) {
                const angle = (i * Math.PI) / 2;
                const fin = new THREE.Mesh(finGeo, mat);
                fin.position.set(
                    Math.cos(angle) * 0.28,
                    0,
                    Math.sin(angle) * 0.28,
                );
                fin.rotation.y = -angle;
                group.add(fin);
            }
            return group;
        }
        case "fast": {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.ConeGeometry(0.15, 1.0, 4),
                mat,
            );
            body.rotation.x = Math.PI / 2;
            group.add(body);
            const wingGeo = new THREE.BoxGeometry(0.5, 0.04, 0.3);
            const wingL = new THREE.Mesh(wingGeo, mat);
            wingL.position.set(-0.2, 0, 0.15);
            wingL.rotation.y = 0.3;
            group.add(wingL);
            const wingR = new THREE.Mesh(wingGeo, mat);
            wingR.position.set(0.2, 0, 0.15);
            wingR.rotation.y = -0.3;
            group.add(wingR);
            return group;
        }
        case "bomber": {
            const group = new THREE.Group();
            const body = new THREE.Mesh(
                new THREE.BoxGeometry(0.6, 0.3, 0.5),
                mat,
            );
            group.add(body);
            const barrel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.06, 0.06, 0.5, 6),
                mat,
            );
            barrel.rotation.x = Math.PI / 2;
            barrel.position.set(0, -0.1, 0.4);
            group.add(barrel);
            const finGeo = new THREE.BoxGeometry(0.08, 0.3, 0.3);
            const finL = new THREE.Mesh(finGeo, mat);
            finL.position.set(-0.34, 0.1, -0.1);
            group.add(finL);
            const finR = new THREE.Mesh(finGeo, mat);
            finR.position.set(0.34, 0.1, -0.1);
            group.add(finR);
            return group;
        }
        case "rare": {
            const group = new THREE.Group();
            const coin = new THREE.Mesh(
                new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24),
                mat,
            );
            coin.rotation.x = Math.PI / 2;
            group.add(coin);
            return group;
        }
        case "elite": {
            const group = new THREE.Group();
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.6, 0.08, 8, 24),
                mat,
            );
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
            const core = new THREE.Mesh(
                new THREE.SphereGeometry(0.25, 10, 10),
                mat,
            );
            group.add(core);
            const spikeGeo = new THREE.ConeGeometry(0.1, 0.5, 4);
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI * 2) / 6;
                const spike = new THREE.Mesh(spikeGeo, mat);
                spike.position.set(
                    Math.cos(angle) * 0.6,
                    0.3,
                    Math.sin(angle) * 0.6,
                );
                spike.rotation.z = -Math.cos(angle) * 0.3;
                spike.rotation.x = Math.sin(angle) * 0.3;
                group.add(spike);
            }
            const barrelGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.3, 6);
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2) / 3 + Math.PI / 6;
                const barrel = new THREE.Mesh(barrelGeo, mat);
                barrel.position.set(
                    Math.cos(angle) * 0.7,
                    -0.05,
                    Math.sin(angle) * 0.7,
                );
                barrel.rotation.x = Math.PI / 2;
                barrel.rotation.z = -angle;
                group.add(barrel);
            }
            return group;
        }
        case "swarm": {
            const group = new THREE.Group();
            const core = new THREE.Mesh(
                new THREE.SphereGeometry(0.12, 8, 8),
                mat,
            );
            group.add(core);
            const wingGeo = new THREE.BoxGeometry(0.25, 0.03, 0.12);
            const wL = new THREE.Mesh(wingGeo, mat);
            wL.position.set(-0.15, 0.04, 0);
            wL.rotation.z = 0.3;
            group.add(wL);
            const wR = new THREE.Mesh(wingGeo, mat);
            wR.position.set(0.15, 0.04, 0);
            wR.rotation.z = -0.3;
            group.add(wR);
            return group;
        }
        default:
            return new THREE.Group();
    }
}

function getEnemyGeometry(type: EnemyType): THREE.BufferGeometry {
    let geo = enemyGeoCache.get(type);
    if (geo) return geo;
    geo = bakeGroupToGeometry(buildEnemyGroup(type));
    enemyGeoCache.set(type, geo);
    return geo;
}

export function createEnemyModel(
    type: EnemyType,
    mat: THREE.MeshStandardMaterial,
): THREE.Object3D {
    // Shielded needs 2 materials (solid core + wireframe cage), keep as Group
    if (type === "shielded") {
        const group = new THREE.Group();
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.3, 10, 10), mat);
        group.add(core);
        const cageMat = mat.clone();
        cageMat.wireframe = true;
        cageMat.transparent = true;
        cageMat.opacity = 0.5;
        const cage = new THREE.Mesh(
            new THREE.IcosahedronGeometry(0.5, 0),
            cageMat,
        );
        group.add(cage);
        return group;
    }

    return new THREE.Mesh(getEnemyGeometry(type), mat);
}

function buildPowerUpGroup(type: PowerUpType): THREE.Group {
    const mat = new THREE.MeshBasicMaterial();
    switch (type) {
        case "rapid-fire": {
            const group = new THREE.Group();
            const seg = new THREE.BoxGeometry(0.08, 0.15, 0.06);
            const s1 = new THREE.Mesh(seg, mat);
            s1.position.set(0, 0.22, 0);
            s1.rotation.z = 0.4;
            group.add(s1);
            const s2 = new THREE.Mesh(seg, mat);
            s2.position.set(0.06, 0.08, 0);
            s2.rotation.z = -0.4;
            group.add(s2);
            const s3 = new THREE.Mesh(seg, mat);
            s3.position.set(0, -0.06, 0);
            s3.rotation.z = 0.4;
            group.add(s3);
            const s4 = new THREE.Mesh(seg, mat);
            s4.position.set(0.06, -0.2, 0);
            s4.rotation.z = -0.4;
            group.add(s4);
            group.scale.setScalar(1.4);
            return group;
        }
        case "spread-shot": {
            const group = new THREE.Group();
            const angles = [-0.5, 0, 0.5];
            for (const angle of angles) {
                const arrow = new THREE.Group();
                const tip = new THREE.Mesh(
                    new THREE.ConeGeometry(0.05, 0.12, 4),
                    mat,
                );
                tip.position.y = 0.15;
                arrow.add(tip);
                const shaft = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.02, 0.02, 0.18, 4),
                    mat,
                );
                shaft.position.y = 0.02;
                arrow.add(shaft);
                arrow.rotation.z = angle;
                group.add(arrow);
            }
            group.scale.setScalar(1.5);
            return group;
        }
        case "shield-recharge":
            // Built directly in createPowerUpModel (ExtrudeGeometry can't merge)
            return new THREE.Group();
        case "score-multiplier": {
            const group = new THREE.Group();
            const barGeo = new THREE.BoxGeometry(0.06, 0.28, 0.06);
            const bar1 = new THREE.Mesh(barGeo, mat);
            bar1.position.x = -0.1;
            bar1.rotation.z = 0.7;
            group.add(bar1);
            const bar2 = new THREE.Mesh(barGeo, mat);
            bar2.position.x = -0.1;
            bar2.rotation.z = -0.7;
            group.add(bar2);
            const arc = new THREE.Mesh(
                new THREE.TorusGeometry(0.08, 0.025, 6, 8, Math.PI),
                mat,
            );
            arc.position.set(0.15, 0.06, 0);
            group.add(arc);
            const base = new THREE.Mesh(
                new THREE.BoxGeometry(0.16, 0.04, 0.05),
                mat,
            );
            base.position.set(0.15, -0.08, 0);
            group.add(base);
            return group;
        }
        case "piercing": {
            const group = new THREE.Group();
            const spearhead = new THREE.Mesh(
                new THREE.ConeGeometry(0.06, 0.15, 4),
                mat,
            );
            spearhead.position.y = 0.2;
            group.add(spearhead);
            const shaft = new THREE.Mesh(
                new THREE.CylinderGeometry(0.025, 0.025, 0.35, 4),
                mat,
            );
            group.add(shaft);
            const ring = new THREE.Mesh(
                new THREE.TorusGeometry(0.12, 0.025, 8, 12),
                mat,
            );
            ring.rotation.x = Math.PI / 2;
            group.add(ring);
            return group;
        }
        default:
            return new THREE.Group();
    }
}

function getPowerUpGeometry(type: PowerUpType): THREE.BufferGeometry {
    let geo = powerUpGeoCache.get(type);
    if (geo) return geo;
    geo = bakeGroupToGeometry(buildPowerUpGroup(type));
    powerUpGeoCache.set(type, geo);
    return geo;
}

export function createPowerUpModel(
    type: PowerUpType,
    mat: THREE.MeshStandardMaterial,
): THREE.Object3D {
    // ExtrudeGeometry doesn't merge with standard primitives; keep as Group
    if (type === "shield-recharge") {
        const group = new THREE.Group();
        const shape = new THREE.Shape();
        shape.moveTo(0, 0.2);
        shape.quadraticCurveTo(-0.08, 0.16, -0.15, 0.08);
        shape.quadraticCurveTo(-0.12, -0.04, 0, -0.2);
        shape.quadraticCurveTo(0.12, -0.04, 0.15, 0.08);
        shape.quadraticCurveTo(0.08, 0.16, 0, 0.2);
        const shieldGeo = new THREE.ExtrudeGeometry(shape, {
            depth: 0.04,
            bevelEnabled: true,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 2,
        });
        shieldGeo.center();
        group.add(new THREE.Mesh(shieldGeo, mat));
        group.add(new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.35, 0.06), mat));
        return group;
    }

    return new THREE.Mesh(getPowerUpGeometry(type), mat);
}
