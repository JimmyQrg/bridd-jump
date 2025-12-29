/* ===========================
   BRIDD JUMP - core.js
   Core game logic and systems
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
function resize(){
  const width = window.innerWidth || 800; // Default fallback
  const height = window.innerHeight || 600; // Default fallback
  canvas.width = width;
  canvas.height = height;
}
window.addEventListener('resize', resize);
resize();

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

    // Create mystic orbs on jump
    if(runtime.mysticOrbEnabled) {
      createMysticFloatingOrbs();
    }

    // Create dark energy tendrils on jump
    if(runtime.darkEnergyEnabled) {
      createDarkEnergyTendrils(player.x + player.width/2, player.y + player.height/2, 1);
    }

    // Small screen shake on jump for high quality
    if(runtime.screenShakeEnabled && runtime.advanced.screenShakeMul > 0.5) {
      screenShake = 3 * runtime.advanced.screenShakeMul;
    }
  }
}

/* ---------- OPTIMIZED MEMORY MANAGEMENT ---------- */
function cleanupOffScreenObjects() {
  // Keep first 25 blocks (index 0-24) regardless of position
  const MIN_KEEP_BLOCKS = 25;

  // Clean up platforms that are 6 blocks off-screen to the left, but keep first 25
  const deleteThreshold = cameraX - DELETE_OFFSET;

  for(let i = platforms.length - 1; i >= MIN_KEEP_BLOCKS; i--) { // Start from MIN_KEEP_BLOCKS
    if(platforms[i].x + platforms[i].width < deleteThreshold) {
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

  // Clean up new effects
  for(let i = cosmicDust.length - 1; i >= 0; i--) {
    if(cosmicDust[i].life <= 0 || cosmicDust[i].x < player.x - 400) {
      cosmicDust.splice(i, 1);
    }
  }

  for(let i = energySpheres.length - 1; i >= 0; i--) {
    if(energySpheres[i].life <= 0) {
      energySpheres.splice(i, 1);
    }
  }

  for(let i = colorStreams.length - 1; i >= 0; i--) {
    if(colorStreams[i].life <= 0 || colorStreams[i].x + colorStreams[i].width < player.x - 200) {
      colorStreams.splice(i, 1);
    }
  }

  for(let i = spirals.length - 1; i >= 0; i--) {
    if(spirals[i].life <= 0) {
      spirals.splice(i, 1);
    }
  }

  for(let i = metallicParticles.length - 1; i >= 0; i--) {
    if(metallicParticles[i].life <= 0 || metallicParticles[i].y > canvas.height + 100) {
      metallicParticles.splice(i, 1);
    }
  }

  for(let i = digitalRain.length - 1; i >= 0; i--) {
    if(digitalRain[i].life <= 0 || digitalRain[i].x < player.x - 200) {
      digitalRain.splice(i, 1);
    }
  }

  for(let i = mysticOrbs.length - 1; i >= 0; i--) {
    if(mysticOrbs[i].life <= 0) {
      mysticOrbs.splice(i, 1);
    }
  }

  for(let i = crystalStructures.length - 1; i >= 0; i--) {
    if(crystalStructures[i].life <= 0) {
      crystalStructures.splice(i, 1);
    }
  }

  for(let i = darkTendrils.length - 1; i >= 0; i--) {
    if(darkTendrils[i].life <= 0) {
      darkTendrils.splice(i, 1);
    }
  }
}

/* ---------- Fixed TICK SYSTEM (always 60 TPS internally) ---------- */
function gameTick() {
  if(!gameRunning) return;

  if(!gameOver) {
    player.speed += 0.002;
  }

  // color cycling
  colorLerp += 1/25/TICKS_PER_SECOND;
  if(colorLerp >= 1){
    colorIndex = (colorIndex + 1) % baseColors.length;
    nextColor = baseColors[(colorIndex+1) % baseColors.length];
    colorLerp = 0;
  }
  platformColor = lerpColor(baseColors[colorIndex], nextColor, colorLerp);

  // FIXED PHYSICS: No delta time scaling - runs at fixed 60 TPS
  if(!gameOver) {
    player.y += player.vy * player.vertMultiplier;
    if(cheats.float && player.vy > 0) player.vy *= 0.5;
    player.vy += GRAVITY * player.vertMultiplier;
    player.x += player.speed * player.horizMultiplier;
  }

  // platform collision (only when game is not over)
  if(!gameOver) {
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
  }

  if(!gameOver && player.y > canvas.height + 300){
    player.jumpsLeft = 1;
    tryDie();
  }

  // spikes (only check when game is not over)
  if(!gameOver) {
    for(let s of spikes){
      if(checkSpikeCollision(s)) tryDie(s);
      if(!s.passed && player.x > s.x + s.width){
        score += 1; s.passed = true;
      }
    }
  }

  // gems (only collect when game is not over)
  if(!gameOver) {
    for(let g of gems){
      if(!g.collected && player.x + player.width > g.x && player.x < g.x + g.size && player.y + player.height > g.y && player.y < g.y + g.size){
        score += 50; g.collected = true;
        spawnParticlesEarly(g.x + g.size/2, g.y + g.size/2, "double", runtime.effects.jumpEffectMul);

        // Create crystal lattice on gem collect
        if(runtime.crystalStructureEnabled) {
          createCrystalStructureFormation(g.x + g.size/2, g.y + g.size/2, 0.5);
        }

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
  }

  // generation (only when game is not over)
  if(!gameOver) {
    const lastPlatform = platforms[platforms.length - 1];
    if(lastPlatform && lastPlatform.x < player.x + canvas.width){
      const out = generateBlockPlatform(lastPlatform.x, lastPlatform.y);
      lastPlatformX = out.x; lastPlatformY = out.y;
    }

    addLine();
  }

  // Create continuous background effects
  if(runtime.cosmicDustEnabled) createCosmicDustClouds();
  if(runtime.colorLightEnabled) createColorLightStreams();
  if(runtime.digitalCharacterEnabled) createDigitalCharacterRain();
  if(runtime.metallicParticleEnabled) createMetallicParticleFlow();

  // Update visual effects only when enabled
  if(runtime.parallaxEnabled) updateParallaxLayers();
  if(runtime.velocityStreaksEnabled) updateVelocityStreaks();
  if(runtime.speedLinesEnabled) updateSpeedLines();
  if(runtime.windParticlesEnabled) updateWindParticles();
  if(runtime.platformPulseEnabled) updatePlatformPulse();
  if(runtime.impactWavesEnabled) updateImpactWaves();
  if(runtime.lensFlareEnabled) updateLensFlares();
  if(runtime.dynamicFogEnabled) updateDynamicFog();
  if(runtime.starburstsEnabled) updateStarbursts();
  if(runtime.afterImagesEnabled) updateAfterImages();
  if(runtime.gravityWavesEnabled) updateGravityWaves();
  if(runtime.energyRipplesEnabled) updateEnergyRipples();
  if(runtime.pixelDisplacementEnabled) updatePixelDisplacements();
  if(runtime.cosmicDustEnabled) updateCosmicDustClouds();
  if(runtime.energySphereEnabled) updateEnergySpherePulses();
  if(runtime.colorLightEnabled) updateColorLightStreams();
  if(runtime.spiralEnergyEnabled) updateSpiralEnergyFields();
  if(runtime.metallicParticleEnabled) updateMetallicParticleFlow();
  if(runtime.digitalCharacterEnabled) updateDigitalCharacterRain();
  if(runtime.mysticOrbEnabled) updateMysticFloatingOrbs();
  if(runtime.crystalStructureEnabled) updateCrystalStructureFormation();
  if(runtime.darkEnergyEnabled) updateDarkEnergyTendrils();
  if(runtime.timeDilationEnabled) applyTimeDilation();

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
  if(!player.visible || gameOver) return;
  if(cheats.invincible) return;
  if(player.onGround || player.vy > 0){
    player.visible = false;
    gameOver = true; // Game is over but keep running for effects
    deathCameraStartTime = globalTime; // Record when death camera started
    if(spike) spike.hit = false;
    createCrashEarly(runtime.effects.dieEffectMul);
    if(score > bestScore){
      bestScore = Math.floor(score);
      try {
        localStorage.setItem('bestScore', bestScore);
      } catch(e) {
        console.warn("Failed to save best score:", e);
      }
    }
    setTimeout(()=> {
      gameRunning = false; // Now stop the game after effects have played
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
    // FIXED: Texture should be ON when blockTextureMul > 0, OFF when = 0
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
    // Update gem rotation
    g.rotation = (g.rotation || 0) + (g.rotationSpeed || 0);
    let floatY = Math.sin(globalTime*3 + g.floatOffset) * 5;
    ctx.save();
    ctx.translate(g.x + g.size/2 - cameraX, g.y + g.size/2 - cameraY + floatY);
    ctx.rotate(g.rotation);
    ctx.fillStyle = "white";
    if(runtime.glowEnabled){ ctx.shadowColor = "white"; ctx.shadowBlur = 20 + 10 * Math.sin(globalTime*5); }
    ctx.fillRect(-g.size/2, -g.size/2, g.size, g.size);
    ctx.restore();
    ctx.shadowBlur = 0;
  }

  // Draw heat distortion
  drawHeatDistortion();

  // Draw gravity waves
  if(runtime.gravityWavesEnabled) drawGravityWaves();

  // Draw energy ripples
  if(runtime.energyRipplesEnabled) drawEnergyRipples();

  // Draw pixel displacements
  if(runtime.pixelDisplacementEnabled) drawPixelDisplacements();

  // Draw new effects
  if(runtime.cosmicDustEnabled) drawCosmicDustClouds();
  if(runtime.energySphereEnabled) drawEnergySpherePulses();
  if(runtime.geometricPatternEnabled) applyGeometricPatternOverlay();
  if(runtime.colorLightEnabled) drawColorLightStreams();
  if(runtime.spiralEnergyEnabled) drawSpiralEnergyFields();
  if(runtime.metallicParticleEnabled) drawMetallicParticleFlow();
  if(runtime.digitalCharacterEnabled) drawDigitalCharacterRain();
  if(runtime.mysticOrbEnabled) drawMysticFloatingOrbs();
  if(runtime.crystalStructureEnabled) drawCrystalStructureFormation();
  if(runtime.darkEnergyEnabled) drawDarkEnergyTendrils();

  // Draw starbursts
  if(runtime.starburstsEnabled) drawStarbursts();

  // Draw impact waves
  if(runtime.impactWavesEnabled) drawImpactWaves();

  // Draw lens flares
  if(runtime.lensFlareEnabled) drawLensFlares();

  // Draw after images
  if(runtime.afterImagesEnabled) drawAfterImages();

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

  // Apply screen tear effect
  applyScreenTear();

  // player
  if(player.visible){
    if(runtime.glowEnabled){ ctx.shadowColor = "#0ff"; ctx.shadowBlur = 20; }
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
    if(runtime.glowEnabled) ctx.shadowBlur = 0;
    ctx.strokeStyle = "#0ff"; ctx.lineWidth = 6; ctx.strokeRect(player.x - cameraX, player.y - cameraY, player.width, player.height);
  }

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

  // Fixed tick system: run at most one tick per frame to prevent lag buildup
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
  draw();
}

/* ---------- Command handling (Ctrl+Shift+A) ---------- */
function openCommandPrompt() {
  const input = prompt("Enter command:");
  if(!input) return;
  const args = input.trim().split(/\s+/);
  const command = args[0].toLowerCase();
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
      if(!isNaN(v) && isFinite(v)) {
        score = Math.max(0, v);
        alert('Score set to: ' + score);
      } else {
        alert('Invalid value for score');
      }
    } else if(root1 === 'add' && root2 !== undefined){
      const v = Number(root2);
      if(!isNaN(v) && isFinite(v)) {
        score = Math.max(0, score + v);
        alert('Score increased by: ' + v + ' (new total: ' + score + ')');
      } else {
        alert('Invalid value to add to score');
      }
    } else {
      alert('Usage: /score set <value>  OR  /score add <value>');
    }
    return;
  }

  if(command === '/clear' && root1 === 'bestscore'){
    bestScore = 0;
    try {
      localStorage.setItem('bestScore', 0);
      document.getElementById('bestScore').innerText = 'Best Score: ' + bestScore;
      alert('Best score cleared.');
    } catch(e) {
      alert('Failed to clear best score: ' + e.message);
    }
    return;
  }

  if(command === '/gamerule'){
    if(!root1) {
      alert('Usage: /gamerule <rule> <value>\nAvailable rules: infiniteJump, death, speed');
      return;
    }

    switch(root1.toLowerCase()){
      case 'infinitejump':
        if(root2 === 'true' || root2 === 'false') {
          cheats.infiniteJump = (root2 === 'true');
          alert('Infinite jump: ' + (cheats.infiniteJump ? 'enabled' : 'disabled'));
        } else {
          alert('Usage: /gamerule infiniteJump <true|false>');
        }
        break;
      case 'death':
        if(root2 === 'true' || root2 === 'false') {
          cheats.invincible = (root2 === 'false'); // death false = invincible true
          alert('Invincibility: ' + (cheats.invincible ? 'enabled' : 'disabled'));
        } else {
          alert('Usage: /gamerule death <true|false>');
        }
        break;
      case 'speed':
        if(!player.speedMultiplier) player.speedMultiplier = 1;
        if(root2 === 'reset') {
          player.speedMultiplier = 1;
          alert('Speed multiplier reset to 1.0');
        } else if(root2 === 'set' && root3 !== undefined) {
          const v = parseFloat(root3);
          if(!isNaN(v) && isFinite(v) && v >= 0.1 && v <= 10) {
            player.speedMultiplier = v;
            alert('Speed multiplier set to: ' + v);
          } else {
            alert('Invalid speed multiplier (must be between 0.1 and 10)');
          }
        } else if(root2 === 'add' && root3 !== undefined) {
          const v = parseFloat(root3);
          if(!isNaN(v) && isFinite(v)) {
            player.speedMultiplier = Math.max(0.1, Math.min(10, player.speedMultiplier + v));
            alert('Speed multiplier adjusted by: ' + v + ' (new value: ' + player.speedMultiplier + ')');
          } else {
            alert('Invalid value to add to speed multiplier');
          }
        } else {
          alert('Usage: /gamerule speed <reset|set|add> [value]');
        }
        break;
      default:
        alert('Unknown gamerule: ' + root1 + '\nAvailable: infiniteJump, death, speed');
    }
    return;
  }

  if(command === '/variable' || command === '/var'){
    if(!root1){
      try {
        let accountLocal = 'player';
        try {
          accountLocal = localStorage.getItem('account') || 'player';
        } catch(e) {
          console.warn("Failed to read account from localStorage:", e);
        }
        let isCreator = ['bw55133@pausd.us','ikunbeautiful@gmail.com','benranwu@gmail.com'].includes(accountLocal);
        alert('Test Mode: ' + testMode +
              '\nInfinite Jump: ' + cheats.infiniteJump +
              '\nFloat: ' + cheats.float +
              '\nInvincible: ' + cheats.invincible +
              '\nScore: ' + score +
              '\nBest Score: ' + bestScore +
              '\nAccount: ' + (isCreator ? 'creator' : 'player') +
              '\nSpeed Multiplier: ' + (player.speedMultiplier || 1) +
              '\nJump Height: ' + (-JUMP_SPEED));
      } catch(e) {
        alert('Error reading variables: ' + e.message);
      }
    }
    return;
  }

  if(command === '/code'){
    if(!root1) {
      alert('Usage: /code <password>');
      return;
    }

    try {
      if(root1 === '770709'){
        testMode = !testMode;
        alert(testMode ? 'TEST MODE ON' : 'TEST MODE OFF');
      }
      else if(root1 === 'lanseyaoji'){
        if(player.speed < 5) player.speed = 5; else player.speed *= 1.5;
        alert('Player speed: ' + player.speed);
      }
      else if(root1 === 'jinyumantang'){
        gemEveryBlock = !gemEveryBlock;
        alert('Gem generation: ' + (gemEveryBlock ? 'every block' : 'normal'));
      }
      else if(root1 === 'JiMmYiStHeCoOlEsTgUy|2025.letmecheat|L^UP++0U+L0UD'){
        if(account !== '𐀒𐀒𐀒'){ oldAccount = account; account = '𐀒𐀒𐀒'; } else account = oldAccount || 'player';
        alert('Account toggled: '+account);
      }
      else {
        alert('Invalid code');
      }
    } catch(e) {
      alert('Error executing code: ' + e.message);
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
  gameOver = false;
  player.visible = true;
  timeScale = 1.0; // Reset time scale to normal
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
