// ============================================================================
// FUTURE SHARDS — DATABASE OF 45 ITEMS, 45 SCENERY ASSETS, 15 TECHS & 9 BUILDINGS
// Directly mapped to the local PNG asset library and especificacao_prototipo_future_shards.md
// ============================================================================

const ITEMS_BASE_DIR = "future_shards_sprites_45_itens";
const SCENERY_BASE_DIR = "future_shards_sprites_cenario_e_recursos";

const ITEMS_DB = [
  // Categoria A (0..12) — Recursos Naturais e Botânicos Brutos (13 Itens)
  { idx: 0, id: "mat_01", slug: "argila_de_varzea", name: "Argila de Várzea", cat: "A", stack: 50, pcv: 5, desc: "Base refratária de toda olaria e fornos tapajônicos." },
  { idx: 1, id: "mat_02", slug: "esponja_de_cauixi", name: "Esponja de Cauixi", cat: "A", stack: 50, pcv: 10, desc: "Esponja de água doce rica em espículas de sílica para temperar argila." },
  { idx: 2, id: "mat_03", slug: "casca_de_caraipe", name: "Casca de Caraipé", cat: "A", stack: 50, pcv: 5, desc: "Casca siliciosa tradicional usada como antiplástico cerâmico." },
  { idx: 3, id: "mat_04", slug: "fibra_de_curua", name: "Fibra de Curuá", cat: "A", stack: 50, pcv: 5, desc: "Fibra amazônica ultra-resistente para cestos, coletes e pontes." },
  { idx: 4, id: "mat_05", slug: "cipo_titica", name: "Cipó-Titica", cat: "A", stack: 50, pcv: 5, desc: "Cipó flexível para amarração de palafitas e ferramentas." },
  { idx: 5, id: "mat_06", slug: "lenha_caida_biomassa", name: "Lenha Caída / Biomassa", cat: "A", stack: 50, pcv: 2, desc: "Galhos secos coletados sem derrubar árvores; base do biocarvão." },
  { idx: 6, id: "mat_07", slug: "latex_de_seringueira", name: "Látex de Seringueira", cat: "A", stack: 30, pcv: 15, desc: "Seiva leitosa extraída no Igapó para vulcanização natural." },
  { idx: 7, id: "mat_08", slug: "sementes_de_acai", name: "Sementes de Açaí e Bacaba", cat: "A", stack: 50, pcv: 5, desc: "Sementes nativas de rápido crescimento agroflorestal e energia." },
  { idx: 8, id: "mat_09", slug: "muda_de_samauma", name: "Muda de Samaúma / Castanheira", cat: "A", stack: 20, pcv: 15, desc: "Árvore gigante que regenera +6% ECO quando plantada em Terra Preta." },
  { idx: 9, id: "mat_10", slug: "sementes_de_urucum", name: "Sementes de Urucum", cat: "A", stack: 30, pcv: 10, desc: "Pigmento rico em bixina para proteção UV e células fotovoltaicas." },
  { idx: 10, id: "mat_11", slug: "fruto_de_jenipapo", name: "Fruto de Jenipapo", cat: "A", stack: 30, pcv: 10, desc: "Fruto amazônico usado em pinturas corporais e camuflagem." },
  { idx: 11, id: "mat_12", slug: "sementes_andiroba_copaiba", name: "Sementes de Andiroba e Copaíba", cat: "A", stack: 30, pcv: 15, desc: "Insumo para óleos medicinais, bálsamos e resinas aromáticas." },
  { idx: 12, id: "mat_13", slug: "agua_bruta_do_rio", name: "Água Bruta do Rio", cat: "A", stack: 20, pcv: 2, desc: "Água coletada no rio; filtre em barro com carvão antes de beber." },

  // Categoria B (13..21) — Minerais, Arqueologia e Sucata Reciclável (9 Itens)
  { idx: 13, id: "arq_01", slug: "caco_ceramico_tapajonico", name: "Caco Cerâmico Tapajônico", cat: "B", stack: 30, pcv: 15, desc: "Fragmento ancestral poroso essencial para formar Terra Preta de Índio." },
  { idx: 14, id: "arq_02", slug: "fragmento_vaso_de_gargalo", name: "Fragmento de Vaso de Gargalo", cat: "B", stack: 10, pcv: 30, desc: "Relíquia hidráulica tapajônica que inspira reservatórios sem evaporação." },
  { idx: 15, id: "arq_03", slug: "fragmento_vaso_de_cariatides", name: "Fragmento de Vaso de Cariátides", cat: "B", stack: 10, pcv: 35, desc: "Peça cerimonial que revela a engenharia do Condensador de Neblina." },
  { idx: 16, id: "arq_04", slug: "apendice_zoomorfo_antigo", name: "Apêndice Zoomorfo Antigo", cat: "B", stack: 10, pcv: 25, desc: "Escultura de onça/coruja em argila que concede bônus passivos." },
  { idx: 17, id: "min_01", slug: "quartzo_leitoso", name: "Quartzo Leitoso", cat: "B", stack: 30, pcv: 10, desc: "Cristal piezoelétrico para lentes de scanner e microcircuitos." },
  { idx: 18, id: "min_02", slug: "pedra_verde_nefrita", name: "Pedra Verde (Nefrita / Jade)", cat: "B", stack: 10, pcv: 40, desc: "Mineral raro usado para esculpir amuletos lendários de Muiraquitã." },
  { idx: 19, id: "rec_01", slug: "sucata_de_cobre", name: "Sucata de Cobre", cat: "B", stack: 30, pcv: 10, desc: "Metal condutor recuperado ao desmontar motores poluentes." },
  { idx: 20, id: "rec_02", slug: "imas_rolamentos_reciclados", name: "Ímãs e Rolamentos Reciclados", cat: "B", stack: 20, pcv: 15, desc: "Peças magnéticas extraídas de dragas para turbinas e drones." },
  { idx: 21, id: "rec_03", slug: "vidro_silicio_recuperado", name: "Vidro e Silício Recuperado", cat: "B", stack: 30, pcv: 10, desc: "Substrato reciclado para placas fotovoltaicas orgânicas." },

  // Categoria C (22..30) — Insumos Processados e Componentes Solarpunk (9 Itens)
  { idx: 22, id: "proc_01", slug: "massa_ceramica_temperada", name: "Massa Cerâmica Temperada", cat: "C", stack: 30, tech: "T1_02", station: "Bancada Rústica", recipe: { mat_01: 2, mat_02: 1 }, desc: "Argila misturada com sílica de cauixi; não racha no forno." },
  { idx: 23, id: "proc_02", slug: "biocarvao_ativado", name: "Biocarvão Ativado (Pirólise)", cat: "C", stack: 30, tech: "T1_04", station: "Forno de Barro", recipe: { mat_06: 2 }, desc: "Carvão poroso que fixa carbono no solo e conduz elétrons." },
  { idx: 24, id: "proc_03", slug: "terra_preta_de_indio", name: "Terra Preta de Índio", cat: "C", stack: 30, tech: "T1_04", station: "Bancada / Composto", recipe: { proc_02: 1, arq_01: 1, mat_06: 1 }, desc: "Regenera 1 tile de Solo Cinza Degradado (+3% ECO imediato)." },
  { idx: 25, id: "proc_04", slug: "borracha_natural_vulcanizada", name: "Borracha Natural Vulcanizada", cat: "C", stack: 20, tech: "T2_01", station: "Forno de Barro", recipe: { mat_07: 2, mat_03: 1 }, desc: "Borracha elástica e impermeável para botas e isolamento." },
  { idx: 26, id: "proc_05", slug: "oleo_medicinal_andiroba", name: "Óleo Medicinal de Andiroba", cat: "C", stack: 20, tech: "T1_05", station: "Prensa Cerâmica", recipe: { mat_12: 2 }, desc: "Óleo vegetal amazônico para bálsamos e queimadores acústicos." },
  { idx: 27, id: "proc_06", slug: "cabo_eletrico_ecologico", name: "Cabo Elétrico Ecológico", cat: "C", stack: 30, tech: "T2_04", station: "Bancada Solarpunk", recipe: { rec_01: 1, proc_04: 1 }, desc: "Fiação de cobre reciclado revestida com borracha de seringueira." },
  { idx: 28, id: "proc_07", slug: "celula_fotovoltaica_urucum", name: "Célula Fotovoltaica de Urucum", cat: "C", stack: 20, tech: "T3_02", station: "Bancada Solarpunk", recipe: { rec_03: 1, min_01: 1, mat_10: 1, rec_01: 1 }, desc: "Célula solar orgânica sensibilizada por pigmento de urucum." },
  { idx: 29, id: "proc_08", slug: "tubo_hidraulico_terracota", name: "Tubo Hidráulico de Terracota", cat: "C", stack: 30, tech: "T2_02", station: "Forno de Barro", recipe: { proc_01: 2 }, desc: "Tubulação cerâmica para irrigação de precisão na Seca." },
  { idx: 30, id: "proc_09", slug: "microcircuito_piezo_ceramico", name: "Microcircuito Piezo-Cerâmico", cat: "C", stack: 20, tech: "T2_05", station: "Bancada Solarpunk", recipe: { proc_01: 1, min_01: 1, rec_01: 1 }, desc: "Placa lógica limpa para o Bio-Scanner, Drones e Condensadores." },

  // Categoria D (31..34) — Consumíveis de Sobrevivência (4 Itens)
  { idx: 31, id: "cons_01", slug: "agua_fresca_filtrada", name: "Água Fresca Filtrada", cat: "D", stack: 20, tech: "T1_03", recipe: { mat_13: 1, proc_02: 1 }, effect: { stamina: 45, hp: 10 }, desc: "Restaura +45 Vigor e refresca o calor da Seca." },
  { idx: 32, id: "cons_02", slug: "tigela_acai_energetico", name: "Tigela de Açaí Energético", cat: "D", stack: 20, tech: "T1_03", recipe: { mat_08: 2, mat_13: 1 }, effect: { stamina: 75, hp: 25 }, desc: "Superalimento amazônico: restaura +75 Vigor e +25 HP." },
  { idx: 33, id: "cons_03", slug: "balsamo_de_copaiba", name: "Bálsamo de Copaíba", cat: "D", stack: 20, tech: "T1_05", recipe: { proc_05: 1, mat_04: 1 }, effect: { stamina: 20, hp: 60 }, desc: "Cura +60 HP imediatamente e trata insolação na Zona 3." },
  { idx: 34, id: "cons_04", slug: "incenso_breu_andiroba", name: "Incenso de Breu e Andiroba", cat: "D", stack: 20, tech: "T2_03", recipe: { proc_05: 1, mat_06: 1 }, effect: { stamina: 100, hp: 30 }, desc: "Aroma medicinal que restaura +100 Vigor e +30 HP." },

  // Categoria E (35..44) — Ferramentas, Vestimentas e Bio-Amuletos Equipáveis (10 Itens)
  { idx: 35, id: "eq_tool_01", slug: "pa_de_manejo_tapajo", name: "Pá de Manejo Tapajó", cat: "E", slot: "tool", tech: "T1_01", recipe: { mat_06: 2, mat_04: 2 }, desc: "Escava argila, relíquias e prepara canteiros de Terra Preta." },
  { idx: 36, id: "eq_tool_02", slug: "chave_de_desmontagem", name: "Chave de Desmontagem", cat: "E", slot: "tool", tech: "T2_04", recipe: { min_01: 1, arq_01: 1, mat_05: 2 }, desc: "Recicla motores a diesel e dragas poluentes em Cobre e Vidro (+ECO)." },
  { idx: 37, id: "eq_tool_03", slug: "scanner_tapajonico", name: "Scanner Tapajônico", cat: "E", slot: "tool", tech: "T2_05", recipe: { proc_09: 1, rec_03: 1 }, desc: "Analisa plantas e vasos para gerar +50% mais Ciência Verde (PCV)." },
  { idx: 38, id: "eq_head_01", slug: "oculos_bio_scanner", name: "Óculos Bio-Scanner", cat: "E", slot: "head", tech: "T3_01", recipe: { rec_03: 1, proc_09: 1, proc_04: 1 }, desc: "Slot Cabeça: +25% ganho de PCV e destaca relíquias no mapa." },
  { idx: 39, id: "eq_body_01", slug: "colete_fibra_curua", name: "Colete de Fibra de Curuá", cat: "E", slot: "body", tech: "T2_01", recipe: { mat_04: 3, mat_07: 1 }, desc: "Slot Torso: +45% Proteção Térmica (bloqueia dano de calor na Zona 3)." },
  { idx: 40, id: "eq_back_01", slug: "cesto_trancado_varzea", name: "Cesto Trançado de Várzea", cat: "E", slot: "back", tech: "T1_01", recipe: { mat_04: 3, mat_05: 1 }, desc: "Slot Costas: Expande a mochila para 12 slots." },
  { idx: 41, id: "eq_back_02", slug: "mochila_solar_mk2", name: "Mochila Solar MK-II", cat: "E", slot: "back", tech: "T3_02", recipe: { eq_back_01: 1, proc_07: 1, proc_06: 1 }, desc: "Slot Costas: 16 slots de mochila e gera +3W/s de energia solar pessoal." },
  { idx: 42, id: "eq_feet_01", slug: "botas_de_seringueira", name: "Botas de Seringueira", cat: "E", slot: "feet", tech: "T2_01", recipe: { proc_04: 2, mat_04: 1 }, desc: "Slot Pés: Anula a lentidão nas águas rasas da Cheia e do Igapó." },
  { idx: 43, id: "eq_amul_01", slug: "muiraquita_de_jade", name: "Muiraquitã de Jade", cat: "E", slot: "amulet1", tech: "T2_03", recipe: { min_02: 1, mat_04: 1 }, desc: "Biojoia: +25% velocidade de movimento e reduz gasto de bateria solar." },
  { idx: 44, id: "eq_amul_02", slug: "amuleto_zoomorfo_pintura", name: "Amuleto Zoomorfo e Pintura", cat: "E", slot: "amulet2", tech: "T2_03", recipe: { arq_04: 1, mat_10: 1, mat_11: 1 }, desc: "Biojoia: +25% Proteção Térmica extra e regenera +1 Vigor/s." }
];

