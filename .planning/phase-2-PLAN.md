# PLANO DA FASE 2: Fidelidade Total à Especificação Técnica (`especificacao_prototipo_future_shards.md`)

## Objetivo
Alinhar 100% da simulação, calendário sazonal, level design das 3 Zonas (`60x40 tiles`), receitas e consumíveis com as tabelas da especificação técnica.

## Escopo de Implementação Atômica
1. **Calendário Sazonal em 6 Sub-períodos (Ciclo de 30 Dias)**:
   - **Dias 1 a 4 (Enchente - Cheia)**: Nível do rio sobe `+1 tile` a cada 2 dias; chuvas leves regam canteiros gratuitamente; painéis solares têm `-30%` de eficiência.
   - **Dias 5 a 11 (Ápice da Cheia)**: Águas avançam até `4 tiles` sobre a várzea (`Y: 27` na margem) e inundam a Zona 2 (Igapó). Turbinas hidrocinéticas geram `+50%` de energia (`45W`).
   - **Dias 12 a 15 (Repiquete / Início da Vazante)**: Água recua gradualmente, fazendo *spawn* de depósitos frescos de **Argila de Várzea** (`mat_01`) e **Esponja de Cauixi** (`mat_02`).
   - **Dias 16 a 19 (Vazante - Seca)**: Rio recua até `Y: 35`, expondo praias de areia branca e revelando **6 montículos arqueológicos extras** antes submersos na Zona 2.
   - **Dias 20 a 26 (Ápice da Seca Extrema)**: Chuva zero; painéis solares operam com `+40%` de geração (`35W`), mas a água do solo comum evapora e ondas de calor na Zona 3 drenam `-2 Vigor/s` sem proteção térmica.
   - **Dias 27 a 30 (Transição das Primeiras Chuvas)**: O calor cede gradualmente preparando o retorno da Cheia.

2. **Spawns, Coordenadas Exatas de POIs e Respawn Dinâmico**:
   - **Zona 1 (`X: 0–19`)**:
     - Trapiche de Madeira em `X: 8, Y: 32`, Bancada Rústica em `X: 8, Y: 18`, Nascente do Igarapé em `X: 16, Y: 6`.
     - 8 nodos de Argila de Várzea (respawn a cada 2 dias), 12 plantas de Curuá/Cipó-Titica (respawn a cada 3 dias), 15 galhos de Lenha/Biomassa (respawn diário), 6 árvores de Açaí/Urucum (coleta não-letal a cada 3 dias).
   - **Zona 2 (`X: 20–39`)**:
     - **5 Seringueiras Centenárias** equipadas com tigelas produzindo `2x Látex/dia`.
     - **Escavação dos Vasos de Gargalo** em `X: 30, Y: 24` e **Carcaça de Rebocador a Diesel** em `X: 33, Y: 34` (que ao ser desmontada limpa a mancha de óleo da água e concede `+10% ECO`).
     - 10 nodos de Cauixi, 12 pontos de escavação (incluindo os 6 revelados na Seca) e 6 árvores de Andiroba/Jenipapo.
   - **Zona 3 (`X: 40–59`)**:
     - **Veio de Quartzo e Pedra Verde (Nefrita)** em `X: 43, Y: 10`.
     - **Cicatriz da Queimada** (`X: 47–59, Y: 12–39`) com **Draga de Garimpo Abandonada** em `X: 52, Y: 28`.
     - **Altar do Grande Vaso de Cariátides** em `X: 53, Y: 5` (Santuário das Cariátides).

3. **Catálogo de 45 Itens, Receitas Exatas e Buffs de Consumíveis**:
   - Sincronizar as quantidades das receitas da Categoria C, D e E com o `.md` (mantendo a fluidez do jogo) e adicionar os efeitos temporizados reais:
     - `cons_01` (**Água Fresca Filtrada**): `+35 Vigor` e imunidade à insolação por `60s`.
     - `cons_02` (**Tigela de Açaí Energético**): `+60 Vigor`, `+20 HP` e `+15% Velocidade` por `90s`.
     - `cons_03` (**Bálsamo de Copaíba**): `+50 HP` e remove queimaduras térmicas.
     - `cons_04` (**Incenso de Breu e Andiroba**): Zera o gasto de vigor na base por `120s`.

