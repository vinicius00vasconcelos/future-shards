# ROADMAP: Evolução do Jogo Future Shards

Seguindo o padrão autônomo **GSD (Get Shit Done)** e a decisão arquitetural definida, o desenvolvimento está estruturado em **4 Fases Atômicas**:

## Fase 1: Modularização da Arquitetura & Conexão Direta com a Biblioteca de Assets PNG (ATUAL)
- **1.1. Estrutura Modular de Arquivos (`index.html`, `css/`, `js/`)**:
  - `index.html`: Estrutura semântica limpa do HUD, Canvas, Minimapa, Inspetor e Modais.
  - `css/style.css`: Identidade visual Solarpunk Tapajônica, bordas de terracota, animações e layout responsivo.
  - `js/assets.js`: Gerenciador de carregamento de sprites PNG reais diretamente das pastas `future_shards_sprites_45_itens/` e `future_shards_sprites_cenario_e_recursos/` (usando `sprites_32x32/`, `sprites_128x128/`, `buildings_128x128/`, `tiles_terreno_128x128/`, `cenario_hd_transparentes/` e `objetos_mundo_32x32/`), mantendo fallback instantâneo para os atlases caso alguma imagem ainda esteja carregando.
  - `js/data.js`: Catálogo completo dos 45 itens (`ITEMS_DB`), 15 nós da Árvore Científica (`TECH_TREE`), 9 construções da Ecobase (`BUILDINGS_DB`) e tipos de objetos de mundo (`WORLD_OBJ_TYPES`), já alinhados aos manifestos JSON.
  - `js/audio.js`: Sintetizador de efeitos sonoros 16-bit (Web Audio API).
  - `js/world.js`: Estado global, geração das 3 Zonas (`60x40 tiles`), ciclo sazonal de 15 dias (Cheia/Seca), cálculos de energia solar e índice climático (`ECO %`).
  - `js/renderer.js`: Engine de renderização 2D no Canvas principal e Minimapa usando os arquivos PNG nativos da biblioteca de assets.
  - `js/ui.js` & `js/main.js`: Renderização dos 4 modais (usando os sprites `128x128` e `32x32` diretamente das pastas), inspetor em tempo real, controles de teclado/mouse/touch e loop de simulação.
- **1.2. Preservação de Compatibilidade (`file://` e Servidor Local)**:
  - Uso de scripts modulares compatíveis tanto com abertura direta (`file:///d:/future%20shards/index.html`) quanto via servidor HTTP local (sem bloqueios de CORS de ES Modules em `file://`).

## Fase 2: Fidelidade Total à Especificação `.md` (Sazonalidade em 6 Sub-estágios, Spawns & Receitas)
- **2.1. Sub-períodos Sazonais dos 30 Dias**: Enchente (Dias 1–4), Ápice da Cheia (Dias 5–11), Repiquete (Dias 12–15), Vazante (Dias 16–19), Ápice da Seca (Dias 20–26) e Transição (Dias 27–30).
- **2.2. Spawns, Respawns e Coleta Contínua**: Seringueiras Centenárias com tigelas coletoras (`2x Látex/dia`), depósitos de argila e cauixi no Repiquete, e 6 montículos arqueológicos revelados na Seca na Zona 2.
- **2.3. Receitas Exatas, Estações de Craft e Buffs de Consumíveis**: Validação de estações (Bancada Rústica, Forno de Barro, Bancada Solarpunk, Prensa/Filtro) e efeitos temporizados de Açaí, Água Filtrada, Bálsamo de Copaíba e Incenso de Breu.

## Fase 3: Mecânicas Avançadas de Mundo, POIs Mestres e Biojoias
- **3.1. Eventos de POIs Mestres**: Limpeza da mancha de óleo no Baixio do Motor Abandonado (`X: 33, Y: 34`) e ativação do Altar do Grande Vaso de Cariátides (`X: 53, Y: 5`) com onda de neblina na Zona 3.
- **3.2. Efeitos Visuais e Passivos de Equipamentos**: Overlay dos Óculos Bio-Scanner (`eq_head_01`), bônus da Muiraquitã de Jade (`eq_amul_01`) e visão noturna/furtividade do Amuleto Zoomorfo (`eq_amul_02`).
- **3.3. Malha Hídrica e Elétrica (`tile_09`)**: Posicionamento de Tubos de Terracota e Cabos Elétricos Ecológicos.

## Fase 4: Persistência (Save/Load), Polimento Visual e Clímax de 100% ECO
- **4.1. Sistema de Save/Load (`localStorage`)**: Salvar e carregar o estado completo do mapa e inventário.
- **4.2. Cinemática de Vitória (`100% ECO`) e Diálogos do Mestre Artesão**.
