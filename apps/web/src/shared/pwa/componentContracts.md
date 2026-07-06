# Contratos de componentes PWA-ready

## Page

Pode:
- usar `useParams`;
- chamar API;
- navegar;
- controlar loading/error;
- montar callbacks.

Não deve:
- conter tabela grande inline;
- conter formulário complexo inline;
- duplicar lógica de filtro.

## Form

Pode:
- receber `value`;
- receber `onChange`;
- validar UX simples;
- chamar `onSubmit`.

Não deve:
- chamar API diretamente;
- ler rota;
- usar `localStorage` diretamente;
- navegar.

## Table

Pode:
- filtrar localmente;
- ordenar localmente;
- editar inline se receber callbacks;
- exibir estado vazio.

Não deve:
- chamar API;
- ler rota;
- depender de `PageGuard`.

## InlineForm

Pode:
- chamar API enquanto ainda estivermos online-first;
- devolver `onCreated(entity)`;
- completar DTO mínimo com os dados digitados;
- futuramente trocar API por fila offline.

Não deve:
- forçar reload global;
- navegar;
- depender da página atual.