// Attach direct file paths from future_shards_sprites_45_itens/
ITEMS_DB.forEach(it => {
  const fileName = `${it.id}_${it.slug}.png`;
  it.sprite32 = `${ITEMS_BASE_DIR}/sprites_32x32/${fileName}`;
  it.sprite128 = `${ITEMS_BASE_DIR}/sprites_128x128/${fileName}`;
  it.spriteHd = `${ITEMS_BASE_DIR}/sprites_hd_transparentes/${fileName}`;
  it.cardHd = `${ITEMS_BASE_DIR}/sprites_hd_cards/${fileName}`;
});

const ITEM_MAP = {};
ITEMS_DB.forEach(it => { ITEM_MAP[it.id] = it; });

// ============================================================================
// 45 SCENERY & WORLD ASSETS (Matching scenery_manifest.json indices 0..44)
// ============================================================================
const SCENERY_ASSETS = [
  // Row 0 (0..8): Terrain Tiles
  { idx: 0, id: "tile_01", slug: "agua_profunda_tapajos", name: "Água Profunda do Tapajós (Turquesa)", isTile: true },
  { idx: 1, id: "tile_02", slug: "agua_barrenta_amazonas", name: "Água Barrenta do Amazonas", isTile: true },
  { idx: 2, id: "tile_03", slug: "agua_rasa_igapo", name: "Água Rasa de Igapó Alagado", isTile: true },
  { idx: 3, id: "tile_04", slug: "praia_areia_alter", name: "Areia Branca de Praia (Vazante)", isTile: true },
  { idx: 4, id: "tile_05", slug: "solo_varzea_grama", name: "Solo Úmido e Grama de Várzea", isTile: true },
  { idx: 5, id: "tile_06", slug: "solo_cinza_degradado", name: "Solo Cinza Degradado (Queimada)", isTile: true },
  { idx: 6, id: "tile_07", slug: "solo_terra_preta_fertil", name: "Solo de Terra Preta de Índio", isTile: true },
  { idx: 7, id: "tile_08", slug: "piso_palafita_madeira", name: "Piso de Palafita e Ponte de Madeira", isTile: true },
  { idx: 8, id: "tile_09", slug: "tubo_terracota_e_cabo", name: "Tubo de Irrigação e Cabo Elétrico", isTile: true },

  // Row 1 (9..17): Natural Resource Nodes
  { idx: 9,  id: "node_01", slug: "barranco_argila_varzea", name: "Depósito de Argila de Várzea" },
  { idx: 10, id: "node_02", slug: "tronco_esponja_cauixi", name: "Tronco com Esponja de Cauixi" },
  { idx: 11, id: "node_03", slug: "planta_fibra_curua", name: "Planta Fibrosa de Curuá" },
  { idx: 12, id: "node_04", slug: "arbusto_urucum_vermelho", name: "Arbusto de Urucum" },
  { idx: 13, id: "node_05", slug: "acaizeiro_frutifero", name: "Palmeira de Açaí" },
  { idx: 14, id: "node_06", slug: "seringueira_com_tigela", name: "Seringueira com Tigela de Látex" },
  { idx: 15, id: "node_07", slug: "arvore_andiroba_jenipapo", name: "Árvore de Andiroba / Jenipapo" },
  { idx: 16, id: "node_08", slug: "samauma_gigante_viva", name: "Samaúma Gigante da Floresta" },
  { idx: 17, id: "node_09", slug: "tronco_queimado_biomassa", name: "Tronco Carbonizado / Lenha Caída" },

  // Row 2 (18..26): Archaeological POIs & Polluting Scrap
  { idx: 18, id: "poi_01", slug: "monticulo_cacos_tapajo", name: "Montículo de Cacos Tapajônicos" },
  { idx: 19, id: "poi_02", slug: "escavacao_vaso_gargalo", name: "Vaso de Gargalo Soterrado" },
  { idx: 20, id: "poi_03", slug: "altar_ruina_cariatides", name: "Altar Ancestral das Cariátides" },
  { idx: 21, id: "poi_04", slug: "pedra_grafismos_rupestres", name: "Pedra com Grafismos Tapajó" },
  { idx: 22, id: "poi_05", slug: "rocha_quartzo_bruto", name: "Afloramento de Quartzo Leitoso" },
  { idx: 23, id: "poi_06", slug: "veio_pedra_verde_jade", name: "Veio de Pedra Verde (Nefrita/Jade)" },
  { idx: 24, id: "poi_07", slug: "motor_diesel_enferrujado", name: "Carcaça de Motor a Diesel (Sucata)" },
  { idx: 25, id: "poi_08", slug: "draga_garimpo_abandonada", name: "Draga Abandonada para Reciclagem" },
  { idx: 26, id: "poi_09", slug: "cabana_palafita_inicial", name: "Cabana Ribeirinha em Palafita" },

  // Row 3 (27..35): Ecobase Solarpunk Buildings
  { idx: 27, id: "bld_01", slug: "bancada_rustica_varzea", name: "Piso / Bancada de Palafita" },
  { idx: 28, id: "bld_02", slug: "forno_ceramico_pirolise", name: "Forno Cerâmico de Pirólise" },
  { idx: 29, id: "bld_03", slug: "canteiro_agroflorestal", name: "Canteiro de Terra Preta" },
  { idx: 30, id: "bld_04", slug: "bancada_engenharia_solarpunk", name: "Bancada de Engenharia Solarpunk" },
  { idx: 31, id: "bld_05", slug: "painel_solar_palafita", name: "Painel Solar Fotovoltaico" },
  { idx: 32, id: "bld_06", slug: "bio_bateria_tapajonica", name: "Bio-Bateria em Vaso Tapajônico" },
  { idx: 33, id: "bld_07", slug: "condensador_neblina_cariatide", name: "Torre Condensadora de Cariátides" },
  { idx: 34, id: "bld_08", slug: "estacao_drone_beija_flor", name: "Estação de Recarga do Drone" },
  { idx: 35, id: "bld_09", slug: "microturbina_fluvial", name: "Microturbina Hidrocinética de Cheia" },

  // Row 4 (36..44): Characters, Solar Boats, Drones & Amazonian Fauna
  { idx: 36, id: "ent_01", slug: "protagonista_explorador", name: "Protagonista (Cientista-Artesão)" },
  { idx: 37, id: "ent_02", slug: "protagonista_bio_scanner", name: "Protagonista Usando Bio-Scanner" },
  { idx: 38, id: "ent_03", slug: "drone_polinizador_beija_flor", name: "Drone Polinizador Beija-Flor" },
  { idx: 39, id: "ent_04", slug: "canoa_rabeta_solar", name: "Canoa / Rabeta Elétrica Solar" },
  { idx: 40, id: "ent_05", slug: "catamara_solar_flutuante", name: "Catamarã Solar Flutuante" },
  { idx: 41, id: "ent_06", slug: "boto_cor_de_rosa", name: "Boto-Cor-de-Rosa do Tapajós" },
  { idx: 42, id: "ent_07", slug: "arara_azul_caninde", name: "Arara-Canindé / Fauna Regenerada" },
  { idx: 43, id: "ent_08", slug: "vitoria_regia_igapo", name: "Vitória-Régia Gigante do Igapó" },
  { idx: 44, id: "ent_09", slug: "mestre_artesao_tapajo_npc", name: "Mestre Artesão Tapajó (NPC)" }
];

