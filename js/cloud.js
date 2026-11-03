// ============================================================================
// FUTURE SHARDS — SUPABASE + VERCEL CLOUD SYNC & LOCAL BACKUP MANAGER
// ============================================================================

const LOCAL_SAVE_KEY = "future_shards_save_v1";

const CloudSync = {
  saves: [],
  logs: [],
  isBusy: false,

  buildSavePayload() {
    return {
      playerName: state.playerName,
      summary: {
        ecoIndex: state.world.ecoIndex,
        pcv: state.player.pcv,
        season: state.world.season,
        dayInSeason: state.world.dayInSeason,
        totalDays: state.world.totalDays,
        unlockedCount: state.world.unlockedTechs.length
      },
      gameState: {
        playerName: state.playerName,
        player: JSON.parse(JSON.stringify(state.player)),
        world: JSON.parse(JSON.stringify(state.world)),
        baseGrid: JSON.parse(JSON.stringify(state.baseGrid)),
        objects: JSON.parse(JSON.stringify(state.objects)),
        drones: JSON.parse(JSON.stringify(state.drones))
      }
    };
  },

  applySavePayload(gameState) {
    if (!gameState || !gameState.player || !gameState.world) return false;
    state.playerName = gameState.playerName || state.playerName;
    Object.assign(state.player, gameState.player);
    Object.assign(state.world, gameState.world);
    if (Array.isArray(gameState.baseGrid) && gameState.baseGrid.length === MAP_H) {
      state.baseGrid = gameState.baseGrid;
    }
    if (Array.isArray(gameState.objects) && gameState.objects.length === MAP_H) {
      state.objects = gameState.objects;
    }
    if (Array.isArray(gameState.drones)) {
      state.drones = gameState.drones;
    }
    updateInspector(state.player.x, state.player.y);
    updateAllUI();
    return true;
  },

  saveLocal() {
    try {
      const payload = this.buildSavePayload();
      localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(payload));
      return true;
    } catch (e) {
      return false;
    }
  },

  loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_SAVE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return this.applySavePayload(parsed.gameState);
    } catch (e) {
      return false;
    }
  },

  async refreshCloudList() {
    const statusEl = document.getElementById("cloudStatusBadge");
    if (statusEl) statusEl.textContent = "Sincronizando com Supabase...";
    try {
      const res = await fetch("/api/cloud?action=list");
      const data = await res.json();
      if (data.ok) {
        this.saves = data.saves || [];
        this.logs = data.logs || [];
        if (statusEl) {
          statusEl.textContent = "Conectado • Supabase Cloud Ativo";
          statusEl.className = "text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300";
        }
      } else {
        if (statusEl) {
          statusEl.textContent = "Modo Local (Offline / file://)";
          statusEl.className = "text-[11px] font-mono px-2.5 py-1 rounded bg-amber-950 border border-amber-500 text-amber-300";
        }
      }
    } catch (e) {
      if (statusEl) {
        statusEl.textContent = "Modo Local (Sem API / file://)";
        statusEl.className = "text-[11px] font-mono px-2.5 py-1 rounded bg-amber-950 border border-amber-500 text-amber-300";
      }
    }
    this.renderCloudModal();
  },

  async saveToSupabase() {
    this.saveLocal();
    const payload = this.buildSavePayload();
    try {
      const res = await fetch("/api/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          playerName: payload.playerName,
          summary: payload.summary,
          gameState: payload.gameState
        })
      });
      const data = await res.json();
      if (data.ok) {
        this.saves = data.saves || this.saves;
        playSfx("tech");
        showToast("Salvo no Supabase + Local!", `Expedição de ${state.playerName} (${state.world.ecoIndex}% ECO) sincronizada na nuvem.`);
        logMsg(`Progresso salvo no Supabase Cloud (Slot: ${data.slot}).`);
        this.renderCloudModal();
        return;
      }
      showToast("Salvo no Navegador (Local)", data.error || "API Cloud indisponível no momento.");
    } catch (e) {
      playSfx("craft");
      showToast("Salvo no Navegador (Local)", "Seu progresso foi gravado em localStorage.");
    }
    this.renderCloudModal();
  },

  async loadFromSupabase(slot) {
    try {
      const res = await fetch(`/api/cloud?action=load&slot=${encodeURIComponent(slot)}`);
      const data = await res.json();
      if (data.ok && data.payload && data.payload.gameState) {
        this.applySavePayload(data.payload.gameState);
        this.saveLocal();
        playSfx("tech");
        showToast("Expedição Carregada da Nuvem!", `Bem-vindo de volta, ${state.playerName} (ECO: ${state.world.ecoIndex}%).`);
        logMsg(`Save '${slot}' carregado do Supabase Cloud.`);
        document.getElementById("modalCloud").classList.add("hidden");
        return;
      }
      showToast("Erro ao Carregar", data.error || "Não foi possível carregar este slot.");
    } catch (e) {
      showToast("Modo Local", "Carregando save local do navegador...");
      if (this.loadLocal()) {
        playSfx("tech");
        document.getElementById("modalCloud").classList.add("hidden");
      }
    }
  },

  async submitTestNote(noteText) {
    if (!noteText || !noteText.trim()) return;
    try {
      const res = await fetch("/api/cloud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log",
          version: "v0.2.0-modular",
          author: state.playerName,
          note: noteText.trim(),
          ecoIndex: state.world.ecoIndex
        })
      });
      const data = await res.json();
      if (data.ok) {
        this.logs = data.logs || [];
        playSfx("scan");
        showToast("Nota de Teste Registrada!", "Salva no banco do Supabase com sucesso.");
        this.renderCloudModal();
      }
    } catch (e) {
      showToast("Erro ao Enviar Nota", "Verifique a conexão com a Vercel API.");
    }
  },

  renderCloudModal() {
    const savesList = document.getElementById("cloudSavesList");
    const logsList = document.getElementById("cloudLogsList");
    if (!savesList || !logsList) return;

    savesList.innerHTML = "";
    if (this.saves.length === 0) {
      savesList.innerHTML = `<div class="text-xs text-slate-400 p-3 bg-slate-900/70 rounded border border-slate-800">Nenhuma expedição salva na nuvem ainda. Clique em <strong>"Salvar Agora no Supabase"</strong> acima!</div>`;
    } else {
      this.saves.forEach((s, i) => {
        const row = document.createElement("div");
        row.className = "bg-slate-900 border border-slate-700 hover:border-emerald-400 rounded-lg p-2.5 flex items-center justify-between gap-2";
        const dateStr = s.updatedAt ? new Date(s.updatedAt).toLocaleString("pt-BR") : "";
        row.innerHTML = `
          <div>
            <div class="text-xs font-bold text-amber-300">#${i + 1} ${s.playerName} <span class="text-emerald-300 font-mono">(ECO: ${s.ecoIndex}%)</span></div>
            <div class="text-[10px] text-slate-400 font-mono">${s.season} Dia ${s.dayInSeason}/15 • ${s.pcv} PCV • ${s.unlockedCount}/15 Tecnologias • ${dateStr}</div>
          </div>
        `;
        const btnLoad = document.createElement("button");
        btnLoad.type = "button";
        btnLoad.className = "px-2.5 py-1 rounded text-xs font-bold bg-teal-700 hover:bg-teal-600 text-white border border-teal-400 shrink-0";
        btnLoad.textContent = "Carregar";
        btnLoad.addEventListener("click", () => this.loadFromSupabase(s.slot));
        row.appendChild(btnLoad);
        savesList.appendChild(row);
      });
    }

    logsList.innerHTML = "";
    if (this.logs.length === 0) {
      logsList.innerHTML = `<div class="text-xs text-slate-400 p-2">Nenhum log remoto adicional.</div>`;
    } else {
      this.logs.forEach(l => {
        const item = document.createElement("div");
        item.className = "bg-slate-900/90 border border-slate-800 rounded p-2 text-xs";
        const dStr = l.createdAt ? new Date(l.createdAt).toLocaleString("pt-BR") : "";
        item.innerHTML = `
          <div class="flex justify-between text-[10px] text-teal-300 font-mono">
            <span><strong>${l.version}</strong> • ${l.author} (ECO ${l.ecoIndex}%)</span>
            <span>${dStr}</span>
          </div>
          <div class="text-slate-200 mt-1">${l.note}</div>
        `;
        logsList.appendChild(item);
      });
    }
  }
};

