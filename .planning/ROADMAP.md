# ROADMAP: Evolução do Jogo Future Shards (GSD)

Seguindo o padrão autônomo **GSD (Get Shit Done)**, o projeto concluiu a **Fase 1 (Modularização + Cloud Vercel/Supabase)** e a **Fase 2 (Restauração dos 90 Sprites 16-Bit + HUD de Madeira + Tech Tree Visual)**.

Abaixo está o **Novo Roadmap (Fases 3 a 6)** focado na transição de um protótipo baseado em grade (*tile-step*) para um **Action-RPG / Simulador Solarpunk de movimentação livre (Sub-Tile 60 FPS), sprites animados e feedback tátil vivo**.

---

## Fase 3: Movimentação Livre Contínua (Free-Roam Sub-Tile), Câmera Suave & Colisão Orgânica
**Objetivo**: Eliminar completamente o andar "quadrado por quadrado" (*grid-locked*) e fazer o personagem, a câmera, os barcos e os animais deslizar pelo mundo a 60 FPS como em *Stardew Valley* / *Chrono Trigger*.

- **3.1. Coordenadas em Ponto Flutuante (`px, py`) e Vetor de Velocidade (`vx, vy`)**:
  - Converter a posição do jogador de índices inteiros (`x: 10, y: 19`) para coordenadas contínuas em pixels/unidades de mundo (`x: 10.5, y: 19.2`), com aceleração, atrito suave e normalização diagonal (`WASD` / Setas / Analógico Virtual / Click-to-Move contínuo).
  - Velocidade dinâmica real: bônus de `+25%` com a **Muiraquitã de Jade**, penalidade na lama/água rasa do Igapó sem as **Botas de Seringueira** e transição automática ou no píer para a **Canoa/Catamarã Solar**.
- **3.2. Câmera com Interpolação Suave (*Smooth Lerp Camera*)**:
  - Em vez de a câmera "pular" quando o jogador muda de tile, ela segue a posição exata em pixels do protagonista com amortecimento suave (`lerp`), eliminando qualquer tremor de cenário.
- **3.3. Hitboxes Circulares/Elípticas nos Pés (*Footprint Colliders*) & *Wall-Sliding***:
  - Árvores (Samaúma, Açaizeiro), Cabana Palafita, Fornos e Condensador terão colisão circular na base do tronco/estrutura (permitindo que o jogador passe por trás da copa das árvores com *Y-Sorting* perfeito e deslize suavemente ao encostar nas bordas, sem travar em cantos invisíveis).
- **3.4. Transição Orgânica de Terreno (*Auto-Tiling / Corner Blending*)**:
  - Suavizar visualmente o encontro entre grama, terra batida, Terra Preta e areia com bordas orgânicas arredondadas e tufos de vegetação, acabando com a aparência de blocos quadrados no chão.

---

## Fase 4: Sistema de Animação de Sprites (Personagem, Fauna, Flora & Máquinas)
**Objetivo**: Dar vida constante a todos os sprites da biblioteca (mesmo os que possuem 1 frame base), combinando *Sprite-Sheet Slicing / Flip* com **Animação Procedural 16-Bit por Sub-Partes e Deformação Pixel-Art**.

- **4.1. Animação Completa do Protagonista & NPC Mestre Artesão**:
  - **Ciclo de Caminhada (*Walk Cycle*) e Direção (`Esquerda/Direita`)**: Espelhamento horizontal automático (*flip*), balanço rítmico de passos (*stride bobbing*), inclinação sutil no sentido da corrida e poeira/respingos d'água nos pés conforme o bioma.
  - **Respiração (*Idle Breathing*)**: Movimento sutil de tórax/ombros quando parado.
  - **Animações de Ação (*Action Swings*)**: Animação dedicada ao usar a **Pá de Manejo** (arco de escavação), **Chave de Desmontagem** (faíscas mecânicas), **Plantio** e **Bio-Scanner** (troca para o sprite `ent_02` com feixe holográfico ciano direcionado ao alvo).
- **4.2. Flora Viva & Vento Amazônico (*Wind Sway*)**:
  - Oscilação orgânica na copa das **Samaúmas, Açaizeiros, Seringueiras e Andirobas** simulando a brisa do Rio Tapajós (a base do tronco fica fixa no chão enquanto a copa balança suavemente em fases diferentes).
  - Folhas caindo lentamente na floresta e ondulação nas **Vitórias-Régias** do Igapó.
- **4.3. Fauna Livre & Barcos com Rastro na Água**:
  - **Boto-Cor-de-Rosa**: Nado contínuo em curvas suaves, emergindo e submergindo com anéis de espuma na água.
  - **Arara-Canindé**: Voo contínuo pelo dossel com sombra projetada no chão.
  - **Canoa / Catamarã Solar & Drone Beija-Flor**: Oscilação de flutuação (*wave bobbing*), rastro de marola (*water wake*) atrás do barco e batimento rápido de asas no Drone Beija-Flor.
- **4.4. Estruturas Solarpunk Animadas**:
  - **Forno de Pirólise**: Pulsação viva das brasas + coluna de fumaça fluida.
  - **Condensador de Cariátides & Bio-Bateria**: Pulsação energética nas linhas ciano + gotas de orvalho condensando e fluindo pelos **Tubos de Terracota** até os canteiros.
  - **Microturbina Fluvial**: Vibração/rotação contínua com espuma de correnteza.

---

## Fase 5: Interação por Proximidade, *Game Feel* ("Juice") & Feedback Visual
**Objetivo**: Substituir o clique rígido em grade por uma interação natural baseada no raio de alcance do jogador e com feedback visual imediato.

- **5.1. Cursor de Alcance Inteligente & *Highlight* no Objeto Mais Próximo**:
  - O jogo detecta automaticamente o recurso, relíquia ou máquina mais próxima na direção em que o jogador está olhando (exibindo um contorno brilhante sutil e um ícone flutuante `[Espaço] Coletar / Conversar / Escanear`).
- **5.2. Animação de Coleta (*Hit-Shake*) & *Floating Loot Drops***:
  - Ao escavar argila, colher açaí ou desmontar uma draga, o objeto sofre um *shake* elástico, solta partículas (folhas, lascas de barro ou faíscas) e os ícones dos itens coletados **saltam fisicamente no chão e voam em direção ao jogador** com texto flutuante (`+3 Argila`, `+15 PCV`).
- **5.3. *Ghost Preview* Fluido para Construção e Plantio**:
  - No modo Construir (`[6]`) ou Plantar (`[5]`), a estrutura aparece translúcida (*verde = livre / vermelho = bloqueado*) acompanhando o cursor/direção do personagem em tempo real.

---

## Fase 6: Ciclo Sazonal Completo (Cheia/Seca), Eventos de POIs Mestres & Clímax 100% ECO
**Objetivo**: Consolidar as mecânicas profundas da especificação `.md` sobre a nova engine fluida.

- **6.1. Transição Gradual do Nível do Rio (Cheia vs. Seca)**:
  - Avanço e recuo orgânico das águas do Tapajós e do Igapó ao longo dos 15 dias de cada estação, expondo os bancos de areia e os sítios arqueológicos de Vasos de Gargalo na Vazante.
- **6.2. Eventos dos POIs Mestres & Cinemática de Regeneração (`ECO: 100%`)**:
  - Despoluição visual da água ao reciclar os motores/dragas na Zona 2/3, ativação do Grande Altar das Cariátides na Zona 3 e transformação visual da Cicatriz da Queimada em floresta viva.