SCENERY_ASSETS.forEach(sa => {
  const fileName = `${sa.id}_${sa.slug}.png`;
  sa.spriteHd = `${SCENERY_BASE_DIR}/cenario_hd_transparentes/${fileName}`;
  sa.cardHd = `${SCENERY_BASE_DIR}/cenario_hd_cards/${fileName}`;
  if (sa.isTile) {
    sa.sprite32 = `${SCENERY_BASE_DIR}/tiles_terreno_32x32/${fileName}`;
    sa.sprite128 = `${SCENERY_BASE_DIR}/tiles_terreno_128x128/${fileName}`;
  } else {
    sa.sprite32 = `${SCENERY_BASE_DIR}/objetos_mundo_32x32/${fileName}`;
    sa.sprite128 = sa.spriteHd;
  }
});

// ============================================================================
// 15 NODES OF THE SCIENTIFIC TECH TREE (3 ERAS)
// ============================================================================
const TECH_TREE = [
  // Era 1
  { id: "T1_01", era: 1, name: "Biomecânica das Fibras (Curuá e Titica)", cost: 0, req: [], desc: "Fibras de celulose do curuá permitem erguer palafitas e ferramentas sem pregos metálicos.", unlocks: "Pá de Manejo, Cesto Trançado, Piso/Ponte de Palafita" },
  { id: "T1_02", era: 1, name: "Termodinâmica da Argila e Cauixi", cost: 15, req: ["T1_01"], desc: "Espículas de sílica do cauixi criam uma malha refratária que evita rachaduras na queima.", unlocks: "Massa Cerâmica Temperada, Forno Cerâmico de Pirólise" },
  { id: "T1_03", era: 1, name: "Adsorção e Filtragem em Barro", cost: 25, req: ["T1_02"], desc: "Cerâmica microporosa e carvão purificam e resfriam a água do rio por evaporação.", unlocks: "Água Fresca Filtrada, Tigela de Açaí Energético" },
  { id: "T1_04", era: 1, name: "Pirólise e Terra Preta de Índio", cost: 40, req: ["T1_02"], desc: "Biocarvão misturado a cacos cerâmicos fixa carbono por séculos e retém 3x mais umidade.", unlocks: "Biocarvão Ativado, Terra Preta de Índio, Canteiro Agroflorestal" },
  { id: "T1_05", era: 1, name: "Fitoquímica de Urucum e Copaíba", cost: 55, req: ["T1_03"], desc: "Bixina do urucum filtra radiação UV e diterpenos da copaíba cicatrizam ferimentos.", unlocks: "Óleo Medicinal, Bálsamo de Copaíba" },

  // Era 2
  { id: "T2_01", era: 2, name: "Vulcanização Natural do Látex", cost: 75, req: ["T1_05"], desc: "Defumar o látex da seringueira com cinzas estabiliza polímeros elásticos impermeáveis.", unlocks: "Borracha Vulcanizada, Botas de Seringueira, Colete de Curuá" },
  { id: "T2_02", era: 2, name: "Hidráulica dos Vasos de Gargalo", cost: 95, req: ["T1_04"], desc: "O gargalo estreito reduz a perda por evaporação durante os 15 dias de Seca.", unlocks: "Tubo Hidráulico de Terracota, Irrigação Cerâmica" },
  { id: "T2_03", era: 2, name: "Ressonância e Simbolismo de Cariátides", cost: 120, req: ["T2_02"], desc: "Câmaras cerâmicas acústicas e lapidação em nefrita potencializam o vigor na base.", unlocks: "Muiraquitã de Jade, Amuleto Zoomorfo, Incenso de Breu" },
  { id: "T2_04", era: 2, name: "Metalurgia Reversa e Mineração Urbana", cost: 145, req: ["T2_01"], desc: "Desmontar motores e dragas abandonadas fornece cobre e vidro sem minerar a floresta.", unlocks: "Chave de Desmontagem, Cabo Ecológico, Bancada Solarpunk" },
  { id: "T2_05", era: 2, name: "Piezoeletricidade do Quartzo", cost: 175, req: ["T2_04"], desc: "Cristais de quartzo amazônico vibram sob corrente elétrica para leitura espectral.", unlocks: "Microcircuito Piezo-Cerâmico, Scanner Tapajônico" },

  // Era 3
  { id: "T3_01", era: 3, name: "Eletroquímica da Bio-Bateria de Carvão", cost: 210, req: ["T1_04", "T2_05"], desc: "A alta superfície do biocarvão atua como supercapacitor dentro de potes cerâmicos.", unlocks: "Bio-Bateria Tapajônica (100Wh), Óculos Bio-Scanner" },
  { id: "T3_02", era: 3, name: "Células Fotovoltaicas Orgânicas (Grätzel)", cost: 250, req: ["T1_05", "T3_01"], desc: "Corantes de urucum sobre vidro reciclado convertem fótons solares em corrente limpa.", unlocks: "Célula Fotovoltaica, Painel Solar de Palafita, Mochila Solar MK-II" },
  { id: "T3_03", era: 3, name: "Geração Hidrocinética de Cheia", cost: 290, req: ["T3_01"], desc: "Hélices submersas geram energia com a correnteza da Cheia sem represar o rio.", unlocks: "Microturbina Fluvial (+30W na Cheia)" },
  { id: "T3_04", era: 3, name: "Condensação Higroscópica de Cariátides", cost: 340, req: ["T2_03", "T3_02"], desc: "Resfriamento Peltier solar dentro do Vaso de Cariátides condensa a umidade do ar na Seca.", unlocks: "Torre Condensadora de Cariátides (+10% ECO, irriga raio 5)" },
  { id: "T3_05", era: 3, name: "Mobilidade Solar e Robótica Biomimética", cost: 400, req: ["T3_04"], desc: "Integra propulsão limpa e drones polinizadores para reflorestar a Cicatriz da Queimada.", unlocks: "Estação do Drone Beija-Flor (+8% ECO, plantio automático)" }
];

