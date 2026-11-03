// ============================================================================
// FUTURE SHARDS — WORLD MAP, CONTINUOUS SUB-TILE PHYSICS & SIMULATION LOGIC
// Implements Free-Roam 360° Movement, Circular Footprint Colliders + Wall-Sliding,
// Smart Proximity Target Detection, and Magnetic Loot Drops + Floating Texts
// ============================================================================

const MAP_W = 60;
const MAP_H = 40;
const TILE_SIZE = 44; // Rendered pixel size on main canvas

// Terrain Tile IDs (matching SCENERY_ASSETS Row 0: indices 0..8)
// 0: Deep Tapajós Water, 1: Muddy Amazon Water, 2: Shallow Igapó Water,
// 3: White Sand Beach, 4: Lush Várzea Grass, 5: Degraded Grey Burned Soil,
// 6: Fertile Terra Preta Soil, 7: Wooden Stilt Floor, 8: Pipe & Cable Floor

// Circular footprint collision radii (in tile units) at the base of world objects
const COLLIDER_RADII = {
  stilt_hut:      0.85,
  samauma_tree:   0.48,
  rubber_tree:    0.38,
  andiroba_tree:  0.38,
  acai_tree:      0.34,
  caryatid_altar: 0.55,
  dredge_wreck:   0.58,
  diesel_wreck:   0.45,
  quartz_rock:    0.42,
  jade_vein:      0.42,
  petroglyph:     0.42,
  bld_02:         0.50,
  bld_04:         0.48,
  bld_05:         0.45,
  bld_06:         0.42,
  bld_07:         0.52,
  bld_08:         0.45,
  bld_09:         0.45
};

const state = {
  playerName: "Aruã Tapajó",
  player: {
    x: 10.5,         // Continuous floating-point world X (in tile units)
    y: 19.5,         // Continuous floating-point world Y (in tile units)
    vx: 0,           // Velocity X (tiles/sec)
    vy: 0,           // Velocity Y (tiles/sec)
    dir: "up",       // "down", "up", "right", "left"
    walkFrame: 1,    // 0=walk1, 1=idle, 2=walk2
    walkCycleTimer: 0,
    stepSfxTimer: 0,
    isMoving: false,
    moveTarget: null,// { x, y, interactOnArrive } for smooth click-to-move
    actionSwing: 0,  // 0..1 tool swing / action animation timer
    actionTarget: null, // { x, y }
    hp: 100,
    maxHp: 100,
    stamina: 120,
    maxStamina: 120,
    solarCharge: 75,
    maxSolarCharge: 100,
    pcv: 120,
    scanningTicks: 0,
    inBoat: false,
    equipment: {
      head: null,
      body: null,
      back: "eq_back_02",
      feet: null,
      tool: "eq_tool_03",
      amulet1: "eq_amul_01",
      amulet2: null
    },
    inventory: {
      eq_amul_01: 1,
      mat_01: 5,
      arq_01: 4,
      proc_03: 4,
      eq_tool_03: 1,
      proc_07: 2,
      mat_04: 4,
      mat_06: 4,
      mat_08: 3,
      cons_02: 2
    }
  },
  camera: {
    x: 10.5,
    y: 19.5,
    shake: 0
  },
  input: {
    keys: { up: false, down: false, left: false, right: false },
    mouseWorldX: 10.5,
    mouseWorldY: 19.5
  },
  nearestTarget: null, // { tx, ty, dist, obj, label }
  lootDrops: [],       // Magnetic loot items jumping & flying into player backpack
  floatingTexts: [],   // Floating "+3 Argila" / "+15 PCV" popups
  footParticles: [],   // Dust, leaf & water ripple particles under player feet
  objectShakes: {},    // Map of "tx,ty" -> shake timer (0..1)
  world: {
    season: "CHEIA",
    dayInSeason: 1,
    totalDays: 1,
    timeOfDay: 9.5,
    ecoIndex: 78,
    gridPowerGen: 0,
    gridPowerUse: 0,
    recycledCount: 0,
    terraPretaCount: 12,
    plantedTreesCount: 2,
    unlockedTechs: ["T1_01", "T1_02", "T1_04"],
    selectedTechId: "T3_04",
    scannedTypes: {},
    activeMode: "collect",
    selectedBuildId: "bld_07",
    craftFilterCat: "ALL",
    hoveredCraftId: "bld_06"
  },
  baseGrid: [],
  objects: [],
  drones: [
    { x: 11.2, y: 20.4, vx: 0, vy: 0, tx: 10.3, ty: 22.2, active: true }
  ],
  fauna: [
    { type: "boto", sceneryIdx: 41, x: 16.5, y: 24.5, vx: 0.6, vy: 0.2, minX: 15.5, maxX: 19.2, minY: 18.0, maxY: 31.0 },
    { type: "boto", sceneryIdx: 41, x: 28.0, y: 34.8, vx: -0.7, vy: 0.15, minX: 20.0, maxX: 38.0, minY: 33.8, maxY: 37.5 },
    { type: "arara", sceneryIdx: 42, x: 8.0, y: 12.0, vx: 1.1, vy: 0.35, minX: 3.0, maxX: 36.0, minY: 6.0, maxY: 26.0 },
    { type: "catamara", sceneryIdx: 40, x: 17.4, y: 22.2, vx: 0, vy: 0.18, minX: 16.8, maxX: 18.5, minY: 20.5, maxY: 24.5 }
  ]
};

