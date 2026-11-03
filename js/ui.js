// ============================================================================
// FUTURE SHARDS — UI RENDERERS (16-BIT WOODEN HUD, HOTBAR & VISUAL TECH TREE)
// ============================================================================

let toastTimeout = null;

// Representative 16-bit Sprite Icons & Short Labels for the Visual Tech Tree Nodes (Matching Image 3)
const TECH_VISUAL_META = {
  T1_01: { label: "machado e fibras",      spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/eq_tool_01_pa_de_manejo_tapajo.png`,   unlockIcons: ["eq_tool_01", "eq_back_01", "mat_04"] },
  T1_02: { label: "panela de barro",       spriteUrl: `${ITEMS_BASE_DIR}/buildings_128x128/bld_02_forno_ceramico_pirolise.png`, unlockIcons: ["proc_01", "mat_01", "mat_02"] },
  T1_03: { label: "filtragem e açaí",      spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/cons_01_agua_fresca_filtrada.png`,      unlockIcons: ["cons_01", "cons_02", "mat_08"] },
  T1_04: { label: "pirólise e fogo",       spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/proc_02_biocarvao_ativado.png`,        unlockIcons: ["proc_02", "proc_03", "arq_01"] },
  T1_05: { label: "urucum e copaíba",      spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/cons_03_balsamo_de_copaiba.png`,       unlockIcons: ["proc_05", "cons_03", "mat_10"] },

  T2_01: { label: "látex vulcanizado",     spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/eq_feet_01_botas_de_seringueira.png`,  unlockIcons: ["proc_04", "eq_feet_01", "eq_body_01"] },
  T2_02: { label: "temperado com cauixi",  spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/proc_01_massa_ceramica_temperada.png`, unlockIcons: ["proc_08", "arq_02", "proc_01"] },
  T2_03: { label: "Muiraquitã & Vaso",     spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/eq_amul_01_muiraquita_de_jade.png`,    unlockIcons: ["eq_amul_01", "arq_03", "eq_amul_02"] },
  T2_04: { label: "mineração reversa",     spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/eq_tool_02_chave_de_desmontagem.png`,  unlockIcons: ["eq_tool_02", "proc_06", "rec_01"] },
  T2_05: { label: "quartzo piezo",         spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/eq_tool_03_scanner_tapajonico.png`,    unlockIcons: ["proc_09", "eq_tool_03", "min_01"] },

  T3_01: { label: "Bio-Bateria Tapajônica",spriteUrl: `${ITEMS_BASE_DIR}/buildings_128x128/bld_06_bio_bateria_tapajonica.png`,  unlockIcons: ["proc_02", "eq_head_01", "proc_09"] },
  T3_02: { label: "célula solar urucum",   spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/proc_07_celula_fotovoltaica_urucum.png`,unlockIcons: ["proc_07", "eq_back_02", "rec_03"] },
  T3_03: { label: "catamarã & turbina",    spriteUrl: `${SCENERY_BASE_DIR}/cenario_hd_transparentes/ent_05_catamara_solar_flutuante.png`, unlockIcons: ["rec_02", "proc_06", "proc_04"] },
  T3_04: { label: "condensador de neblina",spriteUrl: `${ITEMS_BASE_DIR}/buildings_128x128/bld_07_condensador_cariatides.png`,   unlockIcons: ["arq_03", "proc_07", "proc_08"] },
  T3_05: { label: "drone beija-flor",      spriteUrl: `${SCENERY_BASE_DIR}/cenario_hd_transparentes/ent_03_drone_polinizador_beija_flor.png`, unlockIcons: ["proc_09", "proc_07", "mat_09"] }
};

function createItemIconImg(itemId, small = false) {
  const it = ITEM_MAP[itemId];
  const wrapper = document.createElement("div");
  wrapper.className = small ? "sprite-icon-sm" : "sprite-icon rounded bg-slate-950 border border-slate-700";
  if (it) {
    const img = document.createElement("img");
    img.src = AssetLibrary.getItemSpriteUrl(itemId, false); // Always use crisp 128x128 PNG scaled down via pixelated CSS
    img.alt = it.name;
    img.className = "pixel-img";
    wrapper.appendChild(img);
  }
  return wrapper;
}

