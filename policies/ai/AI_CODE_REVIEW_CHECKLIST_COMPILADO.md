# ✅ AI CODE REVIEW CHECKLIST (Compilado)
Versão 1.0

## Segurança / Tenancy
- [ ] Toda query/repo usa ctx.locatarioId
- [ ] Nenhum endpoint aceita locatarioId do body como autoridade
- [ ] Logs/auditoria incluem locatarioId e usuarioId (quando aplicável)

## Autenticação/Autorização
- [ ] Token validado no adapter (assinatura/exp)
- [ ] Usecase checa permissões necessárias
- [ ] SEM_PERMISSAO retorna 403 (via mapping)

## Erros / Result
- [ ] Usecase retorna Result (Ok/Err)
- [ ] AppErrorCode usado (nada de strings soltas)
- [ ] Exceptions só para falhas inesperadas

## Qualidade
- [ ] Nomes semânticos e consistentes (ver GLOSSARY/CONVENTIONS)
- [ ] Tipos explícitos (evitar any)
- [ ] Testes cobrem caminhos principais e edge cases

## “Red flags” (reprovação imediata)
- [ ] locatarioId vindo do cliente e sendo usado como autoridade
- [ ] lógica de negócio em handler/controller
- [ ] erro retornado como string solta
- [ ] ausência de teste para regra de negócio nova