function initWorldMap() {
  state.baseGrid = [];
  state.objects = [];
  for (let y = 0; y < MAP_H; y++) {
    const rowT = [];
    const rowO = [];
    for (let x = 0; x < MAP_W; x++) {
      let t = 4; // Default lush grass

      const riverCurveX = 14.8 + Math.sin(y * 0.24) * 1.8 + (y > 24 ? (24 - y) * 0.45 : 0);
      if (x < 20) {
        if (x >= riverCurveX + 1.1 || y >= 33) {
          t = 0; // Deep Tapajós turquoise water
        } else if (x >= riverCurveX - 0.3 || y >= 31) {
          t = 3; // Sandy/earthy river bank shoreline
        } else if (x >= 4 && x <= 13 && y >= 15 && y <= 24) {
          t = 3; // Earthy Solarpunk Ecobase courtyard clearing
        } else {
          t = 4; // Lush forest grass around the clearing
        }
      } else if (x >= 20 && x < 40) {
        const dIsland = Math.hypot(x - 30, y - 21);
        const channelWave = Math.sin(x * 0.45 + y * 0.3) + Math.cos(x * 0.2 - y * 0.35);
        if (y >= 34) {
          t = (x < 32) ? 0 : 1;
        } else if (y >= 32) {
          t = 3;
        } else if (dIsland < 5.2) {
          t = 6;
        } else if (dIsland < 6.4) {
          t = 4;
        } else if (channelWave > 0.35 && y >= 9 && y <= 30) {
          t = 2;
        } else {
          t = 4;
        }
      } else {
        if (y >= 34) {
          t = 1;
        } else if (y >= 32) {
          t = 3;
        } else {
          const dBurn = Math.hypot((x - 51) * 0.9, (y - 20) * 1.1);
          if (dBurn < 7.8) {
            t = 5;
          } else {
            t = 4;
          }
        }
      }
      rowT.push(t);
      rowO.push(null);
    }
    state.baseGrid.push(rowT);
    state.objects.push(rowO);
  }

  // 1. Stilt House Platform (Top-Left of Ecobase Clearing: X 4..7, Y 15..17)
  for (let y = 15; y <= 17; y++) {
    for (let x = 4; x <= 7; x++) {
      state.baseGrid[y][x] = 7;
    }
  }

  // 2. Wooden Trapiche Pier extending into the Tapajós River (Bottom-Right: X 12..16, Y 23..24)
  for (let x = 12; x <= 16; x++) {
    state.baseGrid[23][x] = 7;
    state.baseGrid[24][x] = 7;
  }

  // 3. Terracotta Irrigation Pipes & Lush Terra Preta Crop Beds
  const pipeCoords = [
    [8, 19], [7, 19], [7, 20], [7, 21], [7, 22], [7, 23], [7, 24],
    [4, 20], [4, 21], [4, 22], [4, 23], [4, 24],
    [5, 22], [6, 22], [5, 24], [6, 24], [8, 24]
  ];
  pipeCoords.forEach(([px, py]) => {
    state.baseGrid[py][px] = 8;
  });

  const cropCoords = [
    [3, 20], [3, 21], [3, 22], [3, 23],
    [5, 20], [6, 20], [5, 21], [6, 21],
    [5, 23], [6, 23],
    [8, 20], [9, 20], [8, 21], [9, 21],
    [8, 22], [9, 22], [8, 23], [9, 23]
  ];
  cropCoords.forEach(([cx, cy]) => {
    state.baseGrid[cy][cx] = 6;
    state.objects[cy][cx] = { kind: "building", id: "bld_03", sceneryIdx: 29, name: "Canteiro de Terra Preta" };
  });

  // 4. Iconic Ecobase Structures
  state.objects[16][6] = { kind: "world", type: "stilt_hut" };
  state.objects[18][4] = { kind: "building", id: "bld_02", sceneryIdx: 28, name: "Forno Cerâmico de Pirólise" };
  state.objects[16][8] = { kind: "building", id: "bld_02", sceneryIdx: 28, name: "Forno Cerâmico de Pirólise" };
  state.objects[19][8] = { kind: "building", id: "bld_07", sceneryIdx: 33, name: "Condensador de Neblina de Cariátides" };
  state.objects[15][7] = { kind: "building", id: "bld_05", sceneryIdx: 31, name: "Painel Solar de Palafita" };
  state.objects[17][5] = { kind: "building", id: "bld_06", sceneryIdx: 32, name: "Bio-Bateria Tapajônica" };
  state.objects[21][10] = { kind: "world", type: "curua_node" };
  state.objects[22][10] = { kind: "world", type: "curua_node" };
  state.objects[23][10] = { kind: "world", type: "curua_node" };
  state.objects[22][12] = { kind: "world", type: "elder_npc" };

  // 5. Dense Forest Canopy Framing Zone 1
  const z1Forest = [
    [12, 15, "samauma_tree"], [3, 13, "samauma_tree"], [9, 12, "samauma_tree"],
    [2, 16, "andiroba_tree"], [2, 19, "acai_tree"], [2, 23, "andiroba_tree"], [2, 26, "samauma_tree"],
    [5, 13, "acai_tree"], [7, 13, "andiroba_tree"], [11, 13, "acai_tree"], [13, 13, "urucum_node"],
    [11, 16, "curua_node"], [13, 17, "urucum_node"],
    [4, 26, "acai_tree"], [6, 26, "curua_node"], [9, 26, "andiroba_tree"],
    [11, 28, "clay_node"], [13, 27, "clay_node"], [14, 29, "clay_node"],
    [3, 9, "acai_tree"], [6, 8, "rubber_tree"], [10, 8, "samauma_tree"], [13, 9, "acai_tree"],
    [4, 29, "charred_log"], [8, 29, "clay_node"]
  ];
  z1Forest.forEach(([x, y, type]) => {
    if (!state.objects[y][x]) state.objects[y][x] = { kind: "world", type };
  });

  // 6. Zone 2 (Igapó & Archaeological Site)
  const z2Spots = [
    [22, 14, "cauixi_node"], [25, 27, "cauixi_node"], [35, 26, "cauixi_node"], [37, 16, "cauixi_node"],
    [23, 7, "rubber_tree"], [27, 6, "rubber_tree"], [32, 7, "rubber_tree"], [36, 8, "rubber_tree"],
    [24, 12, "andiroba_tree"], [34, 12, "andiroba_tree"],
    [29, 10, "samauma_tree"], [36, 13, "samauma_tree"],
    [28, 21, "shard_mound"], [32, 22, "shard_mound"], [27, 23, "shard_mound"],
    [30, 21, "necked_vase"], [31, 19, "petroglyph"],
    [23, 22, "water_lily"], [35, 23, "water_lily"], [26, 16, "water_lily"],
    [26, 30, "diesel_wreck"], [34, 29, "diesel_wreck"]
  ];
  z2Spots.forEach(([x, y, type]) => { state.objects[y][x] = { kind: "world", type }; });

  // 7. Zone 3 (Plateau, Quartz/Jade Outcrop, Burned Scar & Caryatid Sanctuary)
  const z3Spots = [
    [42, 8, "quartz_rock"], [43, 13, "quartz_rock"], [42, 18, "quartz_rock"],
    [43, 10, "jade_vein"], [44, 6, "jade_vein"],
    [52, 6, "caryatid_altar"], [46, 7, "samauma_tree"], [56, 8, "samauma_tree"],
    [48, 15, "charred_log"], [54, 16, "charred_log"], [49, 24, "charred_log"], [55, 22, "charred_log"],
    [51, 20, "dredge_wreck"], [54, 25, "dredge_wreck"], [48, 27, "diesel_wreck"]
  ];
  z3Spots.forEach(([x, y, type]) => { state.objects[y][x] = { kind: "world", type }; });
}

