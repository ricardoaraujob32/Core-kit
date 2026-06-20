# Checklist final — UI/UX Tenant sem IDs técnicos

## Regra central

- Tenant: IDs técnicos não devem aparecer como informação principal.
- Superadmin: IDs técnicos podem continuar visíveis.
- Backend/rotas/payloads: IDs continuam existindo normalmente.

---

## 1. Login

- [ ] `/login` carrega sem tela branca.
- [ ] `/plataforma/login` carrega sem tela branca.
- [ ] Console do navegador não mostra erro de export/import quebrado.
- [ ] Console do navegador não mostra erro de import circular.

---

## 2. Tenant

Validar:

```text
/app/clientes
/app/fornecedores
/app/produtos
/app/transacoes
/app/financeiro
/app/ordens-servico
```

Para cada módulo:

- [ ] Lista não mostra UUID como coluna principal.
- [ ] Tela de detalhe não usa UUID como título.
- [ ] Breadcrumb não mostra UUID.
- [ ] Selects não mostram UUID no texto visível.
- [ ] Cards e resumos usam nomes, códigos, datas, status ou valores.
- [ ] IDs são usados apenas em `key`, `value`, URL, payload ou bloco técnico oculto.

---

## 3. Superadmin

Validar:

```text
/plataforma
/plataforma/locatarios
/plataforma/locatarios/:locatarioId
/plataforma/locatarios/:locatarioId/usuarios
```

- [ ] IDs continuam disponíveis.
- [ ] Exibição técnica usa `TechnicalId` quando fizer sentido.
- [ ] Regras de ocultação do tenant não foram aplicadas indevidamente na plataforma.

---

## 4. Build e validação

Executar:

```bash
node scripts/check-formatters-exports.mjs
node scripts/check-uiux-final.mjs
pnpm --filter web build
```

Critério:

- [ ] Scripts sem erro crítico.
- [ ] Build sem erro.
- [ ] Login visível após recarregar.
