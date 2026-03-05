import * as THREE from "three";
import type {
    GameState,
    GameCallbacks,
    GameStateSnapshot,
    EnemyState,
    ProjectileState,
    ActivePowerUp,
} from "./types";
import {
    PLAYER,
    PLAYFIELD,
    COLLISION,
    ENEMY,
    ENEMY_PROJECTILE_SPEED,
} from "./constants";
import { createGameScene, type SceneContext } from "../scene/createScene";
import { InputSystem } from "../systems/InputSystem";
import { updateMovement } from "../systems/MovementSystem";
import {
    detectCollisions,
    detectCollisionsWithRadii,
} from "../systems/CollisionSystem";
import {
    applyDamage,
    updateShieldRecharge,
    rechargeShieldFull,
} from "../systems/HealthSystem";
import { getDifficulty, shouldSpawnRare } from "../systems/DifficultySystem";
import { SpawnSystem } from "../systems/SpawnSystem";
import { ParticleSystem } from "../systems/ParticleSystem";
import {
    createPlayerProjectile,
    createSpreadProjectiles,
    createEnemyProjectile,
    cleanupProjectiles,
} from "../systems/ProjectileSystem";
import {
    createPowerUp,
    updatePowerUpVisuals,
    cleanupPowerUps,
    activatePowerUp,
    cleanupActivePowerUps,
    hasPowerUp,
} from "../systems/PowerUpSystem";
import { createPlayer, resetPlayer } from "../entities/Player";
import { updateEnemyBehavior, isEnemyOffscreen } from "../entities/Enemy";
import { spawnEnemies } from "../entities/EnemyFactory";
import { AudioManager } from "../audio/AudioManager";
import { SoundEffects } from "../audio/SoundEffects";
import { SynthMusic } from "../audio/SynthMusic";

export class GameEngine {
    private sceneCtx!: SceneContext;
    private input = new InputSystem();
    private spawnSystem = new SpawnSystem();
    private particleSystem!: ParticleSystem;
    private audioManager = new AudioManager();
    private sfx!: SoundEffects;
    private music!: SynthMusic;
    private state!: GameState;
    private animationId = 0;
    private lastTime = 0;
    private callbacks: GameCallbacks;
    private resizeObserver: ResizeObserver | null = null;
    private startPending = false;
    private fpsFrameCount = 0;
    private fpsLastTime = 0;
    private fpsValue = 0;

    constructor(callbacks: GameCallbacks) {
        this.callbacks = callbacks;
    }

    mount(canvas: HTMLCanvasElement) {
        this.sceneCtx = createGameScene(canvas);
        this.particleSystem = new ParticleSystem(this.sceneCtx.scene);
        this.sfx = new SoundEffects(this.audioManager);
        this.music = new SynthMusic(this.audioManager);
        this.input.attach(canvas, this.sceneCtx.camera);

        this.state = this.createInitialState();

        this.resizeObserver = new ResizeObserver(() => {
            requestAnimationFrame(() => this.sceneCtx.resize());
        });
        this.resizeObserver.observe(canvas);

        this.emitState();
        this.loop(performance.now());
    }

    resize() {
        this.sceneCtx.resize();
    }

    unmount() {
        cancelAnimationFrame(this.animationId);
        this.input.detach();
        this.music.stop();
        this.audioManager.dispose();
        this.particleSystem.dispose(this.sceneCtx.scene);
        this.resizeObserver?.disconnect();
        this.sceneCtx.dispose();
    }

    private async requestStart() {
        if (this.callbacks.onStartRequested) {
            this.startPending = true;
            const allowed = await this.callbacks.onStartRequested();
            this.startPending = false;
            if (!allowed) return;
        }
        this.startGame();
    }

    startGame() {
        this.audioManager.init();
        this.audioManager.resume();
        this.clearEntities();
        resetPlayer(this.state.player);
        this.state.phase = "playing";
        this.state.score = 0;
        this.state.scoreMultiplier = 1;
        this.state.wave = 1;
        this.state.elapsedTime = 0;
        this.state.activePowerUps = [];
        this.state.difficulty = 0;
        this.state.powerUpPrdCount = 0;
        this.spawnSystem.reset();
        this.particleSystem.clear();
        this.music.start();
        this.emitState();
    }