function getEffectiveTerrain(x, y) {
  const gx = Math.max(0, Math.min(MAP_W - 1, Math.floor(x)));
  const gy = Math.max(0, Math.min(MAP_H - 1, Math.floor(y)));
  const base = state.baseGrid[gy][gx];
  if (base === 6 || base === 7 || base === 8) return base;

  const isCheia = state.world.season === "CHEIA";
  if (isCheia) {
    if (gy >= 32 && base === 3 && gx >= 18) return 0;
  } else {
    if (gy === 33 && (base === 0 || base === 1)) return 3;
    if (base === 2 && Math.sin(gx * 0.5 + gy * 0.4) < 0) return 3;
  }
  return base;
}

function isTileIrrigated(tx, ty) {
  if (state.world.season === "CHEIA") return true;
  const gx = Math.floor(tx);
  const gy = Math.floor(ty);
  for (let y = Math.max(0, gy - 5); y <= Math.min(MAP_H - 1, gy + 5); y++) {
    for (let x = Math.max(0, gx - 5); x <= Math.min(MAP_W - 1, gx + 5); x++) {
      const obj = state.objects[y][x];
      if (obj && obj.kind === "building" && obj.id === "bld_07") {
        if (Math.hypot(gx - x, gy - y) <= 5.5 && state.player.solarCharge > 0) return true;
      }
    }
  }
  return false;
}

