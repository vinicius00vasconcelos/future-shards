# Future Shards — Protótipo 16-Bit (Solarpunk Tapajônico)

**O Futuro da Amazônia é Ancestral e Solar.**  
Protótipo funcional top-down 16-bit inspirado na ciência prática de *Dr. Stone* aplicada aos saberes tradicionais de **Santarém, Pará** (Cerâmica Tapajônica, Terra Preta de Índio, manejo de várzea/igapó e energia fotovoltaica orgânica).

## Arquitetura do Projeto

- [`index.html`](index.html): Interface principal com HUD climático, Canvas 2D (`60x40 tiles`), Minimapa, Inspetor de Bioma e 5 Modais interativos.
- [`css/style.css`](css/style.css): Design system Solarpunk Tapajônico (Terracota, Ouro Solar, Turquesa do Tapajós e Verde Floresta).
- [`js/data.js`](js/data.js): Banco de dados completo dos **45 itens** (Categorias A–E), **45 assets de cenário**, **15 nós científicos** (3 Eras) e **9 construções da Ecobase**.
- [`js/assets.js`](js/assets.js): Carregador assíncrono dos sprites PNG nativos (`32x32` e `128x128`) das bibliotecas [`future_shards_sprites_45_itens/`](future_shards_sprites_45_itens/) e [`future_shards_sprites_cenario_e_recursos/`](future_shards_sprites_cenario_e_recursos/).
- [`js/world.js`](js/world.js): Simulação das 3 Zonas (`Várzea`, `Igapó Arqueológico` e `Cicatriz da Queimada`), ciclo sazonal de 15 dias de **Cheia** e 15 dias de **Seca**, e cálculo de `ECO %`.
- [`js/renderer.js`](js/renderer.js): Renderizador pixel-perfect no Canvas e Minimapa.
- [`js/ui.js`](js/ui.js) & [`js/main.js`](js/main.js): Controle de eventos, teclado/mouse/touch e atualização de modais.
- [`js/cloud.js`](js/cloud.js) & [`api/cloud.js`](api/cloud.js): Persistência em nuvem integrada ao **Supabase** via **Vercel Serverless Functions** (Save/Load de expedições, Ranking Climático `ECO %` e registro de notas de teste).

## Especificação e Planejamento (GSD)
- [`especificacao_prototipo_future_shards.md`](especificacao_prototipo_future_shards.md): Planta baixa completa de level design, itens e árvore científica.
- [`CHANGELOG.md`](CHANGELOG.md): Histórico detalhado de modificações.
- [`.planning/`](.planning/): Documentos de arquitetura, roadmap e planos de fase.

