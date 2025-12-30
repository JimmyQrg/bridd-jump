/* ===========================
   BRIDD JUMP - game.js
   Complete game logic with 20+ EXTREME effects
   Will lag significantly at Ultra++ and Highest settings
   =========================== */

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
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/* ---------- Constants & state ---------- */
const BLOCK_SIZE = 50;
const JUMP_SPEED = -15;
const GRAVITY = 0.7;
const TICKS_PER_SECOND = 60;
const TICK_INTERVAL = 1000 / TICKS_PER_SECOND;
const DELETE_OFFSET = BLOCK_SIZE * 6;

/* Player object blueprint */
let player = {
  x: 100, y: 0, width: 50, height: 50, vy: 0, speed: 11,
  color: "#0ff", hitboxScale: 0.6, jumpsLeft: 2, onGround:false, visible:true,
  horizMultiplier:1, vertMultiplier:1, accountEmail: "player@example.com"
};

/* world arrays - EXPANDED WITH 20+ NEW EFFECTS */
let platforms = [], spikes = [], gems = [], particles = [], crashPieces = [], trail = [], lines = [];
let shockwaves = [], screenShake = 0, screenFlash = 0, screenDust = [], bloomParticles = [];
let reflections = [], motionBlurBuffer = [], lightRays = [], chromaticAberration = 0;
let parallaxLayers = [], velocityStreaks = [], impactWaves = [], platformPulses = [];
let windParticles = [], speedLines = [], lensFlares = [], screenTears = [];
let dynamicFog = [], heatDistortions = [], starbursts = [], afterImages = [];
let gravityWaves = [], energyRipples = [], pixelDisplacements = [];
// NEW 20 UNIQUE EFFECTS
let cosmicRays = [], plasmaOrbs = [], crystalShards = [], voidPortals = [], quantumFields = [];
let chronoSpheres = [], nebulaClouds = [], fractalVines = [], prismBeams = [], shadowEchoes = [];
let auroraWaves = [], singularityCores = [], matrixRain = [], bioLuminescence = [], dataStreams = [];
let electroFields = [], dimensionalRifts = [], sonicBooms = [], realityFractures = [], temporalEchoes = [];

/* gameplay */
let keys = {}, score = 0, bestScore = localStorage.getItem("bestScore") ? parseInt(localStorage.getItem("bestScore")) : 0;
let gameRunning = false;
let cameraX = 0, cameraY = 0;

/* Tick system */
let tickAccumulator = 0;
let lastFpsUpdateTime = performance.now();

/* color cycling */
let baseColors = [
  {r:255,g:0,b:0},{r:255,g:153,b:0},{r:255,g:255,b:0},
  {r:0,g:255,b:0},{r:0,g:255,b:255},{r:0,g:0,b:255},{r:153,g:0,b:255}
];
let colorIndex = 0, nextColor = baseColors[1], platformColor = {...baseColors[0]}, colorLerp = 0, globalTime = 0;

/* misc */
let testMode = false, gemEveryBlock = false, account = "player", oldAccount = null;
let cheats = { float:false, invincible:false, infiniteJump:false };

/* ---------- Settings loading from localStorage ---------- */
const LS_KEY = "briddSettings";

const defaultSettings = {
  maxFPS: 0,
  qualityPreset: "Extreme+",
  quality: {
    jumpEffect: 64,
    walkEffect: 64,
    dieEffect: 64,
    horizontalLines: 64,
    trail: 64,
    blockTexture: 100,
    glow: 100
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
    radialBlur: 100
  }
};

const qualityPresets = {
  "Potato": {
    blockTexture:1, jumpEffect:0, walkEffect:0, dieEffect:0, horizontalLines:0, trail:0, glow:0, lines:false,
    shockwaves:0, screenShake:0, bloomParticles:0, particleTrails:0, screenDistortion:0,
    particleCount:10, trailLength:10, screenReflections:0, motionBlur:0, lightRays:0,
    parallaxLayers:0, velocityStreaks:0, impactWaves:0, platformPulse:0, colorBleed:0,
    depthOfField:0, windParticles:0, speedLines:0, timeDilation:0, lensFlare:0,
    screenTear:0, dynamicFog:0, heatDistortion:0, starbursts:0, afterImages:0,
    gravityWaves:0, energyRipples:0, pixelDisplacement:0, ambientOcclusion:0, radialBlur:0
  },
  "Low": {
    blockTexture:1, jumpEffect:5, walkEffect:0, dieEffect:0, horizontalLines:0, trail:0, glow:0, lines:false,
    shockwaves:0, screenShake:0, bloomParticles:0, particleTrails:0, screenDistortion:0,
    particleCount:25, trailLength:25, screenReflections:0, motionBlur:0, lightRays:0,
    parallaxLayers:10, velocityStreaks:0, impactWaves:0, platformPulse:0, colorBleed:0,
    depthOfField:0, windParticles:10, speedLines:10, timeDilation:0, lensFlare:0,
    screenTear:0, dynamicFog:0, heatDistortion:0, starbursts:0, afterImages:0,
    gravityWaves:0, energyRipples:0, pixelDisplacement:0, ambientOcclusion:0, radialBlur:0
  },
  "Medium": {
    blockTexture:1, jumpEffect:10, walkEffect:0, dieEffect:10, horizontalLines:0, trail:0, glow:0, lines:false,
    shockwaves:0, screenShake:0, bloomParticles:0, particleTrails:0, screenDistortion:0,
    particleCount:50, trailLength:50, screenReflections:10, motionBlur:0, lightRays:0,
    parallaxLayers:25, velocityStreaks:10, impactWaves:10, platformPulse:10, colorBleed:0,
    depthOfField:10, windParticles:25, speedLines:25, timeDilation:0, lensFlare:0,
    screenTear:0, dynamicFog:0, heatDistortion:0, starbursts:0, afterImages:0,
    gravityWaves:0, energyRipples:0, pixelDisplacement:0, ambientOcclusion:0, radialBlur:0
  },
  "Medium+": {
    blockTexture:1, jumpEffect:15, walkEffect:15, dieEffect:15, horizontalLines:0, trail:0, glow:0, lines:false,
    shockwaves:0, screenShake:0, bloomParticles:0, particleTrails:0, screenDistortion:0,
    particleCount:75, trailLength:75, screenReflections:25, motionBlur:10, lightRays:10,
    parallaxLayers:50, velocityStreaks:25, impactWaves:25, platformPulse:25, colorBleed:10,
    depthOfField:25, windParticles:50, speedLines:50, timeDilation:10, lensFlare:10,
    screenTear:0, dynamicFog:10, heatDistortion:10, starbursts:10, afterImages:10,
    gravityWaves:0, energyRipples:0, pixelDisplacement:0, ambientOcclusion:10, radialBlur:10
  },
  "High": {
    blockTexture:1, jumpEffect:15, walkEffect:15, dieEffect:15, horizontalLines:15, trail:0, glow:0, lines:true,
    shockwaves:10, screenShake:10, bloomParticles:0, particleTrails:0, screenDistortion:0,
    particleCount:100, trailLength:100, screenReflections:50, motionBlur:25, lightRays:25,
    parallaxLayers:75, velocityStreaks:50, impactWaves:50, platformPulse:50, colorBleed:25,
    depthOfField:50, windParticles:75, speedLines:75, timeDilation:25, lensFlare:25,
    screenTear:10, dynamicFog:25, heatDistortion:25, starbursts:25, afterImages:25,
    gravityWaves:10, energyRipples:10, pixelDisplacement:10, ambientOcclusion:25, radialBlur:25
  },
  "High+": {
    blockTexture:1, jumpEffect:33, walkEffect:33, dieEffect:33, horizontalLines:33, trail:0, glow:0, lines:true,
    shockwaves:25, screenShake:25, bloomParticles:10, particleTrails:10, screenDistortion:0,
    particleCount:125, trailLength:125, screenReflections:75, motionBlur:50, lightRays:50,
    parallaxLayers:100, velocityStreaks:75, impactWaves:75, platformPulse:75, colorBleed:50,
    depthOfField:75, windParticles:100, speedLines:100, timeDilation:50, lensFlare:50,
    screenTear:25, dynamicFog:50, heatDistortion:50, starbursts:50, afterImages:50,
    gravityWaves:25, energyRipples:25, pixelDisplacement:25, ambientOcclusion:50, radialBlur:50
  },
  "Extreme": {
    blockTexture:1, jumpEffect:60, walkEffect:60, dieEffect:60, horizontalLines:60, trail:0, glow:0, lines:true,
    shockwaves:50, screenShake:50, bloomParticles:25, particleTrails:25, screenDistortion:10,
    particleCount:150, trailLength:150, screenReflections:100, motionBlur:75, lightRays:75,
    parallaxLayers:125, velocityStreaks:100, impactWaves:100, platformPulse:100, colorBleed:75,
    depthOfField:100, windParticles:125, speedLines:125, timeDilation:75, lensFlare:75,
    screenTear:50, dynamicFog:75, heatDistortion:75, starbursts:75, afterImages:75,
    gravityWaves:50, energyRipples:50, pixelDisplacement:50, ambientOcclusion:75, radialBlur:75
  },
  "Extreme+": {
    blockTexture:1, jumpEffect:64, walkEffect:64, dieEffect:64, horizontalLines:64, trail:1, glow:1, lines:true,
    shockwaves:75, screenShake:75, bloomParticles:50, particleTrails:50, screenDistortion:25,
    particleCount:175, trailLength:175, screenReflections:125, motionBlur:100, lightRays:100,
    parallaxLayers:150, velocityStreaks:125, impactWaves:125, platformPulse:125, colorBleed:100,
    depthOfField:125, windParticles:150, speedLines:150, timeDilation:100, lensFlare:100,
    screenTear:75, dynamicFog:100, heatDistortion:100, starbursts:100, afterImages:100,
    gravityWaves:75, energyRipples:75, pixelDisplacement:75, ambientOcclusion:100, radialBlur:100,
    cosmicRays:50, plasmaOrbs:50, crystalShards:50, voidPortals:25, quantumFields:50,
    chronoSpheres:50, nebulaClouds:50, fractalVines:50, prismBeams:50, shadowEchoes:50,
    auroraWaves:50, singularityCores:25, matrixRain:50, bioLuminescence:50, dataStreams:50,
    electroFields:50, dimensionalRifts:25, sonicBooms:50, realityFractures:50, temporalEchoes:50
  },
  "Ultra": {
    blockTexture:1, jumpEffect:100, walkEffect:100, dieEffect:100, horizontalLines:100, trail:0, glow:1, lines:true,
    shockwaves:100, screenShake:100, bloomParticles:75, particleTrails:75, screenDistortion:50,
    particleCount:200, trailLength:200, screenReflections:150, motionBlur:125, lightRays:125,
    parallaxLayers:175, velocityStreaks:150, impactWaves:150, platformPulse:150, colorBleed:125,
    depthOfField:150, windParticles:175, speedLines:175, timeDilation:125, lensFlare:125,
    screenTear:100, dynamicFog:125, heatDistortion:125, starbursts:125, afterImages:125,
    gravityWaves:100, energyRipples:100, pixelDisplacement:100, ambientOcclusion:125, radialBlur:125
  },
  "Ultra+": {
    blockTexture:1, jumpEffect:120, walkEffect:120, dieEffect:120, horizontalLines:120, trail:1, glow:1, lines:true,
    shockwaves:120, screenShake:120, bloomParticles:100, particleTrails:100, screenDistortion:75,
    particleCount:250, trailLength:250, screenReflections:175, motionBlur:150, lightRays:150,
    parallaxLayers:200, velocityStreaks:175, impactWaves:175, platformPulse:175, colorBleed:150,
    depthOfField:175, windParticles:200, speedLines:200, timeDilation:150, lensFlare:150,
    screenTear:125, dynamicFog:150, heatDistortion:150, starbursts:150, afterImages:150,
    gravityWaves:125, energyRipples:125, pixelDisplacement:125, ambientOcclusion:150, radialBlur:150
  },
  "Ultra++": {
    blockTexture:1, jumpEffect:200, walkEffect:200, dieEffect:200, horizontalLines:200, trail:1, glow:1.5, lines:true,
    shockwaves:150, screenShake:150, bloomParticles:150, particleTrails:150, screenDistortion:100,
    particleCount:300, trailLength:300, screenReflections:200, motionBlur:175, lightRays:175,
    parallaxLayers:225, velocityStreaks:200, impactWaves:200, platformPulse:200, colorBleed:175,
    depthOfField:200, windParticles:225, speedLines:225, timeDilation:175, lensFlare:175,
    screenTear:150, dynamicFog:175, heatDistortion:175, starbursts:175, afterImages:175,
    gravityWaves:150, energyRipples:150, pixelDisplacement:150, ambientOcclusion:175, radialBlur:175
  },
  "Highest": {
    blockTexture:1, jumpEffect:200, walkEffect:200, dieEffect:200, horizontalLines:200, trail:1, glow:2, lines:true,
    shockwaves:200, screenShake:200, bloomParticles:200, particleTrails:200, screenDistortion:200,
    particleCount:500, trailLength:500, screenReflections:250, motionBlur:200, lightRays:200,
    parallaxLayers:250, velocityStreaks:250, impactWaves:250, platformPulse:250, colorBleed:200,
    depthOfField:250, windParticles:250, speedLines:250, timeDilation:200, lensFlare:200,
    screenTear:200, dynamicFog:200, heatDistortion:200, starbursts:200, afterImages:200,
    gravityWaves:200, energyRipples:200, pixelDisplacement:200, ambientOcclusion:200, radialBlur:200
  }
};

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