// ============================================================================
// CONTINUOUS SUB-TILE PHYSICS, CIRCULAR WALL-SLIDING & PROXIMITY TARGETING
// ============================================================================
function updateContinuousPhysics(dt) {
  const p = state.player;
  const keys = state.input.keys;

  // 1. Determine desired direction vector from Keyboard or Click-to-Move target
  let ix = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  let iy = (keys.down ? 1 : 0) - (keys.up ? 1 : 0);

  if (ix !== 0 || iy !== 0) {
    // Keyboard overrides click-to-move
    p.moveTarget = null;
    const len = Math.hypot(ix, iy);
    ix /= len;
    iy /= len;
  } else if (p.moveTarget) {
    const dx = p.moveTarget.x - p.x;
    const dy = p.moveTarget.y - p.y;
    const dist = Math.hypot(dx, dy);
    const stopDist = p.moveTarget.interactOnArrive ? 1.45 : 0.18;
    if (dist <= stopDist) {
      const target = p.moveTarget;
      p.moveTarget = null;
      if (target.interactOnArrive) {
        interactAtTile(Math.floor(target.x), Math.floor(target.y), true);
      }
    } else {
      ix = dx / dist;
      iy = dy / dist;
    }
  }

  // 2. Calculate top speed based on terrain, boat, and Muiraquitã amulet
  const curTerrain = getEffectiveTerrain(p.x, p.y);
  p.inBoat = (curTerrain === 0 || curTerrain === 1);

  let maxSpeed = 4.6; // Base speed in tiles per second
  if (p.equipment.amulet1 === "eq_amul_01") maxSpeed *= 1.22; // Muiraquitã +22% speed
  if (p.inBoat) maxSpeed *= 1.25;
  else if (curTerrain === 2 && p.equipment.feet !== "eq_feet_01") maxSpeed *= 0.65; // Shallow Igapó mud

  // Smooth acceleration & friction damping (physics-tuning pattern)
  const accel = 26.0;
  const friction = 18.0;
  if (ix !== 0 || iy !== 0) {
    p.vx += (ix * maxSpeed - p.vx) * Math.min(1, accel * dt);
    p.vy += (iy * maxSpeed - p.vy) * Math.min(1, accel * dt);
  } else {
    p.vx -= p.vx * Math.min(1, friction * dt);
    p.vy -= p.vy * Math.min(1, friction * dt);
    if (Math.hypot(p.vx, p.vy) < 0.08) {
      p.vx = 0;
      p.vy = 0;
    }
  }

  const speed = Math.hypot(p.vx, p.vy);
  p.isMoving = speed > 0.25;

  // 3. Update Facing Direction ("down", "up", "right", "left") & 3-Frame Walk Cycle
  if (p.isMoving) {
    if (Math.abs(p.vx) > Math.abs(p.vy) * 0.85) {
      p.dir = p.vx > 0 ? "right" : "left";
    } else {
      p.dir = p.vy > 0 ? "down" : "up";
    }

    p.walkCycleTimer += dt * (speed * 2.1);
    const seq = [0, 1, 2, 1]; // Left step -> Idle -> Right step -> Idle
    p.walkFrame = seq[Math.floor(p.walkCycleTimer) % 4];

    // Spawn footstep particles & audio
    p.stepSfxTimer += dt * (speed / 4.2);
    if (p.stepSfxTimer >= 0.36) {
      p.stepSfxTimer = 0;
      spawnFootstepParticle(p.x, p.y, curTerrain);
      if (curTerrain === 7) playSfx("step_wood");
      else if (curTerrain === 0 || curTerrain === 1 || curTerrain === 2) playSfx("step_water");
      else playSfx("step_grass");
    }
  } else {
    p.walkFrame = 1; // Standing idle frame
    p.walkCycleTimer = 0;
  }

  // 4. Apply Continuous Position + Circular Footprint Collision Resolution (Wall-Sliding!)
  let nx = Math.max(0.6, Math.min(MAP_W - 0.6, p.x + p.vx * dt));
  let ny = Math.max(0.6, Math.min(MAP_H - 0.6, p.y + p.vy * dt));

  const playerRadius = 0.28;
  const checkMinX = Math.max(0, Math.floor(nx) - 2);
  const checkMaxX = Math.min(MAP_W - 1, Math.floor(nx) + 2);
  const checkMinY = Math.max(0, Math.floor(ny) - 2);
  const checkMaxY = Math.min(MAP_H - 1, Math.floor(ny) + 2);

  for (let cy = checkMinY; cy <= checkMaxY; cy++) {
    for (let cx = checkMinX; cx <= checkMaxX; cx++) {
      const obj = state.objects[cy][cx];
      if (!obj) continue;
      const key = obj.kind === "building" ? obj.id : obj.type;
      const obsR = COLLIDER_RADII[key];
      if (!obsR) continue; // Low objects like crop beds or clay mounds don't block movement

      const ox = cx + 0.5;
      const oy = cy + 0.55;
      const dx = nx - ox;
      const dy = ny - oy;
      const dist = Math.hypot(dx, dy);
      const minDist = playerRadius + obsR;
      if (dist < minDist && dist > 0.0001) {
        const push = minDist - dist;
        nx += (dx / dist) * push;
        ny += (dy / dist) * push;
      }
    }
  }

  const prevTileX = Math.floor(p.x);
  const prevTileY = Math.floor(p.y);
  p.x = nx;
  p.y = ny;

  if (Math.floor(p.x) !== prevTileX || Math.floor(p.y) !== prevTileY) {
    updateInspector(Math.floor(p.x), Math.floor(p.y));
    updateHUDOnly();
  }

  // 5. Smooth Lerp Camera with subtle look-ahead
  const lookAheadX = (p.vx / maxSpeed) * 0.45;
  const lookAheadY = (p.vy / maxSpeed) * 0.45;
  const camLerp = Math.min(1, dt * 8.5);
  state.camera.x += ((p.x + lookAheadX) - state.camera.x) * camLerp;
  state.camera.y += ((p.y + lookAheadY) - state.camera.y) * camLerp;
  if (state.camera.shake > 0) {
    state.camera.shake = Math.max(0, state.camera.shake - dt * 4.5);
  }

  // 6. Action Swing Timer Decay
  if (p.actionSwing > 0) {
    p.actionSwing = Math.max(0, p.actionSwing - dt * 3.2);
  }

  // 7. Update Smart Proximity Target Highlight
  updateNearestInteractableTarget();

  // 8. Update Continuous Fauna, Hummingbird Drone, Magnetic Loot & Particles
  updateContinuousEntitiesAndJuice(dt);
}

