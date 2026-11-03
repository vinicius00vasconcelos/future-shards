# Especificação Técnica e Balanceamento do Protótipo: Future Shards

**Objetivo do Documento:** Servir como planta baixa (*blueprint*) completa de espaços, ciclo sazonal de 30 dias (15 dias de Cheia / 15 dias de Seca), catálogo detalhado de itens e árvore científica completa para a construção do protótipo funcional de **Future Shards**.

## 1. Escopo do Protótipo e Calendário Sazonal (15 Dias Cheia / 15 Dias Seca)

O protótipo opera sobre um calendário amazônico onde **cada estação dura exatamente 15 dias no jogo** (formando um ciclo completo de 30 dias), espelhando o pulso anual das águas do Rio Tapajós em Santarém:

* **Duração de 1 Dia no Jogo:** `240 segundos` reais (`160s` de período diurno + `80s` de período noturno).
* **Estação 1 — Cheia / Inverno Amazônico (Dias 1 a 15):**
  * **Dias 1 a 4 (Enchente):** O nível do rio sobe `+1 tile` a cada 2 dias; chuvas leves diárias regam os canteiros gratuitamente, mas reduzem a eficiência dos painéis solares em `-30%`.
  * **Dias 5 a 11 (Ápice da Cheia):** As águas avançam até `4 tiles` sobre a várzea e inundam totalmente a Zona 2 (Igapó). Locomoção exige pontes de palafita, Botas de Seringueira ou [Rabeta / Barco Solar](https://www1.folha.uol.com.br/ambiente/2025/06/indigenas-da-amazonia-criam-barco-movido-a-energia-solar-e-aposentam-diesel.shtml). Turbinas hidrocinéticas geram `+50%` de energia.
  * **Dias 12 a 15 (Repiquete / Início da Vazante):** As chuvas diminuem e a água começa a recuar gradualmente, deixando depósitos frescos de **Argila de Várzea** e **Cauixi** nas margens.
* **Estação 2 — Seca / Verão Amazônico (Dias 16 a 30):**
  * **Dias 16 a 19 (Vazante):** O rio recua `4 tiles`, expondo longas praias de areia branca (estilo Alter do Chão) e revelando sítios arqueológicos antes submersos na Zona 2.
  * **Dias 20 a 26 (Ápice da Seca Extrema):** Chuva zero; insolação máxima aumenta a geração dos painéis solares em `+40%`, mas evapora a água do solo comum em `20 segundos`. Sem [Terra Preta de Índio](https://www.embrapa.br/busca-de-projetos/-/projeto/31443/as-terras-pretas-de-indio-da-amazonia-o-entendimento-de-sua-formacao-e-evolucao) e **Condensadores de Neblina de Cariátides**, as plantações secam e surgem focos de calor na Zona 3.
  * **Dias 27 a 30 (Transição das Primeiras Chuvas):** O calor cede gradualmente e o vento aumenta, preparando o retorno do ciclo de Cheia.

## 2. Arquitetura Detalhada das 3 Zonas (Level Design `60x40 Tiles`)

O mapa contínuo de `60x40 tiles` (cada tile de `16x16 px`) é dividido em três zonas de `20x40 tiles` conectadas horizontalmente.

### 2.1. Zona 1: Trapiche e Várzea do Tapajós (`X: 0–19`, `Y: 0–39`)

Ponto de partida do jogador, inspirado nas comunidades ribeirinhas e nos sistemas de [energia solar na Flona do Tapajós](https://www.tapajosdefato.com.br/noticia/160/comunidades-da-flona-do-tapajos-sao-contempladas-com-energia-solar).

| Sub-Região / Coordenadas | Características de Terreno | Pontos de Interesse (POIs) | Comportamento Cheia (Dias 1–15) vs. Seca (Dias 16–30) |
| :--- | :--- | :--- | :--- |
| **Margem e Rio Tapajós** (`X: 0–19, Y: 30–39`) | Água doce azul-turquesa e faixa de areia/barranco | **Trapiche de Madeira** (`X: 8, Y: 32`) e ponto de ancoragem da Canoa Solar | **Cheia:** Água sobe até `Y: 27`, cobrindo a praia. **Seca:** Água recua até `Y: 35`, revelando bancos de argila pura e conchas. |
| **Platô da Palafita Central** (`X: 4–15, Y: 14–26`) | Piso elevado de madeira sobre estacas e terra firme de várzea | **Cabana Inicial**, **Bancada Rústica** (`X: 8, Y: 18`) e Baú de Armazenamento | Sempre seco e seguro acima da cota de inundação; local principal para instalar Painéis Solares e Fornos de Barro. |
| **Bosque de Várzea e Curuá** (`X: 0–19, Y: 0–13`) | Solo úmido sombreado por açaizeiros e palmeiras | **Nascente do Igarapé** (`X: 16, Y: 6`) e canteiros naturais de plantas fibrosas | **Cheia:** Produção abundante de frutos de açaí e fibra de curuá. **Seca:** O igarapé estreita, exigindo tubulação de terracota para puxar água. |

* **Spawns de Recursos da Zona 1:**
  * `Argila de Várzea` (8 nodos na margem; *respawn* a cada 2 dias ou após virada de estação).
  * `Fibra de Curuá` e `Cipó-Titica` (12 arbustos no norte; *respawn* a cada 3 dias).
  * `Lenha Caída / Biomassa` (15 galhos espalhados; *respawn* diário).
  * `Sementes de Açaí` e `Urucum` (6 árvores nativas; coleta não-letal a cada 3 dias).

### 2.2. Zona 2: Igapó Alagado e Sítio Arqueológico Tapajó (`X: 20–39`, `Y: 0–39`)

Floresta inundável misteriosa que guarda os segredos da [Cerâmica Tapajônica](https://santarem.pa.gov.br/noticias/turismo/ceramica-tapajonica-revela-historia-ancestral-de-santarem-e-inspira-novos-projetos-turisticos-n76p2b) entre raízes gigantes de apuizeiros e seringueiras.

| Sub-Região / Coordenadas | Características de Terreno | Pontos de Interesse (POIs) | Comportamento Cheia (Dias 1–15) vs. Seca (Dias 16–30) |
| :--- | :--- | :--- | :--- |
| **Labirinto de Raízes e Seringal** (`X: 20–39, Y: 0–18`) | Ilhotas de musgo cortadas por canais rasos de água escura | **5 Seringueiras Centenárias** para extração de látex com tigelas de barro | **Cheia:** Canais viram rios navegáveis; a pé exige **Botas de Seringueira** ou pontes. **Seca:** Canais viram lamaçais ricos em esponjas de **Cauixi**. |
| **Ilha do Sítio Arqueológico** (`X: 25–35, Y: 19–29`) | Elevação de terra preta ancestral cercada por vitórias-régias | **Escavação dos [Vasos de Gargalo](https://www.scielo.br/j/bgoeldi/a/VpNYcwXrPTyFV5q6pqLC8bf/?lang=pt)** (`X: 30, Y: 24`) e Pedra com Grafismos | **Cheia:** Metade inferior da ilha fica submersa (boto-cor-de-rosa nada ao redor). **Seca:** Revela 6 montículos arqueológicos extras para escavação e scanner. |
| **Baixio do Motor Abandonado** (`X: 20–39, Y: 30–39`) | Enseada rasa poluída por óleo antigo | **Carcaça de Rebocador a Diesel** (`X: 33, Y: 34`) | Desmontar o motor com a **Chave de Desmontagem** limpa a mancha de óleo da água, rende Cobre/Ímãs e concede `+10% ECO`. |

* **Spawns de Recursos da Zona 2:**
  * `Esponja de Cauixi` (10 nodos presos em troncos submersos; essenciais para temperar argila).
  * `Látex de Seringueira` (5 árvores equipáveis com tigelas coletoras; produz `2x Látex/dia`).
  * `Cacos Cerâmicos Ancestrais`, `Fragmento de Gargalo` e `Fragmento de Cariátide` (12 pontos de escavação).
  * `Andiroba` e `Jenipapo` (6 árvores nas ilhotas altas).

### 2.3. Zona 3: Platô de Terra Firme e Cicatriz da Queimada (`X: 40–59`, `Y: 0–39`)

Antiga área de floresta densa que sofreu desmatamento e queimadas, servindo como o grande laboratório de regeneração Solarpunk do jogo.

| Sub-Região / Coordenadas | Características de Terreno | Pontos de Interesse (POIs) | Comportamento Cheia (Dias 1–15) vs. Seca (Dias 16–30) |
| :--- | :--- | :--- | :--- |
| **Encosta Rochosa de Quartzo** (`X: 40–46, Y: 0–39`) | Subida íngreme de pedra arenítica e cascalho | **Veio de Quartzo e Pedra Verde (Nefrita)** (`X: 43, Y: 10`) | Estável o ano todo; fornece sílica, quartzo para células solares e pedra verde para esculpir [Muiraquitãs](https://santarem.pa.gov.br/noticias/gerais/replicas-da-ceramica-tapajonica-sao-o-destaque-da-serie-artesanato-desta-quarta-209467070378-4a41-43ad-822a-74841da50311). |
| **Cicatriz da Queimada** (`X: 47–59, Y: 12–39`) | `180 tiles` de **Solo Cinza Degradado**, troncos carbonizados e calor intenso | **Draga de Garimpo Abandonada** (`X: 52, Y: 28`) — maior fonte de sucata metálica e vidro | **Cheia:** A chuva alivia o calor, mas a enxurrada causa erosão se não houver plantas. **Seca:** Ondas de calor drenam `-2 Vigor/s` sem **Colete de Curuá** ou **Pintura de Urucum**. |
| **Santuário das Cariátides** (`X: 48–58, Y: 0–11`) | Clareira elevada com colunas de pedra e base cerimonial ancestral | **Altar do Grande [Vaso de Cariátides](https://terrabrasilisdidaticos.com.br/produto/ceramica-tapajonica-vaso-de-gargalo-felino/)** (`X: 53, Y: 5`) | Ao conectar energia solar e instalar o Condensador Mestre aqui, uma onda de neblina regenerativa cobre toda a Zona 3. |

## 3. Catálogo Completo de Itens (`45 Itens Balanceados`)

### 3.1. Categoria A — Recursos Naturais e Botânicos Brutos (13 Itens)

| ID | Nome do Item | Stack | Valor Scan (`PCV`) | Fonte / Coleta | Aplicação no Craft |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `mat_01` | **Argila de Várzea** | 50 | `+5 PCV` | Margens da Zona 1 (Pá) | Base de toda cerâmica, fornos e tijolos térmicos |
| `mat_02` | **Esponja de Cauixi** | 50 | `+10 PCV` | Troncos da Zona 2 (Seca/Vazante) | Antiplástico biológico rico em espículas de sílica para cerâmica |
| `mat_03` | **Casca de Caraipé** | 50 | `+5 PCV` | Árvores da Zona 1 | Queimada no forno para gerar cinza siliciosa de têmpera |
| `mat_04` | **Fibra de Curuá** | 50 | `+5 PCV` | Plantas fibrosas da Zona 1 | Fios ultra-resistentes, cestos, coletes e redes |
| `mat_05` | **Cipó-Titica** | 50 | `+5 PCV` | Bosque da Zona 1 e Zona 2 | Amarração de palafitas, pontes e ferramentas |
| `mat_06` | **Lenha Caída / Biomassa** | 50 | `+2 PCV` | Chão das Zonas 1 e 2 | Queima controlada para pirólise de biocarvão e adubo |
| `mat_07` | **Látex de Seringueira** | 30 | `+15 PCV` | Seringueiras na Zona 2 | Borracha vulcanizada, isolamento de cabos e botas |
| `mat_08` | **Sementes de Açaí e Bacaba** | 50 | `+5 PCV` | Palmeiras da Zona 1 | Plantio agroflorestal de rápido crescimento e alimento energético |
| `mat_09` | **Muda de Samaúma / Castanheira** | 20 | `+15 PCV` | Descoberta com Scanner na Zona 2 | Árvores de grande porte para reflorestar a Zona 3 (`+6% ECO` cada) |
| `mat_10` | **Sementes de Urucum** | 30 | `+10 PCV` | Arbustos na Zona 1 | Pintura térmica e corante sensibilizador para células solares |
| `mat_11` | **Fruto de Jenipapo** | 30 | `+10 PCV` | Zona 2 (Igapó) | Pigmento azul-escuro para grafismos corporais e camuflagem |
| `mat_12` | **Sementes de Andiroba e Copaíba** | 30 | `+15 PCV` | Árvores medicinais na Zona 2 | Extração de óleos medicinais, repelentes e combustível de resinas |
| `mat_13` | **Água Bruta do Rio** | 20 | `+2 PCV` | Coletada com pote na margem | Precisa ser filtrada em cerâmica ou fervida antes do consumo |

### 3.2. Categoria B — Minerais, Arqueologia e Sucata Reciclável (9 Itens)

| ID | Nome do Item | Stack | Valor Scan (`PCV`) | Fonte / Coleta | Aplicação no Craft |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `arq_01` | **Caco Cerâmico Tapajônico** | 30 | `+15 PCV` | Escavações na Zona 2 | Triturado para compor a [Terra Preta de Índio](https://www.embrapa.br/busca-de-projetos/-/projeto/31443/as-terras-pretas-de-indio-da-amazonia-o-entendimento-de-sua-formacao-e-evolucao) e estudo de receitas |
| `arq_02` | **Fragmento de [Vaso de Gargalo](https://www.scielo.br/j/bgoeldi/a/VpNYcwXrPTyFV5q6pqLC8bf/?lang=pt)** | 10 | `+30 PCV` | Sítio Arqueológico (Zona 2 na Seca) | Desbloqueia a engenharia hidráulica e reservatórios de baixa evaporação |
| `arq_03` | **Fragmento de [Vaso de Cariátides](https://terrabrasilisdidaticos.com.br/produto/ceramica-tapajonica-vaso-de-gargalo-felino/)** | 10 | `+35 PCV` | Santuário (Zona 3) e Ilha (Zona 2) | Desbloqueia acústica de ressonância e o Condensador de Neblina |
| `arq_04` | **[Apêndice Zoomorfo](https://terrabrasilisdidaticos.com.br/produto/ceramica-tapajonica-apendice-zoomorfo-ra/) Antigo** | 10 | `+25 PCV` | Escavações raras na Vazante | Molde para amuletos de atributo (Onça, Coruja, Rã, Jacaré) |
| `min_01` | **Quartzo Leitoso** | 30 | `+10 PCV` | Encosta Rochosa (Zona 3) | Lentes ópticas, efeito piezoelétrico e sílica pura |
| `min_02` | **Pedra Verde (Nefrita / Jade)** | 10 | `+40 PCV` | Veio profundo na Zona 3 | Matéria-prima nobre para esculpir [Muiraquitãs](https://santarem.pa.gov.br/noticias/gerais/replicas-da-ceramica-tapajonica-sao-o-destaque-da-serie-artesanato-desta-quarta-209467070378-4a41-43ad-822a-74841da50311) |
| `rec_01` | **Sucata de Cobre** | 30 | `+10 PCV` | Desmontar motores/dragas (Zonas 2 e 3) | Condutores elétricos, bobinas e conexões solares |
| `rec_02` | **Ímãs e Rolamentos Reciclados** | 20 | `+15 PCV` | Desmontar Rebocador/Draga | Motores elétricos de barco, turbinas hidrocinéticas e drones |
| `rec_03` | **Vidro e Silício Recuperado** | 30 | `+10 PCV` | Para-brisas e painéis da Draga (Zona 3) | Substrato transparente para células fotovoltaicas e estufas |

### 3.3. Categoria C — Insumos Processados e Componentes Solarpunk (9 Itens)

| ID | Nome do Item Processado | Bancada | Receita Exata | Tempo | Função Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `proc_01` | **Massa Cerâmica Temperada** | Bancada Rústica | `2x Argila` + `1x Cauixi` (ou `Cinza de Caraipé`) | `3s` | Evita rachaduras térmicas; base de todos os vasos e máquinas cerâmicas |
| `proc_02` | **Biocarvão Ativado (Pirólise)** | Forno de Barro | `3x Lenha Caída / Biomassa` (queima sem oxigênio) | `8s` | Reter nutrientes no solo, filtrar água e conduzir elétrons nas biobaterias |
| `proc_03` | **[Terra Preta de Índio](https://www.embrapa.br/busca-de-publicacoes/-/publicacao/684576/utilizacao-de-carvao-e-subprodutos-da-carbonizacao-vegetal-na-agricultura-aprendendo-com-as-terras-pretas-de-indio)** | Bancada / Composto | `2x Biocarvão` + `1x Caco Cerâmico` + `2x Biomassa` | `5s` | Regenera `1 tile` de Solo Cinza Degradado para Solo Fértil Permanente |
| `proc_04` | **Borracha Natural Vulcanizada** | Forno de Barro | `2x Látex` + `1x Cinza de Caraipé` + `1x Óleo Vegetal` | `6s` | Impermeabilização de botas, vedação de baterias e capas de cabos |
| `proc_05` | **Óleo Medicinal de Andiroba/Copaíba** | Prensa Cerâmica | `3x Sementes de Andiroba/Copaíba` | `5s` | Resina para queimadores acústicos, cura de vida e proteção da madeira |
| `proc_06` | **Cabo Elétrico Ecológico** | Bancada Solarpunk | `2x Sucata de Cobre` + `1x Borracha Vulcanizada` | `4s` | Conecta painéis solares, biobaterias e máquinas na base |
| `proc_07` | **Célula Fotovoltaica de Urucum** | Bancada Solarpunk | `2x Vidro/Silício` + `1x Quartzo` + `2x Urucum` + `1x Cobre` | `10s` | Célula solar sensibilizada por corante orgânico amazônico (Grätzel) |
| `proc_08` | **Tubo Hidráulico de Terracota** | Forno de Barro | `2x Massa Cerâmica Temperada` | `4s` | Conduz água dos Vasos de Gargalo e Condensadores até as plantações |
| `proc_09` | **Microcircuito Piezo-Cerâmico** | Bancada Solarpunk | `1x Massa Cerâmica` + `2x Quartzo` + `2x Cobre` | `8s` | Cérebro eletrônico limpo para o Scanner, Drones e Estações Climáticas |

### 3.4. Categoria D — Consumíveis de Sobrevivência (4 Itens)

| ID | Nome do Consumível | Receita | Efeito Imediato no Jogador |
| :--- | :--- | :--- | :--- |
| `cons_01` | **Água Fresca Filtrada** | `1x Água Bruta` no Filtro de Barro com Biocarvão | Restaura `+35 Vigor` e remove penalidade de insolação por `60s` |
| `cons_02` | **Tigela de Açaí Energético** | `2x Açaí` + `1x Água Filtrada` (servido em cuia) | Restaura `+60 Vigor`, `+20 HP` e concede `+15% Velocidade` por `90s` |
| `cons_03` | **Bálsamo de Copaíba** | `1x Óleo de Copaíba` + `1x Fibra de Curuá` | Restaura `+50 HP` imediatamente e cura queimaduras térmicas |
| `cons_04` | **Incenso de Breu e Andiroba** | `1x Óleo de Andiroba` + `1x Biomassa` | Quando queimado num Vaso de Cariátides, zera o gasto de vigor na base |

### 3.5. Categoria E — Ferramentas, Vestimentas e Bio-Amuletos Equipáveis (10 Itens)

| ID | Nome do Item Equipável | Slot | Nó Exigido | Receita | Atributos e Efeitos Passivos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `eq_tool_01` | **Pá de Manejo Tapajó** | Ferramenta | `T1_01` | `2x Lenha Caída` + `2x Fibra de Curuá` | Escava argila, desenterra relíquias na Vazante e aplica Terra Preta no solo |
| `eq_tool_02` | **Chave de Desmontagem** | Ferramenta | `T2_04` | `2x Quartzo` + `2x Caco Cerâmico` + `2x Cipó` | Desmonta carcaças de motores a diesel e dragas em Cobre, Ímãs e Vidro |
| `eq_tool_03` | **Scanner Tapajônico** | Ferramenta | `T2_04` | `1x Circuito Piezo` + `1x Vidro` + `1x Borracha` | Consome `5W` para analisar flora, fauna e vasos, gerando **Ciência Verde (`PCV`)** |
| `eq_head_01` | **Óculos Bio-Scanner** | Cabeça | `T3_01` | `2x Vidro` + `1x Circuito Piezo` + `1x Borracha` | Exibe na tela a umidade de cada tile, o raio de energia e destaca relíquias |
| `eq_body_01` | **Colete de Fibra de Curuá** | Torso | `T2_01` | `4x Fibra de Curuá` + `1x Látex` + `1x Urucum` | `+45% Proteção Térmica` (bloqueia dano de calor na Seca e na Zona 3) |
| `eq_back_01` | **Cesto Trançado de Várzea** | Costas | `T1_01` | `4x Fibra de Curuá` + `2x Cipó-Titica` | Aumenta capacidade da mochila de `8` para `12 slots` |
| `eq_back_02` | **Mochila Solar MK-II** | Costas | `T3_02` | `1x Cesto` + `2x Célula Fotovoltaica` + `1x Cabo` | `16 slots` de mochila; recarrega `+3W/s` da bateria pessoal durante o dia |
| `eq_feet_01` | **Botas de Seringueira** | Pés | `T2_01` | `2x Borracha Vulcanizada` + `2x Fibra de Curuá` | Anula a penalidade de `-50% velocidade` nos terrenos alagados da Cheia e Zona 2 |
| `eq_amul_01` | **[Muiraquitã](https://santarem.pa.gov.br/noticias/gerais/replicas-da-ceramica-tapajonica-sao-o-destaque-da-serie-artesanato-desta-quarta-209467070378-4a41-43ad-822a-74841da50311) de Jade** | Amuleto 1 | `T2_03` | `2x Pedra Verde` + `1x Quartzo` + `1x Fibra` | `+25% Velocidade` na água/chuva e `-25% consumo elétrico` do Scanner |
| `eq_amul_02` | **Amuleto Zoomorfo e Pintura** | Amuleto 2/3 | `T2_03` | `1x Apêndice Zoomorfo` + `2x Urucum/Jenipapo` | `+30% Furtividade` perto de animais, visão noturna ampliada e `+1 Vigor/s` |

## 4. Árvore de Progressão Científica Detalhada (`15 Nós em 3 Eras`)

Seguindo a filosofia de *Dr. Stone*, cada nó da árvore representa um marco científico onde o saber tradicional amazônico resolve um problema físico ou ambiental real:

### Era 1: Sobrevivência Orgânica e Sabedoria da Várzea (Dias 1 a 8)

| Código | Nome do Nó | Custo | Pré-Req. | Explicação Científica (*Dr. Stone* Tapajônico) | O que Desbloqueia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `T1_01` | **Biomecânica das Fibras (Curuá e Titica)** | `0 PCV` | Inicial | As folhas do curuá possuem fibras de celulose mais resistentes à tração que o cânhamo comum, permitindo erguer estruturas suspensas sem pregos metálicos. | Pá de Manejo, Cesto Trançado, **Piso e Ponte de Palafita** (`bld_01`) |
| `T1_02` | **Termodinâmica da Argila e Cauixi** | `15 PCV` | `T1_01` | Queimar argila pura faz a água interna evaporar rápido demais e rachar a peça. Misturar cinzas de caraipé ou espículas de sílica do cauixi cria uma malha refratária. | Massa Cerâmica Temperada, **Forno Cerâmico** (`bld_02`), Tigela Coletora |
| `T1_03` | **Adsorção e Filtragem com Carvão** | `25 PCV` | `T1_02` | A cerâmica microporosa combinada ao carvão retém impurezas e microrganismos por adsorção física e resfria a água por transpiração evaporativa. | Água Fresca Filtrada, Tigela de Açaí, Filtro de Barro Doméstico |
| `T1_04` | **Pirólise e [Terra Preta de Índio](https://www.embrapa.br/busca-de-projetos/-/projeto/31443/as-terras-pretas-de-indio-da-amazonia-o-entendimento-de-sua-formacao-e-evolucao)** | `40 PCV` | `T1_02` | Queimar biomassa com baixo oxigênio cria o biocarvão (*biochar*). Misturado a cacos cerâmicos porosos, ele cria um recife microbiano que fixa carbono por séculos. | Biocarvão Ativado, Solo de Terra Preta, **Canteiro Agroflorestal** (`bld_03`) |
| `T1_05` | **Fitoquímica de Urucum, Jenipapo e Copaíba** | `55 PCV` | `T1_03` | A bixina do urucum absorve radiação UV intensa, enquanto os diterpenos do óleo de copaíba atuam como anti-inflamatório e selante hidrofóbico natural. | Óleo Medicinal, Bálsamo de Copaíba, Pintura Corporal Térmica |

### Era 2: Engenharia Tapajônica e Mineração Urbana (Dias 9 a 18)

| Código | Nome do Nó | Custo | Pré-Req. | Explicação Científica (*Dr. Stone* Tapajônico) | O que Desbloqueia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `T2_01` | **Polimerização e Borracha de Seringueira** | `75 PCV` | `T1_05` | O látex líquido da *Hevea brasiliensis* coagula e ganha elasticidade impermeável quando defumado com vapores ricos em enxofre e cinzas vegetais. | Borracha Vulcanizada, **Botas de Seringueira**, **Colete de Curuá** |
| `T2_02` | **Hidráulica dos [Vasos de Gargalo](https://www.scielo.br/j/bgoeldi/a/VpNYcwXrPTyFV5q6pqLC8bf/?lang=pt)** | `95 PCV` | `T1_04` | O gargalo estreito e o corpo globular dos vasos tapajônicos minimizam a superfície de evaporação na Seca, mantendo a pressão hídrica constante. | Tubo de Terracota, Reservatório de Gargalo (irriga canteiros na Seca) |
| `T2_03` | **Ressonância e Simbolismo de [Cariátides](https://terrabrasilisdidaticos.com.br/produto/ceramica-tapajonica-vaso-de-gargalo-felino/)** | `120 PCV` | `T2_02` | Os vasos sustentados por figuras esculpidas funcionam como câmaras de convecção térmica para volatilizar óleos essenciais que repelem pragas agrícolas. | Totem Queimador de Cariátides, **[Muiraquitã](https://santarem.pa.gov.br/noticias/gerais/replicas-da-ceramica-tapajonica-sao-o-destaque-da-serie-artesanato-desta-quarta-209467070378-4a41-43ad-822a-74841da50311) de Jade**, Amuleto Zoomorfo |
| `T2_04` | **Metalurgia Reversa e Desmontagem Limpa** | `145 PCV` | `T2_01` | Em vez de abrir minas destrutivas na floresta, motores a diesel e dragas abandonadas fornecem cobre eletrolítico, vidro e ímãs prontos para reciclagem. | **Chave de Desmontagem**, Cabo Elétrico Ecológico, **Bancada Solarpunk** (`bld_04`) |
| `T2_05` | **Piezoeletricidade do Quartzo e Bio-Scanner** | `175 PCV` | `T2_04` | Cristais de quartzo amazônico submetidos a corrente elétrica vibram em frequência precisa, permitindo ler a composição do solo e de relíquias soterradas. | Microcircuito Piezo-Cerâmico, **Scanner Tapajônico** |

### Era 3: Ápice Solarpunk e Regeneração Climática (Dias 19 a 30)

| Código | Nome do Nó | Custo | Pré-Req. | Explicação Científica (*Dr. Stone* Tapajônico) | O que Desbloqueia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `T3_01` | **Eletroquímica da Bio-Bateria de Carvão** | `210 PCV` | `T1_04` + `T2_05` | O biocarvão da Terra Preta possui área superficial imensa, funcionando como supercapacitor dentro de vasos cerâmicos vedados com eletrólito ácido natural. | **Bio-Bateria Tapajônica** (`bld_06`, `100 Wh`), **Óculos Bio-Scanner** |
| `T3_02` | **Células Fotovoltaicas Orgânicas (Grätzel)** | `250 PCV` | `T1_05` + `T3_01` | Pigmentos naturais de urucum e açaí aplicados sobre vidro reciclado e sílica imitam a fotossíntese vegetal, convertendo a luz do sol em corrente contínua. | Célula Fotovoltaica Orgânica, **Painel Solar de Palafita** (`bld_05`), **Mochila Solar MK-II** |
| `T3_03` | **Geração Hidrocinética de Cheia** | `290 PCV` | `T3_01` | Durante os 15 dias de Cheia, a força da correnteza dos rios gira pequenas hélices submersas sem precisar construir barragens que alagam a floresta. | **Microturbina Fluvial** (`+30 W` constantes durante a Cheia) |
| `T3_04` | **Condensação Higroscópica de Cariátides** | `340 PCV` | `T2_03` + `T3_02` | Mesmo na Seca Extrema, o ar amazônico guarda umidade. Usar energia solar para resfriar o interior poroso de um grande Vaso de Cariátides condensa litros de água pura. | **Condensador de Neblina de Cariátides** (`bld_07` — vence a Seca dos Dias 16–30) |
| `T3_05` | **Mobilidade Solar e Robótica Biomimética** | `400 PCV` | `T3_04` | Unir cerâmica ultraleve, motores reciclados e células solares permite criar embarcações silenciosas e pequenos drones polinizadores que reflorestam a Cicatriz da Queimada. | **[Rabeta / Catamarã Solar](https://www1.folha.uol.com.br/ambiente/2025/06/indigenas-da-amazonia-criam-barco-movido-a-energia-solar-e-aposentam-diesel.shtml)** e **Estação do Drone Beija-Flor** (`bld_08`) |