function updateInspector(tx, ty) {
  const terrain = getEffectiveTerrain(tx, ty);
  const obj = state.objects[ty][tx];
  const terrainNames = [
    "Água Profunda do Rio Tapajós",
    "Água Barrenta do Rio Amazonas",
    "Água Rasa de Igapó Alagado",
    "Margem Ribeirinha / Areia de Alter",
    "Solo Úmido de Várzea",
    "Solo Cinza Degradado (Queimada)",
    "Solo Fértil de Terra Preta de Índio",
    "Piso de Palafita de Madeira",
    "Tubulação de Terracota & Cabo Solar"
  ];
  const zoneNum = tx < 20 ? 1 : (tx < 40 ? 2 : 3);
  const irrigated = isTileIrrigated(tx, ty);

  const spriteBox = document.getElementById("inspSpriteBox");
  if (!spriteBox) return;
  spriteBox.innerHTML = "";

  let sIdx = terrain;
  let customUrl = null;

  if (obj) {
    if (obj.kind === "world") {
      const info = WORLD_OBJ_TYPES[obj.type];
      sIdx = info.sceneryIdx;
      document.getElementById("inspTitle").textContent = info.name;
      document.getElementById("inspSub").textContent = `Zona ${zoneNum} • Escaneável (+${info.pcv} PCV)`;
      document.getElementById("inspHint").textContent = info.scrap
        ? "Use [3] Reciclar Sucata para extrair Cobre, Ímãs e Vidro (+6% ECO)."
        : `Use [1] para coletar ${ITEM_MAP[info.drop].name} ou [2] para escanear.`;
    } else if (obj.kind === "building") {
      sIdx = obj.sceneryIdx;
      const bld = BUILDINGS_DB.find(b => b.id === obj.id);
      if (bld) customUrl = bld.sprite128;
      document.getElementById("inspTitle").textContent = obj.name;
      document.getElementById("inspSub").textContent = `Estrutura Solarpunk Ativa • Zona ${zoneNum}`;
      document.getElementById("inspHint").textContent = "Gerando impacto climático positivo e energia limpa para a base.";
    }
  } else {
    document.getElementById("inspTitle").textContent = terrainNames[terrain];
    document.getElementById("inspSub").textContent = `Zona ${zoneNum} • ${irrigated ? "Úmido / Irrigado" : "Seco (Exige Condensador)"}`;
    document.getElementById("inspHint").textContent = terrain === 5
      ? "Solo infértil! Selecione [4] Terra Preta para regenerar (+ECO%)."
      : "Terreno livre para caminhar, plantar mudas [5] ou construir [6].";
  }

  const img = document.createElement("img");
  img.src = customUrl || AssetLibrary.getScenerySpriteUrl(sIdx, true);
  img.alt = "Sprite Inspecionado";
  img.className = "pixel-img";
  spriteBox.appendChild(img);
}

function updateHUDOnly() {
  const p = state.player;
  const w = state.world;

  const barHp = document.getElementById("barHp");
  if (barHp) barHp.style.width = `${(p.hp / p.maxHp) * 100}%`;

  const barSolarHud = document.getElementById("barSolarHud");
  if (barSolarHud) {
    const solarPct = Math.min(100, Math.max(8, (p.solarCharge / Math.max(1, p.maxSolarCharge)) * 100));
    barSolarHud.style.width = `${solarPct}%`;
  }

  const txtPcv = document.getElementById("txtPcv");
  if (txtPcv) txtPcv.textContent = `${p.pcv} PCV`;

  const barEco = document.getElementById("barEco");
  if (barEco) barEco.style.width = `${w.ecoIndex}%`;

  const txtEco = document.getElementById("txtEco");
  if (txtEco) txtEco.textContent = `${w.ecoIndex}%`;

  const hours = Math.floor(w.timeOfDay).toString().padStart(2, "0");
  const mins = Math.floor((w.timeOfDay % 1) * 60).toString().padStart(2, "0");
  const sIcon = document.getElementById("txtSeasonIcon");
  if (sIcon) sIcon.textContent = w.season === "CHEIA" ? "🌧️" : "☀️";
  const sTxt = document.getElementById("txtSeason");
  if (sTxt) sTxt.textContent = `${w.season} • Dia ${w.dayInSeason}/15 (${hours}:${mins})`;
  const inspEff = document.getElementById("inspSeasonEffect");
  if (inspEff) inspEff.textContent = w.season === "CHEIA" ? "Cheia (+Água)" : "Seca (+40% Solar)";

  const zBadge = document.getElementById("hudZoneBadge");
  if (zBadge) {
    if (p.x < 20) {
      zBadge.textContent = "Zona 1: Trapiche e Várzea do Tapajós";
      zBadge.className = "text-xs font-bold px-2.5 py-1 rounded bg-emerald-950/90 border border-emerald-500/60 text-emerald-300";
    } else if (p.x < 40) {
      zBadge.textContent = "Zona 2: Igapó Alagado e Sítio Arqueológico";
      zBadge.className = "text-xs font-bold px-2.5 py-1 rounded bg-teal-950/90 border border-teal-500/60 text-teal-300";
    } else {
      zBadge.textContent = "Zona 3: Platô e Cicatriz da Queimada";
      zBadge.className = "text-xs font-bold px-2.5 py-1 rounded bg-amber-950/90 border border-amber-500/60 text-amber-300";
    }
  }
  const coords = document.getElementById("txtCoords");
  if (coords) coords.textContent = `X:${p.x} Y:${p.y}`;
}

