/* ===========================
   BRIDD JUMP - game.js
   Complete game with all effects and features
   =========================== */

/* ---------- Canvas & Context ---------- */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

/* ---------- Game Constants ---------- */
const BLOCK_SIZE = 50;
const JUMP_SPEED = -15;
const GRAVITY = 0.7;
const TICKS_PER_SECOND = 60;
const TICK_INTERVAL = 1000 / TICKS_PER_SECOND;
const DELETE_OFFSET = BLOCK_SIZE * 6;

/* ---------- Player Object ---------- */
let player = {
  x: 100, y: 0, width: 50, height: 50, vy: 0, speed: 11,
  color: "#0ff", hitboxScale: 0.6, jumpsLeft: 2, onGround:false, visible:true,
  horizMultiplier:1, vertMultiplier:1, accountEmail: "player@example.com"
};

/* ---------- Game State ---------- */
let keys = {}, score = 0, bestScore = 0;
let gameRunning = false, gameOver = false;
let cameraX = 0, cameraY = 0, lastPlayerX = 0, deathCameraStartTime = 0;

/* ---------- Tick System ---------- */
let tickAccumulator = 0;
let lastFpsUpdateTime = performance.now();
let lastFpsDisplayUpdate = performance.now();
let fps = 0;
let frameCount = 0;

/* ---------- Color Cycling ---------- */
let baseColors = [
  {r:255,g:0,b:0},{r:255,g:153,b:0},{r:255,g:255,b:0},
  {r:0,g:255,b:0},{r:0,g:255,b:255},{r:0,g:0,b:255},{r:153,g:0,b:255}
];
let colorIndex = 0, nextColor = baseColors[1], platformColor = {...baseColors[0]}, colorLerp = 0, globalTime = 0;

/* ---------- Miscellaneous ---------- */
let testMode = false, gemEveryBlock = false, account = "player", oldAccount = null;
let cheats = { float:false, invincible:false, infiniteJump:false };

// Load best score from localStorage
try {
  const savedBestScore = localStorage.getItem("bestScore");
  if(savedBestScore !== null) {
    const parsed = parseInt(savedBestScore);
    if(!isNaN(parsed) && parsed >= 0) {
      bestScore = parsed;
    }
  }
} catch(e) {
  console.warn("Failed to load best score from localStorage:", e);
}

/* ---------- World Arrays ---------- */
let platforms = [], spikes = [], gems = [], particles = [], crashPieces = [];
let trail = [], lines = [], cosmicDust = [], energySpheres = [], colorStreams = [];
let spirals = [], metallicParticles = [], digitalRain = [], mysticOrbs = [];
let crystalStructures = [], darkTendrils = [], shockwaves = [], screenDust = [];
let bloomParticles = [], reflections = [], motionBlurBuffer = [], lightRays = [];
let parallaxLayers = [], velocityStreaks = [], impactWaves = [], platformPulses = [];
let windParticles = [], speedLines = [], lensFlares = [], screenTears = [];
let dynamicFog = [], heatDistortions = [], starbursts = [], afterImages = [];
let gravityWaves = [], energyRipples = [], pixelDisplacements = [];

/* ---------- Screen Effects ---------- */
let screenShake = 0;
let screenFlash = 0;
let chromaticAberration = 0;
let timeScale = 1.0;

/* ---------- World Generation ---------- */
let lastPlatformX = 0, lastPlatformY = 0;

/* ---------- Settings ---------- */
const LS_KEY = "briddSettings";

const defaultSettings = {
  maxFPS: 0,
  qualityPreset: "Extreme+",
  quality: {
    jumpEffect: 100,
    walkEffect: 100,
    dieEffect: 100,
    horizontalLines: 100,
    trail: 100,
    glow: 100,
    blockTexture: 100
  },
  advanced: {
    shockwaves: 100,
    screenShake: 100,
    bloomParticles: 100,
    particleTrails: 100,
    screenDistortion: 100,
    particleCount: 100,
    trailLength: 100,
    screenReflections: 100,
    motionBlur: 100,
    lightRays: 100,
    parallaxLayers: 100,
    velocityStreaks: 100,
    impactWaves: 100,
    platformPulse: 100,
    colorBleed: 100,
    depthOfField: 100,
    windParticles: 100,
    speedLines: 100,
    timeDilation: 100,
    lensFlare: 100,
    screenTear: 100,
    dynamicFog: 100,
    heatDistortion: 100,
    starbursts: 100,
    afterImages: 100,
    gravityWaves: 100,
    energyRipples: 100,
    pixelDisplacement: 100,
    ambientOcclusion: 100,
    radialBlur: 100,
    cosmicDust: 100,
    energySphere: 100,
    geometricPattern: 100,
    colorLight: 100,
    spiralEnergy: 100,
    metallicParticle: 100,
    digitalCharacter: 100,
    mysticOrb: 100,
    crystalStructure: 100,
    darkEnergy: 100
  }
};

