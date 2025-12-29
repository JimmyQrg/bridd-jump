/* ===========================
   BRIDD JUMP - globals.js
   Global variables, constants, and shared state
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
let timeScale = 1;

/* ---------- World Generation ---------- */
let lastPlatformX = 0, lastPlatformY = 0;

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
  cosmicDustEnabled: false,
  energySphereEnabled: false,
  geometricPatternEnabled: false,
  colorLightEnabled: false,
  spiralEnergyEnabled: false,
  metallicParticleEnabled: false,
  digitalCharacterEnabled: false,
  mysticOrbEnabled: false,
  crystalStructureEnabled: false,
  darkEnergyEnabled: false,
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

/* ---------- Settings ---------- */
const LS_KEY = "briddSettings";
let settings = null;
