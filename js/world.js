// ============================================================================
// FUTURE SHARDS — WORLD MAP, GAME STATE & SIMULATION LOGIC (60x40 TILES)
// ============================================================================

const MAP_W = 60;
const MAP_H = 40;
const TILE_SIZE = 40; // Rendered pixel size on main canvas

// Terrain Tile IDs (matching SCENERY_ASSETS Row 0: indices 0..8)
// 0: Deep Tapajós Water, 1: Muddy Amazon Water, 2: Shallow Igapó Water,
// 3: White Sand Beach, 4: Lush Várzea Grass, 5: Degraded Grey Burned Soil,
// 6: Fertile Terra Preta Soil, 7: Wooden Stilt Floor, 8: Pipe & Cable Floor

const state = {
  playerName: "Aruã Tapajó",
  player: {
    x: 8,
    y: 20,
    hp: 100,
    maxHp: 100,
    stamina: 120,
    maxStamina: 120,
    solarCharge: 60,
    maxSolarCharge: 100,
    pcv: 25,
    scanningTicks: 0,
    inBoat: false,
    equipment: {
      head: null,
      body: null,
      back: "eq_back_01",
      feet: null,
      tool: "eq_tool_01",
      amulet1: null,
      amulet2: null
    },
    inventory: {
      mat_01: 4,
      mat_02: 2,
      mat_04: 4,
      mat_06: 4,
      mat_08: 3,
      arq_01: 2,
      proc_03: 3,
      cons_02: 2
    }
  },
  world: {
    season: "CHEIA", // "CHEIA" (Days 1..15) or "SECA" (Days 16..30)
    dayInSeason: 1,  // 1..15
    totalDays: 1,
    timeOfDay: 8.0,  // 0.0 to 24.0 hours
    ecoIndex: 25,
    gridPowerGen: 0,
    gridPowerUse: 0,
    recycledCount: 0,
    terraPretaCount: 3,
    plantedTreesCount: 0,
    unlockedTechs: ["T1_01"],
    scannedTypes: {},
    activeMode: "collect", // collect, scan, recycle, terrapreta, plant, build
    selectedBuildId: "bld_01",
    craftFilterCat: "ALL"
  },
  baseGrid: [], // 2D array [y][x] of baseTerrain
  objects: [],  // 2D array [y][x] of world objects / buildings
  drones: [
    { x: 10, y: 18, tx: 14, ty: 16, active: false }
  ],
  fauna: [
    { type: "boto", sceneryIdx: 41, x: 12, y: 34, dir: 1 },
    { type: "boto", sceneryIdx: 41, x: 28, y: 33, dir: -1 },
    { type: "arara", sceneryIdx: 42, x: 14, y: 10, dir: 1 }
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
      // Southern River Confluence (Meeting of the Waters: Y >= 31)
      if (y >= 34) {
        t = (x < 32) ? 0 : 1; // Tapajós turquoise on left, Amazon muddy on right
      } else if (y >= 30) {
        t = 3; // White sand beach margin
      } else if (x >= 20 && x < 40) {
        // Zone 2: Flooded Igapó with islands
        const dIsland = Math.hypot(x - 30, y - 22);
        if (dIsland < 5.5) {
          t = 6; // Ancient Terra Preta island
        } else if ((x + y) % 3 === 0 || y > 18) {
          t = 2; // Shallow igapó water
        } else {
          t = 4;
        }
      } else if (x >= 40) {
        // Zone 3: Plateau & Burned Scar
        if (x >= 46 && y >= 10 && y < 30) {
          t = 5; // Degraded grey burned soil
        } else {
          t = 4;
        }
      }
      rowT.push(t);
      rowO.push(null);
    }
    state.baseGrid.push(rowT);
    state.objects.push(rowO);
  }

  // Build initial Stilt Pier & Base platform in Zone 1 (X: 6..12, Y: 18..33)
  for (let y = 18; y <= 23; y++) {
    for (let x = 6; x <= 11; x++) {
      state.baseGrid[y][x] = 7; // Wooden stilt floor
    }
  }
  for (let y = 24; y <= 33; y++) {
    state.baseGrid[y][8] = 7; // Pier to the river
  }

  // Initial Terra Preta beds near base
  state.baseGrid[16][7] = 6;
  state.baseGrid[16][8] = 6;
  state.baseGrid[16][9] = 6;

  // Place Base Structures & NPC in Zone 1
  state.objects[18][7] = { kind: "world", type: "stilt_hut" };
  state.objects[19][10] = { kind: "world", type: "elder_npc" };
  state.objects[20][6] = { kind: "building", id: "bld_02", sceneryIdx: 28, name: "Forno Cerâmico de Pirólise" };

  // Populate Zone 1 Natural Resources
  const z1Spots = [
    [3, 29, "clay_node"], [5, 30, "clay_node"], [12, 29, "clay_node"], [15, 30, "clay_node"],
    [3, 12, "curua_node"], [5, 8, "curua_node"], [14, 9, "curua_node"], [17, 13, "curua_node"],
    [4, 15, "urucum_node"], [13, 14, "urucum_node"],
    [2, 6, "acai_tree"], [7, 5, "acai_tree"], [12, 6, "acai_tree"], [16, 7, "acai_tree"],
    [11, 25, "charred_log"], [15, 22, "charred_log"]
  ];
  z1Spots.forEach(([x, y, type]) => { state.objects[y][x] = { kind: "world", type }; });

  // Populate Zone 2 (Igapó & Archaeological Site)
  const z2Spots = [
    [22, 14, "cauixi_node"], [25, 27, "cauixi_node"], [35, 26, "cauixi_node"], [37, 16, "cauixi_node"],
    [23, 7, "rubber_tree"], [27, 6, "rubber_tree"], [32, 7, "rubber_tree"], [36, 8, "rubber_tree"],
    [24, 12, "andiroba_tree"], [34, 12, "andiroba_tree"],
    [29, 10, "samauma_tree"],
    [28, 21, "shard_mound"], [32, 22, "shard_mound"], [27, 24, "shard_mound"],
    [30, 22, "necked_vase"], [31, 20, "petroglyph"],
    [23, 22, "water_lily"], [36, 23, "water_lily"],
    [26, 31, "diesel_wreck"], [34, 30, "diesel_wreck"]
  ];
  z2Spots.forEach(([x, y, type]) => { state.objects[y][x] = { kind: "world", type }; });

  // Populate Zone 3 (Plateau, Quartz/Jade Outcrop, Burned Scar & Caryatid Sanctuary)
  const z3Spots = [
    [42, 8, "quartz_rock"], [43, 13, "quartz_rock"], [42, 18, "quartz_rock"],
    [43, 10, "jade_vein"], [44, 6, "jade_vein"],
    [52, 5, "caryatid_altar"],
    [48, 15, "charred_log"], [54, 16, "charred_log"], [49, 24, "charred_log"], [56, 22, "charred_log"],
    [51, 20, "dredge_wreck"], [55, 26, "dredge_wreck"], [48, 28, "diesel_wreck"]
  ];
  z3Spots.forEach(([x, y, type]) => { state.objects[y][x] = { kind: "world", type }; });
}

