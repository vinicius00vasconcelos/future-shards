# PLANO DA FASE 1: Modularização & Integração Direta de Assets PNG

## Objetivo
Desacoplar o monólito [`future_shards_prot_tipo_funcional_16_bit_solarpunk_tapaj_nico.html`](file:///d:/future%20shards/future_shards_prot_tipo_funcional_16_bit_solarpunk_tapaj_nico.html) em uma arquitetura limpa e modular (`index.html`, `css/`, `js/`), conectando o jogo diretamente aos arquivos `.png` de alta nitidez das pastas `future_shards_sprites_45_itens/` e `future_shards_sprites_cenario_e_recursos/`.

## Estrutura de Arquivos a Criar
1. `d:\future shards\css\style.css`:
   - Variáveis de tema Solarpunk Tapajônico, tipografia pixelada (`Press Start 2P` + `Inter`), estilização de cards, barras de rolagem e classes utilitárias para ícones PNG (`32x32`, `48x48`, `64x64`, `128x128`).
2. `d:\future shards\js\data.js`:
   - Mapeamento completo de `ITEMS_DB` (45 itens com caminhos exatos para `sprites_32x32/*.png`, `sprites_128x128/*.png` e `sprites_hd_transparentes/*.png` extraídos de `items_manifest.json`).
   - Mapeamento completo de `SCENERY_ASSETS` (45 assets de mundo com caminhos exatos para `tiles_terreno_128x128/`, `cenario_hd_transparentes/` e `objetos_mundo_32x32/` extraídos de `scenery_manifest.json`).
   - `TECH_TREE` (15 nós nas 3 Eras) e `BUILDINGS_DB` (9 estruturas da Ecobase com caminhos para `buildings_128x128/` e `cenario_hd_transparentes/`).
3. `d:\future shards\js\assets.js`:
   - Preloader assíncrono de imagens (`Image()`) para todos os 45 itens e 45 assets de cenário/construções a partir das pastas locais.
   - Funções auxiliares `getItemImage(id, size)` e `getSceneryImage(index, size)` para uso tanto no `<canvas>` quanto nas tags `<img>` da UI.
4. `d:\future shards\js\audio.js`:
   - Engine de efeitos sonoros 16-bit (`playSfx`, controle de mute).
5. `d:\future shards\js\world.js`:
   - Estado reativo do jogo (`state`), geração do mapa `60x40` dividido nas 3 Zonas, cálculo de terreno efetivo (Cheia vs. Seca), irrigação, inventário, atributos térmicos e cálculo de `ECO %` e rede solar.
6. `d:\future shards\js\renderer.js`:
   - Renderização do `<canvas id="gameCanvas">` e `<canvas id="minimapCanvas">` desenhando os sprites `.png` carregados de `future_shards_sprites_cenario_e_recursos/`, efeitos de clima (chuva na Cheia, neblina/calor na Seca, ciclo dia/noite) e pulso do Bio-Scanner.
7. `d:\future shards\js\ui.js`:
   - Atualização de HUD, Inspetor de Tile (exibindo o sprite `128x128` transparente real do asset inspecionado), Mochila Rápida e Modais (Craft de 45 itens, Árvore de 15 nós, Equipamentos e Construções) usando `<img>` apontando diretamente para os PNGs das pastas.
8. `d:\future shards\js\main.js`:
   - Inicialização do jogo, tela de título, loop de simulação sazonal (1s = 15 min no jogo) e listeners de teclado/mouse/touch.
9. `d:\future shards\index.html`:
   - Ponto de entrada limpo que importa `css/style.css` e os módulos em `js/`.

## Critérios de Verificação
- Todos os 45 itens nos modais de Craft/Mochila/Equipamento exibem seus respectivos PNGs de `future_shards_sprites_45_itens/`.
- Todos os terrenos, árvores, relíquias, sucatas, construções, personagem, barco, drone e animais no Canvas e no Inspetor exibem seus respectivos PNGs de `future_shards_sprites_cenario_e_recursos/`.
- Nenhuma regressão nas funcionalidades existentes; código organizado e pronto para a Fase 2.

