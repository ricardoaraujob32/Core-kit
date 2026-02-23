# ERRORS.md

## Objetivo

Padronizar o modelo de erros do sistema, garantindo:

- previsibilidade
- estabilidade de códigos
- facilidade de tratamento em adapters (HTTP, jobs, etc.)
- melhor geração de código assistida por IA

Princípios:

- Erros são **tipados e versionáveis**
- `code` é estável e usado para lógica
- `message` é informativa e humana
- Usecases retornam erros esperados (não exceptions)

---

## Estrutura padrão de erro

Formato conceitual:

- `code` → identificador estável
- `message` → descrição humana
- `details` → contexto opcional

Exemplo:

```ts
export type AppError<T extends object = {}> = {
  code: AppErrorCode;
  message: string;
  details?: T;
};