function updateNearestInteractableTarget() {
  const p = state.player;
  const dirVec = {
    down:  { x: 0, y: 1 },
    up:    { x: 0, y: -1 },
    right: { x: 1, y: 0 },
    left:  { x: -1, y: 0 }
  }[p.dir] || { x: 0, y: 1 };

  let best = null;
  let bestScore = 999;

  const gx = Math.floor(p.x);
  const gy = Math.floor(p.y);
  for (let y = Math.max(0, gy - 2); y <= Math.min(MAP_H - 1, gy + 2); y++) {
    for (let x = Math.max(0, gx - 2); x <= Math.min(MAP_W - 1, gx + 2); x++) {
      const obj = state.objects[y][x];
      if (!obj) continue;
      if (obj.kind === "building" && obj.id === "bld_03") continue;

      const ox = x + 0.5;
      const oy = y + 0.5;
      const dx = ox - p.x;
      const dy = oy - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 2.2) continue;

      // Favor objects in the direction the player is facing
      const dot = (dx * dirVec.x + dy * dirVec.y) / Math.max(0.01, dist);
      const score = dist - dot * 0.45;
      if (score < bestScore) {
        bestScore = score;
        best = { tx: x, ty: y, dist, obj };
      }
    }
  }
  state.nearestTarget = best;
}

function updateContinuousEntitiesAndJuice(dt) {
  // 1. Continuous Fauna Movement (Boto, Arara, Catamarã)
  state.fauna.forEach(f => {
    f.x += f.vx * dt;
    f.y += f.vy * dt;
    if (f.x < f.minX) { f.x = f.minX; f.vx = Math.abs(f.vx); }
    if (f.x > f.maxX) { f.x = f.maxX; f.vx = -Math.abs(f.vx); }
    if (f.y < f.minY) { f.y = f.minY; f.vy = Math.abs(f.vy); }
    if (f.y > f.maxY) { f.y = f.maxY; f.vy = -Math.abs(f.vy); }
  });

  // 2. Smooth Hummingbird Drone Flight between young saplings & crop beds
  const drone = state.drones[0];
  if (drone && drone.active) {
    const dx = drone.tx - drone.x;
    const dy = drone.ty - drone.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 0.25) {
      // Pick next patrol point around the Ecobase saplings & crop beds
      const patrolPoints = [
        { x: 10.4, y: 21.3 }, { x: 10.4, y: 23.3 },
        { x: 8.5, y: 21.5 },  { x: 6.0, y: 20.8 },
        { x: 8.5, y: 19.2 }
      ];
      const nextPt = patrolPoints[Math.floor(Math.random() * patrolPoints.length)];
      drone.tx = nextPt.x;
      drone.ty = nextPt.y;
    } else {
      drone.x += (dx / dist) * 2.1 * dt;
      drone.y += (dy / dist) * 2.1 * dt;
    }
  }

  // 3. Magnetic Loot Drops (Pop up with gravity bounce, then magnetize into player!)
  for (let i = state.lootDrops.length - 1; i >= 0; i--) {
    const d = state.lootDrops[i];
    d.age += dt;
    if (d.age < 0.38) {
      // Parabolic pop-out phase
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.z += d.vz * dt;
      d.vz -= 28.0 * dt;
      if (d.z < 0) { d.z = 0; d.vz = Math.abs(d.vz) * 0.45; }
    } else {
      // Magnetic pull toward player backpack
      const dx = state.player.x - d.x;
      const dy = (state.player.y - 0.3) - d.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 0.35 || d.age > 2.5) {
        addItem(d.itemId, d.qty);
        playSfx("collect");
        state.lootDrops.splice(i, 1);
        continue;
      }
      const pullSpeed = 7.5 + (d.age - 0.38) * 12.0;
      d.x += (dx / dist) * pullSpeed * dt;
      d.y += (dy / dist) * pullSpeed * dt;
      d.z = Math.max(0, d.z - dt * 2);
    }
  }

  // 4. Floating Texts ("+3 Argila", "+15 PCV")
  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.age += dt;
    ft.y -= 0.85 * dt;
    if (ft.age >= ft.life) state.floatingTexts.splice(i, 1);
  }

  // 5. Footstep Particles
  for (let i = state.footParticles.length - 1; i >= 0; i--) {
    const fp = state.footParticles[i];
    fp.age += dt;
    fp.x += fp.vx * dt;
    fp.y += fp.vy * dt;
    if (fp.age >= fp.life) state.footParticles.splice(i, 1);
  }

  // 6. Object Hit-Shake Timers
  Object.keys(state.objectShakes).forEach(k => {
    state.objectShakes[k] -= dt * 3.5;
    if (state.objectShakes[k] <= 0) delete state.objectShakes[k];
  });
}

function spawnFootstepParticle(x, y, terrain) {
  const isWater = (terrain === 0 || terrain === 1 || terrain === 2);
  state.footParticles.push({
    x: x + (Math.random() - 0.5) * 0.25,
    y: y + 0.15,
    vx: (Math.random() - 0.5) * 0.4,
    vy: -0.2 - Math.random() * 0.2,
    age: 0,
    life: isWater ? 0.55 : 0.38,
    isWater,
    color: isWater ? "rgba(165, 243, 252, 0.7)" : (terrain === 4 ? "rgba(134, 239, 172, 0.55)" : "rgba(214, 180, 140, 0.55)")
  });
}

function spawnMagneticLoot(tx, ty, itemId, qty) {
  const count = Math.min(4, qty);
  const baseQty = Math.floor(qty / count);
  const rem = qty % count;
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
    state.lootDrops.push({
      x: tx + 0.5,
      y: ty + 0.5,
      z: 0.2,
      vx: Math.cos(angle) * 1.6,
      vy: Math.sin(angle) * 1.4,
      vz: 6.5 + Math.random() * 2.5,
      itemId,
      qty: i === 0 ? baseQty + rem : baseQty,
      age: 0
    });
  }
}

