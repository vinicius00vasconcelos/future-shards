// ============================================================================
// FUTURE SHARDS — VERCEL SERVERLESS API + SUPABASE CLOUD BACKEND
// Persists game saves, ECO% leaderboard, and development/test logs in Supabase
// ============================================================================

const BUCKET = "future-shards";
const INDEX_PATH = "index.json";

function slugify(str) {
  return String(str || "arua-tapajo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "expedicao";
}

async function fetchIndex(supabaseUrl, serviceKey) {
  try {
    const res = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${INDEX_PATH}`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Cache-Control": "no-cache"
      }
    });
    if (!res.ok) {
      return { saves: [], logs: [] };
    }
    const data = await res.json();
    return {
      saves: Array.isArray(data.saves) ? data.saves : [],
      logs: Array.isArray(data.logs) ? data.logs : []
    };
  } catch (e) {
    return { saves: [], logs: [] };
  }
}

async function saveIndex(supabaseUrl, serviceKey, indexData) {
  await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/${INDEX_PATH}`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      "x-upsert": "true"
    },
    body: JSON.stringify(indexData)
  });
}

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return res.status(503).json({
      ok: false,
      error: "Credenciais do Supabase não configuradas nas variáveis de ambiente da Vercel."
    });
  }

  try {
    if (req.method === "GET") {
      const action = (req.query && req.query.action) || "list";

      if (action === "load") {
        const slot = slugify(req.query.slot || "arua-tapajo");
        const saveRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/saves/${slot}.json`, {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Cache-Control": "no-cache"
          }
        });
        if (!saveRes.ok) {
          return res.status(404).json({ ok: false, error: "Save não encontrado na nuvem." });
        }
        const payload = await saveRes.json();
        return res.status(200).json({ ok: true, slot, payload });
      }

      // Default GET: list saves, ranking, and changelog/test logs
      const indexData = await fetchIndex(supabaseUrl, serviceKey);
      return res.status(200).json({
        ok: true,
        provider: "Supabase Cloud (future-shards)",
        saves: indexData.saves,
        logs: indexData.logs
      });
    }

    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const action = body.action || "save";

      if (action === "save") {
        const playerName = body.playerName || "Aruã Tapajó";
        const slot = slugify(body.slot || playerName);
        const nowIso = new Date().toISOString();

        const saveObject = {
          slot,
          playerName,
          updatedAt: nowIso,
          summary: body.summary || {},
          gameState: body.gameState || {}
        };

        const upRes = await fetch(`${supabaseUrl}/storage/v1/object/${BUCKET}/saves/${slot}.json`, {
          method: "POST",
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
            "Content-Type": "application/json",
            "x-upsert": "true"
          },
          body: JSON.stringify(saveObject)
        });

        if (!upRes.ok) {
          const errTxt = await upRes.text();
          return res.status(500).json({ ok: false, error: `Erro ao gravar save no Supabase: ${errTxt}` });
        }

        const indexData = await fetchIndex(supabaseUrl, serviceKey);
        const summaryEntry = {
          slot,
          playerName,
          ecoIndex: Number(body.summary?.ecoIndex ?? 25),
          pcv: Number(body.summary?.pcv ?? 0),
          season: body.summary?.season || "CHEIA",
          dayInSeason: Number(body.summary?.dayInSeason ?? 1),
          totalDays: Number(body.summary?.totalDays ?? 1),
          unlockedCount: Number(body.summary?.unlockedCount ?? 1),
          updatedAt: nowIso
        };

        const existingIdx = indexData.saves.findIndex(s => s.slot === slot);
        if (existingIdx >= 0) {
          indexData.saves[existingIdx] = summaryEntry;
        } else {
          indexData.saves.unshift(summaryEntry);
        }
        indexData.saves.sort((a, b) => b.ecoIndex - a.ecoIndex || b.pcv - a.pcv);
        indexData.saves = indexData.saves.slice(0, 30);

        await saveIndex(supabaseUrl, serviceKey, indexData);

        return res.status(200).json({
          ok: true,
          slot,
          summary: summaryEntry,
          saves: indexData.saves
        });
      }

      if (action === "log") {
        const indexData = await fetchIndex(supabaseUrl, serviceKey);
        const logEntry = {
          id: `log_${Date.now()}`,
          version: body.version || "v0.2.0",
          author: body.author || "Equipe Future Shards",
          note: body.note || "Atualização de teste registrada",
          ecoIndex: Number(body.ecoIndex ?? 25),
          createdAt: new Date().toISOString()
        };
        indexData.logs.unshift(logEntry);
        indexData.logs = indexData.logs.slice(0, 40);
        await saveIndex(supabaseUrl, serviceKey, indexData);
        return res.status(200).json({ ok: true, log: logEntry, logs: indexData.logs });
      }
    }

    return res.status(405).json({ ok: false, error: "Método não suportado." });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || "Erro interno na API Cloud." });
  }
};
