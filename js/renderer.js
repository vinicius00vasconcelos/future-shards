// ============================================================================
// FUTURE SHARDS — 16-BIT FREE-ROAM SUB-TILE RENDERER & SPRITE ANIMATION ENGINE
// Implements Smooth Lerp Camera, 4-Direction Walkcycle, Tree Wind Sway,
// Organic Terrain Blending, Proximity Target Highlight & Magnetic Loot Drops
// ============================================================================

let canvas = null;
let ctx = null;
let miniCanvas = null;
let miniCtx = null;
let animFrame = 0;
let lastFrameTime = performance.now();

// Visual scale multipliers (in tiles) for 16-bit world objects & structures
const OBJECT_SCALES = {
  // World Objects
  stilt_hut:      { w: 3.3, h: 3.1, anchorY: 0.72 },
  samauma_tree:   { w: 2.9, h: 3.2, anchorY: 0.90, sway: 0.045 },
  rubber_tree:    { w: 2.3, h: 2.6, anchorY: 0.90, sway: 0.055 },
  andiroba_tree:  { w: 2.3, h: 2.6, anchorY: 0.90, sway: 0.055 },
  acai_tree:      { w: 2.1, h: 2.5, anchorY: 0.90, sway: 0.070 },
  caryatid_altar: { w: 2.1, h: 2.2, anchorY: 0.75 },
  dredge_wreck:   { w: 2.1, h: 1.9, anchorY: 0.72 },
  diesel_wreck:   { w: 1.6, h: 1.5, anchorY: 0.70 },
  urucum_node:    { w: 1.5, h: 1.5, anchorY: 0.72, sway: 0.040 },
  curua_node:     { w: 1.4, h: 1.4, anchorY: 0.72, sway: 0.040 },
  clay_node:      { w: 1.4, h: 1.3, anchorY: 0.68 },
  cauixi_node:    { w: 1.5, h: 1.4, anchorY: 0.70 },
  charred_log:    { w: 1.5, h: 1.4, anchorY: 0.70 },
  shard_mound:    { w: 1.4, h: 1.3, anchorY: 0.68 },
  necked_vase:    { w: 1.4, h: 1.4, anchorY: 0.70 },
  petroglyph:     { w: 1.6, h: 1.6, anchorY: 0.72 },
  quartz_rock:    { w: 1.5, h: 1.5, anchorY: 0.72 },
  jade_vein:      { w: 1.5, h: 1.5, anchorY: 0.72 },
  water_lily:     { w: 1.5, h: 1.3, anchorY: 0.65 },
  elder_npc:      { w: 1.5, h: 1.6, anchorY: 0.76, breathe: true },

  // Ecobase Buildings
  bld_01:         { w: 1.3, h: 1.3, anchorY: 0.65 },
  bld_02:         { w: 1.85, h: 1.95, anchorY: 0.75, smoke: true, fireGlow: true },
  bld_03:         { w: 1.15, h: 1.15, anchorY: 0.60 },
  bld_04:         { w: 1.7, h: 1.7, anchorY: 0.72 },
  bld_05:         { w: 1.75, h: 1.75, anchorY: 0.74 },
  bld_06:         { w: 1.55, h: 1.65, anchorY: 0.74, cyanGlow: true },
  bld_07:         { w: 1.85, h: 2.05, anchorY: 0.76, cyanGlow: true },
  bld_08:         { w: 1.65, h: 1.75, anchorY: 0.74, cyanGlow: true },
  bld_09:         { w: 1.65, h: 1.65, anchorY: 0.70 }
};

function initRenderer() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  miniCanvas = document.getElementById("minimapCanvas");
  miniCtx = miniCanvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas() {
  if (!canvas) return;
  const rect = document.getElementById("canvasContainer").getBoundingClientRect();
  canvas.width = Math.max(300, Math.floor(rect.width));
  canvas.height = Math.max(240, Math.floor(rect.height));
}

