// ============================================================================
// FUTURE SHARDS — WORLD MAP, GAME STATE & SIMULATION LOGIC (60x40 TILES)
// ============================================================================

const MAP_W = 60;
const MAP_H = 40;
const TILE_SIZE = 44; // Rendered pixel size on main canvas for rich 16-bit detail

// Terrain Tile IDs (matching SCENERY_ASSETS Row 0: indices 0..8)
// 0: Deep Tapajós Water, 1: Muddy Amazon Water, 2: Shallow Igapó Water,
// 3: White Sand Beach, 4: Lush Várzea Grass, 5: Degraded Grey Burned Soil,
// 6: Fertile Terra Preta Soil, 7: Wooden Stilt Floor, 8: Pipe & Cable Floor

const state = {
  playerName: "Aruã Tapajó",
  player: {
    x: 10,
    y: 19,
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
  world: {
    season: "CHEIA", // "CHEIA" (Days 1..15) or "SECA" (Days 16..30)
    dayInSeason: 1,  // 1..15
    totalDays: 1,
    timeOfDay: 9.5,  // 0.0 to 24.0 hours
    ecoIndex: 42,
    gridPowerGen: 0,
    gridPowerUse: 0,
    recycledCount: 0,
    terraPretaCount: 12,
    plantedTreesCount: 2,
    unlockedTechs: ["T1_01", "T1_02", "T1_04"],
    selectedTechId: "T3_04",
    scannedTypes: {},
    activeMode: "collect", // collect, scan, recycle, terrapreta, plant, build
    selectedBuildId: "bld_07",
    craftFilterCat: "ALL",
    hoveredCraftId: "bld_06"
  },
  baseGrid: [], // 2D array [y][x] of baseTerrain
  objects: [],  // 2D array [y][x] of world objects / buildings
  drones: [
    { x: 11, y: 20, tx: 10, ty: 22, active: true }
  ],
  fauna: [
    { type: "boto", sceneryIdx: 41, x: 16, y: 24, dir: 1 },
    { type: "boto", sceneryIdx: 41, x: 28, y: 34, dir: -1 },
    { type: "arara", sceneryIdx: 42, x: 8, y: 12, dir: 1 },
    { type: "catamara", sceneryIdx: 40, x: 17, y: 22, dir: -1 }
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

      // Zone 1 (0..19): Curved Tapajós River Bay on the right side of the Ecobase (matching Image 2)
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
        // Zone 2: Flooded Igapó with organic winding channels & Terra Preta Archaeological Island (no checkerboard!)
        const dIsland = Math.hypot(x - 30, y - 21);
        const channelWave = Math.sin(x * 0.45 + y * 0.3) + Math.cos(x * 0.2 - y * 0.35);
        if (y >= 34) {
          t = (x < 32) ? 0 : 1; // Meeting of the Waters (Tapajós & Amazon)
        } else if (y >= 32) {
          t = 3;
        } else if (dIsland < 5.2) {
          t = 6; // Ancient Terra Preta archaeological mound
        } else if (dIsland < 6.4) {
          t = 4; // Lush island margin
        } else if (channelWave > 0.35 && y >= 9 && y <= 30) {
          t = 2; // Organic winding Igapó water channels
        } else {
          t = 4;
        }
      } else {
        // Zone 3: Plateau & Burned Scar
        if (y >= 34) {
          t = 1; // Muddy Amazon River
        } else if (y >= 32) {
          t = 3;
        } else {
          const dBurn = Math.hypot((x - 51) * 0.9, (y - 20) * 1.1);
          if (dBurn < 7.8) {
            t = 5; // Organic degraded grey burned scar
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
      state.baseGrid[y][x] = 7; // Wooden stilt floor
    }
  }

  // 2. Wooden Trapiche Pier extending into the Tapajós River (Bottom-Right of Clearing: X 12..16, Y 23..24)
  for (let x = 12; x <= 16; x++) {
    state.baseGrid[23][x] = 7;
    state.baseGrid[24][x] = 7;
  }

  // 3. Terracotta Irrigation Pipes & Lush Terra Preta Crop Beds (Bottom-Left of Clearing: X 3..8, Y 20..24)
  // Pipe spine (tile 8) connecting Caryatid Condenser at (8,19) to the crop beds
  const pipeCoords = [
    [8, 19], [7, 19], [7, 20], [7, 21], [7, 22], [7, 23], [7, 24],
    [4, 20], [4, 21], [4, 22], [4, 23], [4, 24],
    [5, 22], [6, 22], [5, 24], [6, 24], [8, 24]
  ];
  pipeCoords.forEach(([px, py]) => {
    state.baseGrid[py][px] = 8; // Terracotta pipe & solar cable tile
  });

  // Terra Preta agroforestry crop beds (X 3, 5..6, 8..9, Y 20..23)
  const cropCoords = [
    [3, 20], [3, 21], [3, 22], [3, 23],
    [5, 20], [6, 20], [5, 21], [6, 21],
    [5, 23], [6, 23],
    [8, 20], [9, 20], [8, 21], [9, 21],
    [8, 22], [9, 22], [8, 23], [9, 23]
  ];
  cropCoords.forEach(([cx, cy]) => {
    state.baseGrid[cy][cx] = 6; // Terra Preta soil
    state.objects[cy][cx] = { kind: "building", id: "bld_03", sceneryIdx: 29, name: "Canteiro de Terra Preta" };
  });

  // 4. Place Iconic Ecobase Structures matching Image 2
  // Large Stilt House with Solar Roof
  state.objects[16][6] = { kind: "world", type: "stilt_hut" };
  // Left & Right Clay Pyrolysis Kilns with glowing hearth & rising smoke
  state.objects[18][4] = { kind: "building", id: "bld_02", sceneryIdx: 28, name: "Forno Cerâmico de Pirólise" };
  state.objects[16][8] = { kind: "building", id: "bld_02", sceneryIdx: 28, name: "Forno Cerâmico de Pirólise" };
  // Central Glowing Caryatid Fog Condenser connected to the terracotta pipes
  state.objects[19][8] = { kind: "building", id: "bld_07", sceneryIdx: 33, name: "Condensador de Neblina de Cariátides" };
  // Solar Panel on Stilt House deck & Bio-Battery
  state.objects[15][7] = { kind: "building", id: "bld_05", sceneryIdx: 31, name: "Painel Solar de Palafita" };
  state.objects[17][5] = { kind: "building", id: "bld_06", sceneryIdx: 32, name: "Bio-Bateria Tapajônica" };
  // Young saplings being irrigated by the Hummingbird Drone
  state.objects[21][10] = { kind: "world", type: "curua_node" };
  state.objects[22][10] = { kind: "world", type: "curua_node" };
  state.objects[23][10] = { kind: "world", type: "curua_node" };
  // Master Tapajó Artisan NPC near the pier
  state.objects[22][12] = { kind: "world", type: "elder_npc" };

  // 5. Dense Amazonian Forest Canopy Framing Zone 1 (Samaúmas, Açaizeiros, Andirobas, Urucum)
  const z1Forest = [
    // Giant Samaúma on the upper-right riverbank (exactly like Image 2!)
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

  // 6. Populate Zone 2 (Igapó & Archaeological Site)
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

  // 7. Populate Zone 3 (Plateau, Quartz/Jade Outcrop, Burned Scar & Caryatid Sanctuary)
  const z3Spots = [
    [42, 8, "quartz_rock"], [43, 13, "quartz_rock"], [42, 18, "quartz_rock"],
    [43, 10, "jade_vein"], [44, 6, "jade_vein"],
    [52, 6, "caryatid_altar"], [46, 7, "samauma_tree"], [56, 8, "samauma_tree"],
    [48, 15, "charred_log"], [54, 16, "charred_log"], [49, 24, "charred_log"], [55, 22, "charred_log"],
    [51, 20, "dredge_wreck"], [54, 25, "dredge_wreck"], [48, 27, "diesel_wreck"]
  ];
  z3Spots.forEach(([x, y, type]) => { state.objects[y][x] = { kind: "world", type }; });
}

// Effective terrain taking into account 15-Day CHEIA vs 15-Day SECA water level shifts (smooth, no checkerboard)
function getEffectiveTerrain(x, y) {
  const base = state.baseGrid[y][x];
  if (base === 6 || base === 7 || base === 8) return base; // Terra Preta, Stilt floor, and Pipes stay intact

  const isCheia = state.world.season === "CHEIA";
  if (isCheia) {
    if (y >= 32 && base === 3 && x >= 18) return 0; // Lower riverbanks submerge in Cheia
  } else {
    if (y === 33 && (base === 0 || base === 1)) return 3; // Extra white sand beach exposed in Seca
    if (base === 2 && Math.sin(x * 0.5 + y * 0.4) < 0) return 3; // Shallow Igapó margins dry into sandy mud
  }
  return base;
}

// Check if tile is irrigated by a powered Caryatid Fog Condenser (radius 5)
function isTileIrrigated(tx, ty) {
  if (state.world.season === "CHEIA") return true;
  for (let y = Math.max(0, ty - 5); y <= Math.min(MAP_H - 1, ty + 5); y++) {
    for (let x = Math.max(0, tx - 5); x <= Math.min(MAP_W - 1, tx + 5); x++) {
      const obj = state.objects[y][x];
      if (obj && obj.kind === "building" && obj.id === "bld_07") {
        if (Math.hypot(tx - x, ty - y) <= 5.5 && state.player.solarCharge > 0) return true;
      }
    }
  }
  return false;
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
  let hasDroneStation = true; // Active in Ecobase prototype
  let droneStationPos = { x: 11, y: 20 };

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
            droneStationPos = { x, y };
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
// INTERACTION & GAMEPLAY ACTIONS ON TILES
// ============================================================================
function interactAtTile(tx, ty) {
  if (tx < 0 || tx >= MAP_W || ty < 0 || ty >= MAP_H) return;
  const dist = Math.hypot(tx - state.player.x, ty - state.player.y);
  if (dist > 2.8) {
    stepPlayerToward(tx, ty);
    return;
  }

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
    logMsg(`Solo regenerado com Terra Preta em (${tx},${ty})! +ECO%`);
    recalculateEcoAndPower();
    updateAllUI();
    return;
  }

  if (mode === "plant") {
    if (obj) {
      showToast("Tile Ocupado", "Escolha um tile livre de Terra Preta ou grama para plantar.");
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
      logMsg(`Muda de Samaúma plantada em (${tx},${ty})! +4% ECO`);
    } else {
      state.player.inventory["mat_08"]--;
      state.objects[ty][tx] = { kind: "world", type: "acai_tree" };
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
    state.player.scanningTicks = 18;
    playSfx("scan");

    if (obj && obj.kind === "world") {
      const info = WORLD_OBJ_TYPES[obj.type];
      const firstTime = !state.world.scannedTypes[obj.type];
      state.world.scannedTypes[obj.type] = true;
      let bonusMult = state.player.equipment.tool === "eq_tool_03" ? 1.5 : 1.0;
      if (state.player.equipment.head === "eq_head_01") bonusMult += 0.25;
      const gained = Math.round((firstTime ? info.pcv : Math.max(5, Math.floor(info.pcv / 2))) * bonusMult);
      state.player.pcv += gained;
      showToast(`Bio-Scanner: ${info.name}`, `+${gained} Pontos de Ciência Verde (PCV) registrados!`);
      logMsg(`Escaneou ${info.name}: +${gained} PCV.`);
    } else {
      state.player.pcv += 5;
      showToast("Análise de Microclima", "+5 PCV pela leitura de solo e umidade do Tapajós.");
    }
    updateAllUI();
    return;
  }

  if (mode === "recycle") {
    if (obj && obj.kind === "world" && WORLD_OBJ_TYPES[obj.type].scrap) {
      const info = WORLD_OBJ_TYPES[obj.type];
      addItem("rec_01", 3);
      addItem("rec_02", 2);
      addItem("rec_03", 2);
      state.objects[ty][tx] = null;
      state.world.recycledCount++;
      playSfx("craft");
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
      addItem("arq_02", 1);
      playSfx("tech");
      showToast("Mestre Artesão Tapajó:", "“A sílica do cauixi impede o barro de rachar, e os Vasos de Cariátides condensam a neblina na Seca!” (+15 PCV, +1 Vaso de Gargalo)");
      logMsg("Conversou com o Mestre Artesão na Casa de Saberes (+15 PCV).");
      updateAllUI();
      return;
    }
    if (info.scrap) {
      showToast("Sucata Pesada", "Selecione [3] Desmontar Sucata na barra inferior para reciclar este motor/draga!");
      return;
    }
    if (state.player.stamina < 6) {
      showToast("Vigor Baixo!", "Consuma Açaí ou Água Filtrada [7] para recuperar seu vigor.");
      return;
    }
    state.player.stamina = Math.max(0, state.player.stamina - 6);
    addItem(info.drop, info.qty);
    playSfx("collect");
    logMsg(`Coletou ${info.qty}x ${ITEM_MAP[info.drop].name} de ${info.name}.`);
    if (["clay_node", "shard_mound", "necked_vase", "charred_log", "quartz_rock", "jade_vein"].includes(obj.type)) {
      state.objects[ty][tx] = null;
    }
    updateAllUI();
    return;
  }

  if (terrain === 0 || terrain === 1 || terrain === 2) {
    addItem("mat_13", 2);
    playSfx("collect");
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
    showToast("Local Ocupado", "Escolha um tile livre para posicionar esta estrutura.");
    return;
  }
  consumeIngredients(bld.cost);
  state.objects[ty][tx] = { kind: "building", id: bld.id, sceneryIdx: bld.sceneryIdx, name: bld.name };
  playSfx("build");
  showToast(`${bld.name} Construído!`, `Impacto climático: +${bld.eco}% ECO.`);
  logMsg(`Construiu ${bld.name} em (${tx},${ty}) (+${bld.eco}% ECO).`);
  recalculateEcoAndPower();
  updateAllUI();
}

function movePlayer(dx, dy) {
  const nx = Math.max(0, Math.min(MAP_W - 1, state.player.x + dx));
  const ny = Math.max(0, Math.min(MAP_H - 1, state.player.y + dy));
  const terrain = getEffectiveTerrain(nx, ny);

  state.player.inBoat = (terrain === 0 || terrain === 1);

  if (terrain === 2 && state.player.equipment.feet !== "eq_feet_01") {
    state.player.stamina = Math.max(0, state.player.stamina - 1.5);
  }

  state.player.x = nx;
  state.player.y = ny;
  updateInspector(nx, ny);
  updateAllUI();
}

function stepPlayerToward(tx, ty) {
  const dx = Math.sign(tx - state.player.x);
  const dy = Math.sign(ty - state.player.y);
  movePlayer(dx, dy);
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
