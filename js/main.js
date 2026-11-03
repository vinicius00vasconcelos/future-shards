// ============================================================================
// FUTURE SHARDS — MAIN BOOTSTRAP, EVENT LISTENERS & SIMULATION LOOP
// ============================================================================

window.addEventListener("load", () => {
  AssetLibrary.init();
  initWorldMap();
  initRenderer();
  updateInspector(state.player.x, state.player.y);
  updateAllUI();
  logMsg("Bem-vindo a Santarém! Explore as 3 zonas e regenere o clima do Tapajós.");
  requestAnimationFrame(renderGame);

  // Simulation Tick (1 second = 15 in-game minutes)
  setInterval(() => {
    state.world.timeOfDay += 0.25;
    if (state.world.timeOfDay >= 24.0) {
      state.world.timeOfDay = 0.0;
      advanceDay();
    }

    recalculateEcoAndPower();

    const netW = state.world.gridPowerGen - state.world.gridPowerUse;
    state.player.solarCharge = Math.max(0, Math.min(state.player.maxSolarCharge, state.player.solarCharge + netW * 0.2));

    if (state.player.equipment.amulet2 === "eq_amul_02" || state.baseGrid[state.player.y][state.player.x] === 7) {
      state.player.stamina = Math.min(state.player.maxStamina, state.player.stamina + 2);
    }

    if (state.player.x >= 40 && getEffectiveTerrain(state.player.x, state.player.y) === 5 && state.world.season === "SECA") {
      if (getPlayerThermalProtection() < 40) {
        state.player.stamina = Math.max(0, state.player.stamina - 2);
      }
    }

    state.fauna.forEach(f => {
      if (Math.random() < 0.4) {
        f.x = Math.max(2, Math.min(MAP_W - 3, f.x + f.dir));
        if (Math.random() < 0.2) f.dir *= -1;
      }
    });

    const drone = state.drones[0];
    if (drone.active && state.player.solarCharge >= 5) {
      for (let y = 12; y < 29; y++) {
        let converted = false;
        for (let x = 46; x < 58; x++) {
          if (state.baseGrid[y][x] === 5) {
            drone.x += Math.sign(x - drone.x);
            drone.y += Math.sign(y - drone.y);
            if (drone.x === x && drone.y === y) {
              state.baseGrid[y][x] = 6;
              state.world.terraPretaCount++;
              logMsg(`Drone Beija-Flor regenerou solo em (${x},${y})!`);
            }
            converted = true;
            break;
          }
        }
        if (converted) break;
      }
    }

    updateHUDOnly();
  }, 1000);

  // Start Expedition button on Login Overlay
  document.getElementById("btnStartGame").addEventListener("click", () => {
    const nameVal = document.getElementById("inputPlayerName").value.trim();
    if (nameVal) state.playerName = nameVal;
    if (document.getElementById("chkStarterKit").checked) {
      addItem("mat_01", 4);
      addItem("mat_02", 3);
      addItem("proc_03", 4);
    }
    document.getElementById("loginOverlay").classList.add("hidden");
    playSfx("tech");
    showToast(`Expedição Iniciada, ${state.playerName}!`, "Use WASD/Setas ou clique no mapa para caminhar, escanear [2] e construir sua Ecobase.");
  });

  // Hotbar mode buttons
  document.querySelectorAll(".hotbar-btn").forEach(btn => {
    btn.addEventListener("click", () => setActiveMode(btn.dataset.mode));
  });

  // Quick consume button [7]
  document.getElementById("btnQuickConsume").addEventListener("click", () => {
    for (const cid of ["cons_02", "cons_01", "cons_03", "cons_04"]) {
      if ((state.player.inventory[cid] || 0) > 0) {
        useOrEquipItem(cid);
        return;
      }
    }
    showToast("Sem Consumíveis Prontos", "Fabrique Água Filtrada ou Tigela de Açaí na Bancada [C]!");
  });

  // Canvas click -> interact or move
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const cx = (e.clientX - rect.left) * scaleX;
    const cy = (e.clientY - rect.top) * scaleY;

    const colsVis = Math.ceil(canvas.width / TILE_SIZE) + 4;
    const rowsVis = Math.ceil(canvas.height / TILE_SIZE) + 4;
    const camX = Math.max(0, Math.min(MAP_W - colsVis + 2, Math.floor(state.player.x - colsVis / 2)));
    const camY = Math.max(0, Math.min(MAP_H - rowsVis + 2, Math.floor(state.player.y - rowsVis / 2)));

    const tx = camX + Math.floor(cx / TILE_SIZE);
    const ty = camY + Math.floor(cy / TILE_SIZE);
    updateInspector(tx, ty);
    interactAtTile(tx, ty);
  });

  // Minimap click -> teleport / quick travel to inspect any zone
  miniCanvas.addEventListener("click", (e) => {
    const rect = miniCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const tx = Math.max(1, Math.min(MAP_W - 2, Math.floor((mx / rect.width) * MAP_W)));
    const ty = Math.max(1, Math.min(MAP_H - 2, Math.floor((my / rect.height) * MAP_H)));
    state.player.x = tx;
    state.player.y = ty;
    updateInspector(tx, ty);
    updateAllUI();
  });

  // Quick Zone Teleport buttons
  document.getElementById("btnGoZone1").addEventListener("click", () => {
    state.player.x = 8; state.player.y = 20;
    updateInspector(8, 20); updateAllUI();
  });
  document.getElementById("btnGoZone2").addEventListener("click", () => {
    state.player.x = 29; state.player.y = 21;
    updateInspector(29, 21); updateAllUI();
  });
  document.getElementById("btnGoZone3").addEventListener("click", () => {
    state.player.x = 48; state.player.y = 18;
    updateInspector(48, 18); updateAllUI();
  });

  // Touch D-Pad buttons
  document.getElementById("btnMoveUp").addEventListener("click", () => movePlayer(0, -1));
  document.getElementById("btnMoveDown").addEventListener("click", () => movePlayer(0, 1));
  document.getElementById("btnMoveLeft").addEventListener("click", () => movePlayer(-1, 0));
  document.getElementById("btnMoveRight").addEventListener("click", () => movePlayer(1, 0));
  document.getElementById("btnActCenter").addEventListener("click", () => interactAtTile(state.player.x, state.player.y));

  // Modals Open/Close
  document.getElementById("btnOpenCraft").addEventListener("click", () => {
    renderCraftModal();
    document.getElementById("modalCraft").classList.remove("hidden");
  });
  document.getElementById("btnCloseCraft").addEventListener("click", () => {
    document.getElementById("modalCraft").classList.add("hidden");
  });

  document.getElementById("btnOpenTech").addEventListener("click", () => {
    renderTechModal();
    document.getElementById("modalTech").classList.remove("hidden");
  });
  document.getElementById("btnCloseTech").addEventListener("click", () => {
    document.getElementById("modalTech").classList.add("hidden");
  });

  document.getElementById("btnOpenEquip").addEventListener("click", () => {
    renderEquipModal();
    document.getElementById("modalEquip").classList.remove("hidden");
  });
  document.getElementById("btnCloseEquip").addEventListener("click", () => {
    document.getElementById("modalEquip").classList.add("hidden");
  });

  document.getElementById("btnOpenBuild").addEventListener("click", () => {
    renderBuildModal();
    document.getElementById("modalBuild").classList.remove("hidden");
  });
  document.getElementById("btnCloseBuild").addEventListener("click", () => {
    document.getElementById("modalBuild").classList.add("hidden");
  });

  // Cloud / Supabase Modal Open/Close & Actions
  document.getElementById("btnOpenCloud").addEventListener("click", () => {
    document.getElementById("modalCloud").classList.remove("hidden");
    CloudSync.refreshCloudList();
  });
  document.getElementById("btnCloseCloud").addEventListener("click", () => {
    document.getElementById("modalCloud").classList.add("hidden");
  });
  document.getElementById("btnSaveSupabase").addEventListener("click", () => {
    CloudSync.saveToSupabase();
  });
  document.getElementById("btnRefreshCloud").addEventListener("click", () => {
    CloudSync.refreshCloudList();
  });
  document.getElementById("btnSendCloudNote").addEventListener("click", () => {
    const inp = document.getElementById("inputCloudNote");
    if (inp && inp.value.trim()) {
      CloudSync.submitTestNote(inp.value);
      inp.value = "";
    }
  });

  // Craft Category Filter Tabs
  document.querySelectorAll(".craft-tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.world.craftFilterCat = btn.dataset.cat;
      document.querySelectorAll(".craft-tab-btn").forEach(b => {
        b.className = b.dataset.cat === state.world.craftFilterCat
          ? "craft-tab-btn px-2.5 py-1 rounded text-xs font-bold bg-[#c65d3b] text-white"
          : "craft-tab-btn px-2.5 py-1 rounded text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700";
      });
      renderCraftModal();
    });
  });

  // Sandbox / Testing Helper Buttons
  document.getElementById("btnSandboxGrant").addEventListener("click", () => {
    ["mat_01","mat_02","mat_03","mat_04","mat_05","mat_06","mat_07","mat_08","mat_09","mat_10","mat_11","mat_12","arq_01","arq_02","arq_03","arq_04","min_01","min_02","rec_01","rec_02","rec_03","proc_01","proc_02","proc_03","proc_04","proc_07","proc_09"].forEach(id => {
      state.player.inventory[id] = Math.min(50, (state.player.inventory[id] || 0) + 5);
    });
    playSfx("tech");
    showToast("Kit de Insumos Adicionado!", "+5 unidades de todos os recursos e componentes adicionadas à mochila.");
    renderCraftModal();
    updateAllUI();
  });

  document.getElementById("btnAddTestPcv").addEventListener("click", () => {
    state.player.pcv += 100;
    playSfx("tech");
    renderTechModal();
    updateAllUI();
  });

  document.getElementById("btnNextDay").addEventListener("click", () => {
    advanceDay();
    playSfx("collect");
  });

  document.getElementById("btnToggleSeason").addEventListener("click", () => {
    state.world.season = state.world.season === "CHEIA" ? "SECA" : "CHEIA";
    state.world.dayInSeason = 6;
    playSfx("tech");
    showToast(
      `Estação Alternada: Ápice da ${state.world.season} (Dia 6/15)`,
      state.world.season === "CHEIA"
        ? "O Rio Tapajós subiu 4 tiles! Veja as margens inundadas e use pontes/botas de seringueira."
        : "Vazante e Seca Extrema! Bancos de areia surgiram na margem e o sol gera +40% de energia solar."
    );
    updateAllUI();
  });

  document.getElementById("btnMute").addEventListener("click", (e) => {
    isMuted = !isMuted;
    e.currentTarget.textContent = isMuted ? "🔇" : "🔊";
  });

  // Keyboard Controls
  window.addEventListener("keydown", (e) => {
    if (document.activeElement && document.activeElement.tagName === "INPUT") return;
    const k = e.key.toLowerCase();
    if (k === "escape") {
      ["modalCraft", "modalTech", "modalEquip", "modalBuild", "modalCloud"].forEach(id => document.getElementById(id).classList.add("hidden"));
      return;
    }
    if (k === "w" || e.key === "ArrowUp") { e.preventDefault(); movePlayer(0, -1); }
    else if (k === "s" || e.key === "ArrowDown") { e.preventDefault(); movePlayer(0, 1); }
    else if (k === "a" || e.key === "ArrowLeft") { e.preventDefault(); movePlayer(-1, 0); }
    else if (k === "d" || e.key === "ArrowRight") { e.preventDefault(); movePlayer(1, 0); }
    else if (e.key === " ") { e.preventDefault(); interactAtTile(state.player.x, state.player.y); }
    else if (k === "1") setActiveMode("collect");
    else if (k === "2") setActiveMode("scan");
    else if (k === "3") setActiveMode("recycle");
    else if (k === "4") setActiveMode("terrapreta");
    else if (k === "5") setActiveMode("plant");
    else if (k === "6") setActiveMode("build");
    else if (k === "c") { renderCraftModal(); document.getElementById("modalCraft").classList.toggle("hidden"); }
    else if (k === "t") { renderTechModal(); document.getElementById("modalTech").classList.toggle("hidden"); }
    else if (k === "i") { renderEquipModal(); document.getElementById("modalEquip").classList.toggle("hidden"); }
    else if (k === "b") { renderBuildModal(); document.getElementById("modalBuild").classList.toggle("hidden"); }
  });
});

