// ============================================================================
// FUTURE SHARDS — UI RENDERERS (HUD, INSPECTOR & 4 MODALS WITH DIRECT PNGs)
// ============================================================================

let toastTimeout = null;

function createItemIconImg(itemId, small = false) {
  const it = ITEM_MAP[itemId];
  const wrapper = document.createElement("div");
  wrapper.className = small ? "sprite-icon-sm" : "sprite-icon rounded bg-slate-950 border border-slate-700";
  if (it) {
    const img = document.createElement("img");
    img.src = AssetLibrary.getItemSpriteUrl(itemId, small);
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
    "Praia de Areia Branca (Vazante)",
    "Solo Úmido de Várzea",
    "Solo Cinza Degradado (Queimada)",
    "Solo Fértil de Terra Preta de Índio",
    "Piso de Palafita de Madeira",
    "Tubulação de Terracota & Cabo Solar"
  ];
  const zoneNum = tx < 20 ? 1 : (tx < 40 ? 2 : 3);
  const irrigated = isTileIrrigated(tx, ty);

  const spriteBox = document.getElementById("inspSpriteBox");
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
        ? "Use [3] Desmontar Sucata para extrair Cobre, Ímãs e Vidro (+6% ECO)."
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
      ? "Solo infértil! Selecione [4] Aplicar Terra Preta para regenerar (+3% ECO)."
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

  document.getElementById("barHp").style.width = `${(p.hp / p.maxHp) * 100}%`;
  document.getElementById("txtHp").textContent = `${Math.round(p.hp)}/${p.maxHp}`;

  document.getElementById("barStamina").style.width = `${(p.stamina / p.maxStamina) * 100}%`;
  document.getElementById("txtStamina").textContent = `${Math.round(p.stamina)}/${p.maxStamina}`;

  const netSign = (w.gridPowerGen - w.gridPowerUse) >= 0 ? "+" : "";
  document.getElementById("txtSolar").textContent = `${Math.round(p.solarCharge)}/${p.maxSolarCharge}Wh (${netSign}${w.gridPowerGen - w.gridPowerUse}W)`;
  document.getElementById("txtPcv").textContent = `${p.pcv} PCV`;

  document.getElementById("barEco").style.width = `${w.ecoIndex}%`;
  document.getElementById("txtEco").textContent = `${w.ecoIndex}%`;

  const hours = Math.floor(w.timeOfDay).toString().padStart(2, "0");
  const mins = Math.floor((w.timeOfDay % 1) * 60).toString().padStart(2, "0");
  document.getElementById("txtSeasonIcon").textContent = w.season === "CHEIA" ? "🌧️" : "☀️";
  document.getElementById("txtSeason").textContent = `${w.season} • Dia ${w.dayInSeason}/15 (${hours}:${mins})`;
  document.getElementById("inspSeasonEffect").textContent = w.season === "CHEIA" ? "Cheia (+4 Nível Rio)" : "Seca (+40% Solar)";

  const zBadge = document.getElementById("hudZoneBadge");
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
  document.getElementById("txtCoords").textContent = `X:${p.x} Y:${p.y}`;
}

function renderQuickInventoryAndMilestones() {
  const qGrid = document.getElementById("quickInventoryGrid");
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

function renderTechModal() {
  document.getElementById("modalTechPcv").textContent = `${state.player.pcv} PCV Disponíveis`;
  const container = document.getElementById("techTreeContainer");
  container.innerHTML = "";

  const eras = [
    { num: 1, title: "ERA 1: SABEDORIA DA VÁRZEA (DIAS 1–8)", color: "border-emerald-500 text-emerald-300" },
    { num: 2, title: "ERA 2: BIO-QUÍMICA TAPAJÔNICA (DIAS 9–18)", color: "border-amber-500 text-amber-300" },
    { num: 3, title: "ERA 3: ÁPICE SOLARPUNK (DIAS 19–30)", color: "border-cyan-400 text-cyan-300" }
  ];

  eras.forEach(eraObj => {
    const col = document.createElement("div");
    col.className = "space-y-3";
    col.innerHTML = `<div class="text-xs font-extrabold uppercase px-2.5 py-1.5 rounded bg-slate-900 border ${eraObj.color}">${eraObj.title}</div>`;

    TECH_TREE.filter(t => t.era === eraObj.num).forEach(node => {
      const isUnlocked = state.world.unlockedTechs.includes(node.id);
      const reqsMet = node.req.every(r => state.world.unlockedTechs.includes(r));
      const canBuy = !isUnlocked && reqsMet && state.player.pcv >= node.cost;

      const card = document.createElement("div");
      card.className = `tapajo-card rounded-lg p-3 border ${isUnlocked ? "border-emerald-400 bg-emerald-950/30" : (canBuy ? "border-amber-400" : "border-slate-700")}`;
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold ${isUnlocked ? "text-emerald-300" : "text-amber-300"}">${node.id} — ${node.name}</span>
          <span class="text-[10px] font-mono px-1.5 py-0.5 rounded ${isUnlocked ? "bg-emerald-800 text-emerald-100" : "bg-slate-800 text-teal-300"}">
            ${isUnlocked ? "DESBLOQUEADO" : `${node.cost} PCV`}
          </span>
        </div>
        <p class="text-[11px] text-slate-300 mt-1.5">${node.desc}</p>
        <div class="text-[10px] text-teal-300 mt-1.5"><strong>Libera:</strong> ${node.unlocks}</div>
      `;

      if (!isUnlocked) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = canBuy
          ? "mt-2 w-full py-1.5 rounded text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white border border-teal-300"
          : "mt-2 w-full py-1.5 rounded text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700";
        btn.textContent = !reqsMet ? `Pré-requisito: ${node.req.join(", ")}` : `Pesquisar (${node.cost} PCV)`;
        btn.addEventListener("click", () => {
          if (!reqsMet) {
            showToast("Pré-Requisito Pendente", `Desbloqueie primeiro: ${node.req.join(", ")}`);
            return;
          }
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
        });
        card.appendChild(btn);
      }

      col.appendChild(card);
    });

    container.appendChild(col);
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
  document.getElementById("txtActiveAction").textContent = labels[mode] || labels.collect;

  const buildBadge = document.getElementById("txtBuildSelected");
  if (mode === "build") {
    const b = BUILDINGS_DB.find(x => x.id === state.world.selectedBuildId);
    buildBadge.textContent = `Construindo: ${b ? b.name : "Palafita"} (Clique no mapa)`;
    buildBadge.classList.remove("hidden");
  } else {
    buildBadge.classList.add("hidden");
  }

  document.querySelectorAll(".hotbar-btn").forEach(btn => {
    if (btn.dataset.mode === mode) {
      btn.className = "hotbar-btn px-2.5 py-1.5 rounded border-2 border-[#f5c242] bg-[#2a1f1d] text-xs font-bold text-amber-200 flex items-center gap-1.5";
    } else {
      btn.className = "hotbar-btn px-2.5 py-1.5 rounded border border-slate-700 bg-slate-900 hover:border-amber-400 text-xs font-semibold text-slate-200 flex items-center gap-1.5";
    }
  });
}

