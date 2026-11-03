# Changelog — Future Shards

Todas as modificações significativas neste projeto são documentadas neste arquivo e nos commits do GitHub.

## [v0.4.1] — 2026-11-03
### Corrigido
- **Sprites de Árvores 16-Bit com Copas Completas (Sem Corte no Topo)**:
  - **Diagnóstico**: Na folha original `spritesheet_cenario_e_recursos_hd.jpg`, os cards `node_06_seringueira_com_tigela.png`, `node_07_arvore_andiroba_jenipapo.png` e `node_08_samauma_gigante_viva.png` foram desenhados com zoom no tronco/sapopembas, cortando o topo das copas na linha divisória superior da grade.
  - **Solução**: Gerada e recortada nova folha 16-bit com as 4 árvores amazônicas completas de cima a baixo (`node_05_acaizeiro_frutifero.png`, `node_06_seringueira_com_tigela.png`, `node_07_arvore_andiroba_jenipapo.png` e `node_08_samauma_gigante_viva.png`), atualizando `cenario_hd_transparentes/`, `objetos_mundo_32x32/`, o atlas `spritesheet_cenario_45_transparente.png` e o ponto de ancoragem das raízes (`anchorY: 0.90`) em [`js/renderer.js`](js/renderer.js).

## [v0.4.0] — 2026-11-03
### Adicionado
- **Spritesheet Direcional 16-Bit do Protagonista (4 Direções x 3 Frames de Caminhada)**:
  - Gerada, recortada e integrada a folha de caminhada completa em [`future_shards_sprites_cenario_e_recursos/player_walkcycle/`](future_shards_sprites_cenario_e_recursos/player_walkcycle/) contendo **12 frames transparentes** (`down`, `up` com mochila solar iluminada e faixa vermelha, `right` e `left` com ciclo `walk1 -> idle -> walk2`).
- **Movimentação Livre Sub-Tile a 60 FPS, Colisão Circular (*Wall-Sliding*) e Câmera *Lerp* ([`js/world.js`](js/world.js), [`js/renderer.js`](js/renderer.js), [`js/main.js`](js/main.js))**:
  - Aplicados os padrões dos repositórios open-source `awesome-gamedev-agent-skills` (`physics-tuning`, `camera-systems`, `game-feel`) e `sprite-gen`.
  - Movimentação contínua 360° por velocidade (`vx, vy`), aceleração/atrito suave, *Click-to-Move* fluido até qualquer ponto do cenário e colisão elíptica na base de árvores/estruturas permitindo deslizar pelas bordas e passar por trás das copas.
- **Animações Vivas de Cenário, *Smart Proximity Highlight* e *Magnetic Loot Drops***:
  - Brisa do Tapajós (*Wind Sway*) balançando a copa das árvores, pulso luminoso de água correndo pelos Tubos de Terracota, animação da ferramenta na mão ao coletar/escanear, *hit-shake* nos recursos, itens pulando em parábola e voando magneticamente para a mochila, textos flutuantes (`+3 Argila`, `+15 PCV`) e sons de passos por tipo de terreno (`grama`, `madeira`, `água`).

## [v0.3.0] — 2026-11-03
### Corrigido & Adicionado
- **Restauração Integral dos 90 Sprites 16-Bit a partir dos Cards HD Originais**:
  - **Diagnóstico da Causa Raiz**: Os arquivos pré-recortados nas pastas `sprites_128x128/`, `sprites_32x32/` e `buildings_128x128/` continham ícones procedurais simplificados de 8-bits, enquanto `cenario_hd_transparentes/` e `sprites_hd_transparentes/` haviam sofrido remoção de fundo por limiar global de brilho (que apagava os contornos escuros e detalhes internos dos personagens, árvores e cabanas).
  - **Solução**: Extração automatizada via *Edge Flood-Fill (BFS)* diretamente dos 90 cards originais intactos (`sprites_hd_cards/*.png` e `cenario_hd_cards/*.png`), removendo a moldura ardósia e a legenda inferior sem afetar nenhum pixel interno da arte 16-bit, e reconstrução completa dos atlases transparentes (`spritesheet_45_itens_transparente.png` e `spritesheet_cenario_45_transparente.png`).