// Renders the 7-Slot Wooden Item Hotbar at the bottom of the gameplay screen + Floating Craft Preview (Matching Image 2!)
function renderBottomWoodenHotbar() {
  const hotbar = document.getElementById("bottomWoodenHotbar");
  if (!hotbar) return;
  hotbar.innerHTML = "";

  // Collect up to 7 priority items from player inventory / equipment so it looks just like Image 2
  const entries = Object.entries(state.player.inventory).filter(([, qty]) => qty > 0);
  const totalSlots = 7;

  for (let i = 0; i < totalSlots; i++) {
    const slotDiv = document.createElement("div");
    slotDiv.className = "wood-slot w-12 h-12 flex items-center justify-center relative cursor-pointer";

    if (i < entries.length) {
      const [itemId, qty] = entries[i];
      const it = ITEM_MAP[itemId];
      if (it) {
        slotDiv.title = `${it.name} (x${qty}) — Clique para usar/equipar`;
        const img = document.createElement("img");
        img.src = AssetLibrary.getItemSpriteUrl(itemId, false);
        img.alt = it.name;
        img.className = "w-9 h-9 pixel-img drop-shadow-[0_2px_2px_rgba(0,0,0,0.85)]";
        slotDiv.appendChild(img);

        if (qty > 1) {
          const badge = document.createElement("span");
          badge.className = "absolute bottom-0.5 right-1 pixel-font text-[8px] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)]";
          badge.textContent = qty;
          slotDiv.appendChild(badge);
        }
        slotDiv.addEventListener("click", () => useOrEquipItem(itemId));
      }
    }
    hotbar.appendChild(slotDiv);
  }

  // Populate Floating Craft Box (CRAFT: BIO-BATERIA TAPAJÔNICA with 3 icons + '+' signs, matching Image 2!)
  const craftIcons = document.getElementById("floatingCraftIcons");
  const craftBox = document.getElementById("floatingCraftBox");
  if (craftIcons && craftBox) {
    craftIcons.innerHTML = "";
    const previewItems = ["eq_amul_01", "arq_01", "proc_07"];
    previewItems.forEach((pid, idx) => {
      const iconImg = document.createElement("img");
      iconImg.src = AssetLibrary.getItemSpriteUrl(pid, false);
      iconImg.className = "w-7 h-7 pixel-img drop-shadow";
      craftIcons.appendChild(iconImg);
      if (idx < previewItems.length - 1) {
        const plus = document.createElement("span");
        plus.className = "pixel-font text-[9px] text-amber-200";
        plus.textContent = "+";
        craftIcons.appendChild(plus);
      }
    });

    craftBox.onclick = () => {
      renderCraftModal();
      document.getElementById("modalCraft").classList.remove("hidden");
    };
  }
}

function renderQuickInventoryAndMilestones() {
  renderBottomWoodenHotbar();

  const qGrid = document.getElementById("quickInventoryGrid");
  if (!qGrid) return;
  qGrid.innerHTML = "";
  const entries = Object.entries(state.player.inventory).filter(([, qty]) => qty > 0);
  document.getElementById("txtBagSlots").textContent = `${entries.length}/${getMaxBagSlots()} slots`;

  entries.slice(0, 12).forEach(([id, qty]) => {
    const it = ITEM_MAP[id];
    if (!it) return;
    const cell = document.createElement("div");
    cell.className = "relative bg-slate-900 border border-slate-700 hover:border-amber-400 rounded p-1 flex flex-col items-center cursor-pointer";
    cell.title = `${it.name} (x${qty}) — Clique para usar/equipar`;
    const icon = createItemIconImg(id, true);
    const badge = document.createElement("span");
    badge.className = "absolute bottom-0.5 right-1 text-[10px] font-mono font-bold text-amber-300 bg-black/80 px-1 rounded";
    badge.textContent = qty;
    cell.appendChild(icon);
    cell.appendChild(badge);
    cell.addEventListener("click", () => useOrEquipItem(id));
    qGrid.appendChild(cell);
  });

  const milestones = [
    { done: state.world.unlockedTechs.includes("T1_02"), text: "1. Pesquisar Têmpera com Cauixi (T1_02)" },
    { done: state.world.unlockedTechs.includes("T1_04"), text: "2. Dominar Pirólise e Terra Preta (T1_04)" },
    { done: state.world.recycledCount >= 1, text: "3. Reciclar 1 Motor/Draga Poluente [3]" },
    { done: state.world.unlockedTechs.includes("T3_02"), text: "4. Desbloquear Célula Solar de Urucum (T3_02)" },
    { done: state.world.unlockedTechs.includes("T3_04"), text: "5. Ativar Condensador de Cariátides (T3_04)" },
    { done: state.world.ecoIndex >= 100, text: "6. Atingir Clima Regenerado (ECO: 100%)" }
  ];
  const doneCount = milestones.filter(m => m.done).length;
  document.getElementById("txtMilestoneProgress").textContent = `${doneCount}/${milestones.length}`;
  const mList = document.getElementById("milestoneList");
  mList.innerHTML = "";
  milestones.forEach(m => {
    const li = document.createElement("li");
    li.className = m.done ? "text-emerald-400 line-through" : "text-slate-200";
    li.textContent = `${m.done ? "✅" : "⬜"} ${m.text}`;
    mList.appendChild(li);
  });
}