function drawScenerySprite(ctxTarget, sIdx, dx, dy, dw, dh) {
  const directImg = AssetLibrary.getSceneryImage(sIdx);
  if (directImg) {
    ctxTarget.drawImage(directImg, dx, dy, dw, dh);
    return;
  }
  const atlas = AssetLibrary.sceneryAtlasImg;
  if (atlas && atlas.complete && atlas.naturalWidth > 0) {
    const col = sIdx % 9;
    const row = Math.floor(sIdx / 9);
    const cellW = Math.floor(atlas.naturalWidth / 9);
    const cellH = Math.floor(atlas.naturalHeight / 5);
    ctxTarget.drawImage(atlas, col * cellW, row * cellH, cellW, cellH, dx, dy, dw, dh);
  }
}

// Convert screen coordinates to continuous world tile coordinates
function screenToWorldCoords(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  const cx = (clientX - rect.left) * scaleX;
  const cy = (clientY - rect.top) * scaleY;

  const viewW = canvas.width / TILE_SIZE;
  const viewH = canvas.height / TILE_SIZE;
  const camLeft = Math.max(0, Math.min(MAP_W - viewW, state.camera.x - viewW / 2));
  const camTop = Math.max(0, Math.min(MAP_H - viewH, state.camera.y - viewH / 2));

  return {
    wx: camLeft + cx / TILE_SIZE,
    wy: camTop + cy / TILE_SIZE
  };
}

