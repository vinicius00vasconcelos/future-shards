# PLANO INFRAESTRUTURA & CLOUD (GitHub + Vercel + Supabase)

## Objetivo
Configurar o repositório Git/GitHub com histórico semântico detalhado por fases, criar a camada de persistência em nuvem e telemetria de testes integrada ao **Supabase** (`https://wlmesfyuzyahiyzmpmzk.supabase.co`, bucket dedicado `future-shards`) via **Vercel Serverless Functions** (`/api/cloud`), e publicar o projeto na **Vercel** para testes em produção.

## Arquitetura Cloud (Vercel + Supabase)
1. **API Serverless (`api/cloud.js`)**:
   - Opera na Vercel usando as variáveis de ambiente seguras (`SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`).
   - **Endpoints suportados**:
     - `GET /api/cloud?action=list`: Retorna a lista de Saves na Nuvem, Ranking Climático (`ECO %`, Dias, Ciência `PCV`) e o Log de Modificações / Telemetria de Testes armazenados no Supabase (`future-shards/index.json`).
     - `GET /api/cloud?action=load&slot=<slug>`: Carrega o estado completo de uma expedição salva na nuvem (`future-shards/saves/<slug>.json`).
     - `POST /api/cloud` (`action: "save"`): Salva o estado completo da partida (mapa `60x40`, inventário, tecnologias, equipamentos, estação e métricas) no Supabase e atualiza o índice global de saves/ranking.
     - `POST /api/cloud` (`action: "log"`): Registra notas de versão, marcos alcançados ou feedbacks de teste diretamente no Supabase.

2. **Módulo Cliente (`js/cloud.js`) + Modal Cloud (`index.html`)**:
   - Botão **`☁️ Nuvem & Saves`** na barra superior do jogo.
   - Permite **Salvar na Nuvem (Supabase)** com 1 clique, **Carregar Expedição** de qualquer dispositivo, visualizar o **Ranking de Regeneração do Tapajós (ECO %)** e consultar o **Histórico de Modificações (Changelog GitHub/GSD)** sincronizado.
   - Mantém fallback automático para `localStorage` quando aberto localmente via `file://`.

3. **Repositório GitHub & Commits Descritivos**:
   - Criar repositório público/privado `future-shards` na conta GitHub (`vinicius00vasconcelos`).
   - Configurar `.gitignore` para proteger `.env` e `.vercel`.
   - Estruturar commits granulares descrevendo:
     1. Especificação técnica e pacote completo de 90 sprites 16-bit (`future_shards_sprites_45_itens` e `future_shards_sprites_cenario_e_recursos`).
     2. Arquitetura modularizada da Fase 1 (`index.html`, `css/`, `js/`).
     3. Integração Cloud com Supabase + Vercel Serverless API (`api/cloud.js`, `js/cloud.js`, `vercel.json`).
     4. Documentação de evolução (`CHANGELOG.md` e `README.md`).
