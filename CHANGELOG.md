# Changelog — Future Shards

Todas as modificações significativas neste projeto são documentadas neste arquivo e nos commits do GitHub.

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