function renderCraftModal() {
  const grid = document.getElementById("craftItemsGrid");
  grid.innerHTML = "";
  const cat = state.world.craftFilterCat;
  const list = ITEMS_DB.filter(it => cat === "ALL" || it.cat === cat);

  list.forEach(it => {
    const owned = state.player.inventory[it.id] || 0;
    const card = document.createElement("div");
    card.className = "tapajo-card rounded-lg p-3 flex flex-col justify-between gap-2";

    const top = document.createElement("div");
    top.className = "flex items-start gap-3";
    const icon = createItemIconImg(it.id, false);

    const info = document.createElement("div");
    info.className = "flex-1 min-w-0";
    info.innerHTML = `
      <div class="flex items-center justify-between gap-1">
        <span class="text-xs font-bold text-amber-300 truncate">${it.name}</span>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Na mochila: ${owned}</span>
      </div>
      <div class="text-[10px] text-teal-300 font-mono">${it.id} • Cat. ${it.cat}${it.station ? ` • ${it.station}` : ""}</div>
      <p class="text-[11px] text-slate-300 mt-1">${it.desc}</p>
    `;
    top.appendChild(icon);
    top.appendChild(info);
    card.appendChild(top);

    if (it.recipe) {
      const unlocked = !it.tech || state.world.unlockedTechs.includes(it.tech);
      const canCraft = unlocked && hasIngredients(it.recipe);
      const recText = Object.entries(it.recipe)
        .map(([rid, rqty]) => `${rqty}x ${ITEM_MAP[rid].name} (${state.player.inventory[rid] || 0})`)
        .join(" + ");

      const foot = document.createElement("div");
      foot.className = "border-t border-slate-800 pt-2 flex items-center justify-between gap-2";
      foot.innerHTML = `<div class="text-[10px] text-slate-400"><strong>Receita:</strong> ${recText}</div>`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = canCraft
        ? "px-2.5 py-1 rounded text-xs font-bold bg-[#c65d3b] hover:bg-[#d96e4b] text-white border border-amber-300 shrink-0"
        : "px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700 shrink-0";
      btn.textContent = !unlocked ? `Requer ${it.tech}` : "Fabricar";
      btn.addEventListener("click", () => {
        if (!unlocked) {
          showToast("Descoberta Necessária", `Desbloqueie o nó ${it.tech} na Árvore Científica [T].`);
          return;
        }
        if (!hasIngredients(it.recipe)) {
          showToast("Faltam Ingredientes", `Você precisa de: ${recText}`);
          return;
        }
        consumeIngredients(it.recipe);
        addItem(it.id, 1);
        playSfx("craft");
        showToast(`Item Criado: ${it.name}`, "Adicionado à sua mochila!");
        logMsg(`Fabricou 1x ${it.name}.`);
        renderCraftModal();
      });
      foot.appendChild(btn);
      card.appendChild(foot);
    } else {
      const foot = document.createElement("div");
      foot.className = "border-t border-slate-800 pt-1.5 flex items-center justify-between text-[10px] text-emerald-300";
      foot.innerHTML = `<span>Obtido explorando o mapa (Scan: +${it.pcv} PCV)</span>`;
      card.appendChild(foot);
    }

    grid.appendChild(card);
  });
}