/* runtime settings object derived from storage */
let settings = readSettings();

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
    radialBlurMul: 1
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
  // NEW 20 UNIQUE EFFECTS
  cosmicRaysEnabled: true,
  plasmaOrbsEnabled: true,
  crystalShardsEnabled: true,
  voidPortalsEnabled: true,
  quantumFieldsEnabled: true,
  chronoSpheresEnabled: true,
  nebulaCloudsEnabled: true,
  fractalVinesEnabled: true,
  prismBeamsEnabled: true,
  shadowEchoesEnabled: true,
  auroraWavesEnabled: true,
  singularityCoresEnabled: true,
  matrixRainEnabled: true,
  bioLuminescenceEnabled: true,
  dataStreamsEnabled: true,
  electroFieldsEnabled: true,
  dimensionalRiftsEnabled: true,
  sonicBoomsEnabled: true,
  realityFracturesEnabled: true,
  temporalEchoesEnabled: true
};

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
  runtime.effects.blockTextureEnabled = (settings.quality && settings.quality.blockTexture !== undefined) ? (settings.quality.blockTexture > 0) : (preset.blockTexture >= 1);
  runtime.effects.jumpEffectMul = pct(settings.quality.jumpEffect) || (preset.jumpEffect ? preset.jumpEffect/100 : 0);
  runtime.effects.walkEffectMul = pct(settings.quality.walkEffect) || (preset.walkEffect ? preset.walkEffect/100 : 0);
  runtime.effects.dieEffectMul = pct(settings.quality.dieEffect) || (preset.dieEffect ? preset.dieEffect/100 : 0);
  runtime.effects.horizontalLinesMul = pct(settings.quality.horizontalLines) || (preset.horizontalLines ? preset.horizontalLines/100 : 0);
  runtime.effects.trailMul = pct(settings.quality.trail) || (preset.trail ? preset.trail/100 : 0);
  
  // Advanced effects
  runtime.advanced.shockwavesMul = pct(settings.advanced.shockwaves) || (preset.shockwaves ? preset.shockwaves/100 : 0);
  runtime.advanced.screenShakeMul = pct(settings.advanced.screenShake) || (preset.screenShake ? preset.screenShake/100 : 0);
  runtime.advanced.bloomParticlesMul = pct(settings.advanced.bloomParticles) || (preset.bloomParticles ? preset.bloomParticles/100 : 0);
  runtime.advanced.particleTrailsMul = pct(settings.advanced.particleTrails) || (preset.particleTrails ? preset.particleTrails/100 : 0);
  runtime.advanced.screenDistortionMul = pct(settings.advanced.screenDistortion) || (preset.screenDistortion ? preset.screenDistortion/100 : 0);
  runtime.advanced.particleCountMul = pct(settings.advanced.particleCount) || (preset.particleCount ? preset.particleCount/100 : 0);
  runtime.advanced.trailLengthMul = pct(settings.advanced.trailLength) || (preset.trailLength ? preset.trailLength/100 : 0);
  runtime.advanced.screenReflectionsMul = pct(settings.advanced.screenReflections) || (preset.screenReflections ? preset.screenReflections/100 : 0);
  runtime.advanced.motionBlurMul = pct(settings.advanced.motionBlur) || (preset.motionBlur ? preset.motionBlur/100 : 0);
  runtime.advanced.lightRaysMul = pct(settings.advanced.lightRays) || (preset.lightRays ? preset.lightRays/100 : 0);
  runtime.advanced.parallaxLayersMul = pct(settings.advanced.parallaxLayers) || (preset.parallaxLayers ? preset.parallaxLayers/100 : 0);
  runtime.advanced.velocityStreaksMul = pct(settings.advanced.velocityStreaks) || (preset.velocityStreaks ? preset.velocityStreaks/100 : 0);
  runtime.advanced.impactWavesMul = pct(settings.advanced.impactWaves) || (preset.impactWaves ? preset.impactWaves/100 : 0);
  runtime.advanced.platformPulseMul = pct(settings.advanced.platformPulse) || (preset.platformPulse ? preset.platformPulse/100 : 0);
  runtime.advanced.colorBleedMul = pct(settings.advanced.colorBleed) || (preset.colorBleed ? preset.colorBleed/100 : 0);
  runtime.advanced.depthOfFieldMul = pct(settings.advanced.depthOfField) || (preset.depthOfField ? preset.depthOfField/100 : 0);
  runtime.advanced.windParticlesMul = pct(settings.advanced.windParticles) || (preset.windParticles ? preset.windParticles/100 : 0);
  runtime.advanced.speedLinesMul = pct(settings.advanced.speedLines) || (preset.speedLines ? preset.speedLines/100 : 0);
  runtime.advanced.timeDilationMul = pct(settings.advanced.timeDilation) || (preset.timeDilation ? preset.timeDilation/100 : 0);
  runtime.advanced.lensFlareMul = pct(settings.advanced.lensFlare) || (preset.lensFlare ? preset.lensFlare/100 : 0);
  runtime.advanced.screenTearMul = pct(settings.advanced.screenTear) || (preset.screenTear ? preset.screenTear/100 : 0);
  runtime.advanced.dynamicFogMul = pct(settings.advanced.dynamicFog) || (preset.dynamicFog ? preset.dynamicFog/100 : 0);
  runtime.advanced.heatDistortionMul = pct(settings.advanced.heatDistortion) || (preset.heatDistortion ? preset.heatDistortion/100 : 0);
  runtime.advanced.starburstsMul = pct(settings.advanced.starbursts) || (preset.starbursts ? preset.starbursts/100 : 0);
  runtime.advanced.afterImagesMul = pct(settings.advanced.afterImages) || (preset.afterImages ? preset.afterImages/100 : 0);
  runtime.advanced.gravityWavesMul = pct(settings.advanced.gravityWaves) || (preset.gravityWaves ? preset.gravityWaves/100 : 0);
  runtime.advanced.energyRipplesMul = pct(settings.advanced.energyRipples) || (preset.energyRipples ? preset.energyRipples/100 : 0);
  runtime.advanced.pixelDisplacementMul = pct(settings.advanced.pixelDisplacement) || (preset.pixelDisplacement ? preset.pixelDisplacement/100 : 0);
  runtime.advanced.ambientOcclusionMul = pct(settings.advanced.ambientOcclusion) || (preset.ambientOcclusion ? preset.ambientOcclusion/100 : 0);
  runtime.advanced.radialBlurMul = pct(settings.advanced.radialBlur) || (preset.radialBlur ? preset.radialBlur/100 : 0);
  // NEW 20 UNIQUE EFFECTS
  runtime.advanced.cosmicRaysMul = pct(settings.advanced.cosmicRays) || (preset.cosmicRays ? preset.cosmicRays/100 : 0);
  runtime.advanced.plasmaOrbsMul = pct(settings.advanced.plasmaOrbs) || (preset.plasmaOrbs ? preset.plasmaOrbs/100 : 0);
  runtime.advanced.crystalShardsMul = pct(settings.advanced.crystalShards) || (preset.crystalShards ? preset.crystalShards/100 : 0);
  runtime.advanced.voidPortalsMul = pct(settings.advanced.voidPortals) || (preset.voidPortals ? preset.voidPortals/100 : 0);
  runtime.advanced.quantumFieldsMul = pct(settings.advanced.quantumFields) || (preset.quantumFields ? preset.quantumFields/100 : 0);
  runtime.advanced.chronoSpheresMul = pct(settings.advanced.chronoSpheres) || (preset.chronoSpheres ? preset.chronoSpheres/100 : 0);
  runtime.advanced.nebulaCloudsMul = pct(settings.advanced.nebulaClouds) || (preset.nebulaClouds ? preset.nebulaClouds/100 : 0);
  runtime.advanced.fractalVinesMul = pct(settings.advanced.fractalVines) || (preset.fractalVines ? preset.fractalVines/100 : 0);
  runtime.advanced.prismBeamsMul = pct(settings.advanced.prismBeams) || (preset.prismBeams ? preset.prismBeams/100 : 0);
  runtime.advanced.shadowEchoesMul = pct(settings.advanced.shadowEchoes) || (preset.shadowEchoes ? preset.shadowEchoes/100 : 0);
  runtime.advanced.auroraWavesMul = pct(settings.advanced.auroraWaves) || (preset.auroraWaves ? preset.auroraWaves/100 : 0);
  runtime.advanced.singularityCoresMul = pct(settings.advanced.singularityCores) || (preset.singularityCores ? preset.singularityCores/100 : 0);
  runtime.advanced.matrixRainMul = pct(settings.advanced.matrixRain) || (preset.matrixRain ? preset.matrixRain/100 : 0);
  runtime.advanced.bioLuminescenceMul = pct(settings.advanced.bioLuminescence) || (preset.bioLuminescence ? preset.bioLuminescence/100 : 0);
  runtime.advanced.dataStreamsMul = pct(settings.advanced.dataStreams) || (preset.dataStreams ? preset.dataStreams/100 : 0);
  runtime.advanced.electroFieldsMul = pct(settings.advanced.electroFields) || (preset.electroFields ? preset.electroFields/100 : 0);
  runtime.advanced.dimensionalRiftsMul = pct(settings.advanced.dimensionalRifts) || (preset.dimensionalRifts ? preset.dimensionalRifts/100 : 0);
  runtime.advanced.sonicBoomsMul = pct(settings.advanced.sonicBooms) || (preset.sonicBooms ? preset.sonicBooms/100 : 0);
  runtime.advanced.realityFracturesMul = pct(settings.advanced.realityFractures) || (preset.realityFractures ? preset.realityFractures/100 : 0);
  runtime.advanced.temporalEchoesMul = pct(settings.advanced.temporalEchoes) || (preset.temporalEchoes ? preset.temporalEchoes/100 : 0);

  // Enable/disable based on settings
  runtime.glowEnabled = (settings.quality && settings.quality.glow !== undefined) ? (settings.quality.glow > 0) : (preset.glow !== undefined ? preset.glow > 0 : true);
  runtime.linesEnabled = preset.lines !== undefined ? preset.lines : true;
  runtime.trailEnabled = (settings.quality && settings.quality.trail !== undefined) ? settings.quality.trail > 0 : preset.trail > 0;
  
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
  // NEW 20 UNIQUE EFFECTS
  runtime.cosmicRaysEnabled = runtime.advanced.cosmicRaysMul > 0;
  runtime.plasmaOrbsEnabled = runtime.advanced.plasmaOrbsMul > 0;
  runtime.crystalShardsEnabled = runtime.advanced.crystalShardsMul > 0;
  runtime.voidPortalsEnabled = runtime.advanced.voidPortalsMul > 0;
  runtime.quantumFieldsEnabled = runtime.advanced.quantumFieldsMul > 0;
  runtime.chronoSpheresEnabled = runtime.advanced.chronoSpheresMul > 0;
  runtime.nebulaCloudsEnabled = runtime.advanced.nebulaCloudsMul > 0;
  runtime.fractalVinesEnabled = runtime.advanced.fractalVinesMul > 0;
  runtime.prismBeamsEnabled = runtime.advanced.prismBeamsMul > 0;
  runtime.shadowEchoesEnabled = runtime.advanced.shadowEchoesMul > 0;
  runtime.auroraWavesEnabled = runtime.advanced.auroraWavesMul > 0;
  runtime.singularityCoresEnabled = runtime.advanced.singularityCoresMul > 0;
  runtime.matrixRainEnabled = runtime.advanced.matrixRainMul > 0;
  runtime.bioLuminescenceEnabled = runtime.advanced.bioLuminescenceMul > 0;
  runtime.dataStreamsEnabled = runtime.advanced.dataStreamsMul > 0;
  runtime.electroFieldsEnabled = runtime.advanced.electroFieldsMul > 0;
  runtime.dimensionalRiftsEnabled = runtime.advanced.dimensionalRiftsMul > 0;
  runtime.sonicBoomsEnabled = runtime.advanced.sonicBoomsMul > 0;
  runtime.realityFracturesEnabled = runtime.advanced.realityFracturesMul > 0;
  runtime.temporalEchoesEnabled = runtime.advanced.temporalEchoesMul > 0;

  // save canonical
  writeSettings(settings);
}

