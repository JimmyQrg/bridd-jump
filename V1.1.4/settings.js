/* ===========================
   BRIDD JUMP - settings.js
   Settings loading, saving, and initialization
   =========================== */

/* ---------- Settings loading from localStorage ---------- */
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
    blockTexture: 100,
    dropEffect: 100
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
      timeDilation: 0,
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
    darkEnergy: 100,
    gravitySurge: 100,
    shadowDash: 100
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
      particleCount: 500, trailLength: 500, screenReflections: 250,
      motionBlur: 200, lightRays: 200, parallaxLayers: 250,
      velocityStreaks: 250, windParticles: 250, speedLines: 250,
      radialBlur: 200, platformPulse: 250, impactWaves: 250,
      colorBleed: 200, depthOfField: 250, timeDilation: 200,
      lensFlare: 200, screenTear: 200, dynamicFog: 200,
      heatDistortion: 200, starbursts: 200, afterImages: 200,
      gravityWaves: 200, energyRipples: 200, pixelDisplacement: 200,
      ambientOcclusion: 200
    }
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
  runtime.effects.dropEffectMul = pct(settings.quality.dropEffect) || (preset.quality?.dropEffect ? preset.quality.dropEffect/100 : 0);

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
  runtime.advanced.gravitySurgeMul = pct(settings.advanced.gravitySurge) || (preset.advanced?.gravitySurge ? preset.advanced.gravitySurge/100 : 0);
  runtime.advanced.shadowDashMul = pct(settings.advanced.shadowDash) || (preset.advanced?.shadowDash ? preset.advanced.shadowDash/100 : 0);

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
  runtime.gravitySurgeEnabled = runtime.advanced.gravitySurgeMul > 0;
  runtime.shadowDashEnabled = runtime.advanced.shadowDashMul > 0;

  // save canonical
  writeSettings(settings);
}

/* initial apply */
applySettings(settings);