const qualityPresets = {
  "Potato": {
    quality: {
      blockTexture: false, jumpEffect: 0, walkEffect: 0, dieEffect: 0,
      horizontalLines: 0, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 0, screenShake: 0, bloomParticles: 0,
      particleTrails: 0, screenDistortion: 0,
      particleCount: 10, trailLength: 10, screenReflections: 0,
      motionBlur: 0, lightRays: 0, parallaxLayers: 0,
      velocityStreaks: 0, windParticles: 0, speedLines: 0,
      radialBlur: 0, platformPulse: 0, impactWaves: 0,
      colorBleed: 0, depthOfField: 0, timeDilation: 0,
      lensFlare: 0, screenTear: 0, dynamicFog: 0,
      heatDistortion: 0, starbursts: 0, afterImages: 0,
      gravityWaves: 0, energyRipples: 0, pixelDisplacement: 0,
      ambientOcclusion: 0
    }
  },
  "Low": {
    quality: {
      blockTexture: false, jumpEffect: 5, walkEffect: 0, dieEffect: 0,
      horizontalLines: 0, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 0, screenShake: 0, bloomParticles: 0,
      particleTrails: 0, screenDistortion: 0,
      particleCount: 25, trailLength: 25, screenReflections: 0,
      motionBlur: 0, lightRays: 0, parallaxLayers: 10,
      velocityStreaks: 0, windParticles: 10, speedLines: 10,
      radialBlur: 0, platformPulse: 0, impactWaves: 0,
      colorBleed: 0, depthOfField: 0, timeDilation: 0,
      lensFlare: 0, screenTear: 0, dynamicFog: 0,
      heatDistortion: 0, starbursts: 0, afterImages: 0,
      gravityWaves: 0, energyRipples: 0, pixelDisplacement: 0,
      ambientOcclusion: 0
    }
  },
  "Medium": {
    quality: {
      blockTexture: true, jumpEffect: 10, walkEffect: 0, dieEffect: 10,
      horizontalLines: 0, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 0, screenShake: 0, bloomParticles: 0,
      particleTrails: 0, screenDistortion: 0,
      particleCount: 50, trailLength: 50, screenReflections: 10,
      motionBlur: 0, lightRays: 0, parallaxLayers: 25,
      velocityStreaks: 10, windParticles: 25, speedLines: 25,
      radialBlur: 0, platformPulse: 10, impactWaves: 10,
      colorBleed: 0, depthOfField: 10, timeDilation: 0,
      lensFlare: 0, screenTear: 0, dynamicFog: 0,
      heatDistortion: 0, starbursts: 0, afterImages: 0,
      gravityWaves: 0, energyRipples: 0, pixelDisplacement: 0,
      ambientOcclusion: 0
    }
  },
  "Medium+": {
    quality: {
      blockTexture: true, jumpEffect: 15, walkEffect: 15, dieEffect: 15,
      horizontalLines: 0, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 0, screenShake: 0, bloomParticles: 0,
      particleTrails: 0, screenDistortion: 0,
      particleCount: 75, trailLength: 75, screenReflections: 25,
      motionBlur: 10, lightRays: 10, parallaxLayers: 50,
      velocityStreaks: 25, windParticles: 50, speedLines: 50,
      radialBlur: 10, platformPulse: 25, impactWaves: 25,
      colorBleed: 10, depthOfField: 25, timeDilation: 10,
      lensFlare: 10, screenTear: 0, dynamicFog: 10,
      heatDistortion: 10, starbursts: 10, afterImages: 10,
      gravityWaves: 0, energyRipples: 0, pixelDisplacement: 0,
      ambientOcclusion: 10
    }
  },
  "High": {
    quality: {
      blockTexture: true, jumpEffect: 15, walkEffect: 15, dieEffect: 15,
      horizontalLines: 15, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 10, screenShake: 10, bloomParticles: 0,
      particleTrails: 0, screenDistortion: 0,
      particleCount: 100, trailLength: 100, screenReflections: 50,
      motionBlur: 25, lightRays: 25, parallaxLayers: 75,
      velocityStreaks: 50, windParticles: 75, speedLines: 75,
      radialBlur: 25, platformPulse: 50, impactWaves: 50,
      colorBleed: 25, depthOfField: 50, timeDilation: 25,
      lensFlare: 25, screenTear: 10, dynamicFog: 25,
      heatDistortion: 25, starbursts: 25, afterImages: 25,
      gravityWaves: 10, energyRipples: 10, pixelDisplacement: 10,
      ambientOcclusion: 25
    }
  },
  "High+": {
    quality: {
      blockTexture: true, jumpEffect: 33, walkEffect: 33, dieEffect: 33,
      horizontalLines: 33, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 25, screenShake: 25, bloomParticles: 10,
      particleTrails: 10, screenDistortion: 0,
      particleCount: 125, trailLength: 125, screenReflections: 75,
      motionBlur: 50, lightRays: 50, parallaxLayers: 100,
      velocityStreaks: 75, windParticles: 100, speedLines: 100,
      radialBlur: 50, platformPulse: 75, impactWaves: 75,
      colorBleed: 50, depthOfField: 75, timeDilation: 50,
      lensFlare: 50, screenTear: 25, dynamicFog: 50,
      heatDistortion: 50, starbursts: 50, afterImages: 50,
      gravityWaves: 25, energyRipples: 25, pixelDisplacement: 25,
      ambientOcclusion: 50
    }
  },
  "Extreme": {
    quality: {
      blockTexture: true, jumpEffect: 60, walkEffect: 60, dieEffect: 60,
      horizontalLines: 60, trail: 0, glow: 0
    },
    advanced: {
      shockwaves: 50, screenShake: 50, bloomParticles: 25,
      particleTrails: 25, screenDistortion: 10,
      particleCount: 150, trailLength: 150, screenReflections: 100,
      motionBlur: 75, lightRays: 75, parallaxLayers: 125,
      velocityStreaks: 100, windParticles: 125, speedLines: 125,
      radialBlur: 75, platformPulse: 100, impactWaves: 100,
      colorBleed: 75, depthOfField: 100, timeDilation: 75,
      lensFlare: 75, screenTear: 50, dynamicFog: 75,
      heatDistortion: 75, starbursts: 75, afterImages: 75,
      gravityWaves: 50, energyRipples: 50, pixelDisplacement: 50,
      ambientOcclusion: 75
    }
  },
  "Extreme+": {
    quality: {
      blockTexture: true, jumpEffect: 64, walkEffect: 64, dieEffect: 64,
      horizontalLines: 64, trail: 100, glow: 100
    },
    advanced: {
      shockwaves: 75, screenShake: 75, bloomParticles: 50,
      particleTrails: 50, screenDistortion: 25,
      particleCount: 175, trailLength: 175, screenReflections: 125,
      motionBlur: 100, lightRays: 100, parallaxLayers: 150,
      velocityStreaks: 125, windParticles: 150, speedLines: 150,
      radialBlur: 100, platformPulse: 125, impactWaves: 125,
      colorBleed: 100, depthOfField: 125, timeDilation: 100,
      lensFlare: 100, screenTear: 75, dynamicFog: 100,
      heatDistortion: 100, starbursts: 100, afterImages: 100,
      gravityWaves: 75, energyRipples: 75, pixelDisplacement: 75,
      ambientOcclusion: 100
    }
  },
  "Ultra": {
    quality: {
      blockTexture: true, jumpEffect: 100, walkEffect: 100, dieEffect: 100,
      horizontalLines: 100, trail: 0, glow: 100
    },
    advanced: {
      shockwaves: 100, screenShake: 100, bloomParticles: 75,
      particleTrails: 75, screenDistortion: 50,
      particleCount: 200, trailLength: 200, screenReflections: 150,
      motionBlur: 125, lightRays: 125, parallaxLayers: 175,
      velocityStreaks: 150, windParticles: 175, speedLines: 175,
      radialBlur: 125, platformPulse: 150, impactWaves: 150,
      colorBleed: 125, depthOfField: 150, timeDilation: 125,
      lensFlare: 125, screenTear: 100, dynamicFog: 125,
      heatDistortion: 125, starbursts: 125, afterImages: 125,
      gravityWaves: 100, energyRipples: 100, pixelDisplacement: 100,
      ambientOcclusion: 125
    }
  },
  "Ultra+": {
    quality: {
      blockTexture: true, jumpEffect: 120, walkEffect: 120, dieEffect: 120,
      horizontalLines: 120, trail: 100, glow: 100
    },
    advanced: {
      shockwaves: 120, screenShake: 120, bloomParticles: 100,
      particleTrails: 100, screenDistortion: 75,
      particleCount: 250, trailLength: 250, screenReflections: 175,
      motionBlur: 150, lightRays: 150, parallaxLayers: 200,
      velocityStreaks: 175, windParticles: 200, speedLines: 200,
      radialBlur: 150, platformPulse: 175, impactWaves: 175,
      colorBleed: 150, depthOfField: 175, timeDilation: 150,
      lensFlare: 150, screenTear: 125, dynamicFog: 150,
      heatDistortion: 150, starbursts: 150, afterImages: 150,
      gravityWaves: 125, energyRipples: 125, pixelDisplacement: 125,
      ambientOcclusion: 150
    }
  },
  "Ultra++": {
    quality: {
      blockTexture: true, jumpEffect: 200, walkEffect: 200, dieEffect: 200,
      horizontalLines: 200, trail: 100, glow: 150
    },
    advanced: {
      shockwaves: 150, screenShake: 150, bloomParticles: 150,
      particleTrails: 150, screenDistortion: 100,
      particleCount: 300, trailLength: 300, screenReflections: 200,
      motionBlur: 175, lightRays: 175, parallaxLayers: 225,
      velocityStreaks: 200, windParticles: 225, speedLines: 225,
      radialBlur: 175, platformPulse: 200, impactWaves: 200,
      colorBleed: 175, depthOfField: 200, timeDilation: 175,
      lensFlare: 175, screenTear: 150, dynamicFog: 175,
      heatDistortion: 175, starbursts: 175, afterImages: 175,
      gravityWaves: 150, energyRipples: 150, pixelDisplacement: 150,
      ambientOcclusion: 175
    }
  },
  "Highest": {
    quality: {
      blockTexture: true, jumpEffect: 200, walkEffect: 200, dieEffect: 200,
      horizontalLines: 200, trail: 100, glow: 200
    },
    advanced: {
      shockwaves: 200, screenShake: 200, bloomParticles: 200,
      particleTrails: 200, screenDistortion: 200,
      particleCount: 500, trailLength: 500, screenReflections: 200,
      motionBlur: 200, lightRays: 200, parallaxLayers: 250,
      velocityStreaks: 250, windParticles: 250, speedLines: 250,
      radialBlur: 200, platformPulse: 250, impactWaves: 250,
      colorBleed: 200, depthOfField: 250, timeDilation: 200,
      lensFlare: 200, screenTear: 200, dynamicFog: 200,
      heatDistortion: 200, starbursts: 200, afterImages: 200,
      gravityWaves: 200, energyRipples: 200, pixelDisplacement: 200,
      ambientOcclusion: 200,
      cosmicDust: 200, energySphere: 200, geometricPattern: 200,
      colorLight: 200, spiralEnergy: 200, metallicParticle: 200,
      digitalCharacter: 200, mysticOrb: 200, crystalStructure: 200,
      darkEnergy: 200
    }
  }
};

