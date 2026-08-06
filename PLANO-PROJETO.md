# Plano de Projeto — Loja de Ótica (Web + Try-on 3D)

> Documento vivo. Briefing inicial preenchido (Óticas Lírio).
>
> Stack definida: **Next.js 16 (App Router) + TypeScript + Tailwind** (frontend). Backend: **em aberto** (mock local por enquanto).

---

## Visão do produto

Site de e-commerce local para uma ótica física, com:

1. **Catálogo** de óculos/produtos disponíveis (inicialmente com dados mock).
2. **Provador virtual 3D / AR** — o cliente vê uma prévia de como o óculos ficaria no rosto (útil quando o modelo não está na loja ou o cliente está longe).
3. **Páginas institucionais** — apresentação da loja, da fundadora, valores, contato/localização.
4. Fluxos típicos de e-commerce local (navegação, detalhe do produto, interesse/contato ou pedido futuro).

---

## Escopo da Fase 1 (MVP)

### Incluído
- Landing / home com identidade da marca
- Catálogo com filtros básicos (categoria, formato, material, preço — mock)
- Página de detalhe do produto
- Provador virtual (webcam + overlay 3D ou AR face-tracking) em versão funcional mínima
- Páginas: Sobre a loja, Fundadora, Contato / Como chegar
- Layout responsivo (mobile-first)
- Dados 100% mock (JSON local)

### Fora do MVP (próximas fases)
- Checkout com pagamento real
- Estoque sincronizado com sistema da loja
- Área admin / CMS
- Conta de cliente / pedidos
- Integração WhatsApp Business API avançada (pode entrar cedo como CTA simples)
- App nativo

---

## Mapa de páginas (informações / abas)

| Rota sugerida | Nome | Objetivo |
|---|---|---|
| `/` | Início | Marca + CTA catálogo + destaque do try-on |
| `/produtos` | Catálogo | Lista, busca, filtros |
| `/produtos/:id` | Detalhe | Fotos, specs, CTA “Provar virtualmente” |
| `/provar` ou `/provar/:id` | Provador 3D | Webcam + modelo 3D do óculos |
| `/sobre` | A loja | História, valores, o que oferece |
| `/fundadora` | Fundadora | Bio, foto, propósito |
| `/contato` | Contato | Endereço, mapa, horários, WhatsApp/telefone |
| `/carrinho` | Carrinho | (opcional no MVP — ou “lista de interesse”) |

---

## Arquitetura funcional (alto nível)

```
[Next.js App]
   ├── UI (App Router: páginas, componentes)
   ├── Mock data (produtos, textos institucionais)
   ├── Catálogo / filtros
   └── Módulo Try-on (client)
         ├── Acesso à câmera ✓ (MVP)
         ├── Detecção de face / landmarks (próximo)
         ├── Render do modelo 3D do óculos (próximo)
         └── Ajuste de escala/posição na face (próximo)

[Backend — futuro]
   ├── API de produtos / estoque
   ├── Conteúdo institucional (CMS)
   └── Pedidos / leads / agendamentos
```

Enquanto o backend não existir, o front lê de `src/data/*`. A camada `src/services/` (`getProducts()`, `getProductById()`, `getStoreInfo()`) isola mock → API.

---

## Etapas do plano

### Etapa 0 — Briefing e alinhamento *(aguardando resumo da ótica)*
**Objetivo:** consolidar identidade e requisitos reais.

**Entregáveis**
- Nome da marca, slogan, cores, tipografia (ou referências)
- Texto da fundadora e da loja
- Tipos de produto (grau, sol, infantil, acessórios…)
- Fotos reais (loja, fundadora, produtos) quando disponíveis
- Regras de negócio: só vitrine? orçamento? venda online? retirada na loja?
- Público-alvo e diferenciais

**Critério de pronto:** brief preenchido e prioridades do MVP confirmadas.

---

### Etapa 1 — Descoberta e escopo técnico
**Objetivo:** fechar o que entra no MVP e o que fica para depois.

**Atividades**
- Priorizar páginas e fluxos (MoSCoW)
- Definir se o “carrinho” é compra ou “lista de interesse + WhatsApp”
- Escolher abordagem do try-on (ver Etapa 4)
- Critérios de sucesso (ex.: “provar 5 modelos no celular em &lt; 30s”)

**Entregáveis**
- Escopo MVP assinado
- Lista de riscos (câmera em iOS Safari, performance mobile, modelos 3D)

---