function spawnFloatingText(x, y, text, color = "#fde047") {
  state.floatingTexts.push({
    x,
    y,
    text,
    color,
    age: 0,
    life: 1.25
  });
}

// ============================================================================
// INVENTORY, STATS & ECO % CALCULATIONS
// ============================================================================
function getMaxBagSlots() {
  const back = state.player.equipment.back;
  if (back === "eq_back_02") return 16;
  if (back === "eq_back_01") return 12;
  return 8;
}

function getUsedBagSlots() {
  return Object.keys(state.player.inventory).filter(k => state.player.inventory[k] > 0).length;
}

function addItem(itemId, qty = 1) {
  if (!state.player.inventory[itemId]) {
    if (getUsedBagSlots() >= getMaxBagSlots()) {
      showToast("Mochila Cheia!", "Equipe o Cesto Trançado ou a Mochila Solar MK-II para mais slots.");
      return false;
    }
    state.player.inventory[itemId] = 0;
  }
  const maxStack = ITEM_MAP[itemId] ? ITEM_MAP[itemId].stack : 50;
  state.player.inventory[itemId] = Math.min(maxStack, state.player.inventory[itemId] + qty);
  updateAllUI();
  return true;
}

function hasIngredients(recipe) {
  for (const [id, count] of Object.entries(recipe)) {
    if ((state.player.inventory[id] || 0) < count) return false;
  }
  return true;
}

function consumeIngredients(recipe) {
  for (const [id, count] of Object.entries(recipe)) {
    state.player.inventory[id] -= count;
    if (state.player.inventory[id] <= 0) delete state.player.inventory[id];
  }
}

function getPlayerThermalProtection() {
  let prot = 0;
  if (state.player.equipment.body === "eq_body_01") prot += 45;
  if (state.player.equipment.amulet2 === "eq_amul_02") prot += 25;
  return prot;
}

function recalculateEcoAndPower() {
  let buildEco = 0;
  let genW = 0;
  let useW = 0;
  let maxWh = 85;
  let hasDroneStation = true;

  const isDay = state.world.timeOfDay >= 6 && state.world.timeOfDay <= 18;
  const isSeca = state.world.season === "SECA";

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const obj = state.objects[y][x];
      if (obj && obj.kind === "building") {
        const b = BUILDINGS_DB.find(item => item.id === obj.id);
        if (b) {
          buildEco += (b.id === "bld_03" ? 1.5 : b.eco);
          if (b.storage) maxWh += b.storage;
          if (b.id === "bld_05" && isDay) {
            genW += isSeca ? 35 : 25;
          } else if (b.id === "bld_09") {
            genW += isSeca ? 15 : 40;
          } else if (b.power < 0) {
            useW += Math.abs(b.power);
          }
          if (b.id === "bld_08") {
            hasDroneStation = true;
          }
        }
      }
    }
  }

  if (state.player.equipment.back === "eq_back_02" && isDay) {
    genW += 4;
  }

  state.player.maxSolarCharge = maxWh;
  state.world.gridPowerGen = genW;
  state.world.gridPowerUse = useW;
  state.drones[0].active = hasDroneStation;

  const rawEco = 22
    + (state.world.recycledCount * 6)
    + (state.world.terraPretaCount * 1.5)
    + (state.world.plantedTreesCount * 4)
    + buildEco
    + (state.world.unlockedTechs.length * 2);

  state.world.ecoIndex = Math.min(100, Math.max(0, Math.round(rawEco)));
}

// ============================================================================
// INTERACTION & GAMEPLAY ACTIONS (WITH SMOOTH CLICK-TO-MOVE & LOOT JUICE)
// ============================================================================
function interactWithNearestOrCurrentTile() {
  if (state.nearestTarget) {
    interactAtTile(state.nearestTarget.tx, state.nearestTarget.ty, true);
  } else {
    interactAtTile(Math.floor(state.player.x), Math.floor(state.player.y), true);
  }
}