// ============================================================================
// VISUAL TECH TREE / MAPA CIENTÍFICO (3 COLUMNS + GOLDEN CIRCUIT LINES + INSPECTOR)
// Directly matching User's Reference Image 3!
// ============================================================================
function renderTechModal() {
  document.getElementById("modalTechPcv").textContent = `${state.player.pcv} PCV Disponíveis`;
  const container = document.getElementById("techTreeContainer");
  container.innerHTML = "";

  const eras = [
    { num: 1, title: "ERA ANCESTRAL" },
    { num: 2, title: "BIO-QUÍMICA\nTAPAJÔNICA" },
    { num: 3, title: "ERA SOLAR-PUNK" }
  ];

  if (!state.world.selectedTechId) {
    state.world.selectedTechId = "T3_04";
  }

  eras.forEach(eraObj => {
    const col = document.createElement("div");
    col.className = "flex flex-col items-center justify-between py-1";

    const header = document.createElement("div");
    header.className = "pixel-font text-[10px] sm:text-xs text-white text-center whitespace-pre-line leading-relaxed drop-shadow-[0_2px_2px_rgba(0,0,0,0.95)] mb-2";
    header.textContent = eraObj.title;
    col.appendChild(header);

    const nodesWrap = document.createElement("div");
    nodesWrap.className = "flex-1 flex flex-col items-center justify-around gap-3 w-full";

    TECH_TREE.filter(t => t.era === eraObj.num).forEach(node => {
      const isUnlocked = state.world.unlockedTechs.includes(node.id);
      const reqsMet = node.req.every(r => state.world.unlockedTechs.includes(r));
      const isSelected = state.world.selectedTechId === node.id;
      const meta = TECH_VISUAL_META[node.id] || {
        label: node.name.toLowerCase(),
        spriteUrl: `${ITEMS_BASE_DIR}/sprites_128x128/arq_03_fragmento_vaso_de_cariatides.png`,
        unlockIcons: ["arq_03", "proc_07"]
      };

      const nodeItem = document.createElement("div");
      nodeItem.className = "flex flex-col items-center cursor-pointer group";
      nodeItem.dataset.techId = node.id;

      const box = document.createElement("div");
      box.id = `techNodeBox_${node.id}`;
      box.className = `tech-node-box ${isUnlocked ? "unlocked" : (reqsMet ? "" : "locked")} ${isSelected ? "selected" : ""}`;

      const img = document.createElement("img");
      img.src = meta.spriteUrl;
      img.alt = node.name;
      img.className = "w-12 h-12 pixel-img drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]";
      box.appendChild(img);

      // Lock badge on right for locked Era 3 nodes (like Image 3)
      if (!isUnlocked && !reqsMet) {
        const lockBadge = document.createElement("span");
        lockBadge.className = "absolute -right-7 top-1/2 -translate-y-1/2 w-5 h-6 rounded bg-[#2d2520]/90 border border-[#5c4d44] flex items-center justify-center text-[10px] opacity-75";
        lockBadge.textContent = "🔒";
        box.appendChild(lockBadge);
      }

      const label = document.createElement("div");
      label.className = "text-[11px] font-bold text-white text-center mt-1 max-w-[125px] leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.95)] group-hover:text-[#fde047]";
      label.textContent = meta.label;

      nodeItem.appendChild(box);
      nodeItem.appendChild(label);

      nodeItem.addEventListener("click", () => {
        state.world.selectedTechId = node.id;
        renderTechModal();
      });

      nodesWrap.appendChild(nodeItem);
    });

    col.appendChild(nodesWrap);
    container.appendChild(col);
  });

  // Update Right-Hand Inspection Panel (PESQUISA: ... / CIÊNCIA: X / Y)
  updateTechInspectorPanel();

  // Draw glowing golden circuit connector lines in SVG after layout settles
  requestAnimationFrame(() => drawTechTreeConnectors());
}

