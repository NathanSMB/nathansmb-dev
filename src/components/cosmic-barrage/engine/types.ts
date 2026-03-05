import type * as THREE from "three";

export type PowerUpType =
    | "rapid-fire"
    | "spread-shot"
    | "shield-recharge"
    | "score-multiplier"
    | "piercing";

export type EnemyType =
    | "basic"
    | "fast"
    | "shielded"
    | "bomber"
    | "rare"
    | "elite"
    | "swarm";

export interface Entity {
    mesh: THREE.Object3D;
    velocity: THREE.Vector3;
    active: boolean;
}

export interface PlayerState extends Entity {
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    shieldRechargeTimer: number;
    lastShotTime: number;
    fireRate: number;
}

export interface EnemyState extends Entity {
    type: EnemyType;
    hp: number;
    maxHp: number;
    scoreValue: number;
    lastShotTime: number;
    canShoot: boolean;
    spawnTime: number;
    collisionRadius: number;
}

export interface ProjectileState extends Entity {
    isPlayerProjectile: boolean;
    damage: number;
    piercing: boolean;
}

export interface PowerUpState extends Entity {
    type: PowerUpType;
}

export interface ActivePowerUp {
    type: PowerUpType;
    expiresAt: number;
}

export interface ParticleData {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    life: number;
    maxLife: number;
    color: THREE.Color;
}

export interface GameState {
    phase: "start" | "playing" | "game-over";
    score: number;
    scoreMultiplier: number;
    wave: number;
    elapsedTime: number;
    player: PlayerState;
    enemies: EnemyState[];
    projectiles: ProjectileState[];
    powerUps: PowerUpState[];
    activePowerUps: ActivePowerUp[];
    particles: ParticleData[];
    difficulty: number;
    powerUpPrdCount: number;
}

export interface GameCallbacks {
    onStateChange: (state: GameStateSnapshot) => void;
    onGameOver: (finalScore: number, wave: number) => void;
}

export interface GameStateSnapshot {
    phase: "start" | "playing" | "game-over";
    score: number;
    wave: number;
    hp: number;
    maxHp: number;
    shield: number;
    maxShield: number;
    activePowerUps: ActivePowerUp[];
}
