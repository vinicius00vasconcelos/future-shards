// ============================================================================
// FUTURE SHARDS — 16-BIT CANVAS & MINIMAP RENDERER (MULTI-TILE Y-SORTED ENGINE)
// ============================================================================

let canvas = null;
let ctx = null;
let miniCanvas = null;
let miniCtx = null;
let animFrame = 0;

// Visual scale multipliers (in tiles) for 16-bit world objects & structures
const OBJECT_SCALES = {
  // World Objects
  stilt_hut:      { w: 3.3, h: 3.1, anchorY: 0.72 },
  samauma_tree:   { w: 2.8, h: 3.0, anchorY: 0.78 },
  rubber_tree:    { w: 2.2, h: 2.4, anchorY: 0.78 },
  andiroba_tree:  { w: 2.2, h: 2.4, anchorY: 0.78 },
  acai_tree:      { w: 2.0, h: 2.3, anchorY: 0.78 },
  caryatid_altar: { w: 2.1, h: 2.2, anchorY: 0.75 },
  dredge_wreck:   { w: 2.1, h: 1.9, anchorY: 0.72 },
  diesel_wreck:   { w: 1.6, h: 1.5, anchorY: 0.70 },
  urucum_node:    { w: 1.5, h: 1.5, anchorY: 0.72 },
  curua_node:     { w: 1.4, h: 1.4, anchorY: 0.72 },
  clay_node:      { w: 1.4, h: 1.3, anchorY: 0.68 },
  cauixi_node:    { w: 1.5, h: 1.4, anchorY: 0.70 },
  charred_log:    { w: 1.5, h: 1.4, anchorY: 0.70 },
  shard_mound:    { w: 1.4, h: 1.3, anchorY: 0.68 },
  necked_vase:    { w: 1.4, h: 1.4, anchorY: 0.70 },
  petroglyph:     { w: 1.6, h: 1.6, anchorY: 0.72 },
  quartz_rock:    { w: 1.5, h: 1.5, anchorY: 0.72 },
  jade_vein:      { w: 1.5, h: 1.5, anchorY: 0.72 },
  water_lily:     { w: 1.5, h: 1.3, anchorY: 0.65 },
  elder_npc:      { w: 1.5, h: 1.6, anchorY: 0.76 },

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
  canvas.width = Math.max(480, Math.floor(rect.width));
  canvas.height = Math.max(320, Math.floor(rect.height));
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

function renderGame() {
  animFrame++;
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = "#090d12";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const colsVis = Math.ceil(canvas.width / TILE_SIZE) + 4;
  const rowsVis = Math.ceil(canvas.height / TILE_SIZE) + 4;

  const camX = Math.max(0, Math.min(MAP_W - colsVis + 2, Math.floor(state.player.x - colsVis / 2)));
  const camY = Math.max(0, Math.min(MAP_H - rowsVis + 2, Math.floor(state.player.y - rowsVis / 2)));

  const terrainColors = [
    "#156d75", "#7b5e3e", "#1b4d4a", "#9e6b3b",
    "#2d6e36", "#4b4b52", "#221a18", "#8f563b", "#a85032"
  ];

  // ==========================================================================
  // PASS 1: SEAMLESS TERRAIN TILES, ORGANIC SHORELINE EDGES & PIPE NETWORK
  // ==========================================================================
  const minY = Math.max(0, camY - 2);
  const maxY = Math.min(MAP_H, camY + rowsVis + 2);
  const minX = Math.max(0, camX - 2);
  const maxX = Math.min(MAP_W, camX + colsVis + 2);

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const sx = (x - camX) * TILE_SIZE;
      const sy = (y - camY) * TILE_SIZE;
      const t = getEffectiveTerrain(x, y);

      ctx.fillStyle = terrainColors[t] || "#2d6e36";
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      drawScenerySprite(ctx, t, sx, sy, TILE_SIZE, TILE_SIZE);

      // Organic shoreline bank shadow & foam when land meets water (like Image 2)
      const isWater = (t === 0 || t === 1 || t === 2);
      if (isWater) {
        // Check if left or top neighbor is land
        if (x > 0) {
          const leftT = getEffectiveTerrain(x - 1, y);
          if (leftT !== 0 && leftT !== 1 && leftT !== 2) {
            ctx.fillStyle = "#5c381e";
            ctx.fillRect(sx, sy, 6, TILE_SIZE);
            ctx.fillStyle = "#8a5630";
            ctx.fillRect(sx + 6, sy, 3, TILE_SIZE);
            ctx.fillStyle = "rgba(186, 242, 239, 0.45)";
            const foamOffset = Math.sin(animFrame * 0.06 + y * 0.9) * 2;
            ctx.fillRect(sx + 9 + foamOffset, sy + 4, 2, TILE_SIZE - 8);
          }
        }
        if (y > 0) {
          const topT = getEffectiveTerrain(x, y - 1);
          if (topT !== 0 && topT !== 1 && topT !== 2) {
            ctx.fillStyle = "#5c381e";
            ctx.fillRect(sx, sy, TILE_SIZE, 6);
            ctx.fillStyle = "rgba(186, 242, 239, 0.4)";
            ctx.fillRect(sx + 4, sy + 7, TILE_SIZE - 8, 2);
          }
        }
        // Water sparkles on the Tapajós river
        if (((x * 17 + y * 31) % 7 === 0)) {
          const spAlpha = 0.25 + 0.35 * Math.sin(animFrame * 0.08 + x + y);
          ctx.fillStyle = `rgba(224, 252, 249, ${spAlpha.toFixed(2)})`;
          ctx.fillRect(sx + (x * 7 % 26) + 8, sy + (y * 11 % 26) + 8, 3, 3);
        }
      }

      // Draw connected Terracotta Pipe joints when t === 8
      if (t === 8) {
        ctx.fillStyle = "#b85532";
        ctx.fillRect(sx + TILE_SIZE / 2 - 6, sy, 12, TILE_SIZE);
        ctx.fillRect(sx, sy + TILE_SIZE / 2 - 6, TILE_SIZE, 12);
        ctx.strokeStyle = "#592211";
        ctx.lineWidth = 2;
        ctx.strokeRect(sx + TILE_SIZE / 2 - 7, sy + TILE_SIZE / 2 - 7, 14, 14);
        ctx.fillStyle = "#e07a52";
        ctx.fillRect(sx + TILE_SIZE / 2 - 4, sy + TILE_SIZE / 2 - 4, 8, 8);
      }

      // Draw low-lying Canteiro de Terra Preta (bld_03) directly in ground pass so pipes & tall sprites overlap cleanly
      const obj = state.objects[y][x];
      if (obj && obj.kind === "building" && obj.id === "bld_03") {
        const bldImg = AssetLibrary.buildingImages128["bld_03"];
        if (bldImg && bldImg.complete && bldImg.naturalWidth > 0) {
          ctx.drawImage(bldImg, sx - 3, sy - 4, TILE_SIZE + 6, TILE_SIZE + 8);
        } else {
          drawScenerySprite(ctx, 29, sx - 3, sy - 4, TILE_SIZE + 6, TILE_SIZE + 8);
        }
      }
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
      if (obj.kind === "building" && obj.id === "bld_03") continue; // Drawn in ground pass

      renderList.push({
        sortY: y + 0.5,
        kind: obj.kind,
        x,
        y,
        obj
      });
    }
  }

  // Add Fauna & Solar Catamaran
  state.fauna.forEach(f => {
    renderList.push({
      sortY: f.y + 0.5,
      kind: "fauna",
      x: f.x,
      y: f.y,
      fauna: f
    });
  });

  // Add Protagonist
  renderList.push({
    sortY: state.player.y + 0.65,
    kind: "player",
    x: state.player.x,
    y: state.player.y
  });

  // Add Active Hummingbird Drone (flies slightly above canopy)
  const drone = state.drones[0];
  if (drone.active) {
    renderList.push({
      sortY: drone.y + 0.9,
      kind: "drone",
      x: drone.x,
      y: drone.y
    });
  }

  // Sort top-to-bottom by sortY (and X as tie-breaker)
  renderList.sort((a, b) => (a.sortY - b.sortY) || (a.x - b.x));

  // Render sorted entities with multi-tile scale, ground shadows & Solarpunk VFX
  renderList.forEach(item => {
    const baseSx = (item.x - camX) * TILE_SIZE;
    const baseSy = (item.y - camY) * TILE_SIZE;
    const centerX = baseSx + TILE_SIZE / 2;
    const bottomY = baseSy + TILE_SIZE;

    if (item.kind === "world" || item.kind === "building") {
      const obj = item.obj;
      const key = obj.kind === "building" ? obj.id : obj.type;
      const cfg = OBJECT_SCALES[key] || { w: 1.5, h: 1.5, anchorY: 0.72 };
      const dw = TILE_SIZE * cfg.w;
      const dh = TILE_SIZE * cfg.h;
      const dx = centerX - dw / 2;
      const dy = bottomY - dh * cfg.anchorY;

      // Ground drop shadow
      ctx.save();
      ctx.fillStyle = "rgba(8, 12, 16, 0.38)";
      ctx.beginPath();
      ctx.ellipse(centerX, bottomY - 4, dw * 0.34, dh * 0.14, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Bioluminescent Cyan Aura (Caryatid Condenser & Bio-Battery — matching Image 2!)
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

      // Warm Hearth Fire Glow (Clay Pyrolysis Kilns — matching Image 2!)
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

      // Draw actual 16-bit Sprite
      if (obj.kind === "building") {
        const bldImg = AssetLibrary.buildingImages128[obj.id];
        if (bldImg && bldImg.complete && bldImg.naturalWidth > 0) {
          ctx.drawImage(bldImg, dx, dy, dw, dh);
        } else {
          drawScenerySprite(ctx, obj.sceneryIdx, dx, dy, dw, dh);
        }
      } else {
        const sIdx = WORLD_OBJ_TYPES[obj.type].sceneryIdx;
        drawScenerySprite(ctx, sIdx, dx, dy, dw, dh);

        // If this is the Stilt Hut in Zone 1, also draw the rooftop solar panel shimmer
        if (obj.type === "stilt_hut") {
          const panelImg = AssetLibrary.buildingImages128["bld_05"];
          if (panelImg && panelImg.complete && panelImg.naturalWidth > 0) {
            ctx.drawImage(panelImg, centerX - TILE_SIZE * 0.65, dy + 2, TILE_SIZE * 1.35, TILE_SIZE * 1.15);
          }
        }

        // Polluting Scrap badge
        if (WORLD_OBJ_TYPES[obj.type].scrap) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.9)";
          ctx.fillRect(centerX + 8, dy + 8, 14, 14);
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px monospace";
          ctx.fillText("♻", centerX + 10, dy + 19);
        }
      }

      // Rising Smoke Puffs from Pyrolysis Kilns (matching Image 2!)
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
      const isBoat = f.type === "catamara";
      const scale = isBoat ? 2.2 : 1.4;
      const dw = TILE_SIZE * scale;
      const dh = TILE_SIZE * scale;
      const bob = Math.sin(animFrame * 0.08 + f.x) * 3;
      drawScenerySprite(ctx, f.sceneryIdx, centerX - dw / 2, bottomY - dh * 0.7 + bob, dw, dh);
    } else if (item.kind === "player") {
      const dw = TILE_SIZE * 1.55;
      const dh = TILE_SIZE * 1.65;
      const dx = centerX - dw / 2;
      const dy = bottomY - dh * 0.78;

      // Player shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
      ctx.beginPath();
      ctx.ellipse(centerX, bottomY - 4, TILE_SIZE * 0.36, TILE_SIZE * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      if (state.player.inBoat) {
        const boatIdx = state.world.unlockedTechs.includes("T3_05") ? 40 : 39;
        drawScenerySprite(ctx, boatIdx, centerX - TILE_SIZE * 0.9, bottomY - TILE_SIZE * 1.3, TILE_SIZE * 1.8, TILE_SIZE * 1.8);
      } else {
        const charIdx = state.player.scanningTicks > 0 ? 37 : 36;
        drawScenerySprite(ctx, charIdx, dx, dy, dw, dh);
      }

      // Subtle golden reticle at player's feet
      ctx.strokeStyle = "rgba(245, 194, 66, 0.65)";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(baseSx + 3, baseSy + 3, TILE_SIZE - 6, TILE_SIZE - 6);

      // Bio-Scanner Expanding Pulse Ring
      if (state.player.scanningTicks > 0) {
        state.player.scanningTicks--;
        const radius = (19 - state.player.scanningTicks) * 6;
        ctx.strokeStyle = "rgba(46, 213, 196, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, baseSy + TILE_SIZE / 2, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (item.kind === "drone") {
      const hoverY = Math.sin(animFrame * 0.22) * 5;
      const dw = TILE_SIZE * 1.35;
      const dh = TILE_SIZE * 1.35;
      const dx = centerX - dw / 2;
      const dy = bottomY - dh - 12 + hoverY;

      // Drone ground shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
      ctx.beginPath();
      ctx.ellipse(centerX, bottomY - 4, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Water Mist / Pollen Droplets sprayed by the Hummingbird Drone (matching Image 2!)
      ctx.fillStyle = "rgba(125, 249, 255, 0.75)";
      for (let d = 0; d < 4; d++) {
        const dropProg = ((animFrame * 2 + d * 7) % 24) / 24;
        ctx.fillRect(dx - 2 - dropProg * 12, dy + dh * 0.55 + dropProg * 18, 2.5, 2.5);
      }

      drawScenerySprite(ctx, 38, dx, dy, dw, dh);
    }
  });

  // ==========================================================================
  // PASS 3: BIOLUMINESCENT FOREST FIREFLIES & SEASONAL WEATHER OVERLAY
  // ==========================================================================
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
    ctx.strokeStyle = "rgba(125, 211, 252, 0.18)";
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

  // Player indicator dot on Santarém minimap
  miniCtx.fillStyle = "#f5c242";
  miniCtx.beginPath();
  miniCtx.arc(state.player.x * cw, state.player.y * ch, 4, 0, Math.PI * 2);
  miniCtx.fill();
  miniCtx.strokeStyle = "#1a120b";
  miniCtx.lineWidth = 1.5;
  miniCtx.stroke();
}
