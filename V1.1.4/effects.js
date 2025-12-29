/* ===========================
   BRIDD JUMP - effects.js
   All visual effects and animations
   =========================== */

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

    if(fog.life <= 0 || fog.x < player.x - 200){
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

  for(let i = 0; i < Math.floor(20 * intensity * runtime.advanced.starburstsMul); i++){
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
  if(!runtime.afterImagesEnabled || Math.random() > 0.6 * runtime.advanced.afterImagesMul) return;

  for(let i = 0; i < 2; i++) {
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

  for(let i = 0; i < 2; i++) {
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

  for(let i = 0; i < 2; i++) {
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

  for(let i = 0; i < Math.floor(40 * intensity * runtime.advanced.pixelDisplacementMul); i++){
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
  const color = type === "jump" ? "#0ff" : type === "double" ? "#fff" : "#fff";
  const baseCount = type === "land" ? 20 : 30;
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
    createImpactWave(x, y, 0.3);
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

/* ---------- 10 NEW UNIQUE EFFECTS ---------- */

/* 21. COSMIC DUST CLOUDS - Floating space dust particles */
function createCosmicDustClouds(){
  if(!runtime.cosmicDustEnabled || Math.random() > 0.2 * runtime.advanced.cosmicDustMul) return;

  for(let i = 0; i < Math.floor(3 * runtime.advanced.cosmicDustMul); i++){
    cosmicDust.push({
      x: player.x + canvas.width + Math.random() * 300,
      y: Math.random() * canvas.height,
      vx: -(Math.random() * 2 + 1),
      vy: (Math.random() - 0.5) * 0.5,
      size: 50 + Math.random() * 100,
      life: 400 + Math.random() * 200,
      color1: `hsl(${Math.random() * 60 + 240}, 70%, ${30 + Math.random() * 40}%)`,
      color2: `hsl(${Math.random() * 60 + 180}, 80%, ${20 + Math.random() * 30}%)`,
      alpha: 0.3 + Math.random() * 0.4,
      wobble: Math.random() * Math.PI * 2
    });
  }
}

function updateCosmicDustClouds(){
  if(!runtime.cosmicDustEnabled) return;

  for(let i = cosmicDust.length - 1; i >= 0; i--){
    const cloud = cosmicDust[i];
    cloud.x += cloud.vx;
    cloud.y += cloud.vy + Math.sin(cloud.wobble + globalTime) * 0.5;
    cloud.wobble += 0.01;
    cloud.life--;

    if(cloud.life <= 0 || cloud.x < player.x - 400){
      cosmicDust.splice(i, 1);
    }
  }
}

function drawCosmicDustClouds(){
  if(!runtime.cosmicDustEnabled || cosmicDust.length === 0) return;

  ctx.save();
  for(let cloud of cosmicDust){
    const alpha = (cloud.life / 600) * cloud.alpha;
    ctx.globalAlpha = alpha;

    const gradient = ctx.createRadialGradient(
      cloud.x - cameraX, cloud.y - cameraY, 0,
      cloud.x - cameraX, cloud.y - cameraY, cloud.size
    );
    gradient.addColorStop(0, cloud.color1);
    gradient.addColorStop(0.7, cloud.color2);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x - cameraX, cloud.y - cameraY, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/* 22. ENERGY SPHERE PULSES - Pulsing energy spheres */
function createEnergySpherePulses(x, y, intensity = 1){
  if(!runtime.energySphereEnabled) return;

  for(let i = 0; i < Math.floor(4 * intensity * runtime.advanced.energySphereMul); i++){
    energySpheres.push({
      x: x + (Math.random() - 0.5) * 200,
      y: y + (Math.random() - 0.5) * 200,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      radius: 10 + Math.random() * 20,
      life: 120 + Math.random() * 60,
      pulse: Math.random() * Math.PI * 2,
      color: `hsl(${Math.random() * 60 + 180}, 100%, 60%)`,
      rings: 2 + Math.floor(Math.random() * 3)
    });
  }
}

function updateEnergySpherePulses(){
  if(!runtime.energySphereEnabled) return;

  for(let i = energySpheres.length - 1; i >= 0; i--){
    const orb = energySpheres[i];
    orb.x += orb.vx;
    orb.y += orb.vy;
    orb.vx *= 0.98;
    orb.vy *= 0.98;
    orb.pulse += 0.2;
    orb.life--;

    if(orb.life <= 0){
      energySpheres.splice(i, 1);
    }
  }
}

function drawEnergySpherePulses(){
  if(!runtime.energySphereEnabled || energySpheres.length === 0) return;

  ctx.save();
  for(let orb of energySpheres){
    ctx.globalAlpha = orb.life / 180;

    for(let r = 0; r < orb.rings; r++){
      const ringRadius = orb.radius * (1 + r * 0.3) * (1 + Math.sin(orb.pulse + r) * 0.2);
      const alpha = (orb.rings - r) / orb.rings * 0.6;

      ctx.globalAlpha = alpha;
      ctx.strokeStyle = orb.color;
      ctx.lineWidth = 3 - r;
      ctx.beginPath();
      ctx.arc(orb.x - cameraX, orb.y - cameraY, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* 23. GEOMETRIC PATTERN OVERLAY - Complex geometric patterns */
function applyGeometricPatternOverlay(){
  if(!runtime.geometricPatternEnabled || runtime.advanced.geometricPatternMul < 0.1) return;

  if(Math.random() < 0.03 * runtime.advanced.geometricPatternMul){
    ctx.save();
    ctx.globalAlpha = 0.1 * runtime.advanced.geometricPatternMul;

    const centerX = Math.random() * canvas.width;
    const centerY = Math.random() * canvas.height;
    const size = 20 + Math.random() * 40;

    ctx.strokeStyle = `hsl(${Math.random() * 360}, 70%, 60%)`;
    ctx.lineWidth = 1;

    // Draw fractal geometric pattern
    function drawGeometricFractal(x, y, size, depth, maxDepth = 4){
      if(depth >= maxDepth) return;

      const angle = (globalTime * 2 + depth) % (Math.PI * 2);
      const newSize = size * 0.7;

      for(let i = 0; i < 6; i++){
        const newAngle = angle + (i * Math.PI * 2) / 6;
        const newX = x + Math.cos(newAngle) * size;
        const newY = y + Math.sin(newAngle) * size;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(newX, newY);
        ctx.stroke();

        drawGeometricFractal(newX, newY, newSize, depth + 1, maxDepth);
      }
    }

    drawGeometricFractal(centerX, centerY, size, 0);
    ctx.restore();
  }
}

/* 24. COLOR LIGHT STREAMS - Flowing streams of colored light */
function createColorLightStreams(){
  if(!runtime.colorLightEnabled || Math.random() > 0.15 * runtime.advanced.colorLightMul) return;

  colorStreams.push({
    x: player.x + canvas.width,
    y: Math.random() * canvas.height * 0.6,
    width: 200 + Math.random() * 300,
    height: 20 + Math.random() * 40,
    vx: -3 - Math.random() * 2,
    life: 300 + Math.random() * 200,
    colors: [
      `hsl(${120 + Math.random() * 60}, 80%, 60%)`,
      `hsl(${180 + Math.random() * 60}, 90%, 70%)`,
      `hsl(${240 + Math.random() * 60}, 85%, 65%)`
    ],
    waveOffset: Math.random() * Math.PI * 2
  });
}

function updateColorLightStreams(){
  if(!runtime.colorLightEnabled) return;

  for(let i = colorStreams.length - 1; i >= 0; i--){
    const stream = colorStreams[i];
    stream.x += stream.vx;
    stream.waveOffset += 0.05;
    stream.life--;

    if(stream.life <= 0 || stream.x + stream.width < player.x - 200){
      colorStreams.splice(i, 1);
    }
  }
}

function drawColorLightStreams(){
  if(!runtime.colorLightEnabled || colorStreams.length === 0) return;

  ctx.save();
  for(let stream of colorStreams){
    const alpha = stream.life / 500;
    ctx.globalAlpha = alpha * 0.8;

    for(let i = 0; i < stream.colors.length; i++){
      const yOffset = Math.sin(stream.waveOffset + i * 0.5) * 10;
      const gradient = ctx.createLinearGradient(
        stream.x - cameraX, stream.y + yOffset - cameraY,
        stream.x + stream.width - cameraX, stream.y + yOffset - cameraY
      );

      gradient.addColorStop(0, stream.colors[i] + '00');
      gradient.addColorStop(0.5, stream.colors[i]);
      gradient.addColorStop(1, stream.colors[i] + '00');

      ctx.fillStyle = gradient;
      ctx.fillRect(
        stream.x - cameraX,
        stream.y + yOffset + (i * stream.height / stream.colors.length) - cameraY,
        stream.width,
        stream.height / stream.colors.length
      );
    }
  }
  ctx.restore();
}

/* 25. SPIRAL ENERGY FIELDS - Rotating spiral energy effects */
function createSpiralEnergyFields(x, y, intensity = 1){
  if(!runtime.spiralEnergyEnabled) return;

  spirals.push({
    x: x,
    y: y,
    radius: 0,
    maxRadius: 150 * intensity * runtime.advanced.spiralEnergyMul,
    speed: 3,
    life: 1,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.2,
    color: `hsl(${Math.random() * 60 + 270}, 80%, 60%)`,
    arms: 3 + Math.floor(Math.random() * 4)
  });
}

function updateSpiralEnergyFields(){
  if(!runtime.spiralEnergyEnabled) return;

  for(let i = spirals.length - 1; i >= 0; i--){
    const spiral = spirals[i];
    spiral.radius += spiral.speed;
    spiral.rotation += spiral.rotationSpeed;
    spiral.life = 1 - (spiral.radius / spiral.maxRadius);

    if(spiral.radius >= spiral.maxRadius){
      spirals.splice(i, 1);
    }
  }
}

function drawSpiralEnergyFields(){
  if(!runtime.spiralEnergyEnabled || spirals.length === 0) return;

  ctx.save();
  for(let spiral of spirals){
    ctx.globalAlpha = spiral.life * 0.6;
    ctx.strokeStyle = spiral.color;
    ctx.lineWidth = 2;

    ctx.translate(spiral.x - cameraX, spiral.y - cameraY);
    ctx.rotate(spiral.rotation);

    for(let arm = 0; arm < spiral.arms; arm++){
      ctx.save();
      ctx.rotate((arm / spiral.arms) * Math.PI * 2);

      ctx.beginPath();
      const spiralPoints = 20;
      for(let i = 0; i < spiralPoints; i++){
        const t = i / spiralPoints;
        const angle = t * Math.PI * 4;
        const r = t * spiral.radius;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;

        if(i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.restore();
    }
  }
  ctx.restore();
}

/* 26. METALLIC PARTICLE FLOW - Flowing metal-like particles */
function createMetallicParticleFlow(){
  if(!runtime.metallicParticleEnabled || Math.random() > 0.25 * runtime.advanced.metallicParticleMul) return;

  for(let i = 0; i < Math.floor(8 * runtime.advanced.metallicParticleMul); i++){
    metallicParticles.push({
      x: player.x + (Math.random() - 0.5) * 300,
      y: player.y + canvas.height + Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: -Math.random() * 6 - 2,
      size: 4 + Math.random() * 8,
      life: 150 + Math.random() * 100,
      color: `hsl(${180 + Math.random() * 60}, 90%, ${70 + Math.random() * 30}%)`,
      wobble: Math.random() * Math.PI * 2,
      trail: []
    });
  }
}

function updateMetallicParticleFlow(){
  if(!runtime.metallicParticleEnabled) return;

  for(let i = metallicParticles.length - 1; i >= 0; i--){
    const particle = metallicParticles[i];
    particle.x += particle.vx + Math.sin(particle.wobble) * 2;
    particle.y += particle.vy;
    particle.vy += 0.1; // gravity
    particle.wobble += 0.1;

    // Add to trail
    particle.trail.push({x: particle.x, y: particle.y});
    if(particle.trail.length > 6) particle.trail.shift();

    particle.life--;

    if(particle.life <= 0 || particle.y > canvas.height + 100){
      metallicParticles.splice(i, 1);
    }
  }
}

function drawMetallicParticleFlow(){
  if(!runtime.metallicParticleEnabled || metallicParticles.length === 0) return;

  ctx.save();
  for(let particle of metallicParticles){
    ctx.globalAlpha = particle.life / 250;

    // Draw trail
    if(particle.trail.length > 1){
      for(let i = 1; i < particle.trail.length; i++){
        const alpha = (i / particle.trail.length) * 0.8;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(
          particle.trail[i].x - cameraX,
          particle.trail[i].y - cameraY,
          particle.size * (i / particle.trail.length),
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

/* 27. DIGITAL CHARACTER RAIN - Falling computer code */
function createDigitalCharacterRain(){
  if(!runtime.digitalCharacterEnabled || Math.random() > 0.1 * runtime.advanced.digitalCharacterMul) return;

  for(let i = 0; i < Math.floor(5 * runtime.advanced.digitalCharacterMul); i++){
    digitalRain.push({
      x: player.x + canvas.width + Math.random() * 100,
      y: -50,
      vx: -8 - Math.random() * 4,
      chars: [],
      length: 8 + Math.floor(Math.random() * 12),
      life: 200 + Math.random() * 100,
      color: '#00ff00'
    });

    // Generate random characters
    for(let j = 0; j < digitalRain[digitalRain.length - 1].length; j++){
      digitalRain[digitalRain.length - 1].chars.push(
        String.fromCharCode(33 + Math.floor(Math.random() * 94))
      );
    }
  }
}

function updateDigitalCharacterRain(){
  if(!runtime.digitalCharacterEnabled) return;

  for(let i = digitalRain.length - 1; i >= 0; i--){
    const rain = digitalRain[i];
    rain.x += rain.vx;
    rain.life--;

    if(rain.life <= 0 || rain.x < player.x - 200){
      digitalRain.splice(i, 1);
    }
  }
}

function drawDigitalCharacterRain(){
  if(!runtime.digitalCharacterEnabled || digitalRain.length === 0) return;

  ctx.save();
  ctx.font = '12px monospace';
  ctx.textAlign = 'center';

  for(let rain of digitalRain){
    ctx.globalAlpha = rain.life / 300;

    for(let i = 0; i < rain.chars.length; i++){
      const alpha = (rain.chars.length - i) / rain.chars.length;
      ctx.globalAlpha = alpha * 0.8;
      ctx.fillStyle = rain.color;
      ctx.fillText(
        rain.chars[i],
        rain.x - cameraX,
        rain.y - cameraY + i * 14
      );
    }
  }
  ctx.restore();
}

/* 28. MYSTIC FLOATING ORBS - Magical floating energy orbs */
function createMysticFloatingOrbs(){
  if(!runtime.mysticOrbEnabled || Math.random() > 0.3 * runtime.advanced.mysticOrbMul) return;

  for(let i = 0; i < Math.floor(6 * runtime.advanced.mysticOrbMul); i++){
    mysticOrbs.push({
      x: player.x + (Math.random() - 0.5) * 400,
      y: player.y + (Math.random() - 0.5) * 300,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      size: 2 + Math.random() * 6,
      life: 180 + Math.random() * 120,
      color: `hsl(${Math.random() * 60 + 300}, 100%, ${70 + Math.random() * 30}%)`,
      sparkle: Math.random() * Math.PI * 2,
      trail: []
    });
  }
}

function updateMysticFloatingOrbs(){
  if(!runtime.mysticOrbEnabled) return;

  for(let i = mysticOrbs.length - 1; i >= 0; i--){
    const particle = mysticOrbs[i];
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.sparkle += 0.3;
    particle.vx *= 0.99;
    particle.vy *= 0.99;

    // Add to trail
    particle.trail.push({x: particle.x, y: particle.y});
    if(particle.trail.length > 5) particle.trail.shift();

    particle.life--;

    if(particle.life <= 0){
      mysticOrbs.splice(i, 1);
    }
  }
}

function drawMysticFloatingOrbs(){
  if(!runtime.mysticOrbEnabled || mysticOrbs.length === 0) return;

  ctx.save();
  for(let particle of mysticOrbs){
    ctx.globalAlpha = particle.life / 300;

    // Draw sparkling core
    const sparkleSize = particle.size * (1 + Math.sin(particle.sparkle) * 0.3);
    ctx.fillStyle = particle.color;
    ctx.beginPath();
    ctx.arc(particle.x - cameraX, particle.y - cameraY, sparkleSize, 0, Math.PI * 2);
    ctx.fill();

    // Draw trail
    if(particle.trail.length > 1){
      ctx.strokeStyle = particle.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(particle.trail[0].x - cameraX, particle.trail[0].y - cameraY);
      for(let i = 1; i < particle.trail.length; i++){
        ctx.lineTo(particle.trail[i].x - cameraX, particle.trail[i].y - cameraY);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

/* 29. CRYSTAL STRUCTURE FORMATION - Geometric crystal matrix */
function createCrystalStructureFormation(x, y, intensity = 1){
  if(!runtime.crystalStructureEnabled) return;

  const latticeSize = 3 + Math.floor(intensity * runtime.advanced.crystalStructureMul);
  for(let i = 0; i < latticeSize; i++){
    for(let j = 0; j < latticeSize; j++){
      crystalStructures.push({
        x: x + (i - latticeSize/2) * 30,
        y: y + (j - latticeSize/2) * 30,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        size: 8 + Math.random() * 12,
        life: 100 + Math.random() * 80,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        color: `hsl(${180 + Math.random() * 60}, 80%, ${60 + Math.random() * 40}%)`,
        facets: 4 + Math.floor(Math.random() * 4)
      });
    }
  }
}

function updateCrystalStructureFormation(){
  if(!runtime.crystalStructureEnabled) return;

  for(let i = crystalStructures.length - 1; i >= 0; i--){
    const crystal = crystalStructures[i];
    crystal.x += crystal.vx;
    crystal.y += crystal.vy;
    crystal.vx *= 0.95;
    crystal.vy *= 0.95;
    crystal.rotation += crystal.rotationSpeed;
    crystal.life--;

    if(crystal.life <= 0){
      crystalStructures.splice(i, 1);
    }
  }
}

function drawCrystalStructureFormation(){
  if(!runtime.crystalStructureEnabled || crystalStructures.length === 0) return;

  ctx.save();
  for(let crystal of crystalStructures){
    ctx.globalAlpha = crystal.life / 180;
    ctx.fillStyle = crystal.color;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;

    ctx.translate(crystal.x - cameraX, crystal.y - cameraY);
    ctx.rotate(crystal.rotation);

    // Draw faceted crystal
    ctx.beginPath();
    for(let i = 0; i < crystal.facets; i++){
      const angle = (i / crystal.facets) * Math.PI * 2;
      const x = Math.cos(angle) * crystal.size;
      const y = Math.sin(angle) * crystal.size;
      if(i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/* 30. DARK ENERGY TENDRILS - Shadow energy wisps */
function createDarkEnergyTendrils(x, y, intensity = 1){
  if(!runtime.darkEnergyEnabled) return;

  const tendrilCount = 2 + Math.floor(intensity * runtime.advanced.darkEnergyMul);
  for(let i = 0; i < tendrilCount; i++){
    darkTendrils.push({
      x: x,
      y: y,
      segments: [],
      length: 8 + Math.floor(Math.random() * 6),
      life: 120 + Math.random() * 60,
      color: `hsl(${270 + Math.random() * 60}, 100%, ${10 + Math.random() * 20}%)`,
      thickness: 2 + Math.random() * 3
    });

    // Initialize segments
    for(let j = 0; j < darkTendrils[darkTendrils.length - 1].length; j++){
      darkTendrils[darkTendrils.length - 1].segments.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6
      });
    }
  }
}

function updateDarkEnergyTendrils(){
  if(!runtime.darkEnergyEnabled) return;

  for(let i = darkTendrils.length - 1; i >= 0; i--){
    const tendril = darkTendrils[i];

    // Update segments with wave motion
    for(let j = 0; j < tendril.segments.length; j++){
      const segment = tendril.segments[j];
      segment.x += segment.vx;
      segment.y += segment.vy;

      // Add wave motion
      segment.vx += Math.sin(globalTime * 3 + j * 0.5) * 0.1;
      segment.vy += Math.cos(globalTime * 3 + j * 0.5) * 0.1;

      // Dampen movement
      segment.vx *= 0.95;
      segment.vy *= 0.95;
    }

    tendril.life--;

    if(tendril.life <= 0){
      darkTendrils.splice(i, 1);
    }
  }
}

function drawDarkEnergyTendrils(){
  if(!runtime.darkEnergyEnabled || darkTendrils.length === 0) return;

  ctx.save();
  for(let tendril of darkTendrils){
    ctx.globalAlpha = tendril.life / 180;
    ctx.strokeStyle = tendril.color;
    ctx.lineWidth = tendril.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(tendril.segments[0].x - cameraX, tendril.segments[0].y - cameraY);
    for(let i = 1; i < tendril.segments.length; i++){
      ctx.lineTo(tendril.segments[i].x - cameraX, tendril.segments[i].y - cameraY);
    }
    ctx.stroke();

    // Add glow effect
    ctx.shadowColor = tendril.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}

/* ---------- DROP EFFECTS ---------- */

/* 31. GRAVITY SURGE - Expanding gravity field when dropping */
function createGravitySurge(x, y, intensity = 1){
  if(!runtime.gravitySurgeEnabled) return;

  gravitySurges.push({
    x: x,
    y: y,
    radius: 0,
    maxRadius: 120 * intensity * runtime.advanced.gravitySurgeMul,
    speed: 8,
    life: 1,
    alpha: 0.4,
    color: '#ff4444',
    pulse: 0
  });
}

function updateGravitySurge(){
  if(!runtime.gravitySurgeEnabled) return;

  for(let i = gravitySurges.length - 1; i >= 0; i--){
    const surge = gravitySurges[i];
    surge.radius += surge.speed;
    surge.pulse += 0.3;
    surge.life = 1 - (surge.radius / surge.maxRadius);

    if(surge.radius >= surge.maxRadius){
      gravitySurges.splice(i, 1);
    }
  }
}

function drawGravitySurge(){
  if(!runtime.gravitySurgeEnabled || gravitySurges.length === 0) return;

  ctx.save();
  for(let surge of gravitySurges){
    ctx.globalAlpha = surge.life * surge.alpha;
    ctx.strokeStyle = surge.color;
    ctx.lineWidth = 4;

    // Draw pulsing gravity field
    const pulseRadius = surge.radius * (1 + Math.sin(surge.pulse) * 0.2);
    ctx.beginPath();
    ctx.arc(surge.x - cameraX, surge.y - cameraY, pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw inner ring
    ctx.strokeStyle = '#ff8888';
    ctx.lineWidth = 2;
    ctx.globalAlpha = surge.life * surge.alpha * 0.6;
    ctx.beginPath();
    ctx.arc(surge.x - cameraX, surge.y - cameraY, pulseRadius * 0.7, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/* 32. SHADOW DASH - Dark shadow trail when dropping */
function createShadowDash(x, y, intensity = 1){
  if(!runtime.shadowDashEnabled) return;

  for(let i = 0; i < Math.floor(6 * intensity * runtime.advanced.shadowDashMul); i++){
    shadowDashes.push({
      x: x,
      y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 6 + 4, // Always downward
      size: Math.random() * 12 + 8,
      life: Math.random() * 20 + 15,
      alpha: 0.8,
      color: '#000000',
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2
    });
  }
}

function updateShadowDash(){
  if(!runtime.shadowDashEnabled) return;

  for(let i = shadowDashes.length - 1; i >= 0; i--){
    const dash = shadowDashes[i];
    dash.x += dash.vx;
    dash.y += dash.vy;
    dash.vx *= 0.95;
    dash.vy *= 0.95;
    dash.rotation += dash.rotationSpeed;
    dash.life--;
    dash.alpha *= 0.95;

    if(dash.life <= 0 || dash.alpha <= 0.01){
      shadowDashes.splice(i, 1);
    }
  }
}

function drawShadowDash(){
  if(!runtime.shadowDashEnabled || shadowDashes.length === 0) return;

  ctx.save();
  for(let dash of shadowDashes){
    ctx.globalAlpha = dash.alpha;
    ctx.fillStyle = dash.color;
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;

    ctx.translate(dash.x - cameraX, dash.y - cameraY);
    ctx.rotate(dash.rotation);

    // Draw shadow shape
    ctx.beginPath();
    ctx.ellipse(0, 0, dash.size, dash.size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

/* ---------- ENHANCED DEATH ANIMATION ---------- */
function createCrashEarly(amountMul = 1) {
  const baseCount = 40;
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
    for(let i = 0; i < 2; i++) {
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
  }

  // Add screen shake
  if(runtime.screenShakeEnabled) {
    screenShake = 30 * runtime.advanced.screenShakeMul;
  }

  // Add screen flash
  screenFlash = 20;

  // Add screen dust particles
  if(runtime.distortionEnabled) {
    for(let i = 0; i < Math.floor(60 * runtime.advanced.screenDistortionMul); i++) {
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

  // Add energy spheres on death
  if(runtime.energySphereEnabled) {
    createEnergySpherePulses(player.x + player.width/2, player.y + player.height/2, 2);
  }

  // Add spiral energy on death
  if(runtime.spiralEnergyEnabled) {
    createSpiralEnergyFields(player.x + player.width/2, player.y + player.height/2, 2);
  }
}