/* initial apply */
applySettings(settings);

/* ---------- World initialization & reset ---------- */
let lastPlatformX = 0, lastPlatformY = 0;

function resetWorld(){
  // clear ALL arrays
  platforms = []; spikes = []; gems = []; particles = []; crashPieces = []; trail = []; lines = [];
  shockwaves = []; screenDust = []; bloomParticles = []; reflections = []; motionBlurBuffer = [];
  lightRays = []; parallaxLayers = []; velocityStreaks = []; impactWaves = []; platformPulses = [];
  windParticles = []; speedLines = []; lensFlares = []; screenTears = []; dynamicFog = [];
  heatDistortions = []; starbursts = []; afterImages = []; gravityWaves = []; energyRipples = [];
  pixelDisplacements = [];
  // NEW 20 UNIQUE EFFECTS
  cosmicRays = []; plasmaOrbs = []; crystalShards = []; voidPortals = []; quantumFields = [];
  chronoSpheres = []; nebulaClouds = []; fractalVines = []; prismBeams = []; shadowEchoes = [];
  auroraWaves = []; singularityCores = []; matrixRain = []; bioLuminescence = []; dataStreams = [];
  electroFields = []; dimensionalRifts = []; sonicBooms = []; realityFractures = []; temporalEchoes = [];
  
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

  lastPlatformX = platforms[0].x + platforms[0].width;
  lastPlatformY = platforms[0].y;
  
  // Generate additional initial platforms
  const initialBlocksNeeded = 25;
  while(platforms.length < initialBlocksNeeded) {
    const out = generateBlockPlatform(lastPlatformX, lastPlatformY);
    lastPlatformX = out.x;
    lastPlatformY = out.y;
  }
  
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
      y, 
      width: BLOCK_SIZE, 
      height: BLOCK_SIZE, 
      color: {...platformColor}, 
      passed:false,
      pulsePhase: Math.random() * Math.PI * 2 // For platform pulse effect
    });
    if(Math.random() < 0.2){
      spikes.push({ 
        x: x + i*BLOCK_SIZE + BLOCK_SIZE*0.2, 
        y: y - BLOCK_SIZE + BLOCK_SIZE*0.2, 
        width: BLOCK_SIZE*0.6, 
        height: BLOCK_SIZE*0.6, 
        baseY: y - BLOCK_SIZE + BLOCK_SIZE*0.2, 
        hit:true, 
        passed:false 
      });
    }
  }

  // gems
  for(let i=0;i<blockCount;i++){
    if(Math.random() < 0.1 || gemEveryBlock){
      let gemX = x + i*BLOCK_SIZE + BLOCK_SIZE/4;
      let gemY = y - BLOCK_SIZE*1.5;
      let safe = true;
      for(let s of spikes){ if(Math.abs(gemX - s.x) < BLOCK_SIZE*2) safe=false; }
      if(safe) gems.push({ 
        x: gemX, 
        y: gemY, 
        size: 20, 
        collected:false, 
        floatOffset: Math.random()*Math.PI*2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1
      });
    }
  }

  return { x: x + blockCount*BLOCK_SIZE, y };
}

/* ---------- Collision helpers ---------- */
function checkSpikeCollision(spike){
  if(!spike.hit) return false;
  const hbW = player.width * player.hitboxScale;
  const hbH = player.height * player.hitboxScale;
  const hbX = player.x + (player.width - hbW)/2;
  const hbY = player.y + (player.height - hbH)/2;
  return hbX + hbW > spike.x && hbX < spike.x + spike.width && hbY + hbH > spike.y && hbY < spike.y + spike.height;
}