function updateTechInspectorPanel() {
  const node = TECH_TREE.find(t => t.id === state.world.selectedTechId) || TECH_TREE[13];
  const meta = TECH_VISUAL_META[node.id] || { unlockIcons: ["arq_03", "proc_07", "proc_09"] };
  const isUnlocked = state.world.unlockedTechs.includes(node.id);
  const reqsMet = node.req.every(r => state.world.unlockedTechs.includes(r));

  document.getElementById("techInspTitle").textContent = node.name.toUpperCase();
  document.getElementById("techInspDesc").textContent = node.desc;
  document.getElementById("techInspUnlocks").textContent = node.unlocks;
  document.getElementById("techInspScienceCost").textContent = isUnlocked
    ? `PESQUISA CONCLUÍDA (${node.cost} PCV)`
    : `CIÊNCIA: ${state.player.pcv} / ${node.cost}`;

  const iconsRow = document.getElementById("techInspIconsRow");
  iconsRow.innerHTML = "";
  (meta.unlockIcons || []).forEach(itemId => {
    const slot = document.createElement("div");
    slot.className = "wood-slot w-12 h-12 flex items-center justify-center p-1";
    const img = document.createElement("img");
    img.src = AssetLibrary.getItemSpriteUrl(itemId, false);
    img.className = "w-9 h-9 pixel-img";
    slot.appendChild(img);
    iconsRow.appendChild(slot);
  });

  const btn = document.getElementById("btnResearchSelectedTech");
  if (isUnlocked) {
    btn.textContent = "✅ TECNOLOGIA DESBLOQUEADA";
    btn.className = "w-full py-2.5 rounded pixel-font text-[9px] bg-emerald-900/80 text-emerald-200 border-2 border-emerald-400 cursor-default";
    btn.onclick = null;
  } else if (!reqsMet) {
    btn.textContent = `REQUER: ${node.req.join(", ")}`;
    btn.className = "w-full py-2.5 rounded pixel-font text-[9px] bg-slate-800 text-slate-400 border-2 border-slate-600 cursor-not-allowed";
    btn.onclick = () => showToast("Pré-Requisito Pendente", `Desbloqueie primeiro: ${node.req.join(", ")}`);
  } else {
    const canAfford = state.player.pcv >= node.cost;
    btn.textContent = `PESQUISAR (${node.cost} PCV)`;
    btn.className = canAfford
      ? "w-full py-2.5 rounded pixel-font text-[9px] bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white border-2 border-[#56f5e1] shadow-lg cursor-pointer"
      : "w-full py-2.5 rounded pixel-font text-[9px] bg-amber-950/90 text-amber-300 border-2 border-amber-500/60 cursor-pointer";
    btn.onclick = () => {
      if (state.player.pcv < node.cost) {
        showToast("PCV Insuficientes", "Use o Bio-Scanner [2] no mapa ou clique em '+100 PCV (Teste)'.");
        return;
      }
      state.player.pcv -= node.cost;
      state.world.unlockedTechs.push(node.id);
      playSfx("tech");
      showToast(`Nova Descoberta: ${node.name}!`, `Liberado: ${node.unlocks}`);
      logMsg(`Pesquisou ${node.id}: ${node.name}!`);
      recalculateEcoAndPower();
      renderTechModal();
      updateAllUI();
    };
  }
}

function drawTechTreeConnectors() {
  const svg = document.getElementById("techTreeSvg");
  const wrap = document.getElementById("techTreeGraphWrap");
  if (!svg || !wrap) return;

  const wrapRect = wrap.getBoundingClientRect();
  if (wrapRect.width === 0) return;

  svg.setAttribute("viewBox", `0 0 ${wrapRect.width} ${wrapRect.height}`);
  svg.innerHTML = `
    <defs>
      <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  `;

  TECH_TREE.forEach(node => {
    const toBox = document.getElementById(`techNodeBox_${node.id}`);
    if (!toBox) return;
    const toRect = toBox.getBoundingClientRect();
    const x2 = toRect.left - wrapRect.left;
    const y2 = toRect.top - wrapRect.top + toRect.height / 2;

    node.req.forEach(reqId => {
      const fromBox = document.getElementById(`techNodeBox_${reqId}`);
      if (!fromBox) return;
      const fromRect = fromBox.getBoundingClientRect();

      const sameCol = Math.abs(fromRect.left - toRect.left) < 40;
      const bothUnlocked = state.world.unlockedTechs.includes(reqId) && state.world.unlockedTechs.includes(node.id);
      const reqUnlocked = state.world.unlockedTechs.includes(reqId);

      let pathD = "";
      if (sameCol) {
        const cx = fromRect.left - wrapRect.left + fromRect.width / 2;
        const sy = fromRect.bottom - wrapRect.top;
        const ey = toRect.top - wrapRect.top;
        pathD = `M ${cx} ${sy} L ${cx} ${ey}`;
      } else {
        const x1 = fromRect.right - wrapRect.left;
        const y1 = fromRect.top - wrapRect.top + fromRect.height / 2;
        const midX = x1 + (x2 - x1) * 0.52;
        pathD = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
      }

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathD);
      path.setAttribute("fill", "none");
      path.setAttribute("stroke", (bothUnlocked || reqUnlocked) ? "#fde047" : "#7c6f64");
      path.setAttribute("stroke-width", (bothUnlocked || reqUnlocked) ? "3.5" : "2");
      if (bothUnlocked || reqUnlocked) {
        path.setAttribute("filter", "url(#goldGlow)");
      }
      svg.appendChild(path);
    });
  });
}