    toggleMute() {
        this.audioManager.init();
        this.audioManager.toggleMute();
        return this.audioManager.muted;
    }

    private createInitialState(): GameState {
        const player = createPlayer(this.sceneCtx.scene);
        return {
            phase: "start",
            score: 0,
            scoreMultiplier: 1,
            wave: 1,
            elapsedTime: 0,
            player,
            enemies: [],
            projectiles: [],
            powerUps: [],
            activePowerUps: [],
            particles: [],
            difficulty: 0,
            powerUpPrdCount: 0,
        };
    }

    private loop = (now: number) => {
        this.animationId = requestAnimationFrame(this.loop);

        const dt = Math.min((now - this.lastTime) / 1000, 0.05);
        this.lastTime = now;

        this.fpsFrameCount++;
        const fpsElapsed = now - this.fpsLastTime;
        if (fpsElapsed >= 500) {
            this.fpsValue = Math.round(
                (this.fpsFrameCount / fpsElapsed) * 1000,
            );
            this.fpsFrameCount = 0;
            this.fpsLastTime = now;
        }

        if (this.state.phase === "start") {
            if (this.input.start && !this.startPending) {
                this.requestStart();
            }
        } else if (this.state.phase === "playing") {
            this.updatePlaying(dt);
        }

        this.particleSystem.update(dt);
        this.music.update();
        this.sceneCtx.composer.render();
    };

    private updatePlaying(dt: number) {
        const s = this.state;
        s.elapsedTime += dt;

        this.updatePlayer(dt);
        this.updateEnemies(dt);
        this.updateProjectiles(dt);
        this.updatePowerUps(dt);
        this.checkCollisions();
        this.spawnNewEnemies();
        updateShieldRecharge(s.player, dt);

        const diff = getDifficulty(s.elapsedTime);
        s.wave = diff.wave;
        s.difficulty = s.elapsedTime;

        s.activePowerUps = cleanupActivePowerUps(
            s.activePowerUps,
            s.elapsedTime,
        );
        s.scoreMultiplier = hasPowerUp(s.activePowerUps, "score-multiplier")
            ? 2
            : 1;

        this.emitState();
    }

    private updatePlayer(dt: number) {
        const p = this.state.player;
        const pointerX = this.input.pointerWorldX;
        if (pointerX !== null) {
            p.mesh.position.x = Math.max(
                -PLAYFIELD.halfWidth + 0.5,
                Math.min(PLAYFIELD.halfWidth - 0.5, pointerX),
            );
        } else {
            p.velocity.x = 0;
            if (this.input.left) p.velocity.x = -PLAYER.speed;
            if (this.input.right) p.velocity.x = PLAYER.speed;

            p.mesh.position.x += p.velocity.x * dt;
            p.mesh.position.x = Math.max(
                -PLAYFIELD.halfWidth + 0.5,
                Math.min(PLAYFIELD.halfWidth - 0.5, p.mesh.position.x),
            );
        }

        const fireRate = hasPowerUp(this.state.activePowerUps, "rapid-fire")
            ? PLAYER.rapidFireRate
            : PLAYER.fireRate;

        if (
            this.input.shoot &&
            this.state.elapsedTime - p.lastShotTime >= fireRate
        ) {
            p.lastShotTime = this.state.elapsedTime;
            const piercing = hasPowerUp(this.state.activePowerUps, "piercing");

            if (hasPowerUp(this.state.activePowerUps, "spread-shot")) {
                const projs = createSpreadProjectiles(
                    p.mesh.position.x,
                    p.mesh.position.z - 0.8,
                    PLAYER.projectileSpeed,
                    this.sceneCtx.scene,
                    piercing,
                );
                this.state.projectiles.push(...projs);
            } else {
                this.state.projectiles.push(
                    createPlayerProjectile(
                        p.mesh.position.x,
                        p.mesh.position.z - 0.8,
                        PLAYER.projectileSpeed,
                        this.sceneCtx.scene,
                        piercing,
                    ),
                );
            }
            this.sfx.laser();
        }
    }

