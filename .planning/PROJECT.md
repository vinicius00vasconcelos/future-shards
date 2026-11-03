# PROJECT: Future Shards (Protótipo Solarpunk Tapajônico 16-Bit)

## Visão Geral
**Future Shards** é um jogo de sobrevivência ecológica, exploração arqueológica e engenharia Solarpunk ambientado nas margens do Rio Tapajós (Santarém, Pará). Inspirado pela filosofia científica de *Dr. Stone* aplicada aos saberes ancestrais amazônicos (Cerâmica Tapajônica, Terra Preta de Índio, manejo de várzea e bioquímica da floresta), o objetivo do jogador é regenerar o microclima e a biodiversidade local até atingir **100% no Termômetro Climático (ECO %)**.

## Estado Atual do Código e Assets (Mapeamento)
1. **Especificação Técnica ([`especificacao_prototipo_future_shards.md`](file:///d:/future%20shards/especificacao_prototipo_future_shards.md))**:
   - Define o ciclo sazonal de **30 dias** (15 dias de **Cheia** com fases de Enchente, Ápice e Repiquete; 15 dias de **Seca** com Vazante, Seca Extrema e Transição).
   - Define o mapa contínuo de **60x40 tiles** dividido em 3 Zonas (`Zona 1: Várzea`, `Zona 2: Igapó e Sítio Arqueológico`, `Zona 3: Cicatriz da Queimada e Santuário das Cariátides`).
   - Cataloga **45 itens balanceados** (Categorias A, B, C, D e E) com receitas exatas, tempos de processamento e estações de trabalho específicas.
   - Define a **Árvore Científica de 15 Nós em 3 Eras** (`T1_01` a `T3_05`).

2. **Biblioteca de Assets**:
   - [`future_shards_sprites_45_itens`](file:///d:/future%20shards/future_shards_sprites_45_itens/items_manifest.json): Contém os 45 itens em `32x32`, `128x128`, cards HD, 8 construções em `128x128` e o atlas transparente 9x5.
   - [`future_shards_sprites_cenario_e_recursos`](file:///d:/future%20shards/future_shards_sprites_cenario_e_recursos/scenery_manifest.json): Contém os 45 assets de mundo (9 tiles de terreno, 9 nodos de recursos naturais, 9 POIs arqueológicos/sucata, 9 construções da Ecobase e 9 entidades/veículos/fauna) em `32x32`, `128x128` e atlas 9x5.

3. **Protótipo Funcional Atual ([`future_shards_prot_tipo_funcional_16_bit_solarpunk_tapaj_nico.html`](file:///d:/future%20shards/future_shards_prot_tipo_funcional_16_bit_solarpunk_tapaj_nico.html))**:
   - Possui engine 2D em Canvas, minimapa interativo, áudio 16-bit sintetizado (Web Audio API), HUD completo, e os 4 modais principais (Craft, Árvore Científica, Equipamentos e Construção).
   - **Gaps identificados em relação à Especificação `.md`:**
     - **Fidelidade de Spawns e Sub-estágios Sazonais**: Os 6 sub-períodos sazonais (Enchente, Ápice da Cheia, Repiquete, Vazante, Ápice da Seca, Transição) e o sistema de *respawn* periódico de recursos (diário/2 dias/3 dias/por estação) e coleta contínua de látex em seringueiras equipadas com tigelas ainda estão simplificados.
     - **Requisitos de Bancada/Estação no Craft e Receitas Exatas**: Algumas receitas no HTML foram simplificadas em relação à tabela da Seção 3 do `.md` (ex.: `proc_03` Terra Preta, `proc_04` Borracha, `proc_07` Célula Fotovoltaica) e não verificam se o jogador construiu/está próximo à estação exigida (Forno de Barro, Bancada Solarpunk, Filtro).
     - **Eventos de Mundo e POIs Especiais**: O **Altar do Grande Vaso de Cariátides** (`X: 53, Y: 5`) com onda de neblina regenerativa na Zona 3, a limpeza visual da mancha de óleo no **Baixio do Motor Abandonado** (`X: 33, Y: 34`), a dinâmica de evaporação do solo comum em 20s na Seca Extrema, e os efeitos temporizados de consumíveis (velocidade do Açaí, proteção térmica da Água Filtrada, Incenso no Vaso de Cariátides) podem ser implementados com total fidelidade.
     - **Salvamento (Save/Load), Animações de Mundo e Polimento Visual**: Persistência via `localStorage`, partículas visuais (neblina das Cariátides, fumaça limpa, brilho de relíquias com Óculos Bio-Scanner), tela de vitória ao atingir `100% ECO` e carregamento direto dos PNGs de alta nitidez da biblioteca local.