- **Engine Visual Multi-Tile com Ordenação de Profundidade (Y-Sorting) e Efeitos Solarpunk ([`js/renderer.js`](js/renderer.js), [`js/world.js`](js/world.js))**:
  - Escala multi-tile fiel à arte conceitual: Cabana Palafita com teto solar (`3.3x3.1 tiles`), Samaúmas Gigantes (`2.8x3.0 tiles`), Seringueiras/Andirobas/Açaizeiros (`2.2x2.4 tiles`), Fornos de Pirólise com brilho de fogo e fumaça animada, e Torre Condensadora de Cariátides com aura bioluminescente ciano conectada por tubulação de terracota aos canteiros de Terra Preta.
  - Margens orgânicas curvas do Rio Tapajós (sem efeito xadrez artificial), trapiche de madeira avançando sobre o rio, vagalumes na mata e Drone Beija-Flor pulverizando névoa d'água sobre as mudas.
- **HUD em Moldura de Madeira/Terracota, Hotbar Inferior de 7 Slots e Mapa Científico Visual ([`index.html`](index.html), [`css/style.css`](css/style.css), [`js/ui.js`](js/ui.js))**:
  - Barras flutuantes superiores esquerdas (`HP`, `SOLAR`, `ECO: 78%`), minimapa emoldurado `SANTARÉM` no canto superior direito, e barra inferior de madeira com os sprites reais + card flutuante `CRAFT: BIO-BATERIA TAPAJÔNICA`.
  - Redesenho completo do modal **TECH TREE / MAPA CIENTÍFICO** em grafo visual de 3 colunas (`ERA ANCESTRAL`, `BIO-QUÍMICA TAPAJÔNICA`, `ERA SOLAR-PUNK`) sobre pergaminho de circuito com trilhas douradas luminosas em SVG e painel lateral de inspeção (`PESQUISA: ...`, `CIÊNCIA: X / Y`).

## [v0.2.0] — 2026-11-03
### Adicionado
- **Integração Cloud (Vercel + Supabase)**:
  - Criada API Serverless [`api/cloud.js`](api/cloud.js) conectada ao bucket dedicado `future-shards` no Supabase para salvar/carregar o estado completo da partida (`60x40 tiles`, inventário, árvore tecnológica e índice `ECO %`), manter o ranking de regeneração climática e gravar logs/notas de teste em tempo real.
  - Criado módulo cliente [`js/cloud.js`](js/cloud.js) com suporte híbrido (Supabase Cloud + fallback em `localStorage`) e novo modal **☁️ Cloud & Saves** na barra de navegação.
- **Arquitetura Modular (Fase 1 GSD)**:
  - Desacoplamento do protótipo monolítico em múltiplos módulos ([`index.html`](index.html), [`css/style.css`](css/style.css), [`js/data.js`](js/data.js), [`js/assets.js`](js/assets.js), [`js/audio.js`](js/audio.js), [`js/world.js`](js/world.js), [`js/renderer.js`](js/renderer.js), [`js/ui.js`](js/ui.js) e [`js/main.js`](js/main.js)).
- **Conexão Direta com a Biblioteca de 90 Sprites PNG**:
  - Os 45 itens do jogo e os 45 assets de cenário/construções agora são carregados diretamente dos arquivos `.png` transparentes em `future_shards_sprites_45_itens/` e `future_shards_sprites_cenario_e_recursos/`.

## [v0.1.0] — 2026-11-03
### Adicionado
- Especificação técnica completa ([`especificacao_prototipo_future_shards.md`](especificacao_prototipo_future_shards.md)) com calendário sazonal de 30 dias (15 Cheia / 15 Seca), mapa `60x40` em 3 Zonas, 45 itens e 15 nós científicos.
- Biblioteca completa de sprites 16-bit (`32x32`, `128x128`, cards HD e atlases transparentes).
- Protótipo inicial em arquivo único HTML.