    private updateEnemies(dt: number) {
        const enemies = this.state.enemies;
        updateMovement(enemies, dt);

        for (const enemy of enemies) {
            updateEnemyBehavior(
                enemy,
                this.state.player.mesh.position.x,
                dt,
                this.state.elapsedTime,
            );

            if (
                enemy.canShoot &&
                enemy.active &&
                enemy.mesh.position.z > -PLAYFIELD.halfDepth &&
                enemy.mesh.position.z < PLAYFIELD.halfDepth
            ) {
                const config = ENEMY[enemy.type];
                const rate =
                    "fireRate" in config
                        ? (config as { fireRate: number }).fireRate
                        : 99;
                if (this.state.elapsedTime - enemy.lastShotTime >= rate) {
                    enemy.lastShotTime = this.state.elapsedTime;
                    const dirX =
                        (this.state.player.mesh.position.x -
                            enemy.mesh.position.x) *
                        0.1;
                    this.state.projectiles.push(
                        createEnemyProjectile(
                            enemy.mesh.position.x,
                            enemy.mesh.position.z + 0.5,
                            ENEMY_PROJECTILE_SPEED,
                            this.sceneCtx.scene,
                            Math.max(-1, Math.min(1, dirX)),
                        ),
                    );
                }
            }

            if (isEnemyOffscreen(enemy)) {
                enemy.active = false;
                this.sceneCtx.scene.remove(enemy.mesh);
                if (enemy.type !== "rare") {
                    const dead = applyDamage(this.state.player, 20 * enemy.hp);
                    this.sfx.hit();
                    if (dead) {
                        this.gameOver();
                        return;
                    }
                }
            }
        }

        this.state.enemies = enemies.filter((e) => e.active);
    }

    private updateProjectiles(dt: number) {
        updateMovement(this.state.projectiles, dt);
        this.state.projectiles = cleanupProjectiles(
            this.state.projectiles,
            this.sceneCtx.scene,
        );
    }

    private updatePowerUps(dt: number) {
        updateMovement(this.state.powerUps, dt);
        updatePowerUpVisuals(this.state.powerUps, this.state.elapsedTime);
        this.state.powerUps = cleanupPowerUps(
            this.state.powerUps,
            this.sceneCtx.scene,
        );
    }

    private checkCollisions() {
        const s = this.state;
        const scene = this.sceneCtx.scene;

        const playerProjectiles = s.projectiles.filter(
            (p) => p.isPlayerProjectile,
        );
        const enemyProjectiles = s.projectiles.filter(
            (p) => !p.isPlayerProjectile,
        );

        const projEnemyHits = detectCollisionsWithRadii(
            playerProjectiles,
            () => COLLISION.projectileRadius,
            s.enemies,
            (e) => (e as EnemyState).collisionRadius,
        );

        const hitEnemies = new Set<number>();
        const hitProjectiles = new Set<ProjectileState>();

        for (const { a, b } of projEnemyHits) {
            const proj = playerProjectiles[a];
            const enemy = s.enemies[b];
            if (!proj.active || !enemy.active) continue;

            enemy.hp -= proj.damage;
            if (!proj.piercing) {
                proj.active = false;
                hitProjectiles.add(proj);
            }

            if (enemy.hp <= 0) {
                enemy.active = false;
                hitEnemies.add(b);
                s.score += enemy.scoreValue * s.scoreMultiplier;
                this.sfx.explosion();

                const color = new THREE.Color(
                    (enemy.mesh as THREE.Mesh).material
                        ? ((
                              (enemy.mesh as THREE.Mesh)
                                  .material as THREE.MeshStandardMaterial
                          ).emissive ?? new THREE.Color(0xff00ff))
                        : 0xff00ff,
                );
                this.particleSystem.emit(
                    enemy.mesh.position.x,
                    enemy.mesh.position.y,
                    enemy.mesh.position.z,
                    color,
                    15,
                );

                const { powerUp: pu, prdCount: newPrdCount } = createPowerUp(
                    enemy.mesh.position.x,
                    enemy.mesh.position.z,
                    scene,
                    s.powerUpPrdCount,
                );
                s.powerUpPrdCount = newPrdCount;
                if (pu) s.powerUps.push(pu);

                scene.remove(enemy.mesh);
            } else {
                this.sfx.hit();
            }
        }

        for (const proj of hitProjectiles) {
            scene.remove(proj.mesh);
        }

        const enemyProjPlayerHits = detectCollisions(
            enemyProjectiles,
            COLLISION.projectileRadius,
            [s.player],
            COLLISION.playerRadius,
        );

        for (const { a } of enemyProjPlayerHits) {
            const proj = enemyProjectiles[a];
            if (!proj.active) continue;
            proj.active = false;
            scene.remove(proj.mesh);

            const hadShield = s.player.shield > 0;
            const dead = applyDamage(s.player, proj.damage);

            if (hadShield && s.player.shield <= 0) {
                this.sfx.shieldBreak();
            } else {
                this.sfx.hit();
            }

            this.particleSystem.emit(
                s.player.mesh.position.x,
                s.player.mesh.position.y,
                s.player.mesh.position.z,
                new THREE.Color(0xff0000),
                8,
            );

            if (dead) {
                this.gameOver();
                return;
            }
        }

        const enemyPlayerHits = detectCollisionsWithRadii(
            s.enemies,
            (e) => (e as EnemyState).collisionRadius,
            [s.player],
            () => COLLISION.playerRadius,
        );

        for (const { a } of enemyPlayerHits) {
            const enemy = s.enemies[a];
            if (!enemy.active) continue;
            enemy.active = false;
            scene.remove(enemy.mesh);

            const dead = applyDamage(s.player, 30 * enemy.hp);
            this.sfx.hit();

            if (dead) {
                this.gameOver();
                return;
            }
        }

        s.enemies = s.enemies.filter((e) => e.active);

        const puHits = detectCollisions(
            s.powerUps,
            COLLISION.powerUpRadius,
            [s.player],
            COLLISION.playerRadius,
        );

        for (const { a } of puHits) {
            const pu = s.powerUps[a];
            if (!pu.active) continue;
            pu.active = false;
            scene.remove(pu.mesh);

            if (pu.type === "shield-recharge") {
                rechargeShieldFull(s.player);
            }
            s.activePowerUps = activatePowerUp(
                pu.type,
                s.activePowerUps,
                s.elapsedTime,
            );
            this.sfx.powerup();
        }

        s.powerUps = s.powerUps.filter((p) => p.active);
    }