/* ========== FORWARD MOTION EFFECTS (5 effects that give sense of speed) ========== */

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
    ctx.fillRect(layer.x - cameraX * (0.1 * layer.depth), layer.y - cameraY * (0.1 * layer.depth), layer.width, layer.height);
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
  
  for(let i = 0; i < Math.floor(3 * runtime.advanced.speedLinesMul); i++){
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
  
  for(let i = 0; i < Math.floor(5 * runtime.advanced.windParticlesMul); i++){
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

/* ========== VISUAL ENHANCEMENT EFFECTS ========== */

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
  
  lensFlares.push({
    x: x,
    y: y,
    size: 30 * intensity * runtime.advanced.lensFlareMul,
    life: 30,
    alpha: 0.5,
    color: '#ffff88'
  });
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
    
    if(fog.life <= 0 || fog.x < player.x - 200){
      dynamicFog.splice(i, 1);
      continue;
    }
    
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
  ctx.restore();
}

/* 11. HEAT DISTORTION - Heat waves from friction */
function createHeatDistortion(x, y, intensity = 1){
  if(!runtime.heatDistortionEnabled) return;
  
  heatDistortions.push({
    x: x,
    y: y,
    radius: 0,
    maxRadius: 50 * intensity * runtime.advanced.heatDistortionMul,
    speed: 3,
    life: 1,
    alpha: 0.3
  });
}

function drawHeatDistortion(){
  if(!runtime.heatDistortionEnabled || heatDistortions.length === 0) return;
  
  ctx.save();
  for(let i = heatDistortions.length - 1; i >= 0; i--){
    const heat = heatDistortions[i];
    heat.radius += heat.speed;
    heat.life = 1 - (heat.radius / heat.maxRadius);
    
    if(heat.radius >= heat.maxRadius){
      heatDistortions.splice(i, 1);
      continue;
    }
    
    ctx.globalAlpha = heat.life * heat.alpha;
    ctx.strokeStyle = '#ffaa00';
    ctx.lineWidth = 2;
    
    // Draw wavy circle for heat effect
    ctx.beginPath();
    for(let angle = 0; angle < Math.PI * 2; angle += 0.1){
      const wave = Math.sin(angle * 5 + globalTime * 10) * 5;
      const rad = heat.radius + wave;
      const px = heat.x - cameraX + Math.cos(angle) * rad;
      const py = heat.y - cameraY + Math.sin(angle) * rad;
      
      if(angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

/* 12. COLOR BLEED - Color smearing effect */
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

/* 13. STARBURSTS - Explosive particle bursts */
function createStarburst(x, y, intensity = 1){
  if(!runtime.starburstsEnabled) return;
  
  for(let i = 0; i < Math.floor(10 * intensity * runtime.advanced.starburstsMul); i++){
    starbursts.push({
      x: x,
      y: y,
      angle: Math.random() * Math.PI * 2,
      distance: 0,
      maxDistance: Math.random() * 100 + 50,
      speed: Math.random() * 5 + 2,
      size: Math.random() * 3 + 1,
      life: 1,
      color: `hsl(${Math.random() * 60 + 300}, 100%, 70%)`
    });
  }
}

function updateStarbursts(){
  if(!runtime.starburstsEnabled) return;
  
  for(let i = starbursts.length - 1; i >= 0; i--){
    const burst = starbursts[i];
    burst.distance += burst.speed;
    burst.life = 1 - (burst.distance / burst.maxDistance);
    
    if(burst.distance >= burst.maxDistance){
      starbursts.splice(i, 1);
    }
  }
}

function drawStarbursts(){
  if(!runtime.starburstsEnabled || starbursts.length === 0) return;
  
  ctx.save();
  for(let burst of starbursts){
    const x = burst.x - cameraX + Math.cos(burst.angle) * burst.distance;
    const y = burst.y - cameraY + Math.sin(burst.angle) * burst.distance;
    
    ctx.globalAlpha = burst.life;
    ctx.fillStyle = burst.color;
    ctx.fillRect(x, y, burst.size, burst.size);
  }
  ctx.restore();
}

/* 14. AFTER IMAGES - Ghost images of fast-moving objects */
function createAfterImage(){
  if(!runtime.afterImagesEnabled || Math.random() > 0.3 * runtime.advanced.afterImagesMul) return;
  
  afterImages.push({
    x: player.x,
    y: player.y,
    width: player.width,
    height: player.height,
    alpha: 0.3,
    life: 20,
    color: player.color
  });
}

function updateAfterImages(){
  if(!runtime.afterImagesEnabled) return;
  
  for(let i = afterImages.length - 1; i >= 0; i--){
    const image = afterImages[i];
    image.life--;
    image.alpha *= 0.9;
    
    if(image.life <= 0 || image.alpha <= 0.01){
      afterImages.splice(i, 1);
    }
  }
}

function drawAfterImages(){
  if(!runtime.afterImagesEnabled || afterImages.length === 0) return;
  
  ctx.save();
  for(let image of afterImages){
    ctx.globalAlpha = image.alpha;
    ctx.fillStyle = image.color;
    ctx.fillRect(image.x - cameraX, image.y - cameraY, image.width, image.height);
  }
  ctx.restore();
}

/* 15. GRAVITY WAVES - Ripples in space-time */
function createGravityWave(x, y, intensity = 1){
  if(!runtime.gravityWavesEnabled) return;
  
  gravityWaves.push({
    x: x,
    y: y,
    radius: 0,
    maxRadius: 150 * intensity * runtime.advanced.gravityWavesMul,
    speed: 2,
    life: 1,
    alpha: 0.2,
    color: '#00ffff'
  });
}

function updateGravityWaves(){
  if(!runtime.gravityWavesEnabled) return;
  
  for(let i = gravityWaves.length - 1; i >= 0; i--){
    const wave = gravityWaves[i];
    wave.radius += wave.speed;
    wave.life = 1 - (wave.radius / wave.maxRadius);
    
    if(wave.radius >= wave.maxRadius){
      gravityWaves.splice(i, 1);
    }
  }
}

function drawGravityWaves(){
  if(!runtime.gravityWavesEnabled || gravityWaves.length === 0) return;
  
  ctx.save();
  for(let wave of gravityWaves){
    ctx.globalAlpha = wave.life * wave.alpha;
    ctx.strokeStyle = wave.color;
    ctx.lineWidth = 1;
    
    // Draw distorted circle for gravity wave
    ctx.beginPath();
    for(let angle = 0; angle < Math.PI * 2; angle += 0.2){
      const distortion = Math.sin(angle * 3 + globalTime * 5) * 10;
      const rad = wave.radius + distortion;
      const px = wave.x - cameraX + Math.cos(angle) * rad;
      const py = wave.y - cameraY + Math.sin(angle) * rad;
      
      if(angle === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

/* 16. ENERGY RIPPLES - Energy waves from player actions */
function createEnergyRipple(x, y, intensity = 1){
  if(!runtime.energyRipplesEnabled) return;
  
  energyRipples.push({
    x: x,
    y: y,
    radius: 0,
    maxRadius: 80 * intensity * runtime.advanced.energyRipplesMul,
    speed: 4,
    life: 1,
    color: '#00ff00',
    segments: Math.floor(Math.random() * 8 + 4)
  });
}

function updateEnergyRipples(){
  if(!runtime.energyRipplesEnabled) return;
  
  for(let i = energyRipples.length - 1; i >= 0; i--){
    const ripple = energyRipples[i];
    ripple.radius += ripple.speed;
    ripple.life = 1 - (ripple.radius / ripple.maxRadius);
    
    if(ripple.radius >= ripple.maxRadius){
      energyRipples.splice(i, 1);
    }
  }
}

function drawEnergyRipples(){
  if(!runtime.energyRipplesEnabled || energyRipples.length === 0) return;
  
  ctx.save();
  for(let ripple of energyRipples){
    ctx.globalAlpha = ripple.life * 0.5;
    ctx.strokeStyle = ripple.color;
    ctx.lineWidth = 2;
    
    // Draw segmented circle
    const segmentAngle = (Math.PI * 2) / ripple.segments;
    ctx.beginPath();
    
    for(let i = 0; i < ripple.segments; i++){
      const startAngle = i * segmentAngle;
      const endAngle = (i + 0.5) * segmentAngle;
      
      ctx.arc(
        ripple.x - cameraX, 
        ripple.y - cameraY, 
        ripple.radius, 
        startAngle, 
        endAngle
      );
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* 17. PIXEL DISPLACEMENT - Pixel shatter effect */
function createPixelDisplacement(x, y, intensity = 1){
  if(!runtime.pixelDisplacementEnabled) return;
  
  for(let i = 0; i < Math.floor(20 * intensity * runtime.advanced.pixelDisplacementMul); i++){
    pixelDisplacements.push({
      x: x + (Math.random() - 0.5) * 50,
      y: y + (Math.random() - 0.5) * 50,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      size: Math.random() * 4 + 1,
      life: Math.random() * 30 + 20,
      color: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
    });
  }
}

function updatePixelDisplacements(){
  if(!runtime.pixelDisplacementEnabled) return;
  
  for(let i = pixelDisplacements.length - 1; i >= 0; i--){
    const pixel = pixelDisplacements[i];
    pixel.x += pixel.vx;
    pixel.y += pixel.vy;
    pixel.vy += 0.1;
    pixel.life--;
    
    if(pixel.life <= 0){
      pixelDisplacements.splice(i, 1);
    }
  }
}

function drawPixelDisplacements(){
  if(!runtime.pixelDisplacementEnabled || pixelDisplacements.length === 0) return;
  
  ctx.save();
  for(let pixel of pixelDisplacements){
    ctx.globalAlpha = pixel.life / 50;
    ctx.fillStyle = pixel.color;
    ctx.fillRect(pixel.x - cameraX, pixel.y - cameraY, pixel.size, pixel.size);
  }
  ctx.restore();
}

/* 18. DEPTH OF FIELD - Blur based on distance */
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

/* 19. TIME DILATION - Slow motion effect on special events */
let timeScale = 1;
function applyTimeDilation(){
  if(!runtime.timeDilationEnabled || runtime.advanced.timeDilationMul < 0.1) return;
  
  // Random time dilation events
  if(Math.random() < 0.01 * runtime.advanced.timeDilationMul){
    timeScale = 0.3;
    setTimeout(() => {
      timeScale = 1;
    }, 300);
  }
}

/* 20. AMBIENT OCCLUSION - Soft shadows */
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

/* ---------- ENHANCED PARTICLE EFFECTS ---------- */
function spawnParticlesEarly(x, y, type, amountMul = 1) {
  const color = type === "jump" ? "#0ff" : type === "double" ? "#ff0" : "#fff";
  const baseCount = type === "land" ? 10 : 15;
  const count = Math.max(0, Math.floor(baseCount * amountMul * runtime.effects.jumpEffectMul));
  
  for(let i = 0; i < count; i++) {
    const vx = (Math.random() - 0.5) * (type === "land" ? 8 : 5);
    const vy = (Math.random() - (type === "land" ? 1 : 1.5)) * (type === "land" ? 4 : 5);
    particles.push({
      x: x + (Math.random() - 0.5) * (type === "land" ? 10 : 5),
      y: y + (Math.random() - 0.5) * (type === "land" ? 10 : 5),
      vx: vx,
      vy: vy,
      life: Math.random() * (type === "land" ? 25 : 30) + (type === "land" ? 15 : 20),
      color: color,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      size: Math.random() * 4 + 3
    });
  }
  
  // Add particle trails effect
  if(runtime.particleTrailsEnabled && Math.random() < 0.3 * runtime.advanced.particleTrailsMul) {
    for(let i = 0; i < Math.floor(count * 0.3); i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: 60,
        color: color,
        trail: []
      });
    }
  }
  
  // Add bloom particles for high quality
  if(runtime.bloomEnabled && Math.random() < 0.2 * runtime.advanced.bloomParticlesMul && type !== "land") {
    for(let i = 0; i < Math.floor(3 * runtime.advanced.bloomParticlesMul); i++) {
      bloomParticles.push({
        x: x,
        y: y,
        radius: Math.random() * 15 + 5,
        life: 30,
        color: color,
        alpha: 0.5
      });
    }
  }
  
  // Add starburst effect for high quality
  if(runtime.starburstsEnabled && type === "jump") {
    createStarburst(x, y, 0.5);
  }
  
  // Add impact wave for landing
  if(runtime.impactWavesEnabled && type === "land") {
    createImpactWave(x, y, 0.5);
  }
  
  // Add heat distortion for high speed jumps
  if(runtime.heatDistortionEnabled && type === "double") {
    createHeatDistortion(x, y, 0.3);
  }
  
  // Add after image for double jumps
  if(runtime.afterImagesEnabled && type === "double") {
    createAfterImage();
  }
}

/* ---------- ENHANCED DEATH ANIMATION ---------- */
function createCrashEarly(amountMul = 1) {
  const baseCount = 20;
  const count = Math.max(6, Math.floor(baseCount * amountMul * runtime.effects.dieEffectMul));
  
  for(let i = 0; i < count; i++) {
    crashPieces.push({
      x: player.x + Math.random() * player.width,
      y: player.y + Math.random() * player.height,
      vx: (Math.random() - 0.5) * 36,
      vy: (Math.random() - 1.2) * 24,
      ax: (Math.random() - 0.5) * 0.1,
      ay: (Math.random() - 0.5) * 0.1,
      size: Math.random() * player.width / 2 + 16,
      color: player.color,
      life: 120 + Math.random() * 60,
      rotation: Math.random() * Math.PI * 4,
      rotationSpeed: (Math.random() - 0.5) * 0.6,
      scale: 1,
      scaleSpeed: Math.random() * 0.02 + 0.01
    });
  }
  
  // Add shockwave effect
  if(runtime.shockwavesEnabled) {
    shockwaves.push({
      x: player.x + player.width/2,
      y: player.y + player.height/2,
      radius: 0,
      maxRadius: 400 * runtime.advanced.shockwavesMul,
      speed: 15 + 5 * runtime.advanced.shockwavesMul,
      life: 1,
      color: "#f00"
    });
  }
  
  // Add screen shake
  if(runtime.screenShakeEnabled) {
    screenShake = 30 * runtime.advanced.screenShakeMul;
  }
  
  // Add screen flash
  screenFlash = 20;
  
  // Add screen dust particles
  if(runtime.distortionEnabled) {
    for(let i = 0; i < Math.floor(30 * runtime.advanced.screenDistortionMul); i++) {
      screenDust.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 30 + Math.random() * 50,
        size: Math.random() * 3 + 1,
        color: `rgba(255,255,255,${Math.random() * 0.3 + 0.1})`
      });
    }
  }
  
  // Add starburst effect
  if(runtime.starburstsEnabled) {
    createStarburst(player.x + player.width/2, player.y + player.height/2, 2);
  }
  
  // Add gravity waves
  if(runtime.gravityWavesEnabled) {
    createGravityWave(player.x + player.width/2, player.y + player.height/2, 1.5);
  }
  
  // Add energy ripples
  if(runtime.energyRipplesEnabled) {
    createEnergyRipple(player.x + player.width/2, player.y + player.height/2, 1.5);
  }
  
  // Add pixel displacement
  if(runtime.pixelDisplacementEnabled) {
    createPixelDisplacement(player.x + player.width/2, player.y + player.height/2, 2);
  }
  
  // Add lens flare
  if(runtime.lensFlareEnabled) {
    createLensFlare(player.x + player.width/2, player.y + player.height/2, 2);
  }
}

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

/* ========== NEW 20 UNIQUE EFFECTS ========== */

// 21. COSMIC RAYS - Energetic particle beams from above
function createCosmicRays(){
  if(!runtime.cosmicRaysEnabled || cosmicRays.length > 15) return;

  cosmicRays.push({
    x: Math.random() * canvas.width + cameraX,
    y: -50,
    length: 100 + Math.random() * 200,
    angle: Math.PI/2 + (Math.random() - 0.5) * 0.5,
    life: 60,
    maxLife: 60,
    color: `hsl(${Math.random()*60 + 180}, 100%, 80%)`
  });
}

function drawCosmicRays(){
  if(!runtime.cosmicRaysEnabled || cosmicRays.length === 0) return;

  for(let i = cosmicRays.length - 1; i >= 0; i--){
    const ray = cosmicRays[i];
    ctx.save();
    ctx.strokeStyle = ray.color;
    ctx.lineWidth = 2;
    ctx.globalAlpha = ray.life / ray.maxLife;
    ctx.beginPath();
    ctx.moveTo(ray.x - cameraX, ray.y - cameraY);
    const endX = ray.x + Math.cos(ray.angle) * ray.length - cameraX;
    const endY = ray.y + Math.sin(ray.angle) * ray.length - cameraY;
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.restore();

    ray.life--;
    if(ray.life <= 0){
      cosmicRays.splice(i, 1);
    }
  }
}

// 22. PLASMA ORBS - Floating energy spheres
function createPlasmaOrbs(){
  if(!runtime.plasmaOrbsEnabled || plasmaOrbs.length > 10) return;

  plasmaOrbs.push({
    x: player.x + (Math.random() - 0.5) * 200,
    y: player.y + (Math.random() - 0.5) * 200,
    vx: (Math.random() - 0.5) * 4,
    vy: (Math.random() - 0.5) * 4,
    size: 5 + Math.random() * 15,
    life: 120,
    maxLife: 120,
    hue: Math.random() * 360
  });
}

function drawPlasmaOrbs(){
  if(!runtime.plasmaOrbsEnabled || plasmaOrbs.length === 0) return;

  for(let i = plasmaOrbs.length - 1; i >= 0; i--){
    const orb = plasmaOrbs[i];
    const alpha = orb.life / orb.maxLife;

    // Outer glow
    ctx.save();
    const gradient = ctx.createRadialGradient(
      orb.x - cameraX, orb.y - cameraY, 0,
      orb.x - cameraX, orb.y - cameraY, orb.size * 2
    );
    gradient.addColorStop(0, `hsla(${orb.hue}, 100%, 70%, ${alpha})`);
    gradient.addColorStop(1, `hsla(${orb.hue}, 100%, 50%, 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(orb.x - cameraX - orb.size * 2, orb.y - cameraY - orb.size * 2, orb.size * 4, orb.size * 4);
    ctx.restore();

    // Inner core
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = `hsl(${orb.hue}, 100%, 80%)`;
    ctx.beginPath();
    ctx.arc(orb.x - cameraX, orb.y - cameraY, orb.size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.vx *= 0.98;
    orb.vy *= 0.98;
    orb.life--;
    if(orb.life <= 0){
      plasmaOrbs.splice(i, 1);
    }
  }
}

// 23. CRYSTAL SHARDS - Geometric crystal fragments
function createCrystalShards(x, y, count = 5){
  if(!runtime.crystalShardsEnabled) return;

  for(let i = 0; i < count; i++){
    crystalShards.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: -Math.random() * 6 - 2,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.3,
      size: 3 + Math.random() * 5,
      life: 90,
      maxLife: 90,
      sides: 3 + Math.floor(Math.random() * 4), // 3-6 sides
      color: `hsl(${Math.random()*60 + 120}, 70%, 60%)`
    });
  }
}

function drawCrystalShards(){
  if(!runtime.crystalShardsEnabled || crystalShards.length === 0) return;

  for(let i = crystalShards.length - 1; i >= 0; i--){
    const shard = crystalShards[i];
    ctx.save();
    ctx.globalAlpha = shard.life / shard.maxLife;
    ctx.translate(shard.x - cameraX, shard.y - cameraY);
    ctx.rotate(shard.rotation);

    ctx.fillStyle = shard.color;
    ctx.strokeStyle = `hsl(${shard.color.match(/\d+/)[0]}, 70%, 40%)`;
    ctx.lineWidth = 1;

    ctx.beginPath();
    const angleStep = Math.PI * 2 / shard.sides;
    for(let j = 0; j < shard.sides; j++){
      const angle = j * angleStep;
      const radius = shard.size * (0.8 + Math.sin(angle * 2) * 0.2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if(j === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    shard.x += shard.vx;
    shard.y += shard.vy;
    shard.vy += 0.3; // gravity
    shard.rotation += shard.rotationSpeed;
    shard.life--;
    if(shard.life <= 0){
      crystalShards.splice(i, 1);
    }
  }
}

// 24. VOID PORTALS - Dark energy vortexes
function createVoidPortals(){
  if(!runtime.voidPortalsEnabled || voidPortals.length > 3) return;

  voidPortals.push({
    x: Math.random() * canvas.width + cameraX,
    y: Math.random() * canvas.height * 0.6 + cameraY,
    size: 20 + Math.random() * 30,
    rotation: 0,
    life: 180,
    maxLife: 180,
    pulse: 0
  });
}

function drawVoidPortals(){
  if(!runtime.voidPortalsEnabled || voidPortals.length === 0) return;

  for(let i = voidPortals.length - 1; i >= 0; i--){
    const portal = voidPortals[i];
    const alpha = portal.life / portal.maxLife;
    const pulseSize = portal.size * (1 + Math.sin(portal.pulse) * 0.3);

    ctx.save();
    ctx.globalAlpha = alpha * 0.7;
    ctx.translate(portal.x - cameraX, portal.y - cameraY);
    ctx.rotate(portal.rotation);

    // Outer dark ring
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, 'rgba(100,0,150,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
    ctx.fill();

    // Inner swirling pattern
    ctx.strokeStyle = 'rgba(150,0,200,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let j = 0; j < 8; j++){
      const angle = (j / 8) * Math.PI * 2 + portal.rotation;
      const innerRadius = pulseSize * 0.3;
      const outerRadius = pulseSize * 0.8;
      ctx.moveTo(Math.cos(angle) * innerRadius, Math.sin(angle) * innerRadius);
      ctx.lineTo(Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius);
    }
    ctx.stroke();
    ctx.restore();

    portal.rotation += 0.05;
    portal.pulse += 0.1;
    portal.life--;
    if(portal.life <= 0){
      voidPortals.splice(i, 1);
    }
  }
}

// 25. QUANTUM FIELDS - Probabilistic particle clouds
function createQuantumFields(){
  if(!runtime.quantumFieldsEnabled || quantumFields.length > 5) return;

  quantumFields.push({
    x: player.x + (Math.random() - 0.5) * 300,
    y: player.y + (Math.random() - 0.5) * 200,
    width: 50 + Math.random() * 100,
    height: 50 + Math.random() * 100,
    particles: [],
    life: 150,
    maxLife: 150
  });

  // Initialize particles
  const field = quantumFields[quantumFields.length - 1];
  for(let i = 0; i < 20; i++){
    field.particles.push({
      x: Math.random() * field.width,
      y: Math.random() * field.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      size: 1 + Math.random() * 2
    });
  }
}

function drawQuantumFields(){
  if(!runtime.quantumFieldsEnabled || quantumFields.length === 0) return;

  for(let i = quantumFields.length - 1; i >= 0; i--){
    const field = quantumFields[i];
    const alpha = field.life / field.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha * 0.3;
    ctx.fillStyle = 'rgba(0,200,255,0.1)';
    ctx.fillRect(field.x - cameraX, field.y - cameraY, field.width, field.height);

    // Draw particles
    ctx.fillStyle = 'rgba(0,200,255,0.8)';
    for(let particle of field.particles){
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Wrap around field boundaries
      if(particle.x < 0) particle.x = field.width;
      if(particle.x > field.width) particle.x = 0;
      if(particle.y < 0) particle.y = field.height;
      if(particle.y > field.height) particle.y = 0;

      ctx.beginPath();
      ctx.arc(field.x - cameraX + particle.x, field.y - cameraY + particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    field.life--;
    if(field.life <= 0){
      quantumFields.splice(i, 1);
    }
  }
}

// 26. CHRONO SPHERES - Time-manipulating orbs
function createChronoSpheres(){
  if(!runtime.chronoSpheresEnabled || chronoSpheres.length > 8) return;

  chronoSpheres.push({
    x: player.x + (Math.random() - 0.5) * 400,
    y: player.y - 100 - Math.random() * 200,
    vx: (Math.random() - 0.5) * 3,
    vy: 1 + Math.random() * 2,
    size: 8 + Math.random() * 12,
    life: 200,
    maxLife: 200,
    hue: 240 + Math.random() * 120
  });
}

function drawChronoSpheres(){
  if(!runtime.chronoSpheresEnabled || chronoSpheres.length === 0) return;

  for(let i = chronoSpheres.length - 1; i >= 0; i--){
    const sphere = chronoSpheres[i];
    const alpha = sphere.life / sphere.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;

    // Outer distortion ring
    const gradient = ctx.createRadialGradient(
      sphere.x - cameraX, sphere.y - cameraY, 0,
      sphere.x - cameraX, sphere.y - cameraY, sphere.size * 1.5
    );
    gradient.addColorStop(0, `hsla(${sphere.hue}, 80%, 60%, 0.8)`);
    gradient.addColorStop(0.7, `hsla(${sphere.hue}, 60%, 40%, 0.4)`);
    gradient.addColorStop(1, `hsla(${sphere.hue}, 40%, 20%, 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sphere.x - cameraX, sphere.y - cameraY, sphere.size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner core with clock-like markings
    ctx.strokeStyle = `hsl(${sphere.hue}, 90%, 80%)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sphere.x - cameraX, sphere.y - cameraY, sphere.size * 0.5, 0, Math.PI * 2);
    ctx.stroke();

    // Clock hands
    const time = Date.now() * 0.001;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sphere.x - cameraX, sphere.y - cameraY);
    ctx.lineTo(
      sphere.x - cameraX + Math.cos(time) * sphere.size * 0.3,
      sphere.y - cameraY + Math.sin(time) * sphere.size * 0.3
    );
    ctx.moveTo(sphere.x - cameraX, sphere.y - cameraY);
    ctx.lineTo(
      sphere.x - cameraX + Math.cos(time * 12) * sphere.size * 0.2,
      sphere.y - cameraY + Math.sin(time * 12) * sphere.size * 0.2
    );
    ctx.stroke();

    ctx.restore();

    sphere.x += sphere.vx;
    sphere.y += sphere.vy;
    sphere.vy += 0.1; // slight gravity
    sphere.life--;
    if(sphere.life <= 0){
      chronoSpheres.splice(i, 1);
    }
  }
}

// 27. NEBULA CLOUDS - Cosmic gas formations
function createNebulaClouds(){
  if(!runtime.nebulaCloudsEnabled || nebulaClouds.length > 4) return;

  nebulaClouds.push({
    x: Math.random() * canvas.width + cameraX,
    y: Math.random() * canvas.height * 0.5 + cameraY,
    width: 100 + Math.random() * 200,
    height: 60 + Math.random() * 100,
    density: 30 + Math.random() * 20,
    hue: Math.random() * 360,
    life: 300,
    maxLife: 300,
    drift: (Math.random() - 0.5) * 0.5
  });
}

function drawNebulaClouds(){
  if(!runtime.nebulaCloudsEnabled || nebulaClouds.length === 0) return;

  for(let i = nebulaClouds.length - 1; i >= 0; i--){
    const cloud = nebulaClouds[i];
    const alpha = cloud.life / cloud.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha * 0.4;

    // Draw nebula as soft, blended particles
    for(let j = 0; j < cloud.density; j++){
      const px = cloud.x + Math.random() * cloud.width;
      const py = cloud.y + Math.random() * cloud.height;
      const size = 2 + Math.random() * 8;

      const gradient = ctx.createRadialGradient(px - cameraX, py - cameraY, 0, px - cameraX, py - cameraY, size);
      gradient.addColorStop(0, `hsla(${cloud.hue + Math.random()*60}, 70%, 60%, ${0.3 + Math.random()*0.4})`);
      gradient.addColorStop(1, `hsla(${cloud.hue}, 50%, 30%, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(px - cameraX, py - cameraY, size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    cloud.x += cloud.drift;
    cloud.life--;
    if(cloud.life <= 0){
      nebulaClouds.splice(i, 1);
    }
  }
}

// 28. FRACTAL VINES - Recursive growth patterns
function createFractalVines(x, y, intensity = 1){
  if(!runtime.fractalVinesEnabled) return;

  function createVineSegment(startX, startY, angle, length, depth, maxDepth = 4){
    if(depth >= maxDepth || length < 5) return;

    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;

    fractalVines.push({
      x1: startX, y1: startY,
      x2: endX, y2: endY,
      life: 120 - depth * 20,
      maxLife: 120 - depth * 20,
      thickness: Math.max(1, 3 - depth),
      hue: 120 + depth * 30
    });

    // Branch out
    if(depth < maxDepth - 1){
      const branchAngle1 = angle + (Math.random() - 0.5) * 0.8;
      const branchAngle2 = angle - (Math.random() - 0.5) * 0.8;
      const newLength = length * (0.6 + Math.random() * 0.3);

      setTimeout(() => createVineSegment(endX, endY, branchAngle1, newLength, depth + 1, maxDepth), 50);
      if(Math.random() < 0.7){
        setTimeout(() => createVineSegment(endX, endY, branchAngle2, newLength, depth + 1, maxDepth), 50);
      }
    }
  }

  // Start with main stem
  createVineSegment(x, y, -Math.PI/2, 20 + intensity * 30, 0);
}

function drawFractalVines(){
  if(!runtime.fractalVinesEnabled || fractalVines.length === 0) return;

  for(let i = fractalVines.length - 1; i >= 0; i--){
    const vine = fractalVines[i];
    const alpha = vine.life / vine.maxLife;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = `hsl(${vine.hue}, 70%, 50%)`;
    ctx.lineWidth = vine.thickness;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(vine.x1 - cameraX, vine.y1 - cameraY);
    ctx.lineTo(vine.x2 - cameraX, vine.y2 - cameraY);
    ctx.stroke();
    ctx.restore();

    vine.life--;
    if(vine.life <= 0){
      fractalVines.splice(i, 1);
    }
  }
}

// 29. PRISM BEAMS - Light refraction effects
function createPrismBeams(x, y, intensity = 1){
  if(!runtime.prismBeamsEnabled) return;

  const beamCount = 3 + Math.floor(intensity * 3);
  for(let i = 0; i < beamCount; i++){
    prismBeams.push({
      x: x,
      y: y,
      angle: (i / beamCount) * Math.PI * 2,
      length: 50 + intensity * 100,
      width: 3 + intensity * 5,
      life: 45,
      maxLife: 45,
      hue: i * 60, // Different colors for each beam
      speed: 8 + intensity * 4
    });
  }
}

function drawPrismBeams(){
  if(!runtime.prismBeamsEnabled || prismBeams.length === 0) return;

  for(let i = prismBeams.length - 1; i >= 0; i--){
    const beam = prismBeams[i];
    const alpha = beam.life / beam.maxLife;
    const currentLength = beam.length * (beam.life / beam.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;

    // Create beam gradient
    const gradient = ctx.createLinearGradient(
      beam.x - cameraX, beam.y - cameraY,
      beam.x - cameraX + Math.cos(beam.angle) * currentLength,
      beam.y - cameraY + Math.sin(beam.angle) * currentLength
    );
    gradient.addColorStop(0, `hsla(${beam.hue}, 100%, 80%, 0.8)`);
    gradient.addColorStop(1, `hsla(${beam.hue}, 100%, 60%, 0)`);

    ctx.strokeStyle = gradient;
    ctx.lineWidth = beam.width;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(beam.x - cameraX, beam.y - cameraY);
    ctx.lineTo(
      beam.x - cameraX + Math.cos(beam.angle) * currentLength,
      beam.y - cameraY + Math.sin(beam.angle) * currentLength
    );
    ctx.stroke();
    ctx.restore();

    beam.life--;
    if(beam.life <= 0){
      prismBeams.splice(i, 1);
    }
  }
}

// 30. SHADOW ECHOES - Delayed shadow duplicates
function createShadowEchoes(x, y, intensity = 1){
  if(!runtime.shadowEchoesEnabled) return;

  for(let i = 0; i < 3 + intensity * 2; i++){
    shadowEchoes.push({
      x: x,
      y: y,
      delay: i * 8,
      life: 60,
      maxLife: 60,
      alpha: 0.6 - i * 0.15,
      scale: 1 - i * 0.1
    });
  }
}

function drawShadowEchoes(){
  if(!runtime.shadowEchoesEnabled || shadowEchoes.length === 0) return;

  for(let i = shadowEchoes.length - 1; i >= 0; i--){
    const echo = shadowEchoes[i];

    if(echo.delay > 0){
      echo.delay--;
      continue;
    }

    const alpha = echo.alpha * (echo.life / echo.maxLife);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(0,0,0,0.7)';

    // Draw player shadow
    ctx.save();
    ctx.scale(echo.scale, echo.scale);
    ctx.fillRect(
      (echo.x - player.width/2 * echo.scale) - cameraX,
      (echo.y - player.height/2 * echo.scale) - cameraY,
      player.width * echo.scale,
      player.height * echo.scale
    );
    ctx.restore();
    ctx.restore();

    echo.life--;
    if(echo.life <= 0){
      shadowEchoes.splice(i, 1);
    }
  }
}

// 31-40: Additional effects (simplified implementations)
function createAuroraWaves(){ if(!runtime.auroraWavesEnabled || auroraWaves.length > 3) return;
  auroraWaves.push({x: player.x, y: player.y - 100, width: 200, height: 20, life: 120, hue: Math.random()*60+180}); }
function drawAuroraWaves(){
  if(!runtime.auroraWavesEnabled || auroraWaves.length === 0) return;
  for(let i = auroraWaves.length - 1; i >= 0; i--){ const wave = auroraWaves[i];
    ctx.save(); ctx.globalAlpha = wave.life/120; ctx.fillStyle = `hsl(${wave.hue}, 70%, 60%)`;
    ctx.fillRect(wave.x - cameraX, wave.y - cameraY, wave.width, wave.height); ctx.restore();
    wave.life--; if(wave.life <= 0) auroraWaves.splice(i, 1); }}

function createSingularityCores(){ if(!runtime.singularityCoresEnabled || singularityCores.length > 2) return;
  singularityCores.push({x: player.x, y: player.y, size: 15, life: 180, rotation: 0}); }
function drawSingularityCores(){
  if(!runtime.singularityCoresEnabled || singularityCores.length === 0) return;
  for(let i = singularityCores.length - 1; i >= 0; i--){ const core = singularityCores[i];
    ctx.save(); ctx.translate(core.x - cameraX, core.y - cameraY); ctx.rotate(core.rotation);
    ctx.globalAlpha = core.life/180; ctx.fillStyle = '#000'; ctx.fillRect(-core.size, -core.size, core.size*2, core.size*2);
    ctx.fillStyle = '#fff'; ctx.fillRect(-2, -2, 4, 4); ctx.restore();
    core.rotation += 0.1; core.life--; if(core.life <= 0) singularityCores.splice(i, 1); }}

function createMatrixRain(){ if(!runtime.matrixRainEnabled || matrixRain.length > 50) return;
  matrixRain.push({x: Math.random()*canvas.width + cameraX, y: -10, speed: 2+Math.random()*3, life: 200}); }
function drawMatrixRain(){
  if(!runtime.matrixRainEnabled || matrixRain.length === 0) return;
  for(let i = matrixRain.length - 1; i >= 0; i--){ const drop = matrixRain[i];
    ctx.save(); ctx.fillStyle = '#0f0'; ctx.font = '12px monospace'; ctx.fillText('0', drop.x - cameraX, drop.y - cameraY); ctx.restore();
    drop.y += drop.speed; drop.life--; if(drop.life <= 0) matrixRain.splice(i, 1); }}

function createBioLuminescence(){ if(!runtime.bioLuminescenceEnabled || bioLuminescence.length > 15) return;
  bioLuminescence.push({x: player.x + (Math.random()-0.5)*300, y: player.y + (Math.random()-0.5)*200, size: 5+Math.random()*10, life: 100, hue: Math.random()*120+60}); }
function drawBioLuminescence(){
  if(!runtime.bioLuminescenceEnabled || bioLuminescence.length === 0) return;
  for(let i = bioLuminescence.length - 1; i >= 0; i--){ const blob = bioLuminescence[i];
    ctx.save(); ctx.globalAlpha = blob.life/100; ctx.fillStyle = `hsl(${blob.hue}, 80%, 50%)`; ctx.beginPath();
    ctx.arc(blob.x - cameraX, blob.y - cameraY, blob.size, 0, Math.PI*2); ctx.fill(); ctx.restore();
    blob.life--; if(blob.life <= 0) bioLuminescence.splice(i, 1); }}

function createDataStreams(){ if(!runtime.dataStreamsEnabled || dataStreams.length > 8) return;
  dataStreams.push({x: player.x, y: player.y - 50, length: 100, life: 150, data: Math.random().toString(36).substring(2,8)}); }
function drawDataStreams(){
  if(!runtime.dataStreamsEnabled || dataStreams.length === 0) return;
  for(let i = dataStreams.length - 1; i >= 0; i--){ const stream = dataStreams[i];
    ctx.save(); ctx.fillStyle = '#0ff'; ctx.font = '10px monospace'; ctx.fillText(stream.data, stream.x - cameraX, stream.y - cameraY); ctx.restore();
    stream.y -= 1; stream.life--; if(stream.life <= 0) dataStreams.splice(i, 1); }}

function createElectroFields(){ if(!runtime.electroFieldsEnabled || electroFields.length > 6) return;
  electroFields.push({x: player.x, y: player.y, radius: 30+Math.random()*40, life: 80, arcs: []});
  for(let j = 0; j < 5; j++){ electroFields[electroFields.length-1].arcs.push({angle: Math.random()*Math.PI*2, length: Math.random()*0.8+0.2}); }}
function drawElectroFields(){
  if(!runtime.electroFieldsEnabled || electroFields.length === 0) return;
  for(let i = electroFields.length - 1; i >= 0; i--){ const field = electroFields[i];
    ctx.save(); ctx.strokeStyle = '#0ff'; ctx.lineWidth = 2; ctx.globalAlpha = field.life/80;
    for(let arc of field.arcs){ ctx.beginPath(); ctx.arc(field.x - cameraX, field.y - cameraY, field.radius * arc.length, arc.angle, arc.angle + 0.5); ctx.stroke(); }
    ctx.restore(); field.life--; if(field.life <= 0) electroFields.splice(i, 1); }}

function createDimensionalRifts(){ if(!runtime.dimensionalRiftsEnabled || dimensionalRifts.length > 3) return;
  dimensionalRifts.push({x: player.x + (Math.random()-0.5)*400, y: player.y + (Math.random()-0.5)*300, width: 20+Math.random()*30, height: 60+Math.random()*40, life: 120}); }
function drawDimensionalRifts(){
  if(!runtime.dimensionalRiftsEnabled || dimensionalRifts.length === 0) return;
  for(let i = dimensionalRifts.length - 1; i >= 0; i--){ const rift = dimensionalRifts[i];
    ctx.save(); ctx.globalAlpha = rift.life/120; ctx.fillStyle = '#800080'; ctx.fillRect(rift.x - cameraX, rift.y - cameraY, rift.width, rift.height);
    ctx.strokeStyle = '#ff00ff'; ctx.lineWidth = 2; ctx.strokeRect(rift.x - cameraX, rift.y - cameraY, rift.width, rift.height); ctx.restore();
    rift.life--; if(rift.life <= 0) dimensionalRifts.splice(i, 1); }}

function createSonicBooms(){ if(!runtime.sonicBoomsEnabled || sonicBooms.length > 4) return;
  sonicBooms.push({x: player.x, y: player.y, radius: 0, maxRadius: 100+Math.random()*100, life: 60}); }
function drawSonicBooms(){
  if(!runtime.sonicBoomsEnabled || sonicBooms.length === 0) return;
  for(let i = sonicBooms.length - 1; i >= 0; i--){ const boom = sonicBooms[i]; boom.radius = boom.maxRadius * (1 - boom.life/60);
    ctx.save(); ctx.strokeStyle = `rgba(255,255,0,${boom.life/60})`; ctx.lineWidth = 3; ctx.beginPath();
    ctx.arc(boom.x - cameraX, boom.y - cameraY, boom.radius, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    boom.life--; if(boom.life <= 0) sonicBooms.splice(i, 1); }}

function createRealityFractures(){ if(!runtime.realityFracturesEnabled || realityFractures.length > 5) return;
  realityFractures.push({x: player.x + (Math.random()-0.5)*200, y: player.y + (Math.random()-0.5)*200, cracks: [], life: 100});
  for(let j = 0; j < 3+Math.random()*3; j++){ realityFractures[realityFractures.length-1].cracks.push({
    startX: Math.random()*50-25, startY: Math.random()*50-25, endX: Math.random()*50-25, endY: Math.random()*50-25}); }}
function drawRealityFractures(){
  if(!runtime.realityFracturesEnabled || realityFractures.length === 0) return;
  for(let i = realityFractures.length - 1; i >= 0; i--){ const fracture = realityFractures[i];
    ctx.save(); ctx.strokeStyle = `rgba(255,0,255,${fracture.life/100})`; ctx.lineWidth = 2;
    for(let crack of fracture.cracks){ ctx.beginPath(); ctx.moveTo(fracture.x + crack.startX - cameraX, fracture.y + crack.startY - cameraY);
    ctx.lineTo(fracture.x + crack.endX - cameraX, fracture.y + crack.endY - cameraY); ctx.stroke(); } ctx.restore();
    fracture.life--; if(fracture.life <= 0) realityFractures.splice(i, 1); }}

function createTemporalEchoes(){ if(!runtime.temporalEchoesEnabled || temporalEchoes.length > 6) return;
  temporalEchoes.push({x: player.x, y: player.y, delay: 0, life: 90, echoes: []});
  for(let j = 0; j < 4; j++){ temporalEchoes[temporalEchoes.length-1].echoes.push({x: player.x, y: player.y, life: 60 - j*10}); }}
function drawTemporalEchoes(){
  if(!runtime.temporalEchoesEnabled || temporalEchoes.length === 0) return;
  for(let i = temporalEchoes.length - 1; i >= 0; i--){ const echo = temporalEchoes[i];
    ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = '#0080ff';
    for(let j = echo.echoes.length - 1; j >= 0; j--){ const e = echo.echoes[j];
      if(e.life > 0){ ctx.globalAlpha = e.life/60 * 0.4; ctx.fillRect(e.x - cameraX - 25, e.y - cameraY - 25, 50, 50); e.life--; }}
    ctx.restore(); echo.life--; if(echo.life <= 0) temporalEchoes.splice(i, 1); }}

/* ---------- Input handling ---------- */
window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if(["KeyW","ArrowUp","Space"].includes(e.code)) jump();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('mousedown', () => jump());
window.addEventListener('touchstart', () => jump());

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

    // Create some new effects on jump
    if(Math.random() < 0.3) createCosmicRays();
    if(Math.random() < 0.2) createPlasmaOrbs();
    if(Math.random() < 0.4) createCrystalShards(player.x + player.width/2, player.y + player.height/2, 2);
    if(Math.random() < 0.1) createVoidPortals();
    if(Math.random() < 0.15) createQuantumFields();
    if(Math.random() < 0.25) createChronoSpheres();
    if(Math.random() < 0.2) createNebulaClouds();
    if(Math.random() < 0.3) createFractalVines(player.x, player.y + player.height, 1);
    if(Math.random() < 0.2) createPrismBeams(player.x + player.width/2, player.y + player.height/2, 1);
    createShadowEchoes(player.x, player.y, 1);

    // Small screen shake on jump for high quality
    if(runtime.screenShakeEnabled && runtime.advanced.screenShakeMul > 0.5) {
      screenShake = 3 * runtime.advanced.screenShakeMul;
    }

    // UNIQUE SECOND JUMP EFFECTS (only trigger when jumpsLeft was 1 before decrement)
    if(player.jumpsLeft === 1) { // This means it was a second jump (was 2, now 1)
      // Energy ripples around player
      if(runtime.energyRipplesEnabled) {
        createEnergyRipples(player.x + player.width/2, player.y + player.height/2, 1);
      }

      // Pixel displacement effect
      if(runtime.pixelDisplacementEnabled) {
        pixelDisplacements.push({
          x: player.x + player.width/2,
          y: player.y + player.height/2,
          intensity: 2,
          life: 30,
          maxLife: 30
        });
      }

      // Screen tear effect
      if(runtime.screenTearEnabled) {
        createScreenTear();
      }

      // Starburst effect
      if(runtime.starburstsEnabled) {
        createStarbursts(player.x + player.width/2, player.y + player.height/2, 1);
      }

      // After image trail
      if(runtime.afterImagesEnabled) {
        createAfterImage();
      }
    }
  }
}

/* ---------- OPTIMIZED MEMORY MANAGEMENT ---------- */
function cleanupOffScreenObjects() {
  // Keep first 25 blocks (index 0-24) regardless of position, and NEVER delete the spawning ground (index 0)
  const MIN_KEEP_BLOCKS = 25;

  // Clean up platforms that are 6 blocks off-screen to the left, but keep first 25 and NEVER delete spawning ground
  const deleteThreshold = cameraX - DELETE_OFFSET;

  for(let i = platforms.length - 1; i >= MIN_KEEP_BLOCKS; i--) { // Start from MIN_KEEP_BLOCKS
    if(platforms[i].x + platforms[i].width < deleteThreshold && i > 0) { // Never delete spawning ground (index 0)
      platforms.splice(i, 1);
    }
  }
  
  // Clean up spikes (keep spikes associated with first 25 blocks)
  for(let i = spikes.length - 1; i >= 0; i--) {
    if(spikes[i].x + spikes[i].width < deleteThreshold) {
      spikes.splice(i, 1);
    }
  }
  
  // Clean up gems (keep gems associated with first 25 blocks)
  for(let i = gems.length - 1; i >= 0; i--) {
    if(gems[i].x + 20 < deleteThreshold) {
      gems.splice(i, 1);
    }
  }
  
  // Clean up particles
  for(let i = particles.length - 1; i >= 0; i--) {
    if(particles[i].life <= 0 || particles[i].x < deleteThreshold) {
      particles.splice(i, 1);
    }
  }
  
  // Clean up lines that are far behind the player
  const lineDeleteThreshold = cameraX - DELETE_OFFSET * 2;
  for(let i = lines.length - 1; i >= 0; i--) {
    if(lines[i].x + lines[i].width < lineDeleteThreshold) {
      lines.splice(i, 1);
    }
  }
  
  // Clean up shockwaves
  for(let i = shockwaves.length - 1; i >= 0; i--) {
    if(shockwaves[i].life <= 0) {
      shockwaves.splice(i, 1);
    }
  }
  
  // Clean up screen dust
  for(let i = screenDust.length - 1; i >= 0; i--) {
    if(screenDust[i].life <= 0) {
      screenDust.splice(i, 1);
    }
  }
  
  // Clean up bloom particles
  for(let i = bloomParticles.length - 1; i >= 0; i--) {
    if(bloomParticles[i].life <= 0) {
      bloomParticles.splice(i, 1);
    }
  }
  
  // Clean up velocity streaks
  for(let i = velocityStreaks.length - 1; i >= 0; i--) {
    if(velocityStreaks[i].life <= 0) {
      velocityStreaks.splice(i, 1);
    }
  }
  
  // Clean up speed lines
  for(let i = speedLines.length - 1; i >= 0; i--) {
    if(speedLines[i].life <= 0) {
      speedLines.splice(i, 1);
    }
  }
  
  // Clean up wind particles
  for(let i = windParticles.length - 1; i >= 0; i--) {
    if(windParticles[i].life <= 0 || windParticles[i].x < deleteThreshold) {
      windParticles.splice(i, 1);
    }
  }
  
  // Clean up impact waves
  for(let i = impactWaves.length - 1; i >= 0; i--) {
    if(impactWaves[i].life <= 0) {
      impactWaves.splice(i, 1);
    }
  }
  
  // Clean up lens flares
  for(let i = lensFlares.length - 1; i >= 0; i--) {
    if(lensFlares[i].life <= 0) {
      lensFlares.splice(i, 1);
    }
  }
  
  // Clean up dynamic fog
  for(let i = dynamicFog.length - 1; i >= 0; i--) {
    if(dynamicFog[i].life <= 0) {
      dynamicFog.splice(i, 1);
    }
  }
  
  // Clean up heat distortions
  for(let i = heatDistortions.length - 1; i >= 0; i--) {
    if(heatDistortions[i].life <= 0) {
      heatDistortions.splice(i, 1);
    }
  }
  
  // Clean up starbursts
  for(let i = starbursts.length - 1; i >= 0; i--) {
    if(starbursts[i].life <= 0) {
      starbursts.splice(i, 1);
    }
  }
  
  // Clean up after images
  for(let i = afterImages.length - 1; i >= 0; i--) {
    if(afterImages[i].life <= 0) {
      afterImages.splice(i, 1);
    }
  }
  
  // Clean up gravity waves
  for(let i = gravityWaves.length - 1; i >= 0; i--) {
    if(gravityWaves[i].life <= 0) {
      gravityWaves.splice(i, 1);
    }
  }
  
  // Clean up energy ripples
  for(let i = energyRipples.length - 1; i >= 0; i--) {
    if(energyRipples[i].life <= 0) {
      energyRipples.splice(i, 1);
    }
  }
  
  // Clean up pixel displacements
  for(let i = pixelDisplacements.length - 1; i >= 0; i--) {
    if(pixelDisplacements[i].life <= 0) {
      pixelDisplacements.splice(i, 1);
    }
  }
}

/* ---------- Fixed TICK SYSTEM (always 60 TPS internally) ---------- */
function gameTick() {
  if(!gameRunning || !player.visible) return;
  
  player.speed += 0.002;

  // color cycling
  colorLerp += 1/25/TICKS_PER_SECOND;
  if(colorLerp >= 1){
    colorIndex = (colorIndex + 1) % baseColors.length;
    nextColor = baseColors[(colorIndex+1) % baseColors.length];
    colorLerp = 0;
  }
  platformColor = lerpColor(baseColors[colorIndex], nextColor, colorLerp);

  // FIXED PHYSICS: No delta time scaling - runs at fixed 60 TPS
  player.y += player.vy * player.vertMultiplier;
  if(cheats.float && player.vy > 0) player.vy *= 0.5;
  player.vy += GRAVITY * player.vertMultiplier;
  player.x += player.speed * player.horizMultiplier;

  // platform collision
  player.onGround = false;
  for(let plat of platforms){
    if(player.x + player.width > plat.x && player.x < plat.x + plat.width &&
       player.y + player.height > plat.y && player.y + player.height < plat.y + plat.height + player.vy + 1){
      if(player.vy >= 0){
        player.y = plat.y - player.height;
        player.vy = 0;
        player.onGround = true;
        player.jumpsLeft = 2;
        spawnParticlesEarly(player.x + player.width/2, player.y + player.height, "land", runtime.effects.walkEffectMul);
        
        // Create impact wave on landing
        if(runtime.impactWavesEnabled) {
          createImpactWave(player.x + player.width/2, player.y + player.height, 0.3);
        }
      }
    }
    if(!plat.passed && player.x > plat.x + plat.width){
      score += 1;
      plat.passed = true;
      
      // Pulse platform when passed
      if(runtime.platformPulseEnabled) {
        plat.pulsePhase += Math.PI;
      }
    }
  }

  if(player.y > canvas.height + 300){
    player.jumpsLeft = 1;
    tryDie();
  }

  // spikes
  for(let s of spikes){
    if(checkSpikeCollision(s)) tryDie(s);
    if(!s.passed && player.x > s.x + s.width){
      score += 1; s.passed = true;
    }
  }

  // gems
  for(let g of gems){
    if(!g.collected && player.x + player.width > g.x && player.x < g.x + g.size && player.y + player.height > g.y && player.y < g.y + g.size){
      score += 50; g.collected = true;
      spawnParticlesEarly(g.x + g.size/2, g.y + g.size/2, "double", runtime.effects.jumpEffectMul);
      
      // Add rotation to gem
      g.rotation += g.rotationSpeed || 0;
      
      // Create lens flare on gem collect
      if(runtime.lensFlareEnabled) {
        createLensFlare(g.x + g.size/2, g.y + g.size/2, 0.5);
      }
      
      // Create energy ripple on gem collect
      if(runtime.energyRipplesEnabled) {
        createEnergyRipple(g.x + g.size/2, g.y + g.size/2, 0.5);
      }
      
      // Screen shake on gem collect
      if(runtime.screenShakeEnabled) {
        screenShake = 8 * runtime.advanced.screenShakeMul;
      }
    }
  }

  // generation
  const lastPlatform = platforms[platforms.length - 1];
  if(lastPlatform && lastPlatform.x < player.x + canvas.width){
    const out = generateBlockPlatform(lastPlatform.x, lastPlatform.y);
    lastPlatformX = out.x; lastPlatformY = out.y;
  }

  addLine();

  // Update all visual effects
  updateParallaxLayers();
  updateVelocityStreaks();
  updateSpeedLines();
  updateWindParticles();
  updatePlatformPulse();
  updateImpactWaves();
  updateLensFlares();
  updateDynamicFog();
  updateStarbursts();
  updateAfterImages();
  updateGravityWaves();
  updateEnergyRipples();
  updatePixelDisplacements();
  applyTimeDilation();

  // Create ambient new effects
  if(Math.random() < 0.005) createAuroraWaves();
  if(Math.random() < 0.003) createSingularityCores();
  if(Math.random() < 0.01) createMatrixRain();
  if(Math.random() < 0.008) createBioLuminescence();
  if(Math.random() < 0.006) createDataStreams();
  if(Math.random() < 0.004) createElectroFields();
  if(Math.random() < 0.002) createDimensionalRifts();
  if(Math.random() < 0.007) createSonicBooms();
  if(Math.random() < 0.009) createRealityFractures();
  if(Math.random() < 0.005) createTemporalEchoes();

  // update crash pieces with enhanced physics
  for(let i=crashPieces.length-1;i>=0;i--){
    const p = crashPieces[i];
    p.vx += p.ax || 0;
    p.vy += (p.ay || 0) + GRAVITY * 0.3;
    p.x += p.vx; 
    p.y += p.vy;
    p.rotation += p.rotationSpeed || 0;
    p.scale -= p.scaleSpeed || 0;
    p.life--;
    
    if(p.life <= 0 || p.y > canvas.height + 200 || p.scale <= 0) {
      crashPieces.splice(i,1);
    }
  }

  // update particles with rotation
  for(let i=particles.length-1;i>=0;i--){
    const p = particles[i];
    p.x += p.vx; 
    p.y += p.vy;
    p.rotation += p.rotationSpeed || 0;
    p.life--;
    
    // Add trail to trail particles
    if(p.trail) {
      p.trail.push({x: p.x, y: p.y});
      if(p.trail.length > 5) p.trail.shift();
    }
    
    if(p.life <= 0) {
      particles.splice(i,1);
    }
  }
  
  // update lines array movement
  for(let i=lines.length-1;i>=0;i--){
    const l = lines[i];
    // Lines move left very fast (relative to player speed)
    l.x -= l.speed; // Use the speed stored in the line object
  }
  
  // update shockwaves
  for(let i=shockwaves.length-1;i>=0;i--){
    const s = shockwaves[i];
    s.radius += s.speed;
    s.life = 1 - (s.radius / s.maxRadius);
    
    if(s.radius >= s.maxRadius) {
      shockwaves.splice(i,1);
    }
  }
  
  // update screen shake
  if(screenShake > 0) {
    screenShake *= 0.85;
    if(screenShake < 0.1) screenShake = 0;
  }
  
  // update screen flash
  if(screenFlash > 0) {
    screenFlash *= 0.9;
  }
  
  // update screen dust
  for(let i=screenDust.length-1;i>=0;i--){
    const d = screenDust[i];
    d.x += d.vx;
    d.y += d.vy;
    d.life--;
    
    if(d.life <= 0) {
      screenDust.splice(i,1);
    }
  }
  
  // update bloom particles
  for(let i=bloomParticles.length-1;i>=0;i--){
    const b = bloomParticles[i];
    b.life--;
    b.alpha *= 0.95;
    
    if(b.life <= 0 || b.alpha <= 0.01) {
      bloomParticles.splice(i,1);
    }
  }
  
  // MEMORY MANAGEMENT: Clean up off-screen objects
  cleanupOffScreenObjects();
}

/* ---------- Death / tryDie ---------- */
function tryDie(spike){
  if(!player.visible) return;
  if(cheats.invincible) return;
  if(player.onGround || player.vy > 0){
    player.visible = false;
    if(spike) spike.hit = false;
    createCrashEarly(runtime.effects.dieEffectMul);
    gameRunning = false;
    if(score > bestScore){
      bestScore = Math.floor(score);
      localStorage.setItem('bestScore', bestScore);
    }
    setTimeout(()=> {
      document.getElementById('menu').style.display = 'flex';
      document.getElementById('bestScore').innerText = 'Best Score: ' + bestScore;
    }, 1200);
  }
}

/* ---------- Rendering ---------- */
let lastRenderTime = performance.now();
let fps = 0;
let frameCount = 0;
let lastFpsDisplayUpdate = performance.now();

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
  
  // Draw screen dust distortion
  if(runtime.distortionEnabled && screenDust.length > 0) {
    for(let d of screenDust) {
      ctx.globalAlpha = d.life / 100;
      ctx.fillStyle = d.color;
      ctx.fillRect(d.x, d.y, d.size, d.size);
    }
    ctx.globalAlpha = 1;
  }
  
  // Apply time dilation effect
  if(runtime.timeDilationEnabled && timeScale < 1) {
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;
  }

  // background (plain)
  ctx.fillStyle = "#000";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // Draw parallax layers first (background)
  drawParallaxLayers();
  
  // Draw dynamic fog
  drawDynamicFog();

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
  drawVelocityStreaks();
  
  // Draw speed lines
  drawSpeedLines();
  
  // Draw wind particles
  drawWindParticles();

  // Draw new effects
  if(runtime.cosmicRaysEnabled) drawCosmicRays();
  if(runtime.plasmaOrbsEnabled) drawPlasmaOrbs();
  if(runtime.crystalShardsEnabled) drawCrystalShards();
  if(runtime.voidPortalsEnabled) drawVoidPortals();
  if(runtime.quantumFieldsEnabled) drawQuantumFields();
  if(runtime.chronoSpheresEnabled) drawChronoSpheres();
  if(runtime.nebulaCloudsEnabled) drawNebulaClouds();
  if(runtime.fractalVinesEnabled) drawFractalVines();
  if(runtime.prismBeamsEnabled) drawPrismBeams();
  if(runtime.shadowEchoesEnabled) drawShadowEchoes();
  if(runtime.auroraWavesEnabled) drawAuroraWaves();
  if(runtime.singularityCoresEnabled) drawSingularityCores();
  if(runtime.matrixRainEnabled) drawMatrixRain();
  if(runtime.bioLuminescenceEnabled) drawBioLuminescence();
  if(runtime.dataStreamsEnabled) drawDataStreams();
  if(runtime.electroFieldsEnabled) drawElectroFields();
  if(runtime.dimensionalRiftsEnabled) drawDimensionalRifts();
  if(runtime.sonicBoomsEnabled) drawSonicBooms();
  if(runtime.realityFracturesEnabled) drawRealityFractures();
  if(runtime.temporalEchoesEnabled) drawTemporalEchoes();

  // Draw ambient occlusion first (shadows)
  applyAmbientOcclusion();

  // Draw depth of field (blur distant objects)
  applyDepthOfField();

  // platforms
  for(let plat of platforms){
    // Block texture: true = gradient texture (left-top color, right-bottom black), false = solid color only
    const useTexture = runtime.effects.blockTextureEnabled;
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

  // spikes
  for(let s of spikes){
    let pulse = Math.sin(globalTime*5 + s.x) * 5;
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.moveTo(s.x - cameraX, s.baseY + s.height - cameraY + pulse);
    ctx.lineTo(s.x - cameraX + s.width/2, s.baseY - cameraY + pulse);
    ctx.lineTo(s.x - cameraX + s.width, s.baseY + s.height - cameraY + pulse);
    ctx.closePath();
    ctx.fill();
  }

  // gems
  for(let g of gems){
    if(g.collected) continue;
    g.floatOffset = g.floatOffset || Math.random()*Math.PI*2;
    let floatY = Math.sin(globalTime*3 + g.floatOffset) * 5;
    ctx.save();
    ctx.translate(g.x + g.size/2 - cameraX, g.y + g.size/2 - cameraY + floatY);
    ctx.rotate(g.rotation || 0);
    ctx.fillStyle = "white";
    if(runtime.glowEnabled){ ctx.shadowColor = "white"; ctx.shadowBlur = 20 + 10 * Math.sin(globalTime*5); }
    ctx.fillRect(-g.size/2, -g.size/2, g.size, g.size);
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  // Draw heat distortion
  drawHeatDistortion();
  
  // Draw gravity waves
  drawGravityWaves();
  
  // Draw energy ripples
  drawEnergyRipples();
  
  // Draw pixel displacements
  drawPixelDisplacements();
  
  // Draw starbursts
  drawStarbursts();
  
  // Draw impact waves
  drawImpactWaves();
  
  // Draw lens flares
  drawLensFlares();
  
  // Draw after images
  drawAfterImages();

  /* ---------- TRAIL EFFECT ---------- */
  if(player.visible && runtime.trailEnabled){
    // Add new trail position
    trail.push({ 
      x: player.x, 
      y: player.y, 
      width: player.width, 
      height: player.height, 
      color: player.color,
      age: 0, // Start at age 0
      alpha: 0.6 // Start with some transparency
    });
    
    // Update ages and alpha of existing trails
    for(let i = 0; i < trail.length; i++) {
      const t = trail[i];
      t.age++;
      
      // Smooth fade over time - decrease alpha gradually
      // Start fading after 3 ticks, fade over 30 ticks total
      if(t.age > 3) {
        const fadeProgress = (t.age - 3) / 20;
        t.alpha = 0.6 * (1 - fadeProgress); // Linear fade from 0.6 to 0
      }
    }
    
    // Remove trails that are completely faded
    for(let i = trail.length - 1; i >= 0; i--) {
      if(trail[i].alpha <= 0.01) {
        trail.splice(i, 1);
      }
    }
    
    // Keep reasonable trail length for performance
    const maxTrailLen = Math.max(8, Math.floor(25 * runtime.effects.trailMul));
    if(trail.length > maxTrailLen) {
      // Remove oldest trails
      const toRemove = trail.length - maxTrailLen;
      trail.splice(0, toRemove);
    }
    
    // Draw trails with smooth fade
    for(let i = 0; i < trail.length; i++) {
      const t = trail[i];
      ctx.save();
      
      // Use pre-calculated alpha
      ctx.globalAlpha = t.alpha;
      
      if(runtime.glowEnabled){ 
        ctx.shadowColor = t.color; 
        ctx.shadowBlur = 15 * (t.alpha / 0.6); // Scale blur with alpha
      }
      
      ctx.fillStyle = t.color;
      ctx.fillRect(t.x - cameraX, t.y - cameraY, t.width, t.height);
      ctx.strokeStyle = t.color; 
      ctx.lineWidth = 4 * (t.alpha / 0.6); // Thinner stroke as it fades
      ctx.strokeRect(t.x - cameraX, t.y - cameraY, t.width, t.height);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  } else {
    trail = [];
  }

  // shockwaves
  if(runtime.shockwavesEnabled) {
    for(let s of shockwaves) {
      ctx.save();
      ctx.globalAlpha = s.life * 0.6;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(s.x - cameraX, s.y - cameraY, s.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // crash pieces with enhanced animation
  for(let p of crashPieces){
    ctx.save();
    ctx.translate(p.x - cameraX + p.size/2, p.y - cameraY + p.size/2);
    ctx.rotate(p.rotation);
    ctx.scale(p.scale, p.scale);
    ctx.globalAlpha = Math.min(1, p.life / 60);
    ctx.fillStyle = p.color;
    if(runtime.glowEnabled){ 
      ctx.shadowColor = p.color; 
      ctx.shadowBlur = 10 * (p.life / 120); 
    }
    ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
    ctx.restore();
  }

  // particles with rotation
  for(let p of particles){
    if(p.life > 0){
      ctx.save();
      if(p.rotation) {
        ctx.translate(p.x - cameraX + 2.5, p.y - cameraY + 2.5);
        ctx.rotate(p.rotation);
        ctx.translate(-2.5, -2.5);
      }
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / 50;
      ctx.fillRect(p.x - cameraX, p.y - cameraY, p.size || 5, p.size || 5);
      
      // Draw trail for trail particles
      if(p.trail && p.trail.length > 1) {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = p.life / 100;
        ctx.beginPath();
        ctx.moveTo(p.trail[0].x - cameraX + 2.5, p.trail[0].y - cameraY + 2.5);
        for(let j = 1; j < p.trail.length; j++) {
          ctx.lineTo(p.trail[j].x - cameraX + 2.5, p.trail[j].y - cameraY + 2.5);
        }
        ctx.stroke();
      }
      
      ctx.restore();
    }
  }
  
  // bloom particles
  for(let b of bloomParticles){
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.fillStyle = b.color;
    if(runtime.glowEnabled){ 
      ctx.shadowColor = b.color; 
      ctx.shadowBlur = 30; 
    }
    ctx.beginPath();
    ctx.arc(b.x - cameraX, b.y - cameraY, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Apply color bleed effect
  applyColorBleed();
  
  // Apply radial blur effect
  applyRadialBlur();

  // player
  if(player.visible){
    if(runtime.glowEnabled){ ctx.shadowColor = "#0ff"; ctx.shadowBlur = 20; }
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
    if(runtime.glowEnabled) ctx.shadowBlur = 0;
    ctx.strokeStyle = "#0ff"; ctx.lineWidth = 6; ctx.strokeRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
  }
  
  // Apply screen tear effect
  applyScreenTear();
  
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
  
  // Run exactly one game tick per frame when FPS is 60 or higher
  // When FPS is lower than 60, run multiple ticks to catch up
  const maxTicksPerFrame = 5; // Prevent spiral of death
  let ticksThisFrame = 0;
  
  while(tickAccumulator >= TICK_INTERVAL && ticksThisFrame < maxTicksPerFrame) {
    gameTick();
    tickAccumulator -= TICK_INTERVAL;
    ticksThisFrame++;
  }
  
  // If we're running behind, reset accumulator to prevent lag buildup
  if(tickAccumulator > TICK_INTERVAL * 10) {
    tickAccumulator = TICK_INTERVAL; // Keep some buffer
  }

  // Camera smoothing - use actual delta time for smoothness
  const targetCamX = player.x - 150;
  const targetCamY = player.y - canvas.height/2 + player.height*1.5;
  const smoothingFactor = 0.1 * (cappedDeltaMs / 16.67); // Adjust for frame rate
  cameraX = cameraX * (1 - smoothingFactor) + targetCamX * smoothingFactor;
  cameraY = cameraY * (1 - smoothingFactor) + targetCamY * smoothingFactor;

  // Draw (rendering at monitor refresh rate)
  draw();
}

/* ---------- Command handling (Ctrl+Shift+A) ---------- */
function openCommandPrompt() {
  const input = prompt("Enter command:");
  if(!input) return;
  const args = input.trim().split(/\s+/);
  const command = args[0];
  const root1 = args[1];
  const root2 = args[2];
  const root3 = args[3];

  if(command === '/die'){
    if(player.visible){
      player.visible = false;
      createCrashEarly(runtime.effects.dieEffectMul);
      gameRunning = false;
      if(score>bestScore){ bestScore = Math.floor(score); localStorage.setItem('bestScore', bestScore); }
      setTimeout(()=> { document.getElementById('menu').style.display = 'flex'; }, 500);
    }
    return;
  }

  if(command === '/score'){
    if(root1 === 'set' && root2 !== undefined){
      const v = Number(root2);
      if(!isNaN(v)) score = v; else alert('Invalid value');
    } else if(root1 === 'add' && root2 !== undefined){
      const v = Number(root2);
      if(!isNaN(v)) score += v; else alert('Invalid value');
    } else alert('Usage: /score set <value>  OR  /score add <value>');
    return;
  }

  if(command === '/clear' && root1 === 'bestScore'){
    bestScore = 0;
    localStorage.setItem('bestScore', 0);
    document.getElementById('bestScore').innerText = 'Best Score: ' + bestScore;
    alert('Best score cleared.');
    return;
  }

  if(command === '/gamerule'){
    switch(root1){
      case 'infiniteJump': cheats.infiniteJump = (root2 === 'true'); break;
      case 'death': cheats.invincible = (root2 === 'false'); break;
      case 'speed':
        if(!player.speedMultiplier) player.speedMultiplier = 1;
        if(root2 === 'reset') player.speedMultiplier = 1;
        if(root2 === 'add' && !isNaN(parseFloat(root3))) player.speedMultiplier += parseFloat(root3);
        if(root2 === 'set' && !isNaN(parseFloat(root3))) player.speedMultiplier = parseFloat(root3);
        break;
      default: alert('Unknown gamerule');
    }
    return;
  }

  if(command === '/variable'){
    if(!root1){
      let accountLocal = localStorage.getItem('account') || 'player';
      let isCreator = ['bw55133@pausd.us','ikunbeautiful@gmail.com','benranwu@gmail.com'].includes(accountLocal);
      alert('test mode: '+testMode+'\n'+'infinite jump: '+cheats.infiniteJump+'\n'+'float: '+cheats.float+'\n'+'death: '+(!cheats.invincible)+'\n'+'score: '+score+'\n'+'best score: '+bestScore+'\n'+'account: '+(isCreator?'creator':'player')+'\n'+'player speed: '+player.speed+'\n'+'jump height: '+(-JUMP_SPEED));
    }
    return;
  }

  if(command === '/code'){
    if(root1 === '770709'){ testMode = !testMode; alert(testMode ? 'TEST MODE ON' : 'TEST MODE OFF'); }
    else if(root1 === 'lanseyaoji'){ if(player.speed < 5) player.speed = 5; else player.speed *= 1.5; alert('Player speed: '+player.speed); }
    else if(root1 === 'jinyumantang'){ gemEveryBlock = !gemEveryBlock; alert('Gem generation: '+gemEveryBlock); }
    else if(root1 === 'JiMmYiStHeCoOlEsTgUy|2025.letmecheat|L^UP++0U+L0UD'){
      if(account !== '𐀒𐀒𐀒'){ oldAccount = account; account = '𐀒𐀒𐀒'; } else account = oldAccount || 'player';
      alert('Account toggled: '+account);
    }
    return;
  }

  alert('Unknown command');
}

// Override browser Ctrl+Shift+A and add mobile button
window.addEventListener('keydown', function(e){
  // Prevent browser's Ctrl+Shift+A (Select All) from interfering
  if(e.ctrlKey && e.shiftKey && e.code === 'KeyA'){
    e.preventDefault();
    openCommandPrompt();
    return false;
  }
});

// Mobile command button
document.getElementById('mobileCommandBtn').addEventListener('click', openCommandPrompt);

/* ---------- Start / Reset Game ---------- */
function startGame(){
  document.getElementById('menu').style.display = 'none';
  resetWorld();
  gameRunning = true;
  player.visible = true;
  tickAccumulator = 0; // Reset tick accumulator on restart
  lastLoopTime = performance.now(); // Reset time tracking
}

document.getElementById('startBtn').addEventListener('click', startGame);

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

// start the RAF loop
requestAnimationFrame(mainLoop);