function useOrEquipItem(itemId) {
  const it = ITEM_MAP[itemId];
  if (!it || (state.player.inventory[itemId] || 0) <= 0) return;

  if (it.cat === "D" && it.effect) {
    state.player.inventory[itemId]--;
    if (state.player.inventory[itemId] <= 0) delete state.player.inventory[itemId];
    state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + (it.effect.stamina || 0));
    state.player.hp = Math.min(state.player.maxHp, state.player.hp + (it.effect.hp || 0));
    playSfx("collect");
    showToast(`Consumiu ${it.name}`, "Vigor e Vida restaurados!");
    updateAllUI();
    renderEquipModal();
    return;
  }

  if (it.cat === "E" && it.slot) {
    const prev = state.player.equipment[it.slot];
    state.player.inventory[itemId]--;
    if (state.player.inventory[itemId] <= 0) delete state.player.inventory[itemId];
    if (prev) addItem(prev, 1);
    state.player.equipment[it.slot] = itemId;
    playSfx("craft");
    showToast(`Equipado: ${it.name}`, it.desc);
    recalculateEcoAndPower();
    updateAllUI();
    renderEquipModal();
  }
}

function renderEquipModal() {
  const slotNames = {
    head: "Cabeça (Óculos)",
    body: "Torso (Vestimenta)",
    back: "Costas (Mochila)",
    feet: "Pés (Calçado)",
    tool: "Ferramenta Ativa",
    amulet1: "Biojoia 1 (Muiraquitã)",
    amulet2: "Biojoia 2 (Zoomorfo/Pintura)"
  };

  const slotsList = document.getElementById("equippedSlotsList");
  slotsList.innerHTML = "";
  Object.entries(slotNames).forEach(([slotKey, label]) => {
    const eqId = state.player.equipment[slotKey];
    const it = eqId ? ITEM_MAP[eqId] : null;
    const box = document.createElement("div");
    box.className = "bg-slate-900 border border-slate-700 rounded p-2 flex items-center gap-2.5 cursor-pointer hover:border-amber-400";
    if (it) {
      const icon = createItemIconImg(eqId, true);
      box.appendChild(icon);
      const txt = document.createElement("div");
      txt.innerHTML = `<div class="text-[10px] text-slate-400">${label}</div><div class="text-xs font-bold text-amber-300">${it.name}</div>`;
      box.appendChild(txt);
      box.addEventListener("click", () => {
        if (addItem(eqId, 1)) {
          state.player.equipment[slotKey] = null;
          playSfx("collect");
          renderEquipModal();
          updateAllUI();
        }
      });
    } else {
      box.innerHTML = `<div class="text-[10px] text-slate-500">${label}<div class="text-xs font-semibold text-slate-400 mt-0.5">[Vazio]</div></div>`;
    }
    slotsList.appendChild(box);
  });

  const statsPanel = document.getElementById("playerStatsPanel");
  statsPanel.innerHTML = `
    <div class="flex justify-between"><span>Cientista-Artesão:</span><strong class="text-amber-300">${state.playerName}</strong></div>
    <div class="flex justify-between"><span>Proteção Térmica (Seca / Zona 3):</span><strong class="text-emerald-300">+${getPlayerThermalProtection()}%</strong></div>
    <div class="flex justify-between"><span>Capacidade da Mochila:</span><strong class="text-sky-300">${getMaxBagSlots()} Slots</strong></div>
    <div class="flex justify-between"><span>Travessia de Igapó Alagado:</span><strong class="text-teal-300">${state.player.equipment.feet === "eq_feet_01" ? "100% (Botas de Seringueira)" : "50% (Sem Botas)"}</strong></div>
    <div class="flex justify-between"><span>Bônus do Bio-Scanner:</span><strong class="text-amber-300">${state.player.equipment.tool === "eq_tool_03" ? "+50% PCV" : "Padrão"}</strong></div>
  `;

  const fullBag = document.getElementById("fullInventoryList");
  fullBag.innerHTML = "";
  const entries = Object.entries(state.player.inventory).filter(([, q]) => q > 0);
  document.getElementById("modalBagCount").textContent = `${entries.length}/${getMaxBagSlots()} slots`;

  entries.forEach(([id, qty]) => {
    const it = ITEM_MAP[id];
    if (!it) return;
    const card = document.createElement("div");
    card.className = "bg-slate-900 border border-slate-700 hover:border-amber-400 rounded p-2 flex items-center gap-2 cursor-pointer";
    const icon = createItemIconImg(id, true);
    const txt = document.createElement("div");
    txt.className = "min-w-0 flex-1";
    txt.innerHTML = `
      <div class="text-xs font-bold text-white truncate">${it.name}</div>
      <div class="text-[10px] text-amber-300 font-mono">Qtd: ${qty} ${it.cat === "E" ? "• [Equipar]" : (it.cat === "D" ? "• [Consumir]" : "")}</div>
    `;
    card.appendChild(icon);
    card.appendChild(txt);
    card.addEventListener("click", () => useOrEquipItem(id));
    fullBag.appendChild(card);
  });
}