function renderGame(nowTs) {
  const now = nowTs || performance.now();
  const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
  lastFrameTime = now;

  // Step 60 FPS continuous sub-tile physics & animations
  updateContinuousPhysics(dt);

  animFrame++;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#090d12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Smooth Sub-Pixel Camera Offset + Screen Shake
  const viewW = canvas.width / TILE_SIZE;
  const viewH = canvas.height / TILE_SIZE;
  const shakeX = state.camera.shake > 0 ? (Math.random() - 0.5) * state.camera.shake * 0.25 : 0;
  const shakeY = state.camera.shake > 0 ? (Math.random() - 0.5) * state.camera.shake * 0.25 : 0;

  const camLeft = Math.max(0, Math.min(MAP_W - viewW, state.camera.x - viewW / 2)) + shakeX;
  const camTop = Math.max(0, Math.min(MAP_H - viewH, state.camera.y - viewH / 2)) + shakeY;

  const minX = Math.max(0, Math.floor(camLeft) - 2);
  const maxX = Math.min(MAP_W, Math.ceil(camLeft + viewW) + 2);
  const minY = Math.max(0, Math.floor(camTop) - 2);
  const maxY = Math.min(MAP_H, Math.ceil(camTop + viewH) + 2);

  const terrainColors = [
    "#156d75", "#7b5e3e", "#1b4d4a", "#9e6b3b",
    "#2d6e36", "#4b4b52", "#221a18", "#8f563b", "#a85032"
  ];

  // ==========================================================================
  // PASS 1: SEAMLESS TERRAIN, ORGANIC CORNER BLENDING, SHORELINES & PIPES
  // ==========================================================================
  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const sx = Math.floor((x - camLeft) * TILE_SIZE);
      const sy = Math.floor((y - camTop) * TILE_SIZE);
      const t = getEffectiveTerrain(x, y);

      ctx.fillStyle = terrainColors[t] || "#2d6e36";
      ctx.fillRect(sx, sy, TILE_SIZE + 1, TILE_SIZE + 1);
      drawScenerySprite(ctx, t, sx, sy, TILE_SIZE + 1, TILE_SIZE + 1);

      // Organic Terrain Edge Blending (Eliminates boxy grid look between grass t=4 and earth t=3!)
      if (t === 3) {
        ctx.fillStyle = "#2d6e36";
        if (y > 0 && getEffectiveTerrain(x, y - 1) === 4) {
          ctx.beginPath();
          ctx.arc(sx + TILE_SIZE * 0.25, sy + 2, 6, 0, Math.PI * 2);
          ctx.arc(sx + TILE_SIZE * 0.72, sy + 1, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        if (x > 0 && getEffectiveTerrain(x - 1, y) === 4) {
          ctx.beginPath();
          ctx.arc(sx + 2, sy + TILE_SIZE * 0.3, 6, 0, Math.PI * 2);
          ctx.arc(sx + 1, sy + TILE_SIZE * 0.75, 5, 0, Math.PI * 2);
          ctx.fill();
        }
        // Subtle pebbles on earthy courtyard
        if ((x * 13 + y * 29) % 5 === 0) {
          ctx.fillStyle = "rgba(82, 50, 26, 0.45)";
          ctx.fillRect(sx + (x * 7 % 28) + 6, sy + (y * 11 % 28) + 6, 3, 2);
        }
      }

      // Organic shoreline bank shadow & animated wave foam when land meets water
      const isWater = (t === 0 || t === 1 || t === 2);
      if (isWater) {
        if (x > 0) {
          const leftT = getEffectiveTerrain(x - 1, y);
          if (leftT !== 0 && leftT !== 1 && leftT !== 2) {
            ctx.fillStyle = "#5c381e";
            ctx.fillRect(sx, sy, 6, TILE_SIZE + 1);
            ctx.fillStyle = "#8a5630";
            ctx.fillRect(sx + 6, sy, 3, TILE_SIZE + 1);
            ctx.fillStyle = "rgba(186, 242, 239, 0.5)";
            const foamOffset = Math.sin(animFrame * 0.06 + y * 0.9) * 2.5;
            ctx.fillRect(sx + 9 + foamOffset, sy + 3, 2.5, TILE_SIZE - 6);
          }
        }
        if (y > 0) {
          const topT = getEffectiveTerrain(x, y - 1);
          if (topT !== 0 && topT !== 1 && topT !== 2) {
            ctx.fillStyle = "#5c381e";
            ctx.fillRect(sx, sy, TILE_SIZE + 1, 6);
            ctx.fillStyle = "rgba(186, 242, 239, 0.45)";
            ctx.fillRect(sx + 4, sy + 7, TILE_SIZE - 8, 2);
          }
        }
        if (((x * 17 + y * 31) % 7 === 0)) {
          const spAlpha = 0.25 + 0.35 * Math.sin(animFrame * 0.08 + x + y);
          ctx.fillStyle = `rgba(224, 252, 249, ${spAlpha.toFixed(2)})`;
          ctx.fillRect(sx + (x * 7 % 26) + 8, sy + (y * 11 % 26) + 8, 3, 3);
        }
      }

      // Connected Terracotta Pipe joints + Animated Water Pulse flowing inside pipes!
      if (t === 8) {
        ctx.fillStyle = "#b85532";
        ctx.fillRect(sx + TILE_SIZE / 2 - 6, sy, 12, TILE_SIZE + 1);
        ctx.fillRect(sx, sy + TILE_SIZE / 2 - 6, TILE_SIZE + 1, 12);
        ctx.strokeStyle = "#592211";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + TILE_SIZE / 2 - 7, sy + TILE_SIZE / 2 - 7, 14, 14);

        // Glowing water pulse traveling through terracotta pipes
        const flowPulse = 0.4 + 0.5 * Math.sin(animFrame * 0.12 - (x + y) * 0.8);
        ctx.fillStyle = `rgba(86, 245, 225, ${flowPulse.toFixed(2)})`;
        ctx.fillRect(sx + TILE_SIZE / 2 - 3, sy + TILE_SIZE / 2 - 3, 6, 6);
      }

      // Low-lying Canteiro de Terra Preta (bld_03) with animated crop leaves
      const obj = state.objects[y][x];
      if (obj && obj.kind === "building" && obj.id === "bld_03") {
        const bldImg = AssetLibrary.buildingImages128["bld_03"];
        const swayPx = Math.sin(animFrame * 0.06 + x * 0.9 + y * 0.7) * 1.2;
        if (bldImg && bldImg.complete && bldImg.naturalWidth > 0) {
          ctx.drawImage(bldImg, sx - 3 + swayPx * 0.5, sy - 4, TILE_SIZE + 6, TILE_SIZE + 8);
        } else {
          drawScenerySprite(ctx, 29, sx - 3, sy - 4, TILE_SIZE + 6, TILE_SIZE + 8);
        }
      }
    }
  }

  // Draw Footstep Particles & Click-to-Move Destination Indicator
  state.footParticles.forEach(fp => {
    const px = (fp.x - camLeft) * TILE_SIZE;
    const py = (fp.y - camTop) * TILE_SIZE;
    const alpha = 1 - fp.age / fp.life;
    ctx.save();
    ctx.globalAlpha = Math.max(0, alpha);
    ctx.fillStyle = fp.color;
    if (fp.isWater) {
      ctx.strokeStyle = fp.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(px, py, 4 + fp.age * 14, 2 + fp.age * 7, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(px, py, 3 * (1 - fp.age / fp.life) + 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });

  if (state.player.moveTarget) {
    const mx = (state.player.moveTarget.x - camLeft) * TILE_SIZE;
    const my = (state.player.moveTarget.y - camTop) * TILE_SIZE;
    const pulseR = 6 + Math.sin(animFrame * 0.2) * 3;
    ctx.strokeStyle = "rgba(253, 224, 71, 0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(mx, my, pulseR, pulseR * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Ghost Preview when in Build [6] or Plant [5] mode
  if (state.world.activeMode === "build" || state.world.activeMode === "plant") {
    const gx = Math.floor(state.input.mouseWorldX);
    const gy = Math.floor(state.input.mouseWorldY);
    if (gx >= 0 && gx < MAP_W && gy >= 0 && gy < MAP_H) {
      const gsx = (gx - camLeft) * TILE_SIZE;
      const gsy = (gy - camTop) * TILE_SIZE;
      const occupied = !!state.objects[gy][gx];
      ctx.save();
      ctx.globalAlpha = 0.65;
      ctx.fillStyle = occupied ? "rgba(239, 68, 68, 0.35)" : "rgba(74, 222, 128, 0.35)";
      ctx.fillRect(gsx, gsy, TILE_SIZE, TILE_SIZE);
      ctx.strokeStyle = occupied ? "#ef4444" : "#4ade80";
      ctx.lineWidth = 2;
      ctx.strokeRect(gsx + 1, gsy + 1, TILE_SIZE - 2, TILE_SIZE - 2);
      if (state.world.activeMode === "build") {
        const bImg = AssetLibrary.buildingImages128[state.world.selectedBuildId];
        if (bImg && bImg.complete && bImg.naturalWidth > 0) {
          ctx.drawImage(bImg, gsx - 8, gsy - 14, TILE_SIZE + 16, TILE_SIZE + 16);
        }
      }
      ctx.restore();
    }
  }

  // ==========================================================================
  // PASS 2: COLLECT & Y-SORT ALL TALL OBJECTS, BUILDINGS, CHARACTER & FAUNA
  // ==========================================================================
  const renderList = [];

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const obj = state.objects[y][x];
      if (!obj) continue;
      if (obj.kind === "building" && obj.id === "bld_03") continue;

      renderList.push({
        sortY: y + 0.55,
        kind: obj.kind,
        x,
        y,
        obj
      });
    }
  }

  state.fauna.forEach(f => {
    renderList.push({
      sortY: f.y + 0.5,
      kind: "fauna",
      x: f.x,
      y: f.y,
      fauna: f
    });
  });

  renderList.push({
    sortY: state.player.y + 0.15,
    kind: "player",
    x: state.player.x,
    y: state.player.y
  });

  const drone = state.drones[0];
  if (drone.active) {
    renderList.push({
      sortY: drone.y + 0.8,
      kind: "drone",
      x: drone.x,
      y: drone.y
    });
  }

  renderList.sort((a, b) => (a.sortY - b.sortY) || (a.x - b.x));

  renderList.forEach(item => {
    if (item.kind === "world" || item.kind === "building") {
      const baseSx = (item.x - camLeft) * TILE_SIZE;
      const baseSy = (item.y - camTop) * TILE_SIZE;
      const centerX = baseSx + TILE_SIZE / 2;
      const bottomY = baseSy + TILE_SIZE;

      const obj = item.obj;
      const key = obj.kind === "building" ? obj.id : obj.type;
      const cfg = OBJECT_SCALES[key] || { w: 1.5, h: 1.5, anchorY: 0.72 };
      const dw = TILE_SIZE * cfg.w;
      const dh = TILE_SIZE * cfg.h;

      // Hit-Shake & Elastic Squash when interacted with
      const shakeAmt = state.objectShakes[`${item.x},${item.y}`] || 0;
      const shakeOffX = shakeAmt > 0 ? Math.sin(shakeAmt * Math.PI * 8) * 5 * shakeAmt : 0;
      const squashY = shakeAmt > 0 ? 1 - Math.sin(shakeAmt * Math.PI) * 0.12 : 1;

      const dx = centerX - dw / 2 + shakeOffX;
      const dy = bottomY - (dh * squashY) * cfg.anchorY;

      // Ground drop shadow
      ctx.save();
      ctx.fillStyle = "rgba(8, 12, 16, 0.38)";
      ctx.beginPath();
      ctx.ellipse(centerX, bottomY - 4, dw * 0.34, dh * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Highlight ring if this is the Nearest Proximity Target!
      const isNearest = state.nearestTarget && state.nearestTarget.tx === item.x && state.nearestTarget.ty === item.y;
      if (isNearest) {
        ctx.save();
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.ellipse(centerX, bottomY - 4, dw * 0.38, dh * 0.17, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Bioluminescent Cyan Aura (Caryatid Condenser & Bio-Battery)
      if (cfg.cyanGlow) {
        const pulse = 0.85 + Math.sin(animFrame * 0.09) * 0.15;
        const grad = ctx.createRadialGradient(
          centerX, dy + dh * 0.55, 4,
          centerX, dy + dh * 0.55, dw * 0.68 * pulse
        );
        grad.addColorStop(0, "rgba(56, 239, 229, 0.55)");
        grad.addColorStop(0.5, "rgba(46, 213, 196, 0.25)");
        grad.addColorStop(1, "rgba(46, 213, 196, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(centerX, dy + dh * 0.55, dw * 0.68 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }

      // Warm Hearth Fire Glow (Clay Pyrolysis Kilns)
      if (cfg.fireGlow) {
        const flicker = 0.85 + Math.sin(animFrame * 0.22 + item.x) * 0.15;
        const fGrad = ctx.createRadialGradient(
          centerX, dy + dh * 0.65, 2,
          centerX, dy + dh * 0.65, dw * 0.55 * flicker
        );
        fGrad.addColorStop(0, "rgba(255, 180, 50, 0.50)");
        fGrad.addColorStop(1, "rgba(255, 100, 20, 0)");
        ctx.fillStyle = fGrad;
        ctx.beginPath();
        ctx.arc(centerX, dy + dh * 0.65, dw * 0.55 * flicker, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Sprite with Canopy Wind Sway (for trees/plants) or Idle Breathing (for NPC)
      ctx.save();
      if (cfg.sway) {
        const swayAngle = Math.sin(animFrame * 0.045 + item.x * 0.8 + item.y * 0.5) * cfg.sway;
        ctx.translate(centerX, bottomY - 4);
        ctx.transform(1, 0, swayAngle, squashY, 0, 0);
        ctx.translate(-centerX, -(bottomY - 4));
      } else if (cfg.breathe) {
        const breatheScale = 1 + Math.sin(animFrame * 0.08) * 0.025;
        ctx.translate(centerX, bottomY - 4);
        ctx.scale(1, breatheScale * squashY);
        ctx.translate(-centerX, -(bottomY - 4));
      }

      if (obj.kind === "building") {
        const bldImg = AssetLibrary.buildingImages128[obj.id];
        if (bldImg && bldImg.complete && bldImg.naturalWidth > 0) {
          ctx.drawImage(bldImg, dx, dy, dw, dh * squashY);
        } else {
          drawScenerySprite(ctx, obj.sceneryIdx, dx, dy, dw, dh * squashY);
        }
      } else {
        const sIdx = WORLD_OBJ_TYPES[obj.type].sceneryIdx;
        drawScenerySprite(ctx, sIdx, dx, dy, dw, dh * squashY);

        if (obj.type === "stilt_hut") {
          const panelImg = AssetLibrary.buildingImages128["bld_05"];
          if (panelImg && panelImg.complete && panelImg.naturalWidth > 0) {
            ctx.drawImage(panelImg, centerX - TILE_SIZE * 0.65, dy + 2, TILE_SIZE * 1.35, TILE_SIZE * 1.15);
          }
        }

        if (WORLD_OBJ_TYPES[obj.type].scrap) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
          ctx.fillRect(centerX + 8, dy + 8, 14, 14);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px monospace";
          ctx.fillText("♻", centerX + 10, dy + 19);
        }
      }
      ctx.restore();

      // Floating "[Espaço]" interaction badge above the nearest target
      if (isNearest) {
        const bobPrompt = Math.sin(animFrame * 0.15) * 3;
        ctx.save();
        ctx.fillStyle = "rgba(27, 18, 14, 0.92)";
        ctx.strokeStyle = "#fde047";
        ctx.lineWidth = 1.5;
        const bw = 66;
        const bh = 18;
        const bx = centerX - bw / 2;
        const by = dy - 14 + bobPrompt;
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeRect(bx, by, bw, bh);
        ctx.fillStyle = "#fde047";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.fillText("[ESPAÇO]", centerX, by + 12);
        ctx.restore();
      }

      // Rising Smoke Puffs from Pyrolysis Kilns
      if (cfg.smoke) {
        for (let p = 0; p < 4; p++) {
          const prog = ((animFrame * 0.55 + p * 18 + item.x * 11) % 64) / 64;
          const smokeX = centerX + Math.sin(prog * Math.PI * 2 + item.x) * 7;
          const smokeY = dy + 8 - prog * 46;
          const smokeR = 6 + prog * 11;
          const smokeAlpha = (1 - prog) * 0.36;
          ctx.fillStyle = `rgba(205, 218, 228, ${smokeAlpha.toFixed(2)})`;
          ctx.beginPath();
          ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (item.kind === "fauna") {
      const f = item.fauna;
      const fx = (f.x - camLeft) * TILE_SIZE;
      const fy = (f.y - camTop) * TILE_SIZE;
      const isBoat = f.type === "catamara";
      const scale = isBoat ? 2.2 : 1.4;
      const dw = TILE_SIZE * scale;
      const dh = TILE_SIZE * scale;
      const bob = Math.sin(animFrame * 0.09 + f.x * 2) * 3.5;

      // Water ripple wake under Boto & Catamarã
      if (f.type === "boto" || isBoat) {
        ctx.strokeStyle = "rgba(186, 242, 239, 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(fx, fy + 4, dw * 0.28 + Math.sin(animFrame * 0.12) * 3, 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.save();
      if (f.vx < 0) {
        ctx.translate(fx, fy);
        ctx.scale(-1, 1);
        ctx.translate(-fx, -fy);
      }
      drawScenerySprite(ctx, f.sceneryIdx, fx - dw / 2, fy - dh * 0.75 + bob, dw, dh);
      ctx.restore();
    } else if (item.kind === "player") {
      const p = state.player;
      const px = (p.x - camLeft) * TILE_SIZE;
      const py = (p.y - camTop) * TILE_SIZE;
      const dw = TILE_SIZE * 1.52;
      const dh = TILE_SIZE * 1.62;

      // Stride bounce when walking & subtle breathing when idle
      const walkBounce = p.isMoving ? Math.abs(Math.sin(p.walkCycleTimer * Math.PI)) * 3.5 : 0;
      const idleBreathe = !p.isMoving ? Math.sin(animFrame * 0.08) * 0.02 : 0;

      // Ground shadow under player's feet
      ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
      ctx.beginPath();
      ctx.ellipse(px, py - 2, TILE_SIZE * 0.32, TILE_SIZE * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();

      if (p.inBoat) {
        const boatIdx = state.world.unlockedTechs.includes("T3_05") ? 40 : 39;
        const bob = Math.sin(animFrame * 0.1) * 3;
        // Boat water wake
        ctx.strokeStyle = "rgba(186, 242, 239, 0.65)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(px, py, TILE_SIZE * 0.7, TILE_SIZE * 0.28, 0, 0, Math.PI * 2);
        ctx.stroke();
        drawScenerySprite(ctx, boatIdx, px - TILE_SIZE * 0.9, py - TILE_SIZE * 1.35 + bob, TILE_SIZE * 1.8, TILE_SIZE * 1.8);
      } else {
        // Draw 4-Direction 3-Frame Animated Protagonist!
        const frameImg = AssetLibrary.getPlayerFrame(p.dir, p.walkFrame);
        const drawH = dh * (1 + idleBreathe);
        const dx = px - dw / 2;
        const dy = py - drawH * 0.88 - walkBounce;

        if (frameImg) {
          ctx.drawImage(frameImg, dx, dy, dw, drawH);
        } else {
          drawScenerySprite(ctx, 36, dx, dy, dw, drawH);
        }

        // Animated Tool Swing in Player's Hand when collecting / recycling / planting!
        if (p.actionSwing > 0) {
          let toolItemId = "eq_tool_01";
          if (state.world.activeMode === "scan") toolItemId = "eq_tool_03";
          else if (state.world.activeMode === "recycle") toolItemId = "eq_tool_02";
          else if (state.world.activeMode === "terrapreta") toolItemId = "proc_03";
          else if (state.world.activeMode === "plant") toolItemId = "mat_09";

          const toolImg = AssetLibrary.getItemImage(toolItemId);
          if (toolImg) {
            ctx.save();
            const handX = px + (p.dir === "left" ? -14 : 14);
            const handY = py - dh * 0.45;
            const swingAngle = (1 - p.actionSwing) * Math.PI * 0.85 - 0.4;
            ctx.translate(handX, handY);
            ctx.rotate(p.dir === "left" ? -swingAngle : swingAngle);
            ctx.drawImage(toolImg, -14, -14, 28, 28);
            ctx.restore();
          }
        }
      }

      // Bio-Scanner Holographic Beam & Expanding Pulse Ring
      if (p.scanningTicks > 0) {
        p.scanningTicks--;
        const radius = (23 - p.scanningTicks) * 5.5;
        ctx.strokeStyle = "rgba(86, 245, 225, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(px, py - TILE_SIZE * 0.4, radius, 0, Math.PI * 2);
        ctx.stroke();

        if (p.actionTarget) {
          const tx = (p.actionTarget.x - camLeft) * TILE_SIZE;
          const ty = (p.actionTarget.y - camTop) * TILE_SIZE;
          ctx.strokeStyle = "rgba(86, 245, 225, 0.7)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py - TILE_SIZE * 0.5);
          ctx.lineTo(tx, ty - TILE_SIZE * 0.3);
          ctx.stroke();
        }
      }
    } else if (item.kind === "drone") {
      const dxWorld = (item.x - camLeft) * TILE_SIZE;
      const dyWorld = (item.y - camTop) * TILE_SIZE;
      const hoverY = Math.sin(animFrame * 0.25) * 5;
      const dw = TILE_SIZE * 1.35;
      const dh = TILE_SIZE * 1.35;
      const dx = dxWorld - dw / 2;
      const dy = dyWorld - dh - 14 + hoverY;

      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(dxWorld, dyWorld - 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water Mist / Pollen Droplets sprayed by the Hummingbird Drone
      ctx.fillStyle = "rgba(125, 249, 255, 0.8)";
      for (let d = 0; d < 4; d++) {
        const dropProg = ((animFrame * 2 + d * 7) % 24) / 24;
        ctx.fillRect(dx - 2 - dropProg * 12, dy + dh * 0.55 + dropProg * 18, 2.5, 2.5);
      }

      drawScenerySprite(ctx, 38, dx, dy, dw, dh);
    }
  });

  // ==========================================================================
  // PASS 3: MAGNETIC LOOT DROPS, FLOATING TEXTS & BIOLUMINESCENT FIREFLIES
  // ==========================================================================
  state.lootDrops.forEach(d => {
    const lx = (d.x - camLeft) * TILE_SIZE;
    const ly = (d.y - camTop) * TILE_SIZE - d.z * 16;
    const itemImg = AssetLibrary.getItemImage(d.itemId);
    // Ground shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.beginPath();
    ctx.ellipse(lx, (d.y - camTop) * TILE_SIZE, 7, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (itemImg) {
      ctx.drawImage(itemImg, lx - 13, ly - 13, 26, 26);
    }
  });

  state.floatingTexts.forEach(ft => {
    const fx = (ft.x - camLeft) * TILE_SIZE;
    const fy = (ft.y - camTop) * TILE_SIZE;
    const alpha = Math.max(0, 1 - (ft.age / ft.life));
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = "bold 12px 'Inter', sans-serif";
    ctx.textAlign = "center";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.9)";
    ctx.strokeText(ft.text, fx, fy);
    ctx.fillStyle = ft.color;
    ctx.fillText(ft.text, fx, fy);
    ctx.restore();
  });

  for (let i = 0; i < 18; i++) {
    const fx = ((i * 137 + Math.floor(animFrame * 0.4)) % canvas.width);
    const fy = ((i * 89 + Math.floor(Math.sin(animFrame * 0.03 + i) * 18)) % canvas.height);
    const alpha = 0.35 + 0.45 * Math.sin(animFrame * 0.07 + i * 2);
    ctx.fillStyle = i % 2 === 0
      ? `rgba(250, 224, 92, ${alpha.toFixed(2)})`
      : `rgba(86, 245, 225, ${alpha.toFixed(2)})`;
    ctx.fillRect(fx, fy, 3, 3);
  }

  if (state.world.season === "CHEIA" && animFrame % 2 === 0) {
    ctx.strokeStyle = "rgba(125, 211, 252, 0.16)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 18; i++) {
      const rx = ((i * 97 + animFrame * 7) % canvas.width);
      const ry = ((i * 53 + animFrame * 13) % canvas.height);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 3, ry + 8);
      ctx.stroke();
    }
  } else if (state.world.season === "SECA" && state.world.ecoIndex < 65) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.06)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (state.world.timeOfDay >= 19 || state.world.timeOfDay < 5) {
    ctx.fillStyle = "rgba(10, 18, 38, 0.40)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  renderMinimap();
  requestAnimationFrame(renderGame);
}

function renderMinimap() {
  if (!miniCanvas || !miniCtx) return;
  const mw = miniCanvas.width;
  const mh = miniCanvas.height;
  const cw = mw / MAP_W;
  const ch = mh / MAP_H;

  const colors = [
    "#257985", "#7b5e3e", "#1b4d4a", "#b5834c",
    "#34783c", "#52525b", "#291f1c", "#9c5a32", "#c85a32"
  ];

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = getEffectiveTerrain(x, y);
      miniCtx.fillStyle = colors[t] || "#34783c";
      miniCtx.fillRect(x * cw, y * ch, cw + 0.6, ch + 0.6);

      const obj = state.objects[y][x];
      if (obj) {
        if (obj.kind === "building") {
          miniCtx.fillStyle = "#38efdf";
          miniCtx.fillRect(x * cw, y * ch, cw + 1.2, ch + 1.2);
        } else if (obj.type.includes("tree")) {
          miniCtx.fillStyle = "#1e4d26";
          miniCtx.fillRect(x * cw, y * ch, cw + 1, ch + 1);
        }
      }
    }
  }

  miniCtx.fillStyle = "#f5c242";
  miniCtx.beginPath();
  miniCtx.arc(state.player.x * cw, state.player.y * ch, 4, 0, Math.PI * 2);
  miniCtx.fill();
  miniCtx.strokeStyle = "#1a120b";
  miniCtx.lineWidth = 1.5;
  miniCtx.stroke();
}