function interactAtTile(tx, ty, forceImmediate = false) {
  if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return;
  const targetCenterX = tx + 0.5;
  const targetCenterY = ty + 0.5;
  const dist = Math.hypot(targetCenterX - state.player.x, targetCenterY - state.player.y);

  // If clicked far away, smoothly glide there and interact upon arrival!
  if (dist > 2.2 && !forceImmediate) {
    state.player.moveTarget = {
      x: targetCenterX,
      y: targetCenterY,
      interactOnArrive: true
    };
    return;
  }

  // Face toward the interacted object
  const dx = targetCenterX - state.player.x;
  const dy = targetCenterY - state.player.y;
  if (Math.hypot(dx, dy) > 0.2) {
    if (Math.abs(dx) > Math.abs(dy)) state.player.dir = dx > 0 ? "right" : "left";
    else state.player.dir = dy > 0 ? "down" : "up";
  }

  // Trigger tool swing animation & hit-shake on the target tile
  state.player.actionSwing = 1.0;
  state.player.actionTarget = { x: targetCenterX, y: targetCenterY };
  state.objectShakes[`${tx},${ty}`] = 1.0;

  const mode = state.world.activeMode;
  const obj = state.objects[ty][tx];
  const terrain = getEffectiveTerrain(tx, ty);

  if (mode === "build") {
    placeBuildingAt(tx, ty);
    return;
  }

  if (mode === "terrapreta") {
    if ((state.player.inventory["proc_03"] || 0) <= 0) {
      showToast("Sem Terra Preta!", "Fabrique Terra Preta de Índio na bancada [C] ou use o Kit de Teste.");
      return;
    }
    if (state.baseGrid[ty][tx] === 6) {
      showToast("Solo já é Terra Preta", "Este bloco já está fértil e sequestrando carbono.");
      return;
    }
    state.player.inventory["proc_03"]--;
    state.baseGrid[ty][tx] = 6;
    state.world.terraPretaCount++;
    playSfx("craft");
    spawnFloatingText(targetCenterX, targetCenterY - 0.3, "+Terra Preta (+ECO%)", "#4ade80");
    logMsg(`Solo regenerado com Terra Preta em (${tx},${ty})! +ECO%`);
    recalculateEcoAndPower();
    updateAllUI();
    return;
  }

  if (mode === "plant") {
    if (obj) {
      showToast("Local Ocupado", "Escolha um local livre de Terra Preta ou grama para plantar.");
      return;
    }
    if (terrain === 5) {
      showToast("Solo Cinza Degradado!", "Aplique Terra Preta de Índio [4] antes de plantar na Cicatriz da Queimada.");
      return;
    }
    const hasSamauma = (state.player.inventory["mat_09"] || 0) > 0;
    const hasAcai = (state.player.inventory["mat_08"] || 0) > 0;
    if (!hasSamauma && !hasAcai) {
      showToast("Sem Sementes/Mudas", "Colete Sementes de Açaí ou Mudas de Samaúma para plantar.");
      return;
    }
    if (hasSamauma) {
      state.player.inventory["mat_09"]--;
      state.objects[ty][tx] = { kind: "world", type: "samauma_tree" };
      spawnFloatingText(targetCenterX, targetCenterY - 0.4, "🌱 Samaúma (+4% ECO)", "#4ade80");
      logMsg(`Muda de Samaúma plantada em (${tx},${ty})! +4% ECO`);
    } else {
      state.player.inventory["mat_08"]--;
      state.objects[ty][tx] = { kind: "world", type: "acai_tree" };
      spawnFloatingText(targetCenterX, targetCenterY - 0.4, "🌱 Açaizeiro (+4% ECO)", "#4ade80");
      logMsg(`Palmeira de Açaí plantada em (${tx},${ty})! +4% ECO`);
    }
    state.world.plantedTreesCount++;
    playSfx("craft");
    recalculateEcoAndPower();
    updateAllUI();
    return;
  }

  if (mode === "scan") {
    if (state.player.solarCharge < 4) {
      showToast("Bateria Solar Baixa!", "Aguarde o sol recarregar ou construa Painéis Solares.");
      return;
    }
    state.player.solarCharge = Math.max(0, state.player.solarCharge - 4);
    state.player.scanningTicks = 22;
    playSfx("scan");

    if (obj && obj.kind === "world") {
      const info = WORLD_OBJ_TYPES[obj.type];
      const firstTime = !state.world.scannedTypes[obj.type];
      state.world.scannedTypes[obj.type] = true;
      let bonusMult = state.player.equipment.tool === "eq_tool_03" ? 1.5 : 1.0;
      if (state.player.equipment.head === "eq_head_01") bonusMult += 0.25;
      const gained = Math.round((firstTime ? info.pcv : Math.max(5, Math.floor(info.pcv / 2))) * bonusMult);
      state.player.pcv += gained;
      spawnFloatingText(targetCenterX, targetCenterY - 0.5, `+${gained} PCV 📡`, "#56f5e1");
      showToast(`Bio-Scanner: ${info.name}`, `+${gained} Pontos de Ciência Verde (PCV) registrados!`);
      logMsg(`Escaneou ${info.name}: +${gained} PCV.`);
    } else {
      state.player.pcv += 5;
      spawnFloatingText(targetCenterX, targetCenterY - 0.4, `+5 PCV 📡`, "#56f5e1");
      showToast("Análise de Microclima", "+5 PCV pela leitura de solo e umidade do Tapajós.");
    }
    updateAllUI();
    return;
  }

  if (mode === "recycle") {
    if (obj && obj.kind === "world" && WORLD_OBJ_TYPES[obj.type].scrap) {
      const info = WORLD_OBJ_TYPES[obj.type];
      state.objects[ty][tx] = null;
      state.world.recycledCount++;
      state.camera.shake = 0.6;
      playSfx("craft");
      spawnMagneticLoot(tx, ty, "rec_01", 3);
      spawnMagneticLoot(tx, ty, "rec_02", 2);
      spawnMagneticLoot(tx, ty, "rec_03", 2);
      spawnFloatingText(targetCenterX, targetCenterY - 0.5, "♻️ +6% ECO!", "#4ade80");
      showToast("Sucata Poluente Reciclada!", "Você extraiu Cobre, Ímãs e Vidro e limpou o ecossistema (+6% ECO)!");
      logMsg(`${info.name} reciclado! +3 Cobre, +2 Ímãs, +2 Vidro, +6% ECO.`);
      recalculateEcoAndPower();
      updateAllUI();
    } else {
      showToast("Nenhuma Sucata Aqui", "Use [3] em Motores a Diesel ou Dragas Abandonadas nas Zonas 2 e 3.");
    }
    return;
  }

  if (obj && obj.kind === "world") {
    const info = WORLD_OBJ_TYPES[obj.type];
    if (info.npc) {
      state.player.pcv += 15;
      spawnMagneticLoot(tx, ty, "arq_02", 1);
      spawnFloatingText(targetCenterX, targetCenterY - 0.6, "+15 PCV • Sabedoria Tapajó", "#fde047");
      playSfx("tech");
      showToast("Mestre Artesão Tapajó:", "“A sílica do cauixi impede o barro de rachar, e os Vasos de Cariátides condensam a neblina na Seca!” (+15 PCV, +1 Vaso de Gargalo)");
      logMsg("Conversou com o Mestre Artesão na Casa de Saberes (+15 PCV).");
      updateAllUI();
      return;
    }
    if (info.scrap) {
      showToast("Sucata Pesada", "Selecione [3] Reciclar na barra superior para desmontar este motor/draga!");
      return;
    }
    if (state.player.stamina < 6) {
      showToast("Vigor Baixo!", "Consuma Açaí ou Água Filtrada [7] para recuperar seu vigor.");
      return;
    }
    state.player.stamina = Math.max(0, state.player.stamina - 6);
    state.camera.shake = 0.25;
    playSfx("collect");
    spawnMagneticLoot(tx, ty, info.drop, info.qty);
    spawnFloatingText(targetCenterX, targetCenterY - 0.45, `+${info.qty} ${ITEM_MAP[info.drop].name}`, "#fde047");
    logMsg(`Coletou ${info.qty}x ${ITEM_MAP[info.drop].name} de ${info.name}.`);
    if (["clay_node", "shard_mound", "necked_vase", "charred_log", "quartz_rock", "jade_vein"].includes(obj.type)) {
      state.objects[ty][tx] = null;
    }
    updateAllUI();
    return;
  }

  if (terrain === 0 || terrain === 1 || terrain === 2) {
    playSfx("step_water");
    spawnMagneticLoot(tx, ty, "mat_13", 2);
    spawnFloatingText(targetCenterX, targetCenterY - 0.3, "+2 Água do Rio", "#7dd3fc");
    logMsg("Coletou 2x Água Bruta do Rio.");
  }
}