### Etapa 2 — Decisão de stack
**Objetivo:** frontend firme; backend com opções claras.

**Frontend (definido)**
- Next.js 16 (App Router) + React 19
- TypeScript
- Tailwind CSS 4
- Estrutura por feature (catálogo, try-on, institucional)
- Motivo: SEO local, imagens otimizadas, SSG de catálogo; try-on no cliente

**Try-on 3D (candidatos)**
| Opção | Prós | Contras |
|---|---|---|
| **MediaPipe Face Mesh + Three.js** | Grátis, controle total, bom no browser | Mais trabalho de calibração |
| **@react-three/fiber + face-landmarks** | Integra bem com React | Curva de aprendizado |
| **SDK comercial (ex.: Banuba, Wanna, FittingBox)** | Qualidade pronta | Custo / vendor lock-in |

**Recomendação MVP:** MediaPipe (ou equivalente) + Three.js / R3F, com 1–2 modelos 3D de óculos bem calibrados.

**Backend (ainda em aberto) — opções para decidir depois**
| Opção | Quando faz sentido |
|---|---|
| **Sem backend** (só mock + formulário/WhatsApp) | Vitrine rápida |
| **Supabase / Firebase** | Auth leve, CMS simples, rápido |
| **Node (Nest/Express) + Postgres** | Controle total, crescimento |
| **Headless CMS** (Strapi, Sanity) | Conteúdo institucional editável pela loja |

**Entregáveis**
- Stack frontend fixada
- Shortlist backend com critérios (custo, manutenção, quem edita produtos)

---

### Etapa 3 — Design e conteúdo
**Objetivo:** uma composição visual clara (marca em primeiro plano), sem dashboard genérico.

**Atividades**
- Moodboard / direção visual alinhada à ótica
- Wireframes das rotas principais
- Conteúdo placeholder → conteúdo real após o resumo
- Assets: fotos, logo, modelos 3D (`.glb` / `.gltf`)

**Entregáveis**
- Protótipo das telas principais
- Guia rápido de UI (cores, fontes, espaçamento)
- Lista de assets necessários

---

### Etapa 4 — Fundação do projeto React
**Objetivo:** app rodando com navegação e estrutura limpa.

**Atividades**
- Scaffold Vite + React + TS
- Rotas e layout (header/footer)
- Tema / tokens CSS
- Camada `services/` com mock
- Dados mock de produtos (8–20 itens)

**Estrutura sugerida**
```
src/
  app/           # providers, router
  pages/         # Home, Catalogo, Detalhe, Provar, Sobre, Fundadora, Contato
  features/
    catalog/     # cards, filtros, tipos
    tryon/       # câmera, face mesh, scene 3D
    institutional/
  components/    # UI compartilhada
  data/          # products.json, store.json
  services/      # getProducts, getStoreInfo (mock → API depois)
  assets/
```

**Critério de pronto:** navegar entre todas as páginas com conteúdo mock.

---

### Etapa 5 — Catálogo e detalhe do produto
**Objetivo:** experiência de loja navegável.

**Atividades**
- Grid de produtos + busca + filtros
- Estados vazios / loading
- Detalhe: galeria, nome, preço, descrição, tags
- CTA: “Provar virtualmente” e “Falar com a loja” (WhatsApp)

**Modelo de dados mock (exemplo)**
```ts
type Product = {
  id: string
  name: string
  brand: string
  category: 'grau' | 'sol' | 'infantil' | 'acessorio'
  price: number
  images: string[]
  model3dUrl?: string   // .glb para o try-on
  shape: 'aviador' | 'redondo' | 'quadrado' | 'gatinho' | 'outro'
  material: string
  colors: string[]
  inStock: boolean
  description: string
}
```

**Critério de pronto:** filtrar, abrir detalhe e ir ao try-on a partir de um produto.

---

### Etapa 6 — Provador virtual 3D (núcleo diferencial)
**Objetivo:** prévia confiável do óculos no rosto via câmera.

**Fases internas do try-on**
1. **PoC:** um óculos estático alinhado a landmarks da face
2. **Calibração:** escala por distância interpupilar / largura da face
3. **Troca de modelo:** carregar `.glb` por `productId`
4. **UX:** permissões de câmera, fallback se negar, dicas de iluminação
5. **Mobile:** testar Safari iOS e Chrome Android

**UX mínima**
- Pedir permissão de câmera com copy clara
- Botão trocar óculos / voltar ao catálogo
- Capturar “selfie com óculos” (opcional, compartilhar)
- Aviso: “prévia aproximada — prova definitiva na loja”

