// ============================================================================
// FUTURE SHARDS — 16-BIT CANVAS & MINIMAP RENDERER (USING PNG ASSET LIBRARY)
// ============================================================================

let canvas = null;
let ctx = null;
let miniCanvas = null;
let miniCtx = null;
let animFrame = 0;

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

// Draws a scenery/world sprite using the individual loaded PNG from future_shards_sprites_cenario_e_recursos/
// or falls back to the master transparent spritesheet if needed
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

  const colsVis = Math.ceil(canvas.width / TILE_SIZE) + 2;
  const rowsVis = Math.ceil(canvas.height / TILE_SIZE) + 2;

  const camX = Math.max(0, Math.min(MAP_W - colsVis + 1, Math.floor(state.player.x - colsVis / 2)));
  const camY = Math.max(0, Math.min(MAP_H - rowsVis + 1, Math.floor(state.player.y - rowsVis / 2)));

  const terrainColors = [
    "#138a99", "#7b5e3e", "#1b4d4a", "#e8d29b",
    "#2d7a3e", "#4b4b52", "#221c20", "#8f563b", "#a85032"
  ];

  // 1. Draw Terrain Grid & World Objects
  for (let y = camY; y < Math.min(MAP_H, camY + rowsVis); y++) {
    for (let x = camX; x < Math.min(MAP_W, camX + colsVis); x++) {
      const sx = (x - camX) * TILE_SIZE;
      const sy = (y - camY) * TILE_SIZE;
      const t = getEffectiveTerrain(x, y);

      ctx.fillStyle = terrainColors[t] || "#2d7a3e";
      ctx.fillRect(sx, sy, TILE_SIZE, TILE_SIZE);
      drawScenerySprite(ctx, t, sx, sy, TILE_SIZE, TILE_SIZE);

      // Zone border lines (X=20 and X=40)
      if (x === 20 || x === 40) {
        ctx.strokeStyle = "rgba(245, 194, 66, 0.35)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(sx, sy + TILE_SIZE);
        ctx.stroke();
      }

      // World Object / Building on this tile
      const obj = state.objects[y][x];
      if (obj) {
        if (obj.kind === "building") {
          const bldImg = AssetLibrary.buildingImages128[obj.id];
          if (bldImg && bldImg.complete && bldImg.naturalWidth > 0) {
            ctx.drawImage(bldImg, sx - 2, sy - 4, TILE_SIZE + 4, TILE_SIZE + 4);
          } else {
            drawScenerySprite(ctx, obj.sceneryIdx, sx - 2, sy - 4, TILE_SIZE + 4, TILE_SIZE + 4);
          }
        } else {
          const sIdx = WORLD_OBJ_TYPES[obj.type].sceneryIdx;
          drawScenerySprite(ctx, sIdx, sx - 2, sy - 4, TILE_SIZE + 4, TILE_SIZE + 4);

          // Highlight recycle icon on polluting scrap
          if (WORLD_OBJ_TYPES[obj.type].scrap) {
            ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
            ctx.fillRect(sx + TILE_SIZE - 14, sy + 2, 12, 12);
            ctx.fillStyle = "#fff";
            ctx.font = "bold 9px monospace";
            ctx.fillText("♻", sx + TILE_SIZE - 12, sy + 11);
          }
        }
      }
    }
  }

  // 2. Draw Fauna (Pink Dolphin & Macaw)
  state.fauna.forEach(f => {
    if (f.x >= camX && f.x < camX + colsVis && f.y >= camY && f.y < camY + rowsVis) {
      const fx = (f.x - camX) * TILE_SIZE;
      const fy = (f.y - camY) * TILE_SIZE + Math.sin(animFrame * 0.08) * 3;
      drawScenerySprite(ctx, f.sceneryIdx, fx, fy, TILE_SIZE, TILE_SIZE);
    }
  });

  // 3. Draw Active Hummingbird Drone
  const drone = state.drones[0];
  if (drone.active) {
    const dx = (drone.x - camX) * TILE_SIZE;
    const dy = (drone.y - camY) * TILE_SIZE - 8 + Math.sin(animFrame * 0.2) * 4;
    drawScenerySprite(ctx, 38, dx, dy, TILE_SIZE, TILE_SIZE);
  }

  // 4. Draw Protagonist (or Solar Canoe when on deep river water)
  const px = (state.player.x - camX) * TILE_SIZE;
  const py = (state.player.y - camY) * TILE_SIZE;

  if (state.player.inBoat) {
    const boatIdx = state.world.unlockedTechs.includes("T3_05") ? 40 : 39;
    drawScenerySprite(ctx, boatIdx, px - 4, py - 4, TILE_SIZE + 8, TILE_SIZE + 8);
  } else {
    const charIdx = state.player.scanningTicks > 0 ? 37 : 36;
    drawScenerySprite(ctx, charIdx, px - 2, py - 4, TILE_SIZE + 4, TILE_SIZE + 4);
  }

  // Bio-Scanner Expanding Pulse Ring
  if (state.player.scanningTicks > 0) {
    state.player.scanningTicks--;
    const radius = (16 - state.player.scanningTicks) * 6;
    ctx.strokeStyle = "rgba(46, 213, 196, 0.85)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(px + TILE_SIZE / 2, py + TILE_SIZE / 2, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Player Selection Reticle
  ctx.strokeStyle = "#f5c242";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px + 1, py + 1, TILE_SIZE - 2, TILE_SIZE - 2);

  // 5. Weather & Day/Night Atmospheric Filter
  if (state.world.season === "CHEIA" && animFrame % 2 === 0) {
    ctx.strokeStyle = "rgba(125, 211, 252, 0.28)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 28; i++) {
      const rx = ((i * 97 + animFrame * 7) % canvas.width);
      const ry = ((i * 53 + animFrame * 13) % canvas.height);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 10);
      ctx.stroke();
    }
  } else if (state.world.season === "SECA" && state.world.ecoIndex < 65) {
    ctx.fillStyle = "rgba(245, 158, 11, 0.07)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (state.world.timeOfDay >= 19 || state.world.timeOfDay < 5) {
    ctx.fillStyle = "rgba(10, 18, 38, 0.42)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  renderMinimap();
  requestAnimationFrame(renderGame);
}

function renderMinimap() {
  const mw = miniCanvas.width;
  const mh = miniCanvas.height;
  const cw = mw / MAP_W;
  const ch = mh / MAP_H;

  const colors = [
    "#138a99", "#7b5e3e", "#1b4d4a", "#e8d29b",
    "#2d7a3e", "#52525b", "#18181b", "#b45309", "#ea580c"
  ];

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const t = getEffectiveTerrain(x, y);
      miniCtx.fillStyle = colors[t] || "#2d7a3e";
      miniCtx.fillRect(x * cw, y * ch, cw + 0.5, ch + 0.5);
      if (state.objects[y][x] && state.objects[y][x].kind === "building") {
        miniCtx.fillStyle = "#38bdf8";
        miniCtx.fillRect(x * cw, y * ch, cw + 1, ch + 1);
      }
    }
  }

  miniCtx.fillStyle = "#f5c242";
  miniCtx.fillRect(state.player.x * cw - 2, state.player.y * ch - 2, 5, 5);
}

