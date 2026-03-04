# 🛠 AI TROUBLESHOOTING (Compilado)
Versão 1.0

## Copilot “ignorando” docs
- Abra AI_IDE_PACK.md + arquivos âncora ao lado do arquivo alvo
- Cole o bloco "Rules:" no topo do arquivo (usecase/handler)
- Dê exemplos concretos (signature de função, types)

## Copilot gerando código inconsistente
- Verifique nomes (locatarioId vs tenantId)
- Verifique AppErrorCode como type union (catálogo)
- Crie/ajuste templates e peça refactor para seguir template

## Copilot gerando lógica no handler
- Reforce: "handler is adapter only"
- Mova regras para usecase e cubra com testes

## Copilot “inventando” permissões/erros
- Exponha catálogos (permissions + error codes)
- Peça: "use ONLY values from these files"
