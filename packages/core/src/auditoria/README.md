# Auditoria

## 🎯 Objetivo

O módulo de auditoria tem dois papéis distintos:

1. **Auditoria da Plataforma (`auditoria_plataforma`)**
   - Uso exclusivo do superadmin
   - Registro de ações administrativas, segurança e compliance
   - Pode conter `locatario_alvo_id`

2. **Auditoria do Locatário (`auditoria_locatario`)**
   - Uso dos usuários do locatário
   - Monitoramento operacional interno
   - Restrita ao `locatario_id`

---

## 🔒 Regras de acesso

### Superadmin
- Usa apenas `auditoria_plataforma`
- Pode impersonar locatário
- Deve preencher `locatario_alvo_id` quando aplicável

### Locatário
- Usa apenas `auditoria_locatario`
- Nunca acessa dados de plataforma

---

## 🔁 Regras de publicação

| Destino | Quando usar |
|--------|------------|
| Plataforma | ações administrativas, segurança, impersonação |
| Locatário | operações de negócio do tenant |
| Ambas | ações do superadmin que impactam locatário |

---

## 🎭 Impersonação

Quando o superadmin atua como locatário:

- `auditoria_plataforma`:
  - `usuario_id = superadmin`
  - `locatario_alvo_id = alvo`
  - `agente_tipo = SUPERADMIN_IMPERSONANDO`

- `auditoria_locatario`:
  - `locatario_id = alvo`
  - `agente_tipo = SUPERADMIN_IMPERSONANDO`

---

## 🧩 Estrutura de metadados

### Padrão

```json
{
  "antes": {},
  "depois": {},
  "contexto": {}
}

Regras
antes: estado anterior
depois: estado final
contexto: informações auxiliares
🚫 Dados proibidos

Nunca incluir:

senha
token
hash
segredo
📊 Categorias
OPERACAO
SEGURANCA
ERRO
COMPLIANCE
📌 Fonte da verdade em código

As matrizes e padrões estão definidos em:

eventos.ts
metadados.ts

Esses arquivos devem ser usados diretamente pelos controllers.


---

# 🧠 Código: matriz de eventos

## `packages/core/src/auditoria/eventos.ts`

```ts
export type DestinoAuditoria =
  | "PLATAFORMA"
  | "LOCATARIO"
  | "AMBAS";

export type CategoriaAuditoria =
  | "OPERACAO"
  | "SEGURANCA"
  | "ERRO"
  | "COMPLIANCE";

export type EventoAuditoriaDef = {
  evento: string;
  categoria: CategoriaAuditoria;
  destino: DestinoAuditoria;
  exigeLocatarioAlvo?: boolean;
};

export const EVENTOS_AUDITORIA: EventoAuditoriaDef[] = [
  // =========================
  // USUÁRIOS
  // =========================
  { evento: "usuario.listado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.criado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.atualizado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.inativado", categoria: "OPERACAO", destino: "LOCATARIO" },
  { evento: "usuario.reativado", categoria: "OPERACAO", destino: "LOCATARIO" },

  {
    evento: "plataforma.usuario.acao_impersonada",
    categoria: "OPERACAO",
    destino: "AMBAS",
    exigeLocatarioAlvo: true,
  },

  // =========================
  // LOCATÁRIOS
  // =========================
  { evento: "locatario.obtido", categoria: "OPERACAO", destino: "LOCATARIO" },

  {
    evento: "plataforma.locatario.listado",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.locatario.obtido",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
  },
  {
    evento: "plataforma.locatario.criado",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },
  {
    evento: "plataforma.locatario.suspenso",
    categoria: "COMPLIANCE",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },

  // =========================
  // AUTH
  // =========================
  {
    evento: "auth.login.sucesso",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "auth.login.falha",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
  },

  {
    evento: "plataforma.impersonacao.iniciada",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },

  {
    evento: "plataforma.impersonacao.encerrada",
    categoria: "SEGURANCA",
    destino: "PLATAFORMA",
    exigeLocatarioAlvo: true,
  },

  // =========================
  // RBAC
  // =========================
  {
    evento: "rbac.usuario.papeis_atualizados",
    categoria: "SEGURANCA",
    destino: "LOCATARIO",
  },
  {
    evento: "plataforma.rbac.intervencao",
    categoria: "COMPLIANCE",
    destino: "PLATAFORMA",
  },

  // =========================
  // AUDITORIA
  // =========================
  {
    evento: "auditoria.locatario.listada",
    categoria: "OPERACAO",
    destino: "LOCATARIO",
  },
  {
    evento: "auditoria.plataforma.listada",
    categoria: "OPERACAO",
    destino: "PLATAFORMA",
  },
];