**Critério de pronto:** em desktop e mobile, o modelo acompanha a face de forma estável o suficiente para decisão de interesse.

---

### Etapa 7 — Páginas institucionais
**Objetivo:** confiança local (loja real + fundadora).

**Atividades**
- `/sobre` — história, atendimento, diferenciais
- `/fundadora` — narrativa pessoal + foto
- `/contato` — mapa, horários, canais
- CTAs consistentes (WhatsApp, ligação, “agendar visita”)

**Critério de pronto:** textos e mídia reais (ou placeholders marcados) publicados nas rotas.

---

### Etapa 8 — Polimento, performance e acessibilidade
**Objetivo:** site apresentável para clientes reais.

**Checklist**
- [ ] Lighthouse razoável em mobile
- [ ] Imagens otimizadas
- [ ] Modelos 3D leves (compressão Draco/meshopt se necessário)
- [ ] Acessibilidade básica (contraste, foco, alt texts)
- [ ] SEO on-page (títulos, meta, Open Graph)
- [ ] Tratamento de erros (câmera, modelo 3D não carrega)

---

### Etapa 9 — Decisão e implementação do backend
**Objetivo:** sair do mock quando fizer sentido.

**Gatilhos para subir backend**
- Produtos mudam com frequência
- Precisa de estoque real
- Quer editar textos sem mexer no código
- Quer leads/pedidos salvos

**Atividades**
- Escolher stack (ver Etapa 2)
- Contratos de API alinhados aos `services/`
- Migrar `products.json` → banco/CMS
- (Opcional) painel simples de produtos

---

### Etapa 10 — Go-live e operação
**Objetivo:** site público e manutenível.

**Atividades**
- Domínio + hospedagem (Vercel/Netlify para o front)
- Analytics básico
- Treinar a loja: como enviar fotos/modelos novos
- Plano de conteúdo (novidades, promoções)

---

## Roadmap visual (resumo)

```
Etapa 0  Briefing (resumo da ótica)     ──► agora
Etapa 1  Escopo MVP
Etapa 2  Stack (front + opções back)
Etapa 3  Design + assets
Etapa 4  Scaffold React + rotas + mock
Etapa 5  Catálogo + detalhe
Etapa 6  Try-on 3D
Etapa 7  Institucional
Etapa 8  Polimento
Etapa 9  Backend (quando decidir)
Etapa 10 Publicação
```

---

## Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Try-on instável no mobile | PoC cedo (Etapa 6.1); limitar a poucos modelos bem feitos |
| Falta de modelos 3D dos óculos | Usar placeholders genéricos por formato (aviador, redondo…) até assets reais |
| Backend indefinido | Isolar `services/` desde o dia 1 |
| Conteúdo da marca incompleto | Placeholders claros; bloquear só o go-live, não o desenvolvimento |
| Expectativa de “prova perfeita” | Copy honesta: prévia orientativa, não substitui prova física |

---

## Briefing da marca (Etapa 0 — parcial)

| Campo | Valor |
|---|---|
| Nome fantasia | Óticas Lírio |
| Razão social | J.S.G PEREIRA OPTICA |
| CNPJ | 44.922.846/0001-54 |
| Fundadora | Juliana Sandanielo Galante |
| Slogan (provisório) | Beleza que nasce do olhar |
| Endereço cadastral | Rua Felipe Sabbag, 200 — Loja 04, Centro, Ribeirão Pires/SP |
| Telefone | (11) 97431-4460 |
| Instagram | [@oticaslirio](https://www.instagram.com/oticaslirio/) |
| Modelo de venda (MVP) | Vitrine + WhatsApp / visita à loja |
| Assets | Logos em `public/logos/` e `assets/logos/` |

Pendências: foto real da fundadora/loja, confirmação de horário e endereço de atendimento, textos finais, fotos de produtos, modelos 3D.

---

## Status do código (Etapa 4–7 em andamento)

Scaffold Next.js criado com rotas, mock de 12 produtos, design system botânico (verde lírio + pétala), CTAs WhatsApp e provador com câmera (overlay estático — face tracking na Etapa 6).

---

## Próximo passo imediato

1. Rodar `npm run dev` e validar fluxos no celular.
2. Confirmar endereço/horários e enviar foto da Juliana + fotos da loja.
3. Evoluir try-on: MediaPipe Face Mesh + Three.js / R3F.

---

*Última atualização: 18/07/2026 — scaffold Next.js + briefing parcial Óticas Lírio.*