function renderBuildModal() {
  const grid = document.getElementById("buildingsGrid");
  grid.innerHTML = "";
  BUILDINGS_DB.forEach(b => {
    const unlocked = state.world.unlockedTechs.includes(b.tech);
    const canAfford = hasIngredients(b.cost);
    const costStr = Object.entries(b.cost)
      .map(([cid, cqty]) => `${cqty}x ${ITEM_MAP[cid].name} (${state.player.inventory[cid] || 0})`)
      .join(" + ");

    const card = document.createElement("div");
    card.className = "tapajo-card rounded-lg p-3 flex flex-col justify-between gap-2";

    const top = document.createElement("div");
    top.className = "flex items-start gap-3";
    const icon = document.createElement("div");
    icon.className = "sprite-icon rounded bg-slate-950 border border-sky-500/40";
    const img = document.createElement("img");
    img.src = b.sprite128;
    img.alt = b.name;
    img.className = "pixel-img";
    icon.appendChild(img);

    const info = document.createElement("div");
    info.className = "flex-1";
    info.innerHTML = `
      <div class="text-xs font-bold text-sky-300">${b.name}</div>
      <div class="text-[10px] font-mono text-emerald-300">Impacto: +${b.eco}% ECO • Energia: ${b.power >= 0 ? "+" + b.power : b.power}W</div>
      <p class="text-[11px] text-slate-300 mt-1">${b.desc}</p>
    `;
    top.appendChild(icon);
    top.appendChild(info);
    card.appendChild(top);

    const foot = document.createElement("div");
    foot.className = "border-t border-slate-800 pt-2 flex flex-col gap-1.5";
    foot.innerHTML = `<div class="text-[10px] text-slate-400"><strong>Custo:</strong> ${costStr}</div>`;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = (unlocked && canAfford)
      ? "w-full py-1.5 rounded text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white border border-sky-300"
      : "w-full py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700";
    btn.textContent = !unlocked ? `Requer ${b.tech}` : "Selecionar para Construir no Mapa";
    btn.addEventListener("click", () => {
      state.world.selectedBuildId = b.id;
      setActiveMode("build");
      document.getElementById("modalBuild").classList.add("hidden");
      showToast(`Modo Construção: ${b.name}`, "Clique em um tile próximo ao personagem no mapa para construir.");
    });
    foot.appendChild(btn);
    card.appendChild(foot);
    grid.appendChild(card);
  });
}

function updateAllUI() {
  recalculateEcoAndPower();
  updateHUDOnly();
  renderQuickInventoryAndMilestones();
}

function showToast(title, body) {
  const banner = document.getElementById("toastBanner");
  document.getElementById("toastTitle").textContent = title;
  document.getElementById("toastBody").textContent = body;
  banner.classList.remove("hidden");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => banner.classList.add("hidden"), 4200);
}

function logMsg(msg) {
  const log = document.getElementById("gameLog");
  if (!log) return;
  const entry = document.createElement("div");
  entry.textContent = `• ${msg}`;
  log.prepend(entry);
}

function setActiveMode(mode) {
  state.world.activeMode = mode;
  const labels = {
    collect: "[1] Pá & Coleta Seletiva",
    scan: "[2] Bio-Scanner Tapajônico (+PCV)",
    recycle: "[3] Chave de Desmontagem de Sucata",
    terrapreta: "[4] Aplicar Terra Preta de Índio",
    plant: "[5] Plantar Muda Nativa",
    build: "[6] Posicionar Estrutura da Ecobase"
  };
  const actEl = document.getElementById("txtActiveAction");
  if (actEl) actEl.textContent = labels[mode] || labels.collect;

  const buildBadge = document.getElementById("txtBuildSelected");
  if (buildBadge) {
    if (mode === "build") {
      const b = BUILDINGS_DB.find(x => x.id === state.world.selectedBuildId);
      buildBadge.textContent = `Construindo: ${b ? b.name : "Palafita"}`;
      buildBadge.classList.remove("hidden");
    } else {
      buildBadge.classList.add("hidden");
    }
  }

  document.querySelectorAll(".hotbar-btn").forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.className = "hotbar-btn px-2 py-0.5 rounded border-2 border-[#f5c242] bg-[#3b1e12] text-[11px] font-bold text-amber-200 flex items-center gap-1";
    } else {
      btn.className = "hotbar-btn px-2 py-0.5 rounded border border-slate-700 bg-slate-900 hover:border-amber-400 text-[11px] font-semibold text-slate-200 flex items-center gap-1";
    }
  });
}
