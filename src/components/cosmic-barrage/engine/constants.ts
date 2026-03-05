export const PLAYFIELD = {
    width: 20,
    depth: 24,
    halfWidth: 10,
    halfDepth: 12,
} as const;

export const PLAYER = {
    speed: 12,
    fireRate: 0.25,
    rapidFireRate: 0.1,
    projectileSpeed: 20,
    startX: 0,
    startZ: PLAYFIELD.halfDepth - 2,
    hp: 100,
    shield: 100,
    shieldRechargeRate: 5,
    shieldRechargeDelay: 3,
} as const;

export const ENEMY = {
    basic: { hp: 1, speed: 3, score: 100, canShoot: false },
    fast: { hp: 1, speed: 7.5, score: 150, canShoot: false },
    shielded: { hp: 3, speed: 2.1, score: 300, canShoot: false },
    bomber: { hp: 2, speed: 2.4, score: 250, canShoot: true, fireRate: 2 },
    rare: { hp: 1, speed: 4.5, score: 500, canShoot: false },
    elite: { hp: 5, speed: 1.8, score: 400, canShoot: true, fireRate: 1.5 },
    swarm: { hp: 1, speed: 3.6, score: 50, canShoot: false },
} as const;

export const ENEMY_PROJECTILE_SPEED = 10;
export const ENEMY_PROJECTILE_DAMAGE = 15;

export const POWERUP = {
    dropChance: 0.15,
    duration: 8,
    types: [
        "rapid-fire",
        "spread-shot",
        "shield-recharge",
        "score-multiplier",
        "piercing",
    ] as const,
    floatSpeed: 2,
} as const;

export const DIFFICULTY = {
    baseSpawnInterval: 1.5,
    minSpawnInterval: 0.3,
    speedScalePerMinute: 0.15,
    swarmUnlockTime: 60,
    eliteUnlockTime: 120,
    bomberUnlockTime: 120,
    rareInterval: 15,
    waveIncrementTime: 30,
} as const;

export const COLORS = {
    background: 0x0a0014,
    gridLines: 0x00ffff,
    player: 0x00ffff,
    enemyBasic: 0xff00ff,
    enemyFast: 0xffff00,
    enemyShielded: 0x00ff88,
    enemyBomber: 0xff4400,
    enemyRare: 0xffd700,
    enemyElite: 0xff0044,
    enemySwarm: 0xcc66ff,
    playerProjectile: 0x00ffff,
    enemyProjectile: 0xff0066,
    powerUpRapidFire: 0xff8800,
    powerUpSpreadShot: 0x00ff00,
    powerUpShieldRecharge: 0x0088ff,
    powerUpScoreMultiplier: 0xffdd00,
    powerUpPiercing: 0xff00ff,
} as const;

export const COLLISION = {
    playerRadius: 0.5,
    enemyRadius: 0.5,
    projectileRadius: 0.15,
    powerUpRadius: 0.4,
} as const;

export const BLOOM = {
    strength: 1.5,
    threshold: 0.2,
    radius: 0.8,
} as const;