function placeBuildingAt(tx, ty) {
  const bld = BUILDINGS_DB.find(b => b.id === state.world.selectedBuildId);
  if (!bld) return;
  if (!state.world.unlockedTechs.includes(bld.tech)) {
    showToast("Tecnologia Bloqueada", `Pesquise o nó ${bld.tech} na Árvore Científica [T] primeiro.`);
    return;
  }
  if (!hasIngredients(bld.cost)) {
    showToast("Insumos Insuficientes", "Abra a Bancada [C] ou use o Kit de Teste para obter os materiais.");
    return;
  }
  const terrain = getEffectiveTerrain(tx, ty);
  if (bld.id === "bld_01") {
    consumeIngredients(bld.cost);
    state.baseGrid[ty][tx] = 7;
    playSfx("build");
    spawnFloatingText(tx + 0.5, ty, "🏗️ Palafita (+1% ECO)", "#fde047");
    logMsg(`Construiu Piso/Ponte de Palafita em (${tx},${ty}).`);
    recalculateEcoAndPower();
    updateAllUI();
    return;
  }
  if (bld.id === "bld_09" && terrain !== 0 && terrain !== 1 && terrain !== 2) {
    showToast("Requer Água!", "A Microturbina Hidrocinética deve ser instalada nas águas do rio ou igapó.");
    return;
  }
  if (state.objects[ty][tx]) {
    showToast("Local Ocupado", "Escolha um local livre para posicionar esta estrutura.");
    return;
  }
  consumeIngredients(bld.cost);
  state.objects[ty][tx] = { kind: "building", id: bld.id, sceneryIdx: bld.sceneryIdx, name: bld.name };
  state.objectShakes[`${tx},${ty}`] = 1.0;
  playSfx("build");
  spawnFloatingText(tx + 0.5, ty - 0.3, `🏗️ ${bld.name} (+${bld.eco}% ECO)`, "#38efdf");
  showToast(`${bld.name} Construído!`, `Impacto climático: +${bld.eco}% ECO.`);
  logMsg(`Construiu ${bld.name} em (${tx},${ty}) (+${bld.eco}% ECO).`);
  recalculateEcoAndPower();
  updateAllUI();
}

// Legacy helper for touch D-pad clicks (nudges velocity smoothly)
function movePlayer(dx, dy) {
  state.player.moveTarget = {
    x: Math.max(0.6, Math.min(MAP_W - 0.6, state.player.x + dx * 0.9)),
    y: Math.max(0.6, Math.min(MAP_H - 0.6, state.player.y + dy * 0.9)),
    interactOnArrive: false
  };
}

function advanceDay() {
  state.world.dayInSeason++;
  state.world.totalDays++;
  if (state.world.dayInSeason > 15) {
    state.world.dayInSeason = 1;
    state.world.season = state.world.season === "CHEIA" ? "SECA" : "CHEIA";
    showToast(
      `Nova Estação: ${state.world.season} (15 Dias)`,
      state.world.season === "CHEIA"
        ? "O Inverno Amazônico chegou! Os rios subiram e as microturbinas operam no máximo."
        : "O Verão Amazônico (Vazante) começou! Praias e sítios arqueológicos surgiram, mas proteja o solo da seca!"
    );
  }
  logMsg(`Início do Dia ${state.world.dayInSeason}/15 da estação ${state.world.season}.`);
  updateAllUI();
}