// Effective terrain taking into account 15-Day CHEIA vs 15-Day SECA water level shifts
function getEffectiveTerrain(x, y) {
  const base = state.baseGrid[y][x];
  if (base === 6 || base === 7 || base === 8) return base; // Terra Preta, Stilt floor, and Pipes stay intact

  const isCheia = state.world.season === "CHEIA";
  if (isCheia) {
    const floodLevel = (state.world.dayInSeason >= 4 && state.world.dayInSeason <= 12) ? 3 : 2;
    if (y >= 34 - floodLevel && base === 3) return 0; // Beach submerged by Tapajós river
    if (x >= 20 && x < 40 && base === 4 && (x + y) % 2 === 0 && y > 10) return 2; // Igapó expands
  } else {
    if (y >= 34 && y <= 35) return 3; // Extra beach exposed
    if (base === 2 && (x + y) % 2 === 0) return 3; // Shallow channels dry into sandy mud
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
  let hasDroneStation = false;
  let droneStationPos = { x: 10, y: 18 };

  const isDay = state.world.timeOfDay >= 6 && state.world.timeOfDay <= 18;
  const isSeca = state.world.season === "SECA";

  for (let y = 0; y < MAP_H; y++) {
    for (let x = 0; x < MAP_W; x++) {
      const obj = state.objects[y][x];
      if (obj && obj.kind === "building") {
        const b = BUILDINGS_DB.find(item => item.id === obj.id);
        if (b) {
          buildEco += b.eco;
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
  if (hasDroneStation && state.drones[0].x === 10 && state.drones[0].y === 18) {
    state.drones[0].x = droneStationPos.x;
    state.drones[0].y = droneStationPos.y;
  }

  const rawEco = 25
    + (state.world.recycledCount * 6)
    + (state.world.terraPretaCount * 2)
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
  if (dist > 2.6) {
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
    state.player.scanningTicks = 15;
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
        ? "O Inverno Amazônico chegou! Os rios subiram 4 tiles e as microturbinas operam no máximo."
        : "O Verão Amazônico (Vazante) começou! Praias e sítios arqueológicos surgiram, mas proteja o solo da seca!"
    );
  }
  logMsg(`Início do Dia ${state.world.dayInSeason}/15 da estação ${state.world.season}.`);
  updateAllUI();
}

