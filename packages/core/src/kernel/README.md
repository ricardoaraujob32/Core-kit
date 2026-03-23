@core/kernel
🧠 Visão Geral

O pacote kernel representa o núcleo fundamental do sistema, contendo:

Tipos base e contratos transversais
Infraestrutura mínima para Result-Oriented Programming (ROP)
Abstrações (portas) para dependências externas
Modelo de contexto de execução
Utilitários reutilizáveis entre todos os módulos

🎯 Objetivo: garantir consistência, desacoplamento e previsibilidade em todo o Core.

🏗️ Princípios

Este pacote segue:

Clean Architecture
DDD (Domain-Driven Design)
ROP (Result-Oriented Programming)
Imutabilidade e funções puras (quando possível)
📁 Estrutura
kernel/
├── contextoExecucao.ts
├── autorizacao.ts
├── executarEmTransacao.ts
├── portasGenericas.ts
├── ROPHelpers.ts
├── result.ts
├── erros.ts
├── utils.ts
├── StatusJob.ts
🔁 Result-Oriented Programming (ROP)

O kernel padroniza o fluxo de erros com o tipo:

Result<T, ErroApp>
Helpers principais
wrapOk(valor)
wrapErr(erro)
createErroApp(...)
fromThrowable(...)
fromThrowableAsync(...)
Exemplo
const resultado = validarEmail("teste@email.com");

if (!resultado.ok) {
  return resultado;
}

const email = resultado.value;
⚠️ Erros (ErroApp)

Todos os erros do sistema seguem o formato padronizado:

type ErroApp = {
  codigo: string;
  mensagem: string;
  detalhes?: Record<string, unknown>;
  causa?: unknown;
};
Criação
return createErroApp({
  codigo: "INVALIDO",
  mensagem: "E-mail inválido",
});
🔌 Portas (Abstrações)

O kernel define contratos para dependências externas:

Exemplos
IdPorta → geração de IDs
RelogioPorta → controle de tempo
HashPorta → hashing seguro
TokenPorta → tokens (JWT ou equivalente)
PortaTransacao → execução transacional
Exemplo
const id = deps.idPorta.gerarId();
const agora = deps.relogio.agora();
🔄 Transações

Helper padronizado:

executarEmTransacao(transacao, async () => {
  // operação segura
});
Comportamento
sem transação → execução direta
com transação → delega para transacao.executar
👤 Contexto de Execução

O ContextoExecucao representa quem está executando a operação:

type ContextoExecucao = {
  locatarioId: string;
  usuarioId?: string;
  papeis?: Papel[];
  permissoes?: Permissao[];
  modulosHabilitados?: string[];
  agora?: () => Date;
};
Criação (obrigatória via factory)
const ctx = createContextoExecucao({
  locatarioId: "loc_1",
  usuarioId: "user_1",
});
Garantias
Imutabilidade (Object.freeze)
Branding (anti-falsificação)
Normalização de dados
🔐 Autorização (helpers)

Funções auxiliares:

temUsuario(ctx)
exigirUsuario(ctx)
comPermissoes(ctx, ...)
comPapeis(ctx, ...)
comModulosHabilitados(ctx, ...)
🧪 Validações (utils.ts)

Validadores transversais:

validarTextoObrigatorio
validarEmail
validarNumeroPositivo
validarData

⚠️ Retornam erro genérico → deve ser mapeado no domínio.

⚙️ Status de Jobs
type StatusJob =
  | "PENDENTE"
  | "EM_EXECUCAO"
  | "CONCLUIDO"
  | "FALHOU"
  | "CANCELADO";

Usado por:

importações
exportações
backups
📏 Convenções
1. Nunca lançar exceções no domínio

✔️ Use:

return createErroApp(...)

❌ Evite:

throw new Error(...)
2. Sempre usar Result

Todos os usecases devem retornar:

Promise<Result<T, ErroApp>>
3. Dependências via portas

Nunca usar diretamente:

Date
crypto
jwt
libs externas

Sempre via interfaces do kernel.

4. Contexto sempre via factory

Nunca criar manualmente:

❌ { locatarioId: "..." }

Sempre:

✔️ createContextoExecucao(...)
🚧 Pontos de atenção
TransacaoPorta vs PortaTransacao → possível unificação futura
validações do kernel são genéricas → domínio deve especializar
evitar uso de throw fora de boundary (infra)
🧭 Papel do Kernel no Sistema
kernel → base de tudo
   ↑
domínios (auth, rbac, assinaturas, etc.)
   ↑
aplicação / API
✅ Conclusão

O kernel é:

pequeno em código
crítico em arquitetura
responsável por padronizar todo o sistema

Se o kernel estiver consistente, o resto do sistema tende a seguir naturalmente.