// ============================================================================
// 9 ECOBASE BUILDINGS (Mapped to buildings_128x128/ & Scenery indices 27..35)
// ============================================================================
const BUILDINGS_DB = [
  { id: "bld_01", sceneryIdx: 27, name: "Piso / Ponte de Palafita", tech: "T1_01", power: 0, eco: 1, cost: { mat_06: 1, mat_04: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_01_piso_palafita_ponte.png`, desc: "Permite caminhar e construir sobre a água rasa da Cheia e do Igapó." },
  { id: "bld_02", sceneryIdx: 28, name: "Forno Cerâmico de Pirólise", tech: "T1_02", power: 0, eco: 3, cost: { mat_01: 3, mat_02: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_02_forno_ceramico_pirolise.png`, desc: "Queima cerâmica temperada e produz Biocarvão sem emitir fumaça tóxica." },
  { id: "bld_03", sceneryIdx: 29, name: "Canteiro de Terra Preta", tech: "T1_04", power: 0, eco: 4, cost: { proc_03: 1, mat_06: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_03_canteiro_terra_preta.png`, desc: "Canteiro fértil permanente que sustenta mudas nativas mesmo na Seca." },
  { id: "bld_04", sceneryIdx: 30, name: "Bancada de Engenharia Solarpunk", tech: "T2_04", power: -5, eco: 3, cost: { proc_01: 2, rec_01: 2 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_04_bancada_solarpunk.png`, desc: "Estação avançada que reduz o custo de energia e habilita componentes solares." },
  { id: "bld_05", sceneryIdx: 31, name: "Painel Solar de Palafita", tech: "T3_02", power: 25, eco: 6, cost: { proc_07: 1, proc_06: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_05_painel_solar_palafita.png`, desc: "Gera +25W de energia limpa durante o dia (+35W na Seca)." },
  { id: "bld_06", sceneryIdx: 32, name: "Bio-Bateria Tapajônica", tech: "T3_01", power: 0, storage: 100, eco: 4, cost: { proc_01: 2, proc_02: 2, rec_01: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_06_bio_bateria_tapajonica.png`, desc: "Vaso cerâmico com biocarvão que armazena +100Wh para uso noturno." },
  { id: "bld_07", sceneryIdx: 33, name: "Condensador de Neblina de Cariátides", tech: "T3_04", power: -10, eco: 12, cost: { proc_01: 2, proc_07: 1, arq_03: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_07_condensador_cariatides.png`, desc: "Extrai água do ar na Seca e irriga todos os tiles em um raio de 5 blocos." },
  { id: "bld_08", sceneryIdx: 34, name: "Estação do Drone Beija-Flor", tech: "T3_05", power: -8, eco: 10, cost: { proc_09: 1, proc_07: 1, rec_02: 1 }, sprite128: `${ITEMS_BASE_DIR}/buildings_128x128/bld_08_estacao_drone_beija_flor.png`, desc: "Lança um drone beija-flor que regenera e planta árvores na Zona 3." },
  { id: "bld_09", sceneryIdx: 35, name: "Microturbina Hidrocinética", tech: "T3_03", power: 30, eco: 6, cost: { rec_01: 2, rec_02: 1, proc_04: 1 }, sprite128: `${SCENERY_BASE_DIR}/cenario_hd_transparentes/bld_09_microturbina_fluvial.png`, desc: "Instalada na água: gera +30W constantes dia e noite (45W na Cheia)." }
];

// ============================================================================
// WORLD OBJECT TYPES (Mapped to Scenery indices 9..26, 43, 44)
// ============================================================================
const WORLD_OBJ_TYPES = {
  clay_node:     { name: "Depósito de Argila de Várzea",       sceneryIdx: 9,  drop: "mat_01", qty: 3, pcv: 10, zone: 1 },
  cauixi_node:   { name: "Tronco com Esponja de Cauixi",       sceneryIdx: 10, drop: "mat_02", qty: 2, pcv: 15, zone: 2 },
  curua_node:    { name: "Planta Fibrosa de Curuá",            sceneryIdx: 11, drop: "mat_04", qty: 3, pcv: 10, zone: 1 },
  urucum_node:   { name: "Arbusto de Urucum",                  sceneryIdx: 12, drop: "mat_10", qty: 2, pcv: 15, zone: 1 },
  acai_tree:     { name: "Palmeira de Açaí",                   sceneryIdx: 13, drop: "mat_08", qty: 3, pcv: 10, zone: 1 },
  rubber_tree:   { name: "Seringueira com Tigela",             sceneryIdx: 14, drop: "mat_07", qty: 2, pcv: 20, zone: 2 },
  andiroba_tree: { name: "Árvore de Andiroba e Copaíba",       sceneryIdx: 15, drop: "mat_12", qty: 2, pcv: 20, zone: 2 },
  samauma_tree:  { name: "Samaúma Gigante da Floresta",        sceneryIdx: 16, drop: "mat_09", qty: 1, pcv: 25, zone: 2 },
  charred_log:   { name: "Tronco Queimado / Biomassa",         sceneryIdx: 17, drop: "mat_06", qty: 3, pcv: 5,  zone: 3 },
  shard_mound:   { name: "Montículo de Cacos Tapajó",          sceneryIdx: 18, drop: "arq_01", qty: 2, pcv: 25, zone: 2 },
  necked_vase:   { name: "Vaso de Gargalo Soterrado",          sceneryIdx: 19, drop: "arq_02", qty: 1, pcv: 35, zone: 2 },
  caryatid_altar:{ name: "Altar Ancestral de Cariátides",      sceneryIdx: 20, drop: "arq_03", qty: 1, pcv: 45, zone: 3 },
  petroglyph:    { name: "Pedra com Grafismos Tapajó",         sceneryIdx: 21, drop: "arq_04", qty: 1, pcv: 35, zone: 2 },
  quartz_rock:   { name: "Afloramento de Quartzo",             sceneryIdx: 22, drop: "min_01", qty: 2, pcv: 15, zone: 3 },
  jade_vein:     { name: "Veio de Pedra Verde (Jade)",         sceneryIdx: 23, drop: "min_02", qty: 1, pcv: 45, zone: 3 },
  diesel_wreck:  { name: "Motor a Diesel Enferrujado",         sceneryIdx: 24, drop: "rec_01", qty: 3, pcv: 20, scrap: true, zone: 2 },
  dredge_wreck:  { name: "Draga de Garimpo Abandonada",        sceneryIdx: 25, drop: "rec_03", qty: 3, pcv: 25, scrap: true, zone: 3 },
  stilt_hut:     { name: "Cabana Palafita & Casa de Saberes",  sceneryIdx: 26, drop: "cons_01", qty: 1, pcv: 15, zone: 1 },
  water_lily:    { name: "Vitória-Régia Gigante",              sceneryIdx: 43, drop: "mat_05", qty: 2, pcv: 15, zone: 2 },
  elder_npc:     { name: "Mestre Artesão Tapajó (NPC)",        sceneryIdx: 44, drop: "arq_01", qty: 1, pcv: 30, npc: true, zone: 1 }
};

