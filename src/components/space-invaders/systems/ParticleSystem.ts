import * as THREE from "three";
import type { ParticleData } from "../engine/types";

const MAX_PARTICLES = 500;

export class ParticleSystem {
    private instancedMesh: THREE.InstancedMesh;
    private particles: ParticleData[] = [];
    private dummy = new THREE.Object3D();
    private colorAttr: THREE.InstancedBufferAttribute;

    constructor(scene: THREE.Scene) {
        const geo = new THREE.SphereGeometry(0.06, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
        });
        this.instancedMesh = new THREE.InstancedMesh(geo, mat, MAX_PARTICLES);
        this.instancedMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
        this.instancedMesh.count = 0;

        const colors = new Float32Array(MAX_PARTICLES * 3);
        this.colorAttr = new THREE.InstancedBufferAttribute(colors, 3);
        this.instancedMesh.instanceColor = this.colorAttr;

        scene.add(this.instancedMesh);
    }

    emit(x: number, y: number, z: number, color: THREE.Color, count: number) {
        for (let i = 0; i < count; i++) {
            if (this.particles.length >= MAX_PARTICLES) break;
            const speed = 2 + Math.random() * 4;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            this.particles.push({
                position: new THREE.Vector3(x, y, z),
                velocity: new THREE.Vector3(
                    Math.sin(phi) * Math.cos(theta) * speed,
                    Math.cos(phi) * speed * 0.5 + 1,
                    Math.sin(phi) * Math.sin(theta) * speed,
                ),
                life: 0.6 + Math.random() * 0.4,
                maxLife: 0.6 + Math.random() * 0.4,
                color: color.clone(),
            });
        }
    }

    update(dt: number) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.life -= dt;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }
            p.position.addScaledVector(p.velocity, dt);
            p.velocity.y -= 5 * dt;
        }

        this.instancedMesh.count = this.particles.length;

        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            const scale = p.life / p.maxLife;
            this.dummy.position.copy(p.position);
            this.dummy.scale.setScalar(scale);
            this.dummy.updateMatrix();
            this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
            this.colorAttr.setXYZ(i, p.color.r, p.color.g, p.color.b);
        }

        this.instancedMesh.instanceMatrix.needsUpdate = true;
        this.colorAttr.needsUpdate = true;
    }

    clear() {
        this.particles.length = 0;
        this.instancedMesh.count = 0;
    }

    dispose(scene: THREE.Scene) {
        scene.remove(this.instancedMesh);
        this.instancedMesh.geometry.dispose();
        (this.instancedMesh.material as THREE.Material).dispose();
    }
}
