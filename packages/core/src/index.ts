// packages/core/src/index.ts

/**
 * API pública do core Kit
 * Tudo que é exportado aqui é considerado estável
 */

export * from "./result";
export * from "./erros";
export * from "./locatario";
export * from "./rbac";
export { autorizar } from "./autorizacao";


// --- Usuários (exports explícitos para evitar conflito de nomes) ---
export type { Usuario, NovoUsuario, StatusUsuario } from "./usuarios/tipos";

export type { RepositorioUsuarios} from "./usuarios/portasRepositorio";

export { createUsuariosMemoryRepo } from "./usuarios/repositorioMemoria";

export { criarUsuario } from "./usuarios/usecases/criarUsuario";
export { listarUsuarios } from "./usuarios/usecases/listarUsuarios";

export type { Assinatura, StatusAssinatura, AssinaturaId, PlanoId } from "./assinaturas/tipos";
export type { RepositorioAssinaturas } from "./assinaturas/portasRepositorio";

export type { ContextoExecucao, CreateContextoExecucaoParams as CriarContextoExecucaoParams } from "./contextoExecucao";
export { createContextoExecucao as criarContextoExecucao, isContextoExecucao, temUsuario, normalizarPermissoes, normalizarPapeis, normalizarRelogio, comPermissoes, comPapeis } from "./contextoExecucao";

export * from "./clientes/tipos";
export * from "./clientes/validadores";
export type { RepositorioClientes } from "./clientes/portasRepositorio";
export { criarRepositorioClientesEmMemoria } from "./clientes/repositorioMemoria";
export { criarCliente } from "./clientes/usecases/criarCliente";
export { listarClientes } from "./clientes/usecases/listarClientes";

export * from "./fornecedores/tipos";
export * from "./fornecedores/validadores";
export type { RepositorioFornecedores } from "./fornecedores/portasRepositorio";
export { criarRepositorioFornecedoresEmMemoria } from "./fornecedores/repositorioMemoria";
export { criarFornecedor } from "./fornecedores/usecases/criarFornecedor";
export { listarFornecedores } from "./fornecedores/usecases/listarFornecedores";

export * from "./estoque/tipos";
export * from "./estoque/validadores";
export type { RepositorioEstoque } from "./estoque/portasRepositorio";
export { criarRepositorioEstoqueEmMemoria } from "./estoque/repositorioMemoria";
export { criarItemCatalogo } from "./estoque/usecases/criarItemCatalogo";
export { listarItensCatalogo } from "./estoque/usecases/listarItensCatalogo";
export { registrarMovimentoEstoque } from "./estoque/usecases/registrarMovimentoEstoque";

export * from "./transacoes/tipos";
export type { RepositorioTransacoes } from "./transacoes/portasRepositorio";
export { criarRepositorioTransacoesEmMemoria } from "./transacoes/repositorioMemoria";
export { criarTransacaoConfirmada } from "./transacoes/usecases/criarTransacaoConfirmada";

export * from "./ordensServico/tipos";
export type { RepositorioOrdensServico } from "./ordensServico/portasRepositorio";
export { criarRepositorioOrdensServicoEmMemoria } from "./ordensServico/repositorioMemoria";
export { abrirOrdemServico } from "./ordensServico/usecases/abrirOrdemServico";
export { adicionarItemServico } from "./ordensServico/usecases/adicionarItemServico";
export { adicionarProdutoConsumido } from "./ordensServico/usecases/adicionarProdutoConsumido";
export { concluirOrdemServico } from "./ordensServico/usecases/concluirOrdemServico";

export * from "./financeiro/tipos";
export type { RepositorioFinanceiro } from "./financeiro/portasRepositorio";
export { criarRepositorioFinanceiroEmMemoria } from "./financeiro/repositorioMemoria";
export { criarLancamento } from "./financeiro/usecases/criarLancamento";
export { criarLancamentoVinculado } from "./financeiro/usecases/criarLancamentoVinculado";
export { listarLancamentos } from "./financeiro/usecases/listarLancamentos";
export { quitarLancamento } from "./financeiro/usecases/quitarLancamento";