/* ---------- Runtime Settings ---------- */
let runtime = {
  minFrameTime: 0,
  effects: {
    jumpEffectMul: 1,
    walkEffectMul: 1,
    dieEffectMul: 1,
    horizontalLinesMul: 1,
    trailMul: 1,
    blockTextureMul: 1
  },
  advanced: {
    shockwavesMul: 1,
    screenShakeMul: 1,
    bloomParticlesMul: 1,
    particleTrailsMul: 1,
    screenDistortionMul: 1,
    particleCountMul: 1,
    trailLengthMul: 1,
    screenReflectionsMul: 1,
    motionBlurMul: 1,
    lightRaysMul: 1,
    parallaxLayersMul: 1,
    velocityStreaksMul: 1,
    impactWavesMul: 1,
    platformPulseMul: 1,
    colorBleedMul: 1,
    depthOfFieldMul: 1,
    windParticlesMul: 1,
    speedLinesMul: 1,
    timeDilationMul: 1,
    lensFlareMul: 1,
    screenTearMul: 1,
    dynamicFogMul: 1,
    heatDistortionMul: 1,
    starburstsMul: 1,
    afterImagesMul: 1,
    gravityWavesMul: 1,
    energyRipplesMul: 1,
    pixelDisplacementMul: 1,
    ambientOcclusionMul: 1,
    radialBlurMul: 1,
    cosmicDustMul: 1,
    energySphereMul: 1,
    geometricPatternMul: 1,
    colorLightMul: 1,
    spiralEnergyMul: 1,
    metallicParticleMul: 1,
    digitalCharacterMul: 1,
    mysticOrbMul: 1,
    crystalStructureMul: 1,
    darkEnergyMul: 1
  },
  glowEnabled: true,
  linesEnabled: true,
  trailEnabled: true,
  shockwavesEnabled: true,
  screenShakeEnabled: true,
  bloomEnabled: true,
  particleTrailsEnabled: true,
  distortionEnabled: true,
  reflectionsEnabled: true,
  motionBlurEnabled: true,
  lightRaysEnabled: true,
  parallaxEnabled: true,
  velocityStreaksEnabled: true,
  impactWavesEnabled: true,
  platformPulseEnabled: true,
  colorBleedEnabled: true,
  depthOfFieldEnabled: true,
  windParticlesEnabled: true,
  speedLinesEnabled: true,
  timeDilationEnabled: true,
  lensFlareEnabled: true,
  screenTearEnabled: true,
  dynamicFogEnabled: true,
  heatDistortionEnabled: true,
  starburstsEnabled: true,
  afterImagesEnabled: true,
  gravityWavesEnabled: true,
  energyRipplesEnabled: true,
  pixelDisplacementEnabled: true,
  ambientOcclusionEnabled: true,
  radialBlurEnabled: true,
  cosmicDustEnabled: true,
  energySphereEnabled: true,
  geometricPatternEnabled: true,
  colorLightEnabled: true,
  spiralEnergyEnabled: true,
  metallicParticleEnabled: true,
  digitalCharacterEnabled: true,
  mysticOrbEnabled: true,
  crystalStructureEnabled: true,
  darkEnergyEnabled: true
};

let settings = readSettings();

/* ---------- Settings Functions ---------- */
function readSettings(){
  try {
    let raw = localStorage.getItem(LS_KEY);
    if(!raw) return JSON.parse(JSON.stringify(defaultSettings));
    const parsed = JSON.parse(raw);
    const merged = JSON.parse(JSON.stringify(defaultSettings));
    if(parsed.maxFPS !== undefined) merged.maxFPS = parsed.maxFPS;
    if(parsed.qualityPreset) merged.qualityPreset = parsed.qualityPreset;
    if(parsed.quality) merged.quality = {...merged.quality, ...parsed.quality};
    if(parsed.advanced) merged.advanced = {...merged.advanced, ...parsed.advanced};
    return merged;
  } catch(e) {
    console.warn("Failed to read settings:", e);
    return JSON.parse(JSON.stringify(defaultSettings));
  }
}