    private spawnNewEnemies() {
        const diff = getDifficulty(this.state.elapsedTime);

        if (
            shouldSpawnRare(this.state.elapsedTime, this.spawnSystem.lastRare)
        ) {
            this.spawnSystem.lastRare = this.state.elapsedTime;
            const side = Math.random() < 0.5 ? -1 : 1;
            const rareEnemies = spawnEnemies(
                [
                    {
                        type: "rare" as const,
                        x: side * (PLAYFIELD.halfWidth + 1),
                        z: (Math.random() - 0.5) * 4,
                        count: 1,
                    },
                ],
                diff.speedMultiplier,
                this.sceneCtx.scene,
                this.state.elapsedTime,
            );
            this.state.enemies.push(...rareEnemies);
        }

        const requests = this.spawnSystem.update(this.state.elapsedTime, diff);
        const newEnemies = spawnEnemies(
            requests,
            diff.speedMultiplier,
            this.sceneCtx.scene,
            this.state.elapsedTime,
        );
        this.state.enemies.push(...newEnemies);
    }

    private gameOver() {
        this.state.phase = "game-over";
        this.music.stop();
        this.sfx.gameOver();
        this.emitState();
        this.callbacks.onGameOver(this.state.score, this.state.wave);
    }

    private clearEntities() {
        const scene = this.sceneCtx.scene;
        for (const e of this.state.enemies) scene.remove(e.mesh);
        for (const p of this.state.projectiles) scene.remove(p.mesh);
        for (const pu of this.state.powerUps) scene.remove(pu.mesh);
        this.state.enemies = [];
        this.state.projectiles = [];
        this.state.powerUps = [];
    }

    private emitState() {
        const s = this.state;
        const snapshot: GameStateSnapshot = {
            phase: s.phase,
            score: s.score,
            wave: s.wave,
            hp: s.player.hp,
            maxHp: s.player.maxHp,
            shield: s.player.shield,
            maxShield: s.player.maxShield,
            activePowerUps: [...s.activePowerUps],
            fps: this.fpsValue,
        };
        this.callbacks.onStateChange(snapshot);
    }
}