function writeSettings(s){
  try{ localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch(e){ console.warn("Failed to write settings:", e); }
}

function applySettings(s){
  settings = s || settings;
  // FPS
  if(!settings.maxFPS || settings.maxFPS === 0 || settings.maxFPS === "Unlimited"){
    runtime.minFrameTime = 0;
    settings.maxFPS = 0;
  } else {
    runtime.minFrameTime = 1000 / Number(settings.maxFPS);
  }

  const preset = qualityPresets[settings.qualityPreset] || {};
  const pct = (v) => (Number(v) || 0) / 100;

  // Basic effects
  runtime.effects.blockTextureMul = pct(settings.quality.blockTexture) || (preset.quality?.blockTexture ? 1 : 0);
  runtime.effects.jumpEffectMul = pct(settings.quality.jumpEffect) || (preset.quality?.jumpEffect ? preset.quality.jumpEffect/100 : 0);
  runtime.effects.walkEffectMul = pct(settings.quality.walkEffect) || (preset.quality?.walkEffect ? preset.quality.walkEffect/100 : 0);
  runtime.effects.dieEffectMul = pct(settings.quality.dieEffect) || (preset.quality?.dieEffect ? preset.quality.dieEffect/100 : 0);
  runtime.effects.horizontalLinesMul = pct(settings.quality.horizontalLines) || (preset.quality?.horizontalLines ? preset.quality.horizontalLines/100 : 0);
  runtime.effects.trailMul = pct(settings.quality.trail) || (preset.quality?.trail ? preset.quality.trail/100 : 0);

  // Advanced effects
  runtime.advanced.shockwavesMul = pct(settings.advanced.shockwaves) || (preset.advanced?.shockwaves ? preset.advanced.shockwaves/100 : 0);
  runtime.advanced.screenShakeMul = pct(settings.advanced.screenShake) || (preset.advanced?.screenShake ? preset.advanced.screenShake/100 : 0);
  runtime.advanced.bloomParticlesMul = pct(settings.advanced.bloomParticles) || (preset.advanced?.bloomParticles ? preset.advanced.bloomParticles/100 : 0);
  runtime.advanced.particleTrailsMul = pct(settings.advanced.particleTrails) || (preset.advanced?.particleTrails ? preset.advanced.particleTrails/100 : 0);
  runtime.advanced.screenDistortionMul = pct(settings.advanced.screenDistortion) || (preset.advanced?.screenDistortion ? preset.advanced.screenDistortion/100 : 0);
  runtime.advanced.particleCountMul = pct(settings.advanced.particleCount) || (preset.advanced?.particleCount ? preset.advanced.particleCount/100 : 0);
  runtime.advanced.trailLengthMul = pct(settings.advanced.trailLength) || (preset.advanced?.trailLength ? preset.advanced.trailLength/100 : 0);
  runtime.advanced.screenReflectionsMul = pct(settings.advanced.screenReflections) || (preset.advanced?.screenReflections ? preset.advanced.screenReflections/100 : 0);
  runtime.advanced.motionBlurMul = pct(settings.advanced.motionBlur) || (preset.advanced?.motionBlur ? preset.advanced.motionBlur/100 : 0);
  runtime.advanced.lightRaysMul = pct(settings.advanced.lightRays) || (preset.advanced?.lightRays ? preset.advanced.lightRays/100 : 0);
  runtime.advanced.parallaxLayersMul = pct(settings.advanced.parallaxLayers) || (preset.advanced?.parallaxLayers ? preset.advanced.parallaxLayers/100 : 0);
  runtime.advanced.velocityStreaksMul = pct(settings.advanced.velocityStreaks) || (preset.advanced?.velocityStreaks ? preset.advanced.velocityStreaks/100 : 0);
  runtime.advanced.impactWavesMul = pct(settings.advanced.impactWaves) || (preset.advanced?.impactWaves ? preset.advanced.impactWaves/100 : 0);
  runtime.advanced.platformPulseMul = pct(settings.advanced.platformPulse) || (preset.advanced?.platformPulse ? preset.advanced.platformPulse/100 : 0);
  runtime.advanced.colorBleedMul = pct(settings.advanced.colorBleed) || (preset.advanced?.colorBleed ? preset.advanced.colorBleed/100 : 0);
  runtime.advanced.depthOfFieldMul = pct(settings.advanced.depthOfField) || (preset.advanced?.depthOfField ? preset.advanced.depthOfField/100 : 0);
  runtime.advanced.windParticlesMul = pct(settings.advanced.windParticles) || (preset.advanced?.windParticles ? preset.advanced.windParticles/100 : 0);
  runtime.advanced.speedLinesMul = pct(settings.advanced.speedLines) || (preset.advanced?.speedLines ? preset.advanced.speedLines/100 : 0);
  runtime.advanced.timeDilationMul = pct(settings.advanced.timeDilation) || (preset.advanced?.timeDilation ? preset.advanced.timeDilation/100 : 0);
  runtime.advanced.lensFlareMul = pct(settings.advanced.lensFlare) || (preset.advanced?.lensFlare ? preset.advanced.lensFlare/100 : 0);
  runtime.advanced.screenTearMul = pct(settings.advanced.screenTear) || (preset.advanced?.screenTear ? preset.advanced.screenTear/100 : 0);
  runtime.advanced.dynamicFogMul = pct(settings.advanced.dynamicFog) || (preset.advanced?.dynamicFog ? preset.advanced.dynamicFog/100 : 0);
  runtime.advanced.heatDistortionMul = pct(settings.advanced.heatDistortion) || (preset.advanced?.heatDistortion ? preset.advanced.heatDistortion/100 : 0);
  runtime.advanced.starburstsMul = pct(settings.advanced.starbursts) || (preset.advanced?.starbursts ? preset.advanced.starbursts/100 : 0);
  runtime.advanced.afterImagesMul = pct(settings.advanced.afterImages) || (preset.advanced?.afterImages ? preset.advanced.afterImages/100 : 0);
  runtime.advanced.gravityWavesMul = pct(settings.advanced.gravityWaves) || (preset.advanced?.gravityWaves ? preset.advanced.gravityWaves/100 : 0);
  runtime.advanced.energyRipplesMul = pct(settings.advanced.energyRipples) || (preset.advanced?.energyRipples ? preset.advanced.energyRipples/100 : 0);
  runtime.advanced.pixelDisplacementMul = pct(settings.advanced.pixelDisplacement) || (preset.advanced?.pixelDisplacement ? preset.advanced.pixelDisplacement/100 : 0);
  runtime.advanced.ambientOcclusionMul = pct(settings.advanced.ambientOcclusion) || (preset.advanced?.ambientOcclusion ? preset.advanced.ambientOcclusion/100 : 0);
  runtime.advanced.radialBlurMul = pct(settings.advanced.radialBlur) || (preset.advanced?.radialBlur ? preset.advanced.radialBlur/100 : 0);
  runtime.advanced.cosmicDustMul = pct(settings.advanced.cosmicDust) || (preset.advanced?.cosmicDust ? preset.advanced.cosmicDust/100 : 0);
  runtime.advanced.energySphereMul = pct(settings.advanced.energySphere) || (preset.advanced?.energySphere ? preset.advanced.energySphere/100 : 0);
  runtime.advanced.geometricPatternMul = pct(settings.advanced.geometricPattern) || (preset.advanced?.geometricPattern ? preset.advanced.geometricPattern/100 : 0);
  runtime.advanced.colorLightMul = pct(settings.advanced.colorLight) || (preset.advanced?.colorLight ? preset.advanced.colorLight/100 : 0);
  runtime.advanced.spiralEnergyMul = pct(settings.advanced.spiralEnergy) || (preset.advanced?.spiralEnergy ? preset.advanced.spiralEnergy/100 : 0);
  runtime.advanced.metallicParticleMul = pct(settings.advanced.metallicParticle) || (preset.advanced?.metallicParticle ? preset.advanced.metallicParticle/100 : 0);
  runtime.advanced.digitalCharacterMul = pct(settings.advanced.digitalCharacter) || (preset.advanced?.digitalCharacter ? preset.advanced.digitalCharacter/100 : 0);
  runtime.advanced.mysticOrbMul = pct(settings.advanced.mysticOrb) || (preset.advanced?.mysticOrb ? preset.advanced.mysticOrb/100 : 0);
  runtime.advanced.crystalStructureMul = pct(settings.advanced.crystalStructure) || (preset.advanced?.crystalStructure ? preset.advanced.crystalStructure/100 : 0);
  runtime.advanced.darkEnergyMul = pct(settings.advanced.darkEnergy) || (preset.advanced?.darkEnergy ? preset.advanced.darkEnergy/100 : 0);

  // Enable/disable based on settings
  runtime.glowEnabled = (settings.quality && settings.quality.glow !== undefined) ? (settings.quality.glow > 0) : (preset.quality?.glow !== undefined ? preset.quality.glow > 0 : true);
  runtime.linesEnabled = preset.quality?.lines !== undefined ? preset.quality.lines : true;
  runtime.trailEnabled = (settings.quality && settings.quality.trail !== undefined) ? settings.quality.trail > 0 : preset.quality?.trail > 0;

  // Advanced effects enabled
  runtime.shockwavesEnabled = runtime.advanced.shockwavesMul > 0;
  runtime.screenShakeEnabled = runtime.advanced.screenShakeMul > 0;
  runtime.bloomEnabled = runtime.advanced.bloomParticlesMul > 0;
  runtime.particleTrailsEnabled = runtime.advanced.particleTrailsMul > 0;
  runtime.distortionEnabled = runtime.advanced.screenDistortionMul > 0;
  runtime.reflectionsEnabled = runtime.advanced.screenReflectionsMul > 0;
  runtime.motionBlurEnabled = runtime.advanced.motionBlurMul > 0;
  runtime.lightRaysEnabled = runtime.advanced.lightRaysMul > 0;
  runtime.parallaxEnabled = runtime.advanced.parallaxLayersMul > 0;
  runtime.velocityStreaksEnabled = runtime.advanced.velocityStreaksMul > 0;
  runtime.impactWavesEnabled = runtime.advanced.impactWavesMul > 0;
  runtime.platformPulseEnabled = runtime.advanced.platformPulseMul > 0;
  runtime.colorBleedEnabled = runtime.advanced.colorBleedMul > 0;
  runtime.depthOfFieldEnabled = runtime.advanced.depthOfFieldMul > 0;
  runtime.windParticlesEnabled = runtime.advanced.windParticlesMul > 0;
  runtime.speedLinesEnabled = runtime.advanced.speedLinesMul > 0;
  runtime.timeDilationEnabled = runtime.advanced.timeDilationMul > 0;
  runtime.lensFlareEnabled = runtime.advanced.lensFlareMul > 0;
  runtime.screenTearEnabled = runtime.advanced.screenTearMul > 0;
  runtime.dynamicFogEnabled = runtime.advanced.dynamicFogMul > 0;
  runtime.heatDistortionEnabled = runtime.advanced.heatDistortionMul > 0;
  runtime.starburstsEnabled = runtime.advanced.starburstsMul > 0;
  runtime.afterImagesEnabled = runtime.advanced.afterImagesMul > 0;
  runtime.gravityWavesEnabled = runtime.advanced.gravityWavesMul > 0;
  runtime.energyRipplesEnabled = runtime.advanced.energyRipplesMul > 0;
  runtime.pixelDisplacementEnabled = runtime.advanced.pixelDisplacementMul > 0;
  runtime.ambientOcclusionEnabled = runtime.advanced.ambientOcclusionMul > 0;
  runtime.radialBlurEnabled = runtime.advanced.radialBlurMul > 0;
  runtime.cosmicDustEnabled = runtime.advanced.cosmicDustMul > 0;
  runtime.energySphereEnabled = runtime.advanced.energySphereMul > 0;
  runtime.geometricPatternEnabled = runtime.advanced.geometricPatternMul > 0;
  runtime.colorLightEnabled = runtime.advanced.colorLightMul > 0;
  runtime.spiralEnergyEnabled = runtime.advanced.spiralEnergyMul > 0;
  runtime.metallicParticleEnabled = runtime.advanced.metallicParticleMul > 0;
  runtime.digitalCharacterEnabled = runtime.advanced.digitalCharacterMul > 0;
  runtime.mysticOrbEnabled = runtime.advanced.mysticOrbMul > 0;
  runtime.crystalStructureEnabled = runtime.advanced.crystalStructureMul > 0;
  runtime.darkEnergyEnabled = runtime.advanced.darkEnergyMul > 0;

  // save canonical
  writeSettings(settings);
}

// initial apply
applySettings(settings);

/* ---------- Utilities ---------- */
function showToast(msg, ms=1200){
  const d = document.getElementById('debugToast');
  d.innerText = msg;
  d.style.display = 'block';
  clearTimeout(d._timer);
  d._timer = setTimeout(()=> d.style.display = 'none', ms);
}

function lerpColor(c1,c2,t){
  return {
    r: c1.r + (c2.r - c1.r)*t,
    g: c1.g + (c2.g - c1.g)*t,
    b: c1.b + (c2.b - c1.b)*t
  };
}

/* ---------- Canvas & resizing ---------- */
function resize(){
  const width = window.innerWidth || 800; // Default fallback
  const height = window.innerHeight || 600; // Default fallback
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

/* ---------- Lines background ---------- */
function addLine(){
  if(!runtime.linesEnabled) return;
  const chance = Math.min(1, 0.3 * runtime.effects.horizontalLinesMul); // Increased from 0.15 to 0.3
  if(Math.random() > chance) return;

  // Generate lines at fixed distance from player's current position
  // 20 blocks to the right of the player
  const playerRightEdge = player.x + player.width;
  const lineStartX = playerRightEdge + (BLOCK_SIZE * 20) + Math.random() * BLOCK_SIZE * 4;

  lines.push({
    x: lineStartX,
    y: Math.random() * canvas.height,
    width: Math.random() * 150 + 50, // Wider lines
    speed: player.speed * 2.5, // Faster movement
    passed: false
  });
}

/* ---------- FORWARD MOTION EFFECTS (5 effects that give sense of speed) ---------- */

/* 1. PARALLAX LAYERS - Creates depth and forward motion */
function initializeParallaxLayers(){
  if(!runtime.parallaxEnabled) return;

  for(let i = 0; i < Math.floor(5 * runtime.advanced.parallaxLayersMul); i++){
    parallaxLayers.push({
      y: Math.random() * canvas.height,
      width: Math.random() * 300 + 100,
      height: Math.random() * 3 + 1,
      speed: (Math.random() * 0.5 + 0.1) * player.speed * (i + 1) * 0.2,
      x: Math.random() * canvas.width * 2,
      color: `rgba(100, 100, 255, ${Math.random() * 0.1 + 0.05})`,
      depth: i + 1
    });
  }
}

function updateParallaxLayers(){
  if(!runtime.parallaxEnabled) return;

  for(let layer of parallaxLayers){
    layer.x -= layer.speed;
    if(layer.x + layer.width < 0){
      layer.x = canvas.width + Math.random() * canvas.width;
      layer.y = Math.random() * canvas.height;
    }
  }
}

function drawParallaxLayers(){
  if(!runtime.parallaxEnabled || parallaxLayers.length === 0) return;

  ctx.save();
  for(let layer of parallaxLayers){
    ctx.fillStyle = layer.color;
    ctx.fillRect(layer.x - cameraX, layer.y - cameraY, layer.width, layer.height);
  }
  ctx.restore();
}

/* 2. VELOCITY STREAKS - Speed lines that follow player movement */
function createVelocityStreaks(){
  if(!runtime.velocityStreaksEnabled || Math.random() > 0.3 * runtime.advanced.velocityStreaksMul) return;

  velocityStreaks.push({
    x: player.x + player.width/2,
    y: player.y + player.height/2,
    length: Math.random() * 100 + 50 * runtime.advanced.velocityStreaksMul,
    angle: Math.atan2(player.vy, player.speed) + (Math.random() - 0.5) * 0.5,
    width: Math.random() * 3 + 1,
    life: 30,
    alpha: Math.random() * 0.3 + 0.1,
    color: `rgba(0, 255, 255, 0.5)`
  });
}

function updateVelocityStreaks(){
  if(!runtime.velocityStreaksEnabled) return;

  for(let i = velocityStreaks.length - 1; i >= 0; i--){
    const streak = velocityStreaks[i];
    streak.life--;
    streak.alpha *= 0.95;

    if(streak.life <= 0 || streak.alpha <= 0.01){
      velocityStreaks.splice(i, 1);
    }
  }
}

function drawVelocityStreaks(){
  if(!runtime.velocityStreaksEnabled || velocityStreaks.length === 0) return;

  ctx.save();
  for(let streak of velocityStreaks){
    const endX = streak.x - cameraX + Math.cos(streak.angle) * streak.length;
    const endY = streak.y - cameraY + Math.sin(streak.angle) * streak.length;

    ctx.globalAlpha = streak.alpha;
    ctx.strokeStyle = streak.color;
    ctx.lineWidth = streak.width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(streak.x - cameraX, streak.y - cameraY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.restore();
}

/* 3. SPEED LINES - Radial lines emanating from player */
function createSpeedLines(){
  if(!runtime.speedLinesEnabled || Math.random() > 0.4 * runtime.advanced.speedLinesMul) return;

  for(let i = 0; i < Math.floor(6 * runtime.advanced.speedLinesMul); i++){
    speedLines.push({
      x: player.x + player.width/2,
      y: player.y + player.height/2,
      angle: Math.random() * Math.PI * 2,
      length: Math.random() * 80 + 40 * runtime.advanced.speedLinesMul,
      speed: Math.random() * 10 + 5,
      life: 20,
      alpha: 0.4,
      color: '#ffffff'
    });
  }
}

function updateSpeedLines(){
  if(!runtime.speedLinesEnabled) return;

  for(let i = speedLines.length - 1; i >= 0; i--){
    const line = speedLines[i];
    line.x += Math.cos(line.angle) * line.speed;
    line.y += Math.sin(line.angle) * line.speed;
    line.life--;
    line.alpha *= 0.9;

    if(line.life <= 0 || line.alpha <= 0.01){
      speedLines.splice(i, 1);
    }
  }
}

function drawSpeedLines(){
  if(!runtime.speedLinesEnabled || speedLines.length === 0) return;

  ctx.save();
  for(let line of speedLines){
    const endX = line.x - cameraX + Math.cos(line.angle) * line.length;
    const endY = line.y - cameraY + Math.sin(line.angle) * line.length;

    ctx.globalAlpha = line.alpha;
    ctx.strokeStyle = line.color;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(line.x - cameraX, line.y - cameraY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }
  ctx.restore();
}

/* 4. WIND PARTICLES - Particles blowing past player */
function createWindParticles(){
  if(!runtime.windParticlesEnabled || Math.random() > 0.5 * runtime.advanced.windParticlesMul) return;

  for(let i = 0; i < Math.floor(10 * runtime.advanced.windParticlesMul); i++){
    windParticles.push({
      x: player.x + canvas.width + Math.random() * 100,
      y: Math.random() * canvas.height,
      vx: -(Math.random() * 15 + 10) * player.speed * 0.1,
      vy: (Math.random() - 0.5) * 4,
      size: Math.random() * 4 + 1,
      life: Math.random() * 100 + 50,
      color: `rgba(200, 220, 255, ${Math.random() * 0.3 + 0.1})`
    });
  }
}

function updateWindParticles(){
  if(!runtime.windParticlesEnabled) return;

  for(let i = windParticles.length - 1; i >= 0; i--){
    const particle = windParticles[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.life--;

    if(particle.life <= 0 || particle.x < player.x - 100){
      windParticles.splice(i, 1);
    }
  }
}

function drawWindParticles(){
  if(!runtime.windParticlesEnabled || windParticles.length === 0) return;

  ctx.save();
  for(let particle of windParticles){
    ctx.globalAlpha = particle.life / 150;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x - cameraX, particle.y - cameraY, particle.size, particle.size);
  }
  ctx.restore();
}

/* 5. RADIAL BLUR - Motion blur effect centered on player */
function applyRadialBlur(){
  if(!runtime.radialBlurEnabled || runtime.advanced.radialBlurMul < 0.1) return;

  // Simulate radial blur by drawing multiple offset copies
  ctx.save();
  const blurIntensity = runtime.advanced.radialBlurMul * 0.1;

  for(let i = 0; i < 3; i++){
    const offset = (i + 1) * blurIntensity * 2;
    const alpha = (i + 1) / 12 * blurIntensity;

    ctx.globalAlpha = alpha;
    ctx.translate(offset, 0);

    // Re-draw player and nearby effects with offset
    if(player.visible){
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
    }
  }
  ctx.restore();
}

/* ---------- VISUAL ENHANCEMENT EFFECTS ---------- */

/* 6. PLATFORM PULSE - Platforms pulse with color */
function updatePlatformPulse(){
  if(!runtime.platformPulseEnabled) return;

  for(let plat of platforms){
    plat.pulsePhase += 0.1 * runtime.advanced.platformPulseMul;
  }
}

function drawPlatformPulse(){
  if(!runtime.platformPulseEnabled) return;

  ctx.save();
  for(let plat of platforms){
    const pulse = Math.sin(plat.pulsePhase) * 0.2 + 0.8;
    const r = Math.floor(plat.color.r * pulse);
    const g = Math.floor(plat.color.g * pulse);
    const b = Math.floor(plat.color.b * pulse);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(plat.x - cameraX, plat.y - cameraY, plat.width, plat.height);
  }
  ctx.restore();
}

/* 7. IMPACT WAVES - Ripple effects on collisions */
function createImpactWave(x, y, intensity = 1){
  if(!runtime.impactWavesEnabled) return;

  for(let i = 0; i < 2; i++) {
    impactWaves.push({
      x: x,
      y: y,
      radius: 0,
      maxRadius: 100 * intensity * runtime.advanced.impactWavesMul,
      speed: 5 + 5 * runtime.advanced.impactWavesMul,
      life: 1,
      color: '#ffffff',
      width: 2
    });
  }
}

function updateImpactWaves(){
  if(!runtime.impactWavesEnabled) return;

  for(let i = impactWaves.length - 1; i >= 0; i--){
    const wave = impactWaves[i];
    wave.radius += wave.speed;
    wave.life = 1 - (wave.radius / wave.maxRadius);

    if(wave.radius >= wave.maxRadius){
      impactWaves.splice(i, 1);
    }
  }
}

function drawImpactWaves(){
  if(!runtime.impactWavesEnabled || impactWaves.length === 0) return;

  ctx.save();
  for(let wave of impactWaves){
    ctx.globalAlpha = wave.life * 0.5;
    ctx.strokeStyle = wave.color;
    ctx.lineWidth = wave.width;
    ctx.beginPath();
    ctx.arc(wave.x - cameraX, wave.y - cameraY, wave.radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* 8. LENS FLARE - Light effects from bright objects */
function createLensFlare(x, y, intensity = 1){
  if(!runtime.lensFlareEnabled) return;

  for(let i = 0; i < 2; i++) {
    lensFlares.push({
      x: x,
      y: y,
      size: 30 * intensity * runtime.advanced.lensFlareMul,
      life: 30,
      alpha: 0.5,
      color: '#ffff88'
    });
  }
}

function updateLensFlares(){
  if(!runtime.lensFlareEnabled) return;

  for(let i = lensFlares.length - 1; i >= 0; i--){
    const flare = lensFlares[i];
    flare.life--;
    flare.alpha *= 0.95;

    if(flare.life <= 0 || flare.alpha <= 0.01){
      lensFlares.splice(i, 1);
    }
  }
}

function drawLensFlares(){
  if(!runtime.lensFlareEnabled || lensFlares.length === 0) return;

  ctx.save();
  for(let flare of lensFlares){
    ctx.globalAlpha = flare.alpha;
    ctx.fillStyle = flare.color;

    // Draw flare as a circle with gradient
    const gradient = ctx.createRadialGradient(
      flare.x - cameraX, flare.y - cameraY, 0,
      flare.x - cameraX, flare.y - cameraY, flare.size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 200, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flare.x - cameraX, flare.y - cameraY, flare.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* 9. SCREEN TEAR - Visual distortion at high speeds */
function applyScreenTear(){
  if(!runtime.screenTearEnabled || runtime.advanced.screenTearMul < 0.1) return;

  const tearIntensity = runtime.advanced.screenTearMul * 0.1;
  if(Math.random() < tearIntensity * 0.1){
    const tearY = Math.random() * canvas.height;
    const tearHeight = Math.random() * 20 + 5;
    const tearOffset = (Math.random() - 0.5) * 30 * tearIntensity;

    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.drawImage(canvas, 0, tearY, canvas.width, tearHeight, tearOffset, tearY, canvas.width, tearHeight);
    ctx.restore();
  }
}

/* 10. DYNAMIC FOG - Atmospheric depth */
function updateDynamicFog(){
  if(!runtime.dynamicFogEnabled || Math.random() > 0.1 * runtime.advanced.dynamicFogMul) return;

  dynamicFog.push({
    x: player.x + canvas.width + Math.random() * 200,
    y: Math.random() * canvas.height,
    size: Math.random() * 100 + 50,
    speed: Math.random() * 3 + 1,
    alpha: Math.random() * 0.1 + 0.05,
    life: 200
  });
}

function drawDynamicFog(){
  if(!runtime.dynamicFogEnabled || dynamicFog.length === 0) return;

  ctx.save();
  for(let i = dynamicFog.length - 1; i >= 0; i--){
    const fog = dynamicFog[i];
    fog.x -= fog.speed;
    fog.life--;

    if(fog.life <= 0 || fog.x < player.x - 400){
      dynamicFog.splice(i, 1);
    } else {
      ctx.globalAlpha = fog.alpha * (fog.life / 200);
      ctx.fillStyle = '#8888aa';

      const gradient = ctx.createRadialGradient(
        fog.x - cameraX, fog.y - cameraY, 0,
        fog.x - cameraX, fog.y - cameraY, fog.size
      );
      gradient.addColorStop(0, 'rgba(136, 136, 170, 0.3)');
      gradient.addColorStop(1, 'rgba(136, 136, 170, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(fog.x - cameraX, fog.y - cameraY, fog.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/* ---------- DEPTH OF FIELD - Blur based on distance */
function applyDepthOfField(){
  if(!runtime.depthOfFieldEnabled || runtime.advanced.depthOfFieldMul < 0.1) return;

  // Simplified depth of field - blur distant objects
  ctx.save();
  const blurAmount = runtime.advanced.depthOfFieldMul * 0.02;

  // Apply blur to platforms based on distance from player
  for(let plat of platforms){
    const distance = Math.abs(plat.x - player.x);
    if(distance > 300){
      ctx.save();
      ctx.globalAlpha = 0.1 * (distance / 500) * blurAmount;
      ctx.fillStyle = '#000000';
      ctx.fillRect(plat.x - cameraX, plat.y - cameraY, plat.width, plat.height);
      ctx.restore();
    }
  }
  ctx.restore();
}

/* ---------- AMBIENT OCCLUSION - Soft shadows */
function applyAmbientOcclusion(){
  if(!runtime.ambientOcclusionEnabled || runtime.advanced.ambientOcclusionMul < 0.1) return;

  ctx.save();
  const occlusion = runtime.advanced.ambientOcclusionMul * 0.05;

  // Add subtle shadows under platforms
  for(let plat of platforms){
    ctx.globalAlpha = 0.1 * occlusion;
    ctx.fillStyle = '#000000';

    // Shadow under platform
    ctx.fillRect(
      plat.x - cameraX + 3,
      plat.y - cameraY + plat.height,
      plat.width,
      5
    );

    // Shadow on side of platform
    ctx.fillRect(
      plat.x - cameraX + plat.width,
      plat.y - cameraY,
      3,
      plat.height
    );
  }
  ctx.restore();
}

/* ---------- TIME DILATION - Slow motion effect on special events */
function applyTimeDilation(){
  if(!runtime.timeDilationEnabled || runtime.advanced.timeDilationMul < 0.1) return;

  // Random time dilation events - set slow motion
  if(Math.random() < 0.01 * runtime.advanced.timeDilationMul && timeScale >= 0.9){
    timeScale = 0.3;
  }

  // Gradually return to normal speed
  if(timeScale < 1.0){
    timeScale += 0.02; // Gradually increase back to 1.0
    if(timeScale > 1.0) timeScale = 1.0;
  }
}

/* ---------- COLOR BLEED - Color smearing effect */
function applyColorBleed(){
  if(!runtime.colorBleedEnabled || runtime.advanced.colorBleedMul < 0.1) return;

  // Simplified color bleed by drawing semi-transparent copies
  ctx.save();
  const bleed = runtime.advanced.colorBleedMul * 0.05;

  for(let i = 0; i < 2; i++){
    ctx.globalAlpha = bleed * 0.3;
    ctx.translate(bleed * 2, 0);

    // Re-draw player with offset
    if(player.visible){
      ctx.fillStyle = '#ff00ff';
      ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
    }
  }
  ctx.restore();
}

/* ---------- GAME LOGIC ---------- */

/* ---------- World initialization & reset ---------- */
function resetWorld(){
  // clear ALL arrays
  platforms = []; spikes = []; gems = []; particles = []; crashPieces = [];
  trail = []; lines = []; cosmicDust = []; energySpheres = []; colorStreams = [];
  spirals = []; metallicParticles = []; digitalRain = []; mysticOrbs = [];
  crystalStructures = []; darkTendrils = []; shockwaves = []; screenDust = [];
  bloomParticles = []; reflections = []; motionBlurBuffer = []; lightRays = [];
  parallaxLayers = []; velocityStreaks = []; impactWaves = []; platformPulses = [];
  windParticles = []; speedLines = []; lensFlares = []; screenTears = [];
  dynamicFog = []; heatDistortions = []; starbursts = []; afterImages = [];
  gravityWaves = []; energyRipples = []; pixelDisplacements = [];

  screenShake = 0;
  screenFlash = 0;
  chromaticAberration = 0;

  // reset player
  player.x = 100;
  player.y = canvas.height/2 - player.height;
  player.vy = 0;
  player.speed = 11;
  player.jumpsLeft = 2;
  player.onGround = false;
  player.visible = true;
  player.horizMultiplier = 1; player.vertMultiplier = 1;

  // reset score and color cycling
  score = 0; colorLerp = 0; globalTime = 0;
  colorIndex = 0; platformColor = {...baseColors[0]}; nextColor = baseColors[1];

  // Create a guaranteed ground platform
  const groundHeight = BLOCK_SIZE;
  platforms.push({
    x: 0,
    y: Math.max(100, canvas.height - groundHeight * 2),
    width: Math.max(canvas.width, BLOCK_SIZE*10),
    height: groundHeight,
    color: {...platformColor},
    passed: false
  });

  // Initialize parallax layers for forward motion effect
  initializeParallaxLayers();
}

/* ---------- Platform generator ---------- */
function generateBlockPlatform(lastX, lastY){
  let blockCount = Math.floor(Math.random()*8)+1;
  if(Math.random()<0.7) blockCount = Math.min(blockCount,Math.floor(Math.random()*3+1));
  let gap = Math.floor(Math.random()*5+3) * BLOCK_SIZE;
  let x = lastX + gap;
  let y = lastY + (Math.floor(Math.random()*3)-1) * BLOCK_SIZE;
  y = Math.max(BLOCK_SIZE, Math.min(canvas.height - 3*BLOCK_SIZE, y));

  for(let i=0;i<blockCount;i++){
    platforms.push({
      x: x + i*BLOCK_SIZE,
      y: y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      color: {...platformColor},
      passed: false,
      pulsePhase: Math.random() * Math.PI * 2
    });
  }

  return {x: x + blockCount*BLOCK_SIZE, y: y};
}

/* ---------- Input handling ---------- */

function jump(){
  if(!player.visible) return;
  if(cheats.infiniteJump || player.jumpsLeft > 0){
    player.vy = JUMP_SPEED;
    spawnParticlesEarly(player.x + player.width/2, player.y + player.height,
                       player.jumpsLeft === 2 ? "jump" : "double",
                       runtime.effects.jumpEffectMul);
    if(!cheats.infiniteJump) player.jumpsLeft--;

    // Create velocity streaks
    createVelocityStreaks();

    // Create speed lines
    createSpeedLines();

    // Create wind particles
    createWindParticles();
  }
}

/* ---------- Start / Reset Game ---------- */
function startGame(){
  document.getElementById('menu').style.display = 'none';
  resetWorld();
  gameRunning = true;
  gameOver = false;
  player.visible = true;
  timeScale = 1.0; // Reset time scale to normal
  tickAccumulator = 0; // Reset tick accumulator on restart
  lastLoopTime = performance.now(); // Reset time tracking
}

document.getElementById('startBtn').addEventListener('click', startGame);

/* ---------- Game physics and logic ---------- */
function gameTick(){
  if(!gameRunning) return;

  // Update global time
  globalTime += 1/60;

  // Color cycling
  colorLerp += 0.005;
  if(colorLerp >= 1){
    colorLerp = 0;
    colorIndex = (colorIndex + 1) % baseColors.length;
    platformColor = {...baseColors[colorIndex]};
    nextColor = baseColors[(colorIndex + 1) % baseColors.length];
  }
  platformColor = lerpColor(platformColor, nextColor, colorLerp);

  // Player physics
  player.vy += GRAVITY * timeScale;
  player.y += player.vy * timeScale;
  player.x += player.speed * timeScale;

  // Platform collision
  player.onGround = false;
  for(let plat of platforms){
    if(player.x < plat.x + plat.width && player.x + player.width > plat.x &&
       player.y < plat.y + plat.height && player.y + player.height > plat.y &&
       player.vy >= 0){

      // Check if landing on top
      if(player.y + player.height - player.vy <= plat.y){
        player.y = plat.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;

        // Landing effects
        spawnParticlesEarly(player.x + player.width/2, player.y + player.height, "land", runtime.effects.walkEffectMul);
        createImpactWave(player.x + player.width/2, player.y + player.height/2, 0.5);

        if(!plat.passed){
          plat.passed = true;
          score += 10;
        }
      }
    }
  }

  // Generate new platforms ahead
  const lastPlat = platforms[platforms.length - 1];
  if(lastPlat && player.x > lastPlat.x + lastPlat.width - canvas.width){
    const out = generateBlockPlatform(lastPlat.x + lastPlat.width, lastPlat.y);
    lastPlatformX = out.x;
    lastPlatformY = out.y;
  }

  // Generate horizontal lines
  if(player.x > lastPlatformX - canvas.width/2){
    addLine();
  }

  // Update effects
  updateParallaxLayers();
  updateVelocityStreaks();
  updateSpeedLines();
  updateWindParticles();
  updateImpactWaves();
  updateLensFlares();
  updateDynamicFog();
  updatePlatformPulse();

  // Clean up off-screen objects
  cleanupOffScreenObjects();

  // Check death conditions
  if(player.y > canvas.height + 300 || player.x < cameraX - 200){
    tryDie();
  }
}

function cleanupOffScreenObjects(){
  // Clean up platforms
  for(let i = platforms.length - 1; i >= 0; i--){
    if(platforms[i].x + platforms[i].width < cameraX - DELETE_OFFSET){
      platforms.splice(i, 1);
    }
  }

  // Clean up lines
  for(let i = lines.length - 1; i >= 0; i--){
    if(lines[i].x + lines[i].width < cameraX - DELETE_OFFSET){
      lines.splice(i, 1);
    }
  }

  // Clean up other effects
  for(let i = particles.length - 1; i >= 0; i--){
    if(particles[i].x < cameraX - DELETE_OFFSET || particles[i].life <= 0){
      particles.splice(i, 1);
    }
  }

  for(let i = crashPieces.length - 1; i >= 0; i--){
    if(crashPieces[i].x < cameraX - DELETE_OFFSET || crashPieces[i].life <= 0){
      crashPieces.splice(i, 1);
    }
  }
}

function tryDie(){
  if(cheats.invincible) return;

  gameRunning = false;
  gameOver = true;
  player.visible = false;

  // Death effects
  spawnParticlesEarly(player.x + player.width/2, player.y + player.height/2, "die", runtime.effects.dieEffectMul);
  createCrashEarly(runtime.effects.dieEffectMul);

  // Update best score
  if(score > bestScore){
    bestScore = Math.floor(score);
    try {
      localStorage.setItem('bestScore', bestScore);
    } catch(e) {
      console.warn("Failed to save best score:", e);
    }
  }

  // Show game over menu
  setTimeout(() => {
    document.getElementById('menu').style.display = 'flex';
    document.getElementById('bestScore').innerText = 'Best Score: ' + bestScore;
  }, 2000);
}

/* ---------- Particle effects ---------- */
function spawnParticlesEarly(x, y, type, amountMul = 1) {
  const color = type === "jump" ? "#0ff" : type === "double" ? "#fff" : "#fff";
  const baseCount = type === "land" ? 20 : 30;
  const count = Math.max(0, Math.floor(baseCount * amountMul * runtime.effects.jumpEffectMul));

  for(let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10 - 5,
      life: Math.random() * 30 + 20,
      color: color,
      size: Math.random() * 3 + 1
    });
  }
}

function createCrashEarly(amountMul = 1) {
  const baseCount = 50;
  const count = Math.max(0, Math.floor(baseCount * amountMul * runtime.effects.dieEffectMul));

  for(let i = 0; i < count; i++) {
    crashPieces.push({
      x: player.x + player.width/2,
      y: player.y + player.height/2,
      vx: (Math.random() - 0.5) * 20,
      vy: (Math.random() - 0.5) * 20 - 10,
      life: Math.random() * 60 + 40,
      color: `hsl(${Math.random() * 60}, 100%, 70%)`,
      size: Math.random() * 4 + 2,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.5
    });
  }
}

/* ---------- Rendering ---------- */
function draw(){
  // Apply screen shake
  const shakeX = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;
  const shakeY = screenShake > 0 ? (Math.random() - 0.5) * screenShake : 0;

  ctx.save();
  ctx.translate(shakeX, shakeY);

  // Apply screen flash
  if(screenFlash > 0) {
    ctx.fillStyle = `rgba(255,255,255,${screenFlash * 0.05})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // clear with potential distortion effect
  if(runtime.distortionEnabled && screenShake > 5) {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0,0,canvas.width,canvas.height);
  }

  // background (plain)
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Draw parallax layers first (background)
  if(runtime.parallaxEnabled) drawParallaxLayers();

  // Draw dynamic fog
  if(runtime.dynamicFogEnabled) drawDynamicFog();

  // horizontal lines background
  if(runtime.linesEnabled){
    for(let l of lines){
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(l.x - cameraX, l.y - cameraY);
      ctx.lineTo(l.x + l.width - cameraX, l.y - cameraY);
      ctx.stroke();

      // Second parallel line from early version
      ctx.beginPath();
      ctx.moveTo(l.x - 5 - cameraX, l.y + 2 - cameraY);
      ctx.lineTo(l.x + l.width - 5 - cameraX, l.y + 2 - cameraY);
      ctx.stroke();
    }
  }

  // Draw velocity streaks
  if(runtime.velocityStreaksEnabled) drawVelocityStreaks();

  // Draw speed lines
  if(runtime.speedLinesEnabled) drawSpeedLines();

  // Draw wind particles
  if(runtime.windParticlesEnabled) drawWindParticles();

  // Draw ambient occlusion first (shadows)
  if(runtime.ambientOcclusionEnabled) applyAmbientOcclusion();

  // Draw depth of field (blur distant objects)
  if(runtime.depthOfFieldEnabled) applyDepthOfField();

  // platforms
  for(let plat of platforms){
    const useTexture = runtime.effects.blockTextureMul > 0;
    if(useTexture){
      for(let y = plat.y; y < canvas.height; y += BLOCK_SIZE){
        let dark = (y === plat.y) ? 1 : 0.3;
        const grd = ctx.createLinearGradient(plat.x - cameraX, y - cameraY, plat.x + plat.width - cameraX, y + BLOCK_SIZE - cameraY);
        grd.addColorStop(0, `rgba(${Math.floor(plat.color.r*dark)},${Math.floor(plat.color.g*dark)},${Math.floor(plat.color.b*dark)},1)`);
        grd.addColorStop(1, "rgba(0,0,0,1)");
        ctx.fillStyle = grd;
        if(runtime.glowEnabled){ ctx.shadowColor = `rgba(${plat.color.r},${plat.color.g},${plat.color.b},0.9)`; ctx.shadowBlur = plat === platforms[0] ? 12 : 0; }
        ctx.fillRect(plat.x - cameraX, y - cameraY, plat.width, BLOCK_SIZE);
        ctx.shadowBlur = 0;
      }
    } else {
      // Use platform pulse effect if enabled
      if(runtime.platformPulseEnabled) {
        const pulse = Math.sin(plat.pulsePhase) * 0.2 + 0.8;
        const r = Math.floor(plat.color.r * pulse);
        const g = Math.floor(plat.color.g * pulse);
        const b = Math.floor(plat.color.b * pulse);
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      } else {
        ctx.fillStyle = `rgb(${plat.color.r},${plat.color.g},${plat.color.b})`;
      }
      ctx.fillRect(plat.x - cameraX, plat.y - cameraY, plat.width, plat.height);
    }
  }

  // Draw impact waves
  if(runtime.impactWavesEnabled) drawImpactWaves();

  // Draw lens flares
  if(runtime.lensFlareEnabled) drawLensFlares();

  // Draw particles
  for(let p of particles){
    ctx.globalAlpha = p.life / 50;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - cameraX, p.y - cameraY, p.size, p.size);
  }

  // Draw crash pieces
  for(let p of crashPieces){
    ctx.globalAlpha = p.life / 100;
    ctx.save();
    ctx.translate(p.x - cameraX + p.size/2, p.y - cameraY + p.size/2);
    ctx.rotate(p.rotation);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    ctx.restore();
    p.rotation += p.rotationSpeed;
  }

  // player
  if(player.visible){
    if(runtime.glowEnabled){ ctx.shadowColor = "#0ff"; ctx.shadowBlur = 20; }
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
    if(runtime.glowEnabled) ctx.shadowBlur = 0;
    ctx.strokeStyle = "#0ff"; ctx.lineWidth = 6; ctx.strokeRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
  }

  // Apply radial blur
  if(runtime.radialBlurEnabled) applyRadialBlur();

  // Apply screen tear
  if(runtime.screenTearEnabled) applyScreenTear();

  // Apply color bleed
  if(runtime.colorBleedEnabled) applyColorBleed();

  ctx.restore(); // Restore from screen shake transform

  // HUD
  const hudScore = document.getElementById('scoreHUD');
  hudScore.innerText = 'Score: ' + Math.floor(score);

  // FPS counter
  frameCount++;
}

/* ---------- Main loop with proper FPS limiting ---------- */
let lastLoopTime = performance.now();
let accumulated = 0;

function mainLoop(now){
  requestAnimationFrame(mainLoop);
  if(!now) now = performance.now();

  const deltaMs = now - lastLoopTime;
  lastLoopTime = now;

  // Cap delta time to prevent large jumps (e.g., when tab is inactive)
  const cappedDeltaMs = Math.min(deltaMs, 100); // Max 100ms (10 FPS minimum)
  globalTime += cappedDeltaMs / 1000;

  // Calculate FPS
  fps = 1000 / Math.max(1, cappedDeltaMs);

  // Update FPS display only every 0.5 seconds
  if(now - lastFpsDisplayUpdate > 500){
    const fpsLabel = document.getElementById('fpsLabel');
    const maxFPSText = settings.maxFPS === 0 ? 'Unlimited' : settings.maxFPS;
    fpsLabel.innerText = `FPS: ${Math.round(fps)} / ${maxFPSText} — Quality: ${settings.qualityPreset}`;
    lastFpsDisplayUpdate = now;
    frameCount = 0;
  }

  // FPS limiting for rendering
  if(runtime.minFrameTime > 0){
    accumulated += cappedDeltaMs;
    if(accumulated < runtime.minFrameTime) return;
    accumulated = 0;
  }

  // Fixed tick system: always run at 60 TPS regardless of FPS
  // Use cappedDeltaMs to prevent large time jumps
  tickAccumulator += cappedDeltaMs;

  // Run at most one tick per frame to prevent lag buildup
  if(tickAccumulator >= TICK_INTERVAL){
    gameTick();
    tickAccumulator -= TICK_INTERVAL;

    // Prevent excessive accumulation
    if(tickAccumulator > TICK_INTERVAL * 2) {
      tickAccumulator = TICK_INTERVAL;
    }
  }

  // Camera smoothing - use actual delta time for smoothness
  let targetCamX, targetCamY;

  if(gameOver) {
    // When game is over, keep camera at the death position (don't push away)
    targetCamX = lastPlayerX - 150;
    targetCamY = canvas.height/2; // Center vertically
  } else {
    // Normal camera follow
    targetCamX = player.x - 150;
    targetCamY = player.y - canvas.height/2 + player.height*1.5;
    lastPlayerX = player.x; // Update last known player position
  }

  const smoothingFactor = 0.1 * (cappedDeltaMs / 16.67); // Adjust for frame rate
  cameraX = cameraX * (1 - smoothingFactor) + targetCamX * smoothingFactor;
  cameraY = cameraY * (1 - smoothingFactor) + targetCamY * smoothingFactor;

  // Draw (rendering at monitor refresh rate)
  if(gameRunning || gameOver) draw();
}

/* ---------- Settings button ---------- */
document.getElementById('settingsBtn').addEventListener('click', () => {
  fetch('settings.html', { method: 'HEAD' }).then(resp => {
    if(resp.ok) {
      window.location.href = 'settings.html';
    } else {
      alert('settings.html not found');
    }
  }).catch(()=> {
    alert('settings.html not found');
  });
});

/* ---------- Command handling (Ctrl+Shift+A) ---------- */
function openCommandPrompt(){
  const cmd = prompt("Enter command:");
  if(!cmd) return;

  const parts = cmd.split(' ');
  const command = parts[0].toLowerCase();

  if(command === 'float'){
    cheats.float = !cheats.float;
    showToast(`Float mode: ${cheats.float ? 'ON' : 'OFF'}`);
  } else if(command === 'invincible'){
    cheats.invincible = !cheats.invincible;
    showToast(`Invincible mode: ${cheats.invincible ? 'ON' : 'OFF'}`);
  } else if(command === 'infinitejump'){
    cheats.infiniteJump = !cheats.infiniteJump;
    showToast(`Infinite jump: ${cheats.infiniteJump ? 'ON' : 'OFF'}`);
  } else if(command === 'gemeveryblock'){
    gemEveryBlock = !gemEveryBlock;
    showToast(`Gem every block: ${gemEveryBlock ? 'ON' : 'OFF'}`);
  } else if(command === 'testmode'){
    testMode = !testMode;
    showToast(`Test mode: ${testMode ? 'ON' : 'OFF'}`);
  } else {
    showToast("Unknown command");
  }
}

window.addEventListener('keydown', e => {
  if(e.ctrlKey && e.shiftKey && e.code === 'KeyA'){
    e.preventDefault();
    openCommandPrompt();
  }
});

/* ---------- Mobile command button ---------- */
document.getElementById('mobileCommandBtn').addEventListener('click', openCommandPrompt);

/* ---------- Game initialization ---------- */
if(!localStorage.getItem(LS_KEY)){
  writeSettings(defaultSettings);
  settings = readSettings();
  applySettings(settings);
} else {
  settings = readSettings();
  applySettings(settings);
}

// init ground/platforms and show menu
resetWorld();
document.getElementById('bestScore').innerText = 'Best Score: ' + bestScore;
document.getElementById('menu').style.display = 'flex';

// Input handling
window.addEventListener('keydown', e => { if(e.code === 'Space') e.preventDefault(); keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('mousedown', () => jump());
window.addEventListener('touchstart', () => jump());

// start the RAF loop
requestAnimationFrame(mainLoop);