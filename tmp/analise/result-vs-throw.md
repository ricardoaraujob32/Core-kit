# Análise Result vs Throw

## Ocorrências de throw no Core
packages/core/src/kernel/contextoExecucao.ts:69:    throw new Error("ContextoExecucao inválido: locatarioId é obrigatório.");
packages/core/src/kernel/contextoExecucao.ts:74:    throw new Error("ContextoExecucao inválido: usuarioId não pode ser null.");
packages/core/src/kernel/contextoExecucao.ts:78:    throw new Error("ContextoExecucao inválido: usuarioId deve ser string não vazia, null ou undefined."); // mantém a semântica: "" não é usuário válido
packages/core/src/kernel/contextoExecucao.ts:87:            throw new Error("ContextoExecucao inválido: módulo habilitado deve ser string não vazia.");
packages/core/src/auditoria/resolverEventoAuditoria.ts:17:    throw new Error(`Evento de auditoria não mapeado: ${nome}`);

## Uso de Result / Ok / Err
packages/core/src/auth/usecases/resolverContextoAutorizado.ts:3:import { createContextoExecucao, wrapOk } from "../../kernel";
packages/core/src/auth/usecases/resolverContextoAutorizado.ts:32:   * @returns `Ok(ctx)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/auth/usecases/resolverContextoAutorizado.ts:43:    return wrapOk<ResolverContextoAutorizadoOutput>({
packages/core/src/auth/usecases/rotacionarRefresh.ts:3:import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/auth/usecases/rotacionarRefresh.ts:58:   * @returns `Ok(sessao)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/auth/usecases/rotacionarRefresh.ts:104:      return wrapOk(novoRefresh.value);
packages/core/src/auth/usecases/rotacionarRefresh.ts:127:    return wrapOk<RotacionarRefreshOutput>({
packages/core/src/auth/usecases/validarSessao.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/auth/usecases/validarSessao.ts:36:   * @returns `Ok(sessaoValidada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/auth/usecases/validarSessao.ts:47:    return wrapOk<ValidarSessaoOutput>({
packages/core/src/auth/usecases/logout.ts:3:import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/auth/usecases/logout.ts:66:    return wrapOk<LogoutOutput>({});
packages/core/src/auth/usecases/emitirSessao.ts:3:import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/auth/usecases/emitirSessao.ts:71:   * @returns `Ok(sessao)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/auth/usecases/emitirSessao.ts:211:    return wrapOk<EmitirSessaoOutput>({
packages/core/src/auth/tipos.ts:3:import type { ContextoExecucao, ErroApp, Result } from "../kernel";
packages/core/src/auth/tipos.ts:110:export type EmitirSessaoResult = Promise<Result<EmitirSessaoOutput, ErroApp>>;
packages/core/src/auth/tipos.ts:130:export type ValidarSessaoResult = Result<ValidarSessaoOutput, ErroApp>;
packages/core/src/auth/tipos.ts:153:export type RotacionarRefreshResult = Promise<Result<RotacionarRefreshOutput, ErroApp>>;
packages/core/src/auth/tipos.ts:178:export type LogoutResult = Promise<Result<LogoutOutput, ErroApp>>;
packages/core/src/auth/tipos.ts:189:  Promise<Result<ResolverContextoAutorizadoOutput, ErroApp>>;
packages/core/src/auth/validadores.ts:3:import { ErroApp, Result, validarEmail, validarIdGenerico, validarTextoObrigatorio } from "../kernel";
packages/core/src/auth/validadores.ts:16:function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
packages/core/src/auth/validadores.ts:27:export function validarEmailAuth(email: string): Result<string, ErroApp> {
packages/core/src/auth/validadores.ts:39:export function validarSenha(senha: string): Result<string, ErroApp> {
packages/core/src/auth/validadores.ts:49:export function validarLocatarioIdAuth(locatarioId: LocatarioId): Result<string, ErroApp> {
packages/core/src/auth/validadores.ts:62:export function validarTokenNaoVazio(token: string): Result<string, ErroApp> {
packages/core/src/auth/portasServico.ts:3:import { ContextoExecucao, ErroApp, Result } from "../kernel";
packages/core/src/auth/portasServico.ts:19:  gerarHashSenha(senha: string): Promise<Result<string, ErroApp>>;
packages/core/src/auth/portasServico.ts:27:  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
packages/core/src/auth/portasServico.ts:50:  }): Promise<Result<
packages/core/src/auth/portasServico.ts:60:      ErroApp> >;
packages/core/src/auth/portasServico.ts:70:  ): Result<
packages/core/src/auth/portasServico.ts:77:    ErroApp>;
packages/core/src/auth/portasServico.ts:99:    Result<{
packages/core/src/auth/portasServico.ts:103:    }, ErroApp>
packages/core/src/auth/portasServico.ts:117:    Result<{
packages/core/src/auth/portasServico.ts:119:    }, ErroApp>
packages/core/src/auth/portasServico.ts:132:  }): Promise<Result<void, ErroApp>>;
packages/core/src/auth/portasServico.ts:148:  resolverPermissoes(ctx: ContextoExecucao): Promise<Result<ContextoExecucao, ErroApp>>;
packages/core/src/auth/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/auth/portasRepositorio.ts:22:  buscarPorEmail(params: { locatarioId: LocatarioId; email: string }): Promise<Result<UsuarioAuth | null, ErroApp>>;
packages/core/src/auth/portasRepositorio.ts:30:  atualizarUltimoLogin(params: { usuarioId: UsuarioId; quando: Date }): Promise<Result<void, ErroApp>>;
packages/core/src/auth/portasRepositorio.ts:45:  buscarPorSlug(params: { locatarioSlug: LocatarioSlug }): Promise<Result<LocatarioAuth | null, ErroApp>>;
packages/core/src/auth/erros.ts:3:import { createErroApp } from "../kernel";
packages/core/src/auth/erros.ts:19: * @returns `Err(ErroApp)` específico do pacote `auth`.
packages/core/src/auth/erros.ts:22:  return createErroApp({ codigo: "AUTH_CREDENCIAIS_INVALIDAS", mensagem: "Credenciais inválidas.", detalhes: {} });
packages/core/src/auth/erros.ts:30: * @returns `Err(ErroApp)` específico do pacote `auth`.
packages/core/src/auth/erros.ts:33:  return createErroApp({ codigo: "AUTH_TOKEN_INVALIDO_OU_EXPIRADO", mensagem: "Token inválido ou expirado.", detalhes: {} });
packages/core/src/auth/erros.ts:40: * @returns `Err(ErroApp)` com contexto do estado bloqueante.
packages/core/src/auth/erros.ts:43:  return createErroApp({ codigo: "AUTH_USUARIO_NAO_PODE_AUTENTICAR", mensagem: "Usuário não pode autenticar.", detalhes: { status } });
packages/core/src/auth/erros.ts:50: * @returns `Err(ErroApp)` com contexto do estado bloqueante.
packages/core/src/auth/erros.ts:53:  return createErroApp({ codigo: "AUTH_LOCATARIO_NAO_PODE_AUTENTICAR", mensagem: "Locatário não pode autenticar.", detalhes: { status } });
packages/core/src/auth/erros.ts:60: * @returns `Err(ErroApp)` específico do pacote `auth`.
packages/core/src/auth/erros.ts:63:  return createErroApp({ codigo: "AUTH_ENTRADA_INVALIDA", mensagem: "Entrada inválida para autenticação.", detalhes });
packages/core/src/auth/erros.ts:69: * @returns `Err(ErroApp)` específico do pacote `auth`.
packages/core/src/auth/erros.ts:72:  return createErroApp({ codigo: "AUTH_SESSAO_INVALIDA", mensagem: "Sessão inválida de autenticação.", detalhes: {} });
packages/core/src/kernel/portasGenericas.ts:3:import type { ErroApp } from "./erros";
packages/core/src/kernel/portasGenericas.ts:99: * quando a operação transacional já participa do fluxo `Result<T, ErroApp>`.
packages/core/src/kernel/portasGenericas.ts:109:  executar<T>(fn: () => Promise<Result<T, ErroApp>>): Promise<Result<T, ErroApp>>;
packages/core/src/kernel/portasGenericas.ts:116:  buscarPorId(params: { id: TId }): Promise<Result<TEntidade | null, ErroApp>>;
packages/core/src/kernel/portasGenericas.ts:123:  atualizar(entidade: TEntidade): Promise<Result<TEntidade, ErroApp>>;
packages/core/src/kernel/portasGenericas.ts:130:  listar(): Promise<Result<TEntidade[], ErroApp>>;
packages/core/src/kernel/executarEmTransacao.ts:3:import type { ErroApp } from "./erros";
packages/core/src/kernel/executarEmTransacao.ts:35:  transacao: TransacaoPorta | undefined, fn: () => Promise<Result<T, ErroApp>>): Promise<Result<T, ErroApp>> {
packages/core/src/kernel/maquinaEstados.ts:3:import type { ErroApp } from "./erros";
packages/core/src/kernel/maquinaEstados.ts:4:import { Result, wrapOk } from "./result";
packages/core/src/kernel/maquinaEstados.ts:5:import { createErroApp } from "./ROPHelpers";
packages/core/src/kernel/maquinaEstados.ts:42:  }) => Result<never, ErroApp>;
packages/core/src/kernel/maquinaEstados.ts:57:): Result<TEstado, ErroApp> {
packages/core/src/kernel/maquinaEstados.ts:69:    return createErroApp({
packages/core/src/kernel/maquinaEstados.ts:80:  return wrapOk(proximoEstado);
packages/core/src/kernel/maquinaEstados.ts:105:  }): Result<TEstado, ErroApp> =>
packages/core/src/kernel/maquinaEstados.ts:136:}): Result<TEntidade, ErroApp> {
packages/core/src/kernel/maquinaEstados.ts:147:  return wrapOk(params.entidade);
packages/core/src/kernel/ROPHelpers.ts:3:import { Result, wrapErr, wrapOk } from "./result";
packages/core/src/kernel/ROPHelpers.ts:4:import { CodigoErroApp, ErroApp, erroApp, isErroApp } from "./erros";
packages/core/src/kernel/ROPHelpers.ts:13: * funcional baseado em `Result<T, ErroApp>`.
packages/core/src/kernel/ROPHelpers.ts:25:export function createErroApp<T = never, Codigo extends string = CodigoErroApp,>(params: {codigo: Codigo; mensagem: string; detalhes?: Record<string, unknown>; causa?: unknown;}): Result<T, ErroApp> {
packages/core/src/kernel/ROPHelpers.ts:31:  return wrapErr(erroApp(codigo, mensagem, detalhes, causa));
packages/core/src/kernel/ROPHelpers.ts:51: * - se lançar `ErroApp` → preserva
packages/core/src/kernel/ROPHelpers.ts:61:export function fromThrowable<T>(fn: () => T,): Result<T, ErroApp> {
packages/core/src/kernel/ROPHelpers.ts:63:    return wrapOk(fn());
packages/core/src/kernel/ROPHelpers.ts:66:    if (isResultErrErroApp(e)) return e as Result<T, ErroApp>;
packages/core/src/kernel/ROPHelpers.ts:68:    // Se jogaram um ErroApp direto, preserva.
packages/core/src/kernel/ROPHelpers.ts:69:    if (isErroApp(e)) return wrapErr(e);
packages/core/src/kernel/ROPHelpers.ts:72:    return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "", causa: e });
packages/core/src/kernel/ROPHelpers.ts:85:export async function fromThrowableAsync<T>(fn: () => Promise<T>,): Promise<Result<T, ErroApp>> {
packages/core/src/kernel/ROPHelpers.ts:87:    return wrapOk(await fn());
packages/core/src/kernel/ROPHelpers.ts:90:    if (isResultErrErroApp(e)) return e as Result<T, ErroApp>;
packages/core/src/kernel/ROPHelpers.ts:92:    // Se jogaram um ErroApp direto, preserva.
packages/core/src/kernel/ROPHelpers.ts:93:    if (isErroApp(e)) return wrapErr(e);
packages/core/src/kernel/ROPHelpers.ts:96:    return createErroApp({ codigo: "ERRO_INTERNO", mensagem: "", causa: e });
packages/core/src/kernel/ROPHelpers.ts:110: * Detecta se o valor é um Result Err cujo error é um ErroApp.
packages/core/src/kernel/ROPHelpers.ts:111: * (tolerância: protege contra throw(createErroApp(...)) ou throw(wrapErr(...)))
packages/core/src/kernel/ROPHelpers.ts:115:function isResultErrErroApp(v: unknown): v is Result<unknown, ErroApp> {
packages/core/src/kernel/ROPHelpers.ts:121:  return isErroApp(err);
packages/core/src/kernel/autorizacao.ts:2:import type { ErroApp } from "./erros";
packages/core/src/kernel/autorizacao.ts:4:import { wrapOk } from "./result";
packages/core/src/kernel/autorizacao.ts:7:import { createErroApp } from "./ROPHelpers";
packages/core/src/kernel/autorizacao.ts:43:  ): Promise<Result<void, ErroApp>>;
packages/core/src/kernel/autorizacao.ts:59:): Promise<Result<void, ErroApp> | null> {
packages/core/src/kernel/autorizacao.ts:70:): Promise<Result<void, ErroApp>> {
packages/core/src/kernel/autorizacao.ts:72:    return createErroApp({
packages/core/src/kernel/autorizacao.ts:88:      return wrapOk(undefined);
packages/core/src/kernel/autorizacao.ts:101:      return createErroApp({
packages/core/src/kernel/autorizacao.ts:132:export function exigirUsuario(ctx: ContextoExecucao): Result<ContextoExecucao & { usuarioId: UsuarioId }, ErroApp> {
packages/core/src/kernel/autorizacao.ts:134:    ? wrapOk(ctx)
packages/core/src/kernel/autorizacao.ts:135:    : createErroApp({
packages/core/src/kernel/index.ts:4:export { wrapOk, isOk, wrapErr, isErr, map, mapAsync, mapErr, mapErrAsync, match,
packages/core/src/kernel/index.ts:8:export type { CodigoErroApp, ErroApp } from "./erros";
packages/core/src/kernel/index.ts:9:export { isErroApp } from "./erros";
packages/core/src/kernel/index.ts:11:export { createErroApp, normalizarMensagem, fromThrowable, fromThrowableAsync } from "./ROPHelpers";
packages/core/src/kernel/errosInfra.ts:3:import { wrapErr } from "../../src/kernel/result";
packages/core/src/kernel/errosInfra.ts:6:  return wrapErr({
packages/core/src/kernel/result.ts:5: * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
packages/core/src/kernel/result.ts:8: * - ok(value)  -> { ok: true, value }
packages/core/src/kernel/result.ts:9: * - err(error) -> { ok: false, error }
packages/core/src/kernel/result.ts:21: * Result<T, E> representa sucesso (ok) ou falha (err) sem usar exceção como fluxo normal.
packages/core/src/kernel/result.ts:23:export type Result<T, E> = Ok<T> | Err<E>;
packages/core/src/kernel/result.ts:40:export function wrapOk<T>(value: T): Ok<T> {
packages/core/src/kernel/result.ts:49:export function wrapErr<E>(error: E): Err<E> {
packages/core/src/kernel/result.ts:58:export function isOk<T, E>(r: Result<T, E>): r is Ok<T> {
packages/core/src/kernel/result.ts:67:export function isErr<T, E>(r: Result<T, E>): r is Err<E> {
packages/core/src/kernel/result.ts:77:export function map<T, E, U>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
packages/core/src/kernel/result.ts:78:  return r.ok ? wrapOk(fn(r.value)) : r;
packages/core/src/kernel/result.ts:87:export async function mapAsync<T, E, U>(r: Result<T, E>, fn: (value: T) => Promise<U>): Promise<Result<U, E>> {
packages/core/src/kernel/result.ts:88:  return r.ok ? wrapOk(await fn(r.value)) : r;
packages/core/src/kernel/result.ts:97:export function mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
packages/core/src/kernel/result.ts:98:  return r.ok ? r : wrapErr(fn(r.error));
packages/core/src/kernel/result.ts:107:export async function mapErrAsync<T, E, F>(r: Result<T, E>, fn: (error: E) => Promise<F>): Promise<Result<T, F>> {
packages/core/src/kernel/result.ts:108:  return r.ok ? r : wrapErr(await fn(r.error));
packages/core/src/kernel/result.ts:118:export function andThen<T, E, U>(r: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
packages/core/src/kernel/result.ts:128:export async function andThenAsync<T, E, U>(r: Result<T, E>, fn: (value: T) => Promise<Result<U, E>>): Promise<Result<U, E>> {
packages/core/src/kernel/result.ts:138:export function match<T, E, U>(r: Result<T, E>, handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
packages/core/src/kernel/result.ts:139:  return r.ok ? handlers.ok(r.value) : handlers.err(r.error);
packages/core/src/kernel/result.ts:148:export function unwrapOr<T, E>(r: Result<T, E>, alternativo: T): T {
packages/core/src/kernel/result.ts:158:export function unwrapOrElse<T, E>(r: Result<T, E>, fn: (e: E) => T): T {
packages/core/src/kernel/result.ts:168:export function tap<T, E>(r: Result<T, E>, fn: (value: T) => void): Result<T, E> {
packages/core/src/kernel/result.ts:179:export function tapErr<T, E>(r: Result<T, E>, fn: (error: E) => void): Result<T, E> {
packages/core/src/kernel/utils.ts:3:import type { ErroApp } from "./erros";
packages/core/src/kernel/utils.ts:5:import { wrapOk } from "./result";
packages/core/src/kernel/utils.ts:6:import { createErroApp } from "./ROPHelpers";
packages/core/src/kernel/utils.ts:31: * @returns `Err(ErroApp)` com código genérico de entrada inválida.
packages/core/src/kernel/utils.ts:33:function erroValidacao(campo: string, valor?: unknown): Result<never, ErroApp> {
packages/core/src/kernel/utils.ts:34:  return createErroApp({
packages/core/src/kernel/utils.ts:51: * @returns `Ok(string)` com texto normalizado ou `Err(ErroApp)` genérico.
packages/core/src/kernel/utils.ts:53:export function validarTextoObrigatorio(valor: string, campo: string, tamanhoMinimo = 1): Result<string, ErroApp> {
packages/core/src/kernel/utils.ts:64:  return wrapOk(trim);
packages/core/src/kernel/utils.ts:75: * @returns `Ok(string)` com ID normalizado ou `Err(ErroApp)` genérico.
packages/core/src/kernel/utils.ts:77:export function validarIdGenerico(valor: string, campo: string): Result<string, ErroApp> {
packages/core/src/kernel/utils.ts:100: * @returns `Ok(string)` com e-mail normalizado ou `Err(ErroApp)` genérico.
packages/core/src/kernel/utils.ts:102:export function validarEmail(email: string, campo = "email"): Result<string, ErroApp> {
packages/core/src/kernel/utils.ts:114:  return wrapOk(normalizado);
packages/core/src/kernel/utils.ts:124:export function validarData(valor: Date, campo: string): Result<Date, ErroApp> {
packages/core/src/kernel/utils.ts:129:  return wrapOk(valor);
packages/core/src/kernel/utils.ts:137: * @returns `Ok(number)` quando o valor é positivo; `Err(ErroApp)` caso contrário.
packages/core/src/kernel/utils.ts:139:export function validarNumeroPositivo(valor: number, campo: string): Result<number, ErroApp> {
packages/core/src/kernel/utils.ts:144:  return wrapOk(valor);
packages/core/src/kernel/usecases.ts:3:import type { ErroApp } from "./erros";
packages/core/src/kernel/usecases.ts:12:  TErro extends ErroApp = ErroApp,
packages/core/src/kernel/usecases.ts:13:> = (input: TInput) => Promise<Result<TOutput, TErro>>;
packages/core/src/kernel/erros.ts:15:export type CodigoErroApp =
packages/core/src/kernel/erros.ts:65:export function mapCodigoErroToMensagemErro(codigo: CodigoErroApp): string {
packages/core/src/kernel/erros.ts:138:// export type CodigoErroApp = CodigoErroKernel | (string & {});
packages/core/src/kernel/erros.ts:157:// export function isCodigoErroApp(codigo: string): codigo is CodigoErroKernel {
packages/core/src/kernel/erros.ts:170:] as const satisfies readonly CodigoErroApp[];
packages/core/src/kernel/erros.ts:175:export function isCodigoErroApp(codigo: string): codigo is CodigoErroApp {
packages/core/src/kernel/erros.ts:186:export interface ErroApp<Codigo extends string = string> {
packages/core/src/kernel/erros.ts:201:export function erroApp<Codigo extends string = CodigoErroApp>(codigo: Codigo, mensagem: string, detalhes?: Record<string, unknown>, causa?: unknown): ErroApp<Codigo> {
packages/core/src/kernel/erros.ts:208: * @returns true se for ErroApp; do contrário, false
packages/core/src/kernel/erros.ts:210:export function isErroApp(value: unknown): value is ErroApp {
packages/core/src/kernel/erros.ts:213:  const v = value as Partial<ErroApp>;
packages/core/src/clientes/usecases/atualizarCliente.ts:3:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/atualizarCliente.ts:44:        return wrapOk<AtualizarClienteOutput>({ cliente: atualizado.value });
packages/core/src/clientes/usecases/criarCliente.ts:3:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/criarCliente.ts:20:      return wrapOk<CriarClienteOutput>({ clienteId: res.value.clienteId });
packages/core/src/clientes/usecases/obterCliente.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/obterCliente.ts:14:    return wrapOk<ObterClienteOutput>({ cliente: res.value });
packages/core/src/clientes/usecases/inativarCliente.ts:1:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/inativarCliente.ts:17:      return wrapOk<InativarClienteOutput>({ cliente: atualizado.value });
packages/core/src/clientes/usecases/excluirCliente.ts:7:import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/excluirCliente.ts:48:      return wrapOk<ExcluirClienteOutput>({
packages/core/src/clientes/usecases/listarClientes.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/listarClientes.ts:11:    return wrapOk<ListarClientesOutput>({ itens: res.value });
packages/core/src/clientes/usecases/reativarCliente.ts:1:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/clientes/usecases/reativarCliente.ts:17:      return wrapOk<ReativarClienteOutput>({ cliente: atualizado.value });
packages/core/src/clientes/tipos.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/clientes/tipos.ts:27:export type CriarClienteResult = Promise<Result<CriarClienteOutput, ErroApp>>;
packages/core/src/clientes/tipos.ts:31:export type ObterClienteResult = Promise<Result<ObterClienteOutput, ErroApp>>;
packages/core/src/clientes/tipos.ts:35:export type ListarClientesResult = Promise<Result<ListarClientesOutput, ErroApp>>;
packages/core/src/clientes/tipos.ts:39:export type AtualizarClienteResult = Promise<Result<AtualizarClienteOutput, ErroApp>>;
packages/core/src/clientes/tipos.ts:43:export type InativarClienteResult = Promise<Result<InativarClienteOutput, ErroApp>>;
packages/core/src/clientes/tipos.ts:47:export type ReativarClienteResult = Promise<Result<ReativarClienteOutput, ErroApp>>;
packages/core/src/clientes/tipos.ts:51:export type ExcluirClienteResult = Promise<Result<ExcluirClienteOutput, ErroApp>>;
packages/core/src/clientes/validadores.ts:1:import { createErroApp, wrapOk } from "../kernel";
packages/core/src/clientes/validadores.ts:2:import type { ErroApp, Result } from "../kernel";
packages/core/src/clientes/validadores.ts:6:export function validarLocatarioId(locatarioId: unknown): Result<LocatarioId, ErroApp> {
packages/core/src/clientes/validadores.ts:8:    return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "clientes.validarLocatarioId" } });
packages/core/src/clientes/validadores.ts:10:  return wrapOk(locatarioId.trim() as LocatarioId);
packages/core/src/clientes/validadores.ts:13:export function validarClienteId(clienteId: unknown): Result<ClienteId, ErroApp> {
packages/core/src/clientes/validadores.ts:15:    return createErroApp({ codigo: "INVALIDO", mensagem: "Cliente inválido.", detalhes: { operacao: "clientes.validarClienteId" } });
packages/core/src/clientes/validadores.ts:17:  return wrapOk(clienteId.trim() as ClienteId);
packages/core/src/clientes/validadores.ts:20:export function validarNomeCliente(nome: unknown): Result<string, ErroApp> {
packages/core/src/clientes/validadores.ts:22:    return createErroApp({ codigo: "INVALIDO", mensagem: "Nome do cliente deve conter ao menos 2 caracteres.", detalhes: { operacao: "clientes.validarNome" } });
packages/core/src/clientes/validadores.ts:24:  return wrapOk(nome.trim());
packages/core/src/clientes/validadores.ts:27:export function validarEmailOpcional(email: unknown): Result<string | null, ErroApp> {
packages/core/src/clientes/validadores.ts:28:  if (email === undefined || email === null || email === "") return wrapOk(null);
packages/core/src/clientes/validadores.ts:30:    return createErroApp({ codigo: "INVALIDO", mensagem: "E-mail inválido.", detalhes: { operacao: "clientes.validarEmail" } });
packages/core/src/clientes/validadores.ts:32:  return wrapOk(email.trim().toLowerCase());
packages/core/src/clientes/validadores.ts:35:export function validarTextoOpcional(valor: unknown): Result<string | null, ErroApp> {
packages/core/src/clientes/validadores.ts:36:  if (valor === undefined || valor === null || valor === "") return wrapOk(null);
packages/core/src/clientes/validadores.ts:38:    return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "clientes.validarTextoOpcional" } });
packages/core/src/clientes/validadores.ts:40:  return wrapOk(valor.trim() || null);
packages/core/src/clientes/portasRepositorio.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/clientes/portasRepositorio.ts:15:  criar(cliente: Cliente): Promise<Result<{ clienteId: ClienteId }, ErroApp>>;
packages/core/src/clientes/portasRepositorio.ts:21:  buscarPorId(params: { locatarioId: LocatarioId; clienteId: ClienteId }): Promise<Result<Cliente | null, ErroApp>>;
packages/core/src/clientes/portasRepositorio.ts:27:  listarPorLocatario(params: { locatarioId: LocatarioId; cursor?: ClienteId; limite?: number }): Promise<Result<Cliente[], ErroApp>>;
packages/core/src/clientes/portasRepositorio.ts:33:  atualizar(cliente: Cliente): Promise<Result<Cliente, ErroApp>>;
packages/core/src/clientes/erros.ts:1:import { createErroApp } from "../kernel";
packages/core/src/clientes/erros.ts:5:  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Cliente não encontrado.", detalhes: { operacao: "clientes.naoEncontrado", clienteId } });
packages/core/src/clientes/erros.ts:9:  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Cliente inativo não pode ser utilizado.", detalhes: { operacao: "clientes.inativo", clienteId } });
packages/core/src/rbac/usecases/autorizarOperacao.ts:3:import { normalizarPermissoes, wrapOk } from "../../kernel";
packages/core/src/rbac/usecases/autorizarOperacao.ts:23: * @returns `Ok(void)` quando a operação é autorizada, ou `Err(ErroApp)` quando negada.
packages/core/src/rbac/usecases/autorizarOperacao.ts:40:  return wrapOk(undefined);
packages/core/src/rbac/usecases/resolverAutorizacao.ts:3:import { createContextoExecucao, exigirUsuario, wrapOk } from "../../kernel";
packages/core/src/rbac/usecases/resolverAutorizacao.ts:36:    return wrapOk<ResolverAutorizacaoOutput>({
packages/core/src/rbac/usecases/resolverPermissoes.ts:3:import { comPapeis, comPermissoes, exigirUsuario, wrapOk } from "../../kernel";
packages/core/src/rbac/usecases/resolverPermissoes.ts:58:   * @returns `Ok({ ctx, permissoes, papeis })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/rbac/usecases/resolverPermissoes.ts:69:      return wrapOk<ResolverPermissoesOutput>({
packages/core/src/rbac/usecases/resolverPermissoes.ts:98:    return wrapOk<ResolverPermissoesOutput>({
packages/core/src/rbac/tipos.ts:3:import { ContextoExecucao, ErroApp, Result } from "../kernel";
packages/core/src/rbac/tipos.ts:119:export type ResolverPermissoesResult = Promise< Result<ResolverPermissoesOutput, ErroApp> >;
packages/core/src/rbac/tipos.ts:132:export type AutorizarOperacaoResult = Result<void, ErroApp>;
packages/core/src/rbac/tipos.ts:151:export type ResolverAutorizacaoResult = Promise<Result<ResolverAutorizacaoOutput, ErroApp>>
packages/core/src/rbac/validadores.ts:3:import { ErroApp, Result, validarTextoObrigatorio } from "../kernel";
packages/core/src/rbac/validadores.ts:20:export function validarPermissao(permissao: Permissao): Result<string, ErroApp> {
packages/core/src/rbac/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/rbac/portasRepositorio.ts:21:  listarPapeisDoUsuario(params: {locatarioId: LocatarioId; usuarioId: UsuarioId}): Promise<Result<Papel[], ErroApp>>;
packages/core/src/rbac/portasRepositorio.ts:32:  listarPermissoesEfetivasDoUsuario(params: {locatarioId: LocatarioId; usuarioId: UsuarioId}): Promise<Result<Permissao[], ErroApp>>;
packages/core/src/rbac/portasRepositorio.ts:47:  }): Promise<Result<AutorizacaoSnapshot, ErroApp>>;
packages/core/src/rbac/erros.ts:3:import { createErroApp } from "../kernel";
packages/core/src/rbac/erros.ts:18: * @returns `Err(ErroApp)` específico do domínio de autorização.
packages/core/src/rbac/erros.ts:21:  return createErroApp({ codigo: "RBAC_PERMISSAO_INVALIDA", mensagem: "Permissão inválida.", detalhes: { permissao } });
packages/core/src/rbac/erros.ts:27: * @returns `Err(ErroApp)` específico do módulo RBAC.
packages/core/src/rbac/erros.ts:30:  return createErroApp({ codigo: "RBAC_NAO_AUTENTICADO", mensagem: "Usuário não autenticado para resolução de autorização.", detalhes: {} });
packages/core/src/rbac/erros.ts:37: * @returns `Err(ErroApp)` com a permissão faltante em `detalhes`.
packages/core/src/rbac/erros.ts:40:  return createErroApp({ codigo: "RBAC_NAO_AUTORIZADO", mensagem: "Usuário não possui a permissão necessária.", detalhes: { permissao } });
packages/core/src/bootstrap/portasRepositorio.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/bootstrap/portasRepositorio.ts:10:  carregarCatalogo(): Promise<Result<CatalogoAutorizacaoBootstrap, ErroApp>>;
packages/core/src/modulos/usecases/listarModulosHabilitados.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/modulos/usecases/listarModulosHabilitados.ts:36: * ou `Err(ErroApp)` em caso de falha.
packages/core/src/modulos/usecases/listarModulosHabilitados.ts:47:    return wrapOk<ListarModulosHabilitadosOutput>({
packages/core/src/modulos/usecases/resolverModulosHabilitados.ts:3:import { comModulosHabilitados, wrapOk } from "../../kernel";
packages/core/src/modulos/usecases/resolverModulosHabilitados.ts:31:      return wrapOk<ResolverModulosHabilitadosOutput>({
packages/core/src/modulos/usecases/resolverModulosHabilitados.ts:52:    return wrapOk<ResolverModulosHabilitadosOutput>({
packages/core/src/modulos/usecases/exigirModuloHabilitado.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/modulos/usecases/exigirModuloHabilitado.ts:37: * ou `Err(ErroApp)` em caso de falha.
packages/core/src/modulos/usecases/exigirModuloHabilitado.ts:50:    return wrapOk<ModuloEstaHabilitadoOutput>(statusResult.value);
packages/core/src/modulos/usecases/moduloEstaHabilitado.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/modulos/usecases/moduloEstaHabilitado.ts:37: * ou `Err(ErroApp)` em caso de falha.
packages/core/src/modulos/usecases/moduloEstaHabilitado.ts:52:    return wrapOk<ModuloEstaHabilitadoOutput>({
packages/core/src/modulos/tipos.ts:3:import { ContextoExecucao, ErroApp, Result } from "../kernel";
packages/core/src/modulos/tipos.ts:58:export type ListarModulosHabilitadosResult = Promise<Result<ListarModulosHabilitadosOutput, ErroApp>>;
packages/core/src/modulos/tipos.ts:87:export type ModuloEstaHabilitadoResult = Promise<Result<ModuloEstaHabilitadoOutput, ErroApp>>;
packages/core/src/modulos/tipos.ts:107:export type ResolverModulosHabilitadosResult = Promise<Result<ResolverModulosHabilitadosOutput, ErroApp>>;
packages/core/src/modulos/validadores.ts:3:import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel";
packages/core/src/modulos/validadores.ts:18:): Result<ListarModulosHabilitadosInput, ErroApp> {
packages/core/src/modulos/validadores.ts:24:  return wrapOk({
packages/core/src/modulos/validadores.ts:42:): Result<ModuloEstaHabilitadoInput, ErroApp> {
packages/core/src/modulos/validadores.ts:53:  return wrapOk({
packages/core/src/modulos/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/modulos/portasRepositorio.ts:20:  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<ModuloHabilitado[], ErroApp>>;
packages/core/src/modulos/erros.ts:3:import { createErroApp, ErroApp, Result } from "../kernel";
packages/core/src/modulos/erros.ts:17: * @returns `Err(ErroApp)` específico do pacote `modulos`.
packages/core/src/modulos/erros.ts:19:export function erroLocatarioIdInvalido(locatarioId: unknown): Result<never, ErroApp> {
packages/core/src/modulos/erros.ts:20:  return createErroApp({ codigo: "MODULOS_LOCATARIO_ID_INVALIDO", mensagem: "Identificador de locatário inválido para consulta de módulos.", detalhes: { locatarioId } });
packages/core/src/modulos/erros.ts:27: * @returns `Err(ErroApp)` específico do pacote `modulos`.
packages/core/src/modulos/erros.ts:29:export function erroModuloCodigoInvalido(codigo: unknown): Result<never, ErroApp> {
packages/core/src/modulos/erros.ts:30:  return createErroApp({ codigo: "MODULOS_CODIGO_INVALIDO", mensagem: "Código do módulo inválido.", detalhes: { codigo } });
packages/core/src/modulos/erros.ts:37: * @returns `Err(ErroApp)` com causa preservada para diagnóstico.
packages/core/src/modulos/erros.ts:39:export function erroRepositorioModulos(causa?: unknown): Result<never, ErroApp> {
packages/core/src/modulos/erros.ts:40:  return createErroApp({ codigo: "MODULOS_REPOSITORIO_FALHA", mensagem: "Falha ao consultar módulos habilitados.", detalhes: {}, causa });
packages/core/src/modulos/erros.ts:48: * @returns `Err(ErroApp)` com contexto de autorização funcional.
packages/core/src/modulos/erros.ts:50:export function erroModuloNaoHabilitado(codigo: string, locatarioId: LocatarioId): Result<never, ErroApp> {
packages/core/src/modulos/erros.ts:51:  return createErroApp({ codigo: "MODULO_NAO_HABILITADO", mensagem: "Módulo não habilitado para o locatário.", detalhes: { codigo, locatarioId } });
packages/core/src/usuarios/maquinaEstados.ts:3:import { createErroApp, ErroApp, Result, transicionarEstado, wrapOk, type TabelaTransicoes } from "../kernel";
packages/core/src/usuarios/maquinaEstados.ts:66:export function exigirEstadoOperacionalUsuario(usuario: Usuario): Result<Usuario, ErroApp> {
packages/core/src/usuarios/maquinaEstados.ts:75:  return wrapOk(usuario);
packages/core/src/usuarios/maquinaEstados.ts:88:  return createErroApp({
packages/core/src/usuarios/usecases/obterUsuario.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/usuarios/usecases/obterUsuario.ts:41:   * @returns `Ok(usuario)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/usuarios/usecases/obterUsuario.ts:62:    return wrapOk<ObterUsuarioOutput>({
packages/core/src/usuarios/usecases/redefinirSenhaUsuario.ts:3:import { executarEmTransacao, HashPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/usuarios/usecases/redefinirSenhaUsuario.ts:59:      return wrapOk<RedefinirSenhaUsuarioOutput>({
packages/core/src/usuarios/usecases/helpers.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/usuarios/usecases/helpers.ts:36:  return wrapOk(resultado.value);
packages/core/src/usuarios/usecases/listarUsuariosPorLocatario.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/usuarios/usecases/listarUsuariosPorLocatario.ts:36:   * @returns `Ok({ itens })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/usuarios/usecases/listarUsuariosPorLocatario.ts:53:    return wrapOk<ListarUsuariosPorLocatarioOutput>({
packages/core/src/usuarios/usecases/criarUsuario.ts:3:import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/usuarios/usecases/criarUsuario.ts:49:   * @returns `Ok({ usuarioId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/usuarios/usecases/criarUsuario.ts:102:      return wrapOk<CriarUsuarioOutput>({
packages/core/src/usuarios/usecases/alterarSenhaUsuario.ts:4:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/usuarios/usecases/alterarSenhaUsuario.ts:69:      return wrapOk<AlterarSenhaUsuarioOutput>({
packages/core/src/usuarios/usecases/atualizarUsuario.ts:7:import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";
packages/core/src/usuarios/usecases/atualizarUsuario.ts:51:   * @returns `Ok(usuarioAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/usuarios/usecases/atualizarUsuario.ts:111:      return wrapOk<AtualizarUsuarioOutput>({
packages/core/src/usuarios/usecases/reativarUsuario.ts:5:import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";
packages/core/src/usuarios/usecases/reativarUsuario.ts:45:   * @returns `Ok(usuarioAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/usuarios/usecases/reativarUsuario.ts:78:      return wrapOk<ReativarUsuarioOutput>({
packages/core/src/usuarios/usecases/desativarUsuario.ts:5:import { wrapOk, RelogioPorta, TransacaoPorta } from "../../kernel";
packages/core/src/usuarios/usecases/desativarUsuario.ts:46:   * @returns `Ok(usuarioAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/usuarios/usecases/desativarUsuario.ts:79:      return wrapOk<DesativarUsuarioOutput>({
packages/core/src/usuarios/politicas.ts:3:import type { Result, ErroApp } from "../kernel";
packages/core/src/usuarios/politicas.ts:35:  autorizar(input: EntradaPoliticaUsuario): Promise<Result<void, ErroApp>>;
packages/core/src/usuarios/politicas.ts:51:export async function autorizarUsuario(deps: DepsPoliticaSegurancaUsuarios, input: EntradaPoliticaUsuario): Promise<Result<void, ErroApp> | null> {
packages/core/src/usuarios/tipos.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/usuarios/tipos.ts:92:export type CriarUsuarioResult = Promise<Result<CriarUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:113:export type ObterUsuarioResult = Promise<Result<ObterUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:138:export type AtualizarUsuarioResult = Promise<Result<AtualizarUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:159:export type DesativarUsuarioResult = Promise<Result<DesativarUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:180:export type ReativarUsuarioResult = Promise<Result<ReativarUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:201:export type ListarUsuariosPorLocatarioResult = Promise<Result<ListarUsuariosPorLocatarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:223:export type AlterarSenhaUsuarioResult = Promise<Result<AlterarSenhaUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/tipos.ts:244:export type RedefinirSenhaUsuarioResult = Promise<Result<RedefinirSenhaUsuarioOutput, ErroApp>>;
packages/core/src/usuarios/validadores.ts:3:import { validarEmail, validarIdGenerico, validarTextoObrigatorio, type ErroApp, type Result } from "../kernel";
packages/core/src/usuarios/validadores.ts:16:function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
packages/core/src/usuarios/validadores.ts:27:export function validarUsuarioId(usuarioId: UsuarioId): Result<string, ErroApp> {
packages/core/src/usuarios/validadores.ts:41:export function validarNomeUsuario(nome: string): Result<string, ErroApp> {
packages/core/src/usuarios/validadores.ts:51:export function validarEmailUsuario(email: string): Result<string, ErroApp> {
packages/core/src/usuarios/validadores.ts:64:export function validarSenhaHash(senhaHash: string): Result<string, ErroApp> {
packages/core/src/usuarios/validadores.ts:73:export function validarSenhaUsuario(senha: string): Result<string, ErroApp> {
packages/core/src/usuarios/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/usuarios/portasRepositorio.ts:31:  }): Promise<Result<{ usuarioId: UsuarioId }, ErroApp>>;
packages/core/src/usuarios/portasRepositorio.ts:42:  }): Promise<Result<Usuario | null, ErroApp>>;
packages/core/src/usuarios/portasRepositorio.ts:56:  }): Promise<Result<Usuario | null, ErroApp>>;
packages/core/src/usuarios/portasRepositorio.ts:68:  }): Promise<Result<Usuario[], ErroApp>>;
packages/core/src/usuarios/portasRepositorio.ts:76:  atualizar(usuario: Usuario): Promise<Result<Usuario, ErroApp>>;
packages/core/src/usuarios/portasRepositorio.ts:88:  }): Promise<Result<void, ErroApp>>;
packages/core/src/usuarios/portasRepositorio.ts:99:}): Promise<Result<void, ErroApp>>;
packages/core/src/usuarios/erros.ts:4:import { createErroApp } from "../kernel";
packages/core/src/usuarios/erros.ts:26: * @returns `Err(ErroApp)` com código específico do módulo.
packages/core/src/usuarios/erros.ts:29:  return createErroApp({ codigo: "USUARIO_INVALIDO", mensagem: "Dados do usuário inválidos.", detalhes });
packages/core/src/usuarios/erros.ts:36: * @returns `Err(ErroApp)` tipado para ausência de usuário.
packages/core/src/usuarios/erros.ts:39:  return createErroApp({ codigo: "USUARIO_NAO_ENCONTRADO", mensagem: "Usuário não encontrado.", detalhes: { usuarioId } });
packages/core/src/usuarios/erros.ts:46: * @returns `Err(ErroApp)` com o estado incompatível da conta.
packages/core/src/usuarios/erros.ts:49:  return createErroApp({ codigo: "USUARIO_INATIVO", mensagem: "Usuário inativo.", detalhes: { usuarioId } });
packages/core/src/usuarios/erros.ts:56: * @returns `Err(ErroApp)` com contexto sobre o usuário bloqueado.
packages/core/src/usuarios/erros.ts:59:  return createErroApp({ codigo: "USUARIO_SUSPENSO", mensagem: "Usuário suspenso.", detalhes: { usuarioId } });
packages/core/src/usuarios/erros.ts:66: * @returns `Err(ErroApp)` com contexto sobre o usuário encerrado.
packages/core/src/usuarios/erros.ts:69:  return createErroApp({ codigo: "USUARIO_ENCERRADO", mensagem: "Usuário encerrado.", detalhes: { usuarioId } });
packages/core/src/usuarios/erros.ts:80: * @returns `Err(ErroApp)` de conflito de cadastro.
packages/core/src/usuarios/erros.ts:83:  return createErroApp({ codigo: "USUARIO_EMAIL_JA_EXISTE", mensagem: "Já existe usuário com este e-mail no escopo informado.", detalhes: { email, locatarioId } });
packages/core/src/usuarios/erros.ts:92:  return createErroApp({
packages/core/src/backups/usecases/listarBackupsLocatario.ts:4:import { ErroApp, Result, wrapOk } from "../../kernel";
packages/core/src/backups/usecases/listarBackupsLocatario.ts:32:   * @returns `Ok({ locatarioId, backups })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/backups/usecases/listarBackupsLocatario.ts:34:  return async function listarBackupsLocatario(input: ListarBackupsLocatarioInput): Promise<Result<ListarBackupsLocatarioOutput, ErroApp>> {
packages/core/src/backups/usecases/listarBackupsLocatario.ts:41:    return wrapOk({
packages/core/src/backups/usecases/solicitarRestauracaoLocatario.ts:5:import { ErroApp, executarEmTransacao, IdPorta, TransacaoPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
packages/core/src/backups/usecases/solicitarRestauracaoLocatario.ts:46:   * @returns `Ok({ restauracao })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/backups/usecases/solicitarRestauracaoLocatario.ts:48:  return async function solicitarRestauracaoLocatario(input: SolicitarRestauracaoLocatarioInput): Promise<Result<SolicitarRestauracaoLocatarioOutput, ErroApp>> {
packages/core/src/backups/usecases/solicitarRestauracaoLocatario.ts:106:      return wrapOk({ restauracao: mapRestauracao(criada.value) });
packages/core/src/backups/usecases/solicitarBackupLocatario.ts:4:import { ErroApp, executarEmTransacao, IdPorta, TransacaoPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
packages/core/src/backups/usecases/solicitarBackupLocatario.ts:41:   * @returns `Ok({ backup })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/backups/usecases/solicitarBackupLocatario.ts:43:  return async function solicitarBackupLocatario(input: SolicitarBackupLocatarioInput): Promise<Result<SolicitarBackupLocatarioOutput, ErroApp>> {
packages/core/src/backups/usecases/solicitarBackupLocatario.ts:82:      return wrapOk({ backup: mapBackup(criada.value) });
packages/core/src/backups/validadores.ts:3:import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel";
packages/core/src/backups/validadores.ts:16:function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
packages/core/src/backups/validadores.ts:31:export function validarSolicitarBackupLocatarioInput(input: SolicitarBackupLocatarioInput): Result<SolicitarBackupLocatarioInput, ErroApp> {
packages/core/src/backups/validadores.ts:39:  return wrapOk(input);
packages/core/src/backups/validadores.ts:48:export function validarListarBackupsLocatarioInput(input: ListarBackupsLocatarioInput): Result<ListarBackupsLocatarioInput, ErroApp> {
packages/core/src/backups/validadores.ts:52:  return wrapOk(input);
packages/core/src/backups/validadores.ts:67:export function validarSolicitarRestauracaoLocatarioInput(input: SolicitarRestauracaoLocatarioInput): Result<SolicitarRestauracaoLocatarioInput, ErroApp> {
packages/core/src/backups/validadores.ts:82:  return wrapOk(input);
packages/core/src/backups/erros.ts:3:import { createErroApp, ErroApp, Result } from "../kernel";
packages/core/src/backups/erros.ts:14: * @returns `Err(ErroApp)` específico do pacote `backups`.
packages/core/src/backups/erros.ts:16:export function erroBackupInvalido(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
packages/core/src/backups/erros.ts:17:  return createErroApp({ codigo: "BACKUP_INVALIDO", detalhes });
packages/core/src/backups/erros.ts:24: * @returns `Err(ErroApp)` com contexto da busca.
packages/core/src/backups/erros.ts:26:export function erroBackupNaoEncontrado(backupId: BackupId): Result<never, ErroApp> {
packages/core/src/backups/erros.ts:27:  return createErroApp({ codigo: "BACKUP_NAO_ENCONTRADO", detalhes: { backupId } });
packages/core/src/backups/erros.ts:35: * @returns `Err(ErroApp)` específico de isolamento multi-tenant.
packages/core/src/backups/erros.ts:37:export function erroBackupNaoPertenceAoLocatario(backupId: BackupId, locatarioId: LocatarioId): Result<never, ErroApp> {
packages/core/src/backups/erros.ts:38:  return createErroApp({ codigo: "BACKUP_NAO_PERTENCE_AO_LOCATARIO", detalhes: { backupId, locatarioId } });
packages/core/src/backups/erros.ts:45: * @returns `Err(ErroApp)` específico de elegibilidade de restauração.
packages/core/src/backups/erros.ts:47:export function erroBackupNaoDisponivelParaRestauracao(backupId: BackupId): Result<never, ErroApp> {
packages/core/src/backups/erros.ts:48:  return createErroApp({ codigo: "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO", detalhes: { backupId } });
packages/core/src/backups/erros.ts:55: * @returns `Err(ErroApp)` específico de concorrência operacional.
packages/core/src/backups/erros.ts:57:export function erroJaExisteBackupEmAberto(locatarioId: LocatarioId): Result<never, ErroApp> {
packages/core/src/backups/erros.ts:58:  return createErroApp({ codigo: "BACKUP_EM_ABERTO_JA_EXISTE", detalhes: { locatarioId } });
packages/core/src/backups/erros.ts:65: * @returns `Err(ErroApp)` específico de concorrência operacional.
packages/core/src/backups/erros.ts:67:export function erroJaExisteRestauracaoEmAberto(locatarioId: LocatarioId): Result<never, ErroApp> {
packages/core/src/backups/erros.ts:68:  return createErroApp({ codigo: "RESTAURACAO_EM_ABERTO_JA_EXISTE", detalhes: { locatarioId } });
packages/core/src/tokens/maquinaEstados.ts:3:import { ErroApp, Result, transicionarEstado, wrapOk, type TabelaTransicoes } from "../kernel";
packages/core/src/tokens/maquinaEstados.ts:36: *          ou `Err(ErroApp)` quando é inválida.
packages/core/src/tokens/maquinaEstados.ts:84:}): Result<TokenPersistido, ErroApp> {
packages/core/src/tokens/maquinaEstados.ts:95:  return wrapOk(params.token);
packages/core/src/tokens/maquinaEstados.ts:107:}): Result<StatusToken, ErroApp> {
packages/core/src/tokens/usecases/revogarToken.ts:3:import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";
packages/core/src/tokens/usecases/revogarToken.ts:47:   * @returns `Ok(tokenAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/tokens/usecases/revogarToken.ts:89:      return wrapOk<RevogarTokenOutput>({
packages/core/src/tokens/usecases/rotacionarToken.ts:3:import { executarEmTransacao, wrapOk, type IdPorta, type RelogioPorta, type TransacaoPorta } from "../../kernel";
packages/core/src/tokens/usecases/rotacionarToken.ts:56:   * @returns `Ok({ tokenAnterior, tokenNovo })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/tokens/usecases/rotacionarToken.ts:141:      return wrapOk({
packages/core/src/tokens/usecases/obterTokenPorHash.ts:3:import { RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/tokens/usecases/obterTokenPorHash.ts:45:   * @returns `Ok(token)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/tokens/usecases/obterTokenPorHash.ts:71:    return wrapOk<ObterTokenPorHashOutput>({
packages/core/src/tokens/usecases/helpers.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/tokens/usecases/helpers.ts:37:  return wrapOk(resultado.value);
packages/core/src/tokens/usecases/helpers.ts:66:  return wrapOk(resultado.value);
packages/core/src/tokens/usecases/emitirToken.ts:3:import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/tokens/usecases/emitirToken.ts:50:   * @returns `Ok({ tokenId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/tokens/usecases/emitirToken.ts:112:      return wrapOk<EmitirTokenOutput>({
packages/core/src/tokens/usecases/listarTokensDoUsuario.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/tokens/usecases/listarTokensDoUsuario.ts:38:   * @returns `Ok({ itens })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/tokens/usecases/listarTokensDoUsuario.ts:60:    return wrapOk<ListarTokensDoUsuarioOutput>({
packages/core/src/tokens/politicas.ts:3:import type { Result, ErroApp } from "../kernel";
packages/core/src/tokens/politicas.ts:25:  autorizar(input: EntradaPoliticaToken): Promise<Result<void, ErroApp>>;
packages/core/src/tokens/politicas.ts:32:export async function autorizarToken(deps: DepsPoliticaSegurancaTokens, input: EntradaPoliticaToken): Promise<Result<void, ErroApp> | null> {
packages/core/src/tokens/tipos.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/tokens/tipos.ts:117:export type EmitirTokenResult = Promise<Result<EmitirTokenOutput, ErroApp>>;
packages/core/src/tokens/tipos.ts:140:export type ListarTokensDoUsuarioResult = Promise<Result<ListarTokensDoUsuarioOutput, ErroApp>>;
packages/core/src/tokens/tipos.ts:161:export type ObterTokenPorHashResult = Promise<Result<ObterTokenPorHashOutput, ErroApp>>;
packages/core/src/tokens/tipos.ts:189:export type RevogarTokenResult = Promise<Result<RevogarTokenOutput, ErroApp>>;
packages/core/src/tokens/tipos.ts:223:export type RotacionarTokenResult = Promise<Result<RotacionarTokenOutput, ErroApp>>;
packages/core/src/tokens/tipos.ts:267:export type CriarRefreshResult = Promise<Result<RefreshCriado, ErroApp>>;
packages/core/src/tokens/tipos.ts:272:export type ValidarRefreshResult = Promise<Result<RefreshValido, ErroApp>>;
packages/core/src/tokens/validadores.ts:3:import { ErroApp, Result, validarData, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
packages/core/src/tokens/validadores.ts:16:function mapearErroToken(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
packages/core/src/tokens/validadores.ts:30:function mapearErroEntrada(resultado: Result<string | Date | number, ErroApp>, campo: string, valor?: unknown): any {
packages/core/src/tokens/validadores.ts:41:export function validarTokenId(tokenId: TokenId): Result<string, ErroApp> {
packages/core/src/tokens/validadores.ts:55:export function validarTokenBruto(tokenBruto: string): Result<string, ErroApp> {
packages/core/src/tokens/validadores.ts:73:export function validarTtl(ttlMs: number): Result<number, ErroApp> {
packages/core/src/tokens/validadores.ts:85:export function validarAgora(agora: Date): Result<Date, ErroApp> {
packages/core/src/tokens/validadores.ts:100:export function validarHashToken(hashToken: string): Result<string, ErroApp> {
packages/core/src/tokens/validadores.ts:114:export function validarTokenTipo(tipo: TokenTipo): Result<TokenTipo, ErroApp> {
packages/core/src/tokens/validadores.ts:119:  return wrapOk(tipo);
packages/core/src/tokens/validadores.ts:128:export function validarExpiraEm(expiraEm: Date): Result<Date, ErroApp> {
packages/core/src/tokens/portasServico.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/tokens/portasServico.ts:31:    : Promise<Result<{ tokenBruto: string; tokenId: TokenId; expiraEm: Date }, ErroApp>>;
packages/core/src/tokens/portasServico.ts:40:    : Promise<Result<{ tokenId: TokenId; usuarioId: UsuarioId; expiraEm: Date }, ErroApp>>;
packages/core/src/tokens/portasServico.ts:49:    : Promise<Result<void, ErroApp>>;
packages/core/src/tokens/portasServico.ts:69:  gerarTokenSeguro(): Promise<Result<string, ErroApp>>;
packages/core/src/tokens/portasServico.ts:77:  hashToken(tokenBruto: string): Promise<Result<string, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/tokens/portasRepositorio.ts:31:  inserir(token: TokenPersistido): Promise<Result<void, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:43:  }): Promise<Result<TokenPersistido | null, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:55:  }): Promise<Result<TokenPersistido | null, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:69:  }): Promise<Result<void, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:86:  }): Promise<Result<void, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:106:  }): Promise<Result<{ tokenId: TokenId }, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:114:  atualizar(token: TokenPersistido): Promise<Result<TokenPersistido, ErroApp>>;
packages/core/src/tokens/portasRepositorio.ts:125:  }): Promise<Result<TokenPersistido[], ErroApp>>;
packages/core/src/tokens/erros.ts:3:import { createErroApp } from "../kernel";
packages/core/src/tokens/erros.ts:24: * @returns `Err(ErroApp)` com contexto de token inválido de entrada.
packages/core/src/tokens/erros.ts:27:  return createErroApp({
packages/core/src/tokens/erros.ts:40: * @returns `Err(ErroApp)` com semântica de não autenticação.
packages/core/src/tokens/erros.ts:43:  return createErroApp({
packages/core/src/tokens/erros.ts:56: * @returns `Err(ErroApp)` com código específico do módulo de tokens.
packages/core/src/tokens/erros.ts:59:  return createErroApp({ codigo: "TOKEN_ROTACAO_CONFLITO", mensagem: "Conflito na rotação do token.", detalhes });
packages/core/src/tokens/erros.ts:66: * @returns `Err(ErroApp)` com código específico do módulo.
packages/core/src/tokens/erros.ts:69:  return createErroApp({ codigo: "TOKEN_INVALIDO", mensagem: "Dados do token inválidos.", detalhes });
packages/core/src/tokens/erros.ts:79: * @returns `Err(ErroApp)` com contexto de busca.
packages/core/src/tokens/erros.ts:82:  return createErroApp({ codigo: "TOKEN_NAO_ENCONTRADO", mensagem: "Token não encontrado.", detalhes: { tokenIdOuHash } });
packages/core/src/tokens/erros.ts:89: * @returns `Err(ErroApp)` com contexto do token revogado.
packages/core/src/tokens/erros.ts:92:  return createErroApp({ codigo: "TOKEN_REVOGADO", mensagem: "Token revogado.", detalhes: { tokenId } });
packages/core/src/tokens/erros.ts:99: * @returns `Err(ErroApp)` com contexto do token expirado.
packages/core/src/tokens/erros.ts:102:  return createErroApp({ codigo: "TOKEN_EXPIRADO", mensagem: "Token expirado.", detalhes: { tokenId } });
packages/core/src/tokens/erros.ts:109: * @returns `Err(ErroApp)` específico do domínio de tokens.
packages/core/src/tokens/erros.ts:112:  return createErroApp({ codigo: "TOKEN_HASH_JA_EXISTE", mensagem: "Já existe token com este hash.", detalhes: { hashToken } });
packages/core/src/produtos/usecases/obterProduto.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/produtos/usecases/obterProduto.ts:14:    return wrapOk<ObterProdutoOutput>({ produto: res.value });
packages/core/src/produtos/usecases/atualizarProduto.ts:21:import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/produtos/usecases/atualizarProduto.ts:79:      return wrapOk<AtualizarProdutoOutput>({
packages/core/src/produtos/usecases/criarProduto.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/produtos/usecases/criarProduto.ts:21:      return wrapOk<CriarProdutoOutput>({ produtoId: res.value.produtoId });
packages/core/src/produtos/usecases/excluirProduto.ts:11:import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/produtos/usecases/excluirProduto.ts:46:      return wrapOk<ExcluirProdutoOutput>({
packages/core/src/produtos/usecases/listarProdutos.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/produtos/usecases/listarProdutos.ts:12:    return wrapOk<ListarProdutosOutput>({ itens: res.value });
packages/core/src/produtos/tipos.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/produtos/tipos.ts:31:export type CriarProdutoResult = Promise<Result<CriarProdutoOutput, ErroApp>>;
packages/core/src/produtos/tipos.ts:34:export type ObterProdutoResult = Promise<Result<ObterProdutoOutput, ErroApp>>;
packages/core/src/produtos/tipos.ts:37:export type ListarProdutosResult = Promise<Result<ListarProdutosOutput, ErroApp>>;
packages/core/src/produtos/tipos.ts:40:export type InativarProdutoResult = Promise<Result<InativarProdutoOutput, ErroApp>>;
packages/core/src/produtos/tipos.ts:43:export type ReativarProdutoResult = Promise<Result<ReativarProdutoOutput, ErroApp>>;
packages/core/src/produtos/tipos.ts:61:export type AtualizarProdutoResult = Promise<Result<AtualizarProdutoOutput, ErroApp>>;
packages/core/src/produtos/tipos.ts:74:export type ExcluirProdutoResult = Promise<Result<ExcluirProdutoOutput, ErroApp>>;
packages/core/src/produtos/validadores.ts:3:import { createErroApp, wrapOk } from "../kernel";
packages/core/src/produtos/validadores.ts:4:import type { ErroApp, Result } from "../kernel";
packages/core/src/produtos/validadores.ts:8:export function validarLocatarioId(v: unknown): Result<LocatarioId, ErroApp> {
packages/core/src/produtos/validadores.ts:9:  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "produtos.validarLocatarioId" } });
packages/core/src/produtos/validadores.ts:10:  return wrapOk(v.trim() as LocatarioId);
packages/core/src/produtos/validadores.ts:12:export function validarProdutoId(v: unknown): Result<ProdutoId, ErroApp> {
packages/core/src/produtos/validadores.ts:13:  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Produto inválido.", detalhes: { operacao: "produtos.validarProdutoId" } });
packages/core/src/produtos/validadores.ts:14:  return wrapOk(v.trim() as ProdutoId);
packages/core/src/produtos/validadores.ts:16:export function validarNomeProduto(v: unknown): Result<string, ErroApp> {
packages/core/src/produtos/validadores.ts:17:  if (typeof v !== "string" || v.trim().length < 2) return createErroApp({ codigo: "INVALIDO", mensagem: "Nome inválido.", detalhes: { operacao: "produtos.validarNome" } });
packages/core/src/produtos/validadores.ts:18:  return wrapOk(v.trim());
packages/core/src/produtos/validadores.ts:20:export function validarTipoProduto(v: unknown): Result<TipoProduto, ErroApp> {
packages/core/src/produtos/validadores.ts:21:  if (v !== "PRODUTO" && v !== "SERVICO") return createErroApp({ codigo: "INVALIDO", mensagem: "Tipo inválido.", detalhes: { operacao: "produtos.validarTipo" } });
packages/core/src/produtos/validadores.ts:22:  return wrapOk(v);
packages/core/src/produtos/validadores.ts:24:export function validarUnidade(v: unknown): Result<string, ErroApp> {
packages/core/src/produtos/validadores.ts:25:  if (v === undefined || v === null || v === "") return wrapOk("UN");
packages/core/src/produtos/validadores.ts:26:  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Unidade inválida.", detalhes: { operacao: "produtos.validarUnidade" } });
packages/core/src/produtos/validadores.ts:27:  return wrapOk(v.trim().toUpperCase());
packages/core/src/produtos/validadores.ts:29:export function validarValorNaoNegativo(v: unknown, campo: string): Result<number, ErroApp> {
packages/core/src/produtos/validadores.ts:30:  if (v === undefined || v === null) return wrapOk(0);
packages/core/src/produtos/validadores.ts:31:  if (typeof v !== "number" || Number.isNaN(v) || v < 0) return createErroApp({ codigo: "INVALIDO", mensagem: `${campo} inválido.`, detalhes: { operacao: "produtos.validarValor", campo } });
packages/core/src/produtos/validadores.ts:32:  return wrapOk(v);
packages/core/src/produtos/validadores.ts:34:export function validarValorOpcionalNaoNegativo(v: unknown, campo: string): Result<number | null, ErroApp> {
packages/core/src/produtos/validadores.ts:35:  if (v === undefined || v === null) return wrapOk(null);
packages/core/src/produtos/validadores.ts:36:  if (typeof v !== "number" || Number.isNaN(v) || v < 0) return createErroApp({ codigo: "INVALIDO", mensagem: `${campo} inválido.`, detalhes: { operacao: "produtos.validarValorOpcional", campo } });
packages/core/src/produtos/validadores.ts:37:  return wrapOk(v);
packages/core/src/produtos/validadores.ts:39:export function validarTextoOpcional(v: unknown): Result<string | null, ErroApp> {
packages/core/src/produtos/validadores.ts:40:  if (v === undefined || v === null || v === "") return wrapOk(null);
packages/core/src/produtos/validadores.ts:41:  if (typeof v !== "string") return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "produtos.validarTextoOpcional" } });
packages/core/src/produtos/validadores.ts:42:  return wrapOk(v.trim() || null);
packages/core/src/produtos/validadores.ts:45:export function validarSkuProduto(value: string | null | undefined): Result<string | null, ErroApp>  {
packages/core/src/produtos/validadores.ts:46:  return wrapOk(value?.trim() || null);
packages/core/src/produtos/validadores.ts:49:export function validarDescricaoProduto(value: string | null | undefined): Result<string | null, ErroApp>  {
packages/core/src/produtos/validadores.ts:50:  return wrapOk(value?.trim() || null);
packages/core/src/produtos/validadores.ts:56:    return createErroApp({
packages/core/src/produtos/validadores.ts:61:  return wrapOk(unidade);
packages/core/src/produtos/validadores.ts:66:    return createErroApp({
packages/core/src/produtos/validadores.ts:71:  return wrapOk(value);
packages/core/src/produtos/validadores.ts:75:  if (value === null || value === undefined) return wrapOk(null);
packages/core/src/produtos/validadores.ts:78:    return createErroApp({
packages/core/src/produtos/validadores.ts:84:  return wrapOk(value);
packages/core/src/produtos/portasRepositorio.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/produtos/portasRepositorio.ts:15:  criar(produto: Produto): Promise<Result<{ produtoId: ProdutoId }, ErroApp>>;
packages/core/src/produtos/portasRepositorio.ts:21:  buscarPorId(params: { locatarioId: LocatarioId; produtoId: ProdutoId }): Promise<Result<Produto | null, ErroApp>>;
packages/core/src/produtos/portasRepositorio.ts:27:  listarPorLocatario(params: { locatarioId: LocatarioId; tipo?: TipoProduto; cursor?: ProdutoId; limite?: number }): Promise<Result<Produto[], ErroApp>>;
packages/core/src/produtos/portasRepositorio.ts:33:  atualizar(produto: Produto): Promise<Result<Produto, ErroApp>>;
packages/core/src/produtos/erros.ts:1:import { createErroApp } from "../kernel";
packages/core/src/produtos/erros.ts:5:  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Produto ou serviço não encontrado.", detalhes: { operacao: "produtos.naoEncontrado", produtoId } });
packages/core/src/produtos/erros.ts:9:  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Produto ou serviço inativo não pode ser utilizado.", detalhes: { operacao: "produtos.inativo", produtoId } });
packages/core/src/exportacoes/usecases/marcarExportacaoEmExecucao.ts:3:import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/exportacoes/usecases/marcarExportacaoEmExecucao.ts:35:   * @returns `Ok(exportacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/exportacoes/usecases/marcarExportacaoEmExecucao.ts:37:  return async function marcarExportacaoEmExecucao(input: MarcarExportacaoEmExecucaoInput): Promise<Result<Exportacao, ErroApp>> {
packages/core/src/exportacoes/usecases/listarExportacoesLocatario.ts:3:import { ErroApp, Result, wrapOk } from "../../kernel";
packages/core/src/exportacoes/usecases/listarExportacoesLocatario.ts:30:   * @returns `Ok({ locatarioId, exportacoes })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/exportacoes/usecases/listarExportacoesLocatario.ts:32:  return async function listarExportacoesLocatario(input: ListarExportacoesLocatarioInput): Promise<Result<ListarExportacoesLocatarioOutput, ErroApp>> {
packages/core/src/exportacoes/usecases/listarExportacoesLocatario.ts:39:    return wrapOk({
packages/core/src/exportacoes/usecases/marcarExportacaoConcluida.ts:3:import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/exportacoes/usecases/marcarExportacaoConcluida.ts:37:   * @returns `Ok(exportacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/exportacoes/usecases/marcarExportacaoConcluida.ts:39:  return async function marcarExportacaoConcluida(input: MarcarExportacaoConcluidaInput): Promise<Result<Exportacao, ErroApp>> {
packages/core/src/exportacoes/usecases/solicitarExportacao.ts:3:import { ErroApp, IdPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
packages/core/src/exportacoes/usecases/solicitarExportacao.ts:38:   * @returns `Ok({ exportacao })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/exportacoes/usecases/solicitarExportacao.ts:40:  return async function solicitarExportacao(input: SolicitarExportacaoInput): Promise<Result<SolicitarExportacaoOutput, ErroApp>> {
packages/core/src/exportacoes/usecases/solicitarExportacao.ts:61:    return wrapOk({ exportacao: criada.value });
packages/core/src/exportacoes/usecases/marcarExportacaoComFalha.ts:3:import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/exportacoes/usecases/marcarExportacaoComFalha.ts:36:   * @returns `Ok(exportacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/exportacoes/usecases/marcarExportacaoComFalha.ts:38:  return async function marcarExportacaoComFalha(input: MarcarExportacaoComFalhaInput): Promise<Result<Exportacao, ErroApp>> {
packages/core/src/exportacoes/validadores.ts:3:import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio, wrapOk } from "../kernel";
packages/core/src/exportacoes/validadores.ts:17:function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
packages/core/src/exportacoes/validadores.ts:32:export function validarSolicitarExportacaoInput(input: SolicitarExportacaoInput): Result<SolicitarExportacaoInput, ErroApp> {
packages/core/src/exportacoes/validadores.ts:40:  return wrapOk(input);
packages/core/src/exportacoes/validadores.ts:49:export function validarListarExportacoesLocatarioInput(input: ListarExportacoesLocatarioInput): Result<ListarExportacoesLocatarioInput, ErroApp> {
packages/core/src/exportacoes/validadores.ts:53:  return wrapOk(input);
packages/core/src/exportacoes/validadores.ts:62:export function validarMarcarExportacaoEmExecucaoInput(input: MarcarExportacaoEmExecucaoInput): Result<MarcarExportacaoEmExecucaoInput, ErroApp> {
packages/core/src/exportacoes/validadores.ts:66:  return wrapOk(input);
packages/core/src/exportacoes/validadores.ts:79:export function validarMarcarExportacaoConcluidaInput(input: MarcarExportacaoConcluidaInput): Result<MarcarExportacaoConcluidaInput, ErroApp> {
packages/core/src/exportacoes/validadores.ts:87:  return wrapOk(input);
packages/core/src/exportacoes/validadores.ts:100:export function validarMarcarExportacaoComFalhaInput(input: MarcarExportacaoComFalhaInput): Result<MarcarExportacaoComFalhaInput, ErroApp> {
packages/core/src/exportacoes/validadores.ts:107:  return wrapOk(input);
packages/core/src/exportacoes/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/exportacoes/portasRepositorio.ts:20:  criarExportacao(params: RegistrarExportacaoParams): Promise<Result<Exportacao, ErroApp>>;
packages/core/src/exportacoes/portasRepositorio.ts:28:  atualizarExportacao(exportacao: Exportacao): Promise<Result<Exportacao, ErroApp>>;
packages/core/src/exportacoes/portasRepositorio.ts:36:  buscarPorId(exportacaoId: ExportacaoId): Promise<Result<Exportacao | null, ErroApp>>;
packages/core/src/exportacoes/portasRepositorio.ts:44:  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Exportacao[], ErroApp>>;
packages/core/src/exportacoes/erros.ts:3:import { createErroApp, ErroApp, Result } from "../kernel";
packages/core/src/exportacoes/erros.ts:10: * @returns `Err(ErroApp)` específico do pacote `exportacoes`.
packages/core/src/exportacoes/erros.ts:12:export function erroExportacaoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
packages/core/src/exportacoes/erros.ts:13:  return createErroApp({ codigo: "EXPORTACAO_INVALIDA", detalhes });
packages/core/src/exportacoes/erros.ts:20: * @returns `Err(ErroApp)` com contexto da consulta.
packages/core/src/exportacoes/erros.ts:22:export function erroExportacaoNaoEncontrada(exportacaoId: ExportacaoId): Result<never, ErroApp> {
packages/core/src/exportacoes/erros.ts:23:  return createErroApp({ codigo: "EXPORTACAO_NAO_ENCONTRADA", detalhes: { exportacaoId } });
packages/core/src/exportacoes/erros.ts:32: * @returns `Err(ErroApp)` específico de transição de status inválida.
packages/core/src/exportacoes/erros.ts:34:export function erroTransicaoStatusExportacaoInvalida(exportacaoId: ExportacaoId, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
packages/core/src/exportacoes/erros.ts:35:  return createErroApp({ codigo: "EXPORTACAO_TRANSICAO_STATUS_INVALIDA", detalhes: { exportacaoId, statusAtual, statusDestino } });
packages/core/src/importacoes/usecases/marcarItemImportacaoComFalha.ts:3:import { ErroApp, Result } from "../../kernel";
packages/core/src/importacoes/usecases/marcarItemImportacaoComFalha.ts:31:   * @returns `Ok(itemAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/marcarItemImportacaoComFalha.ts:33:  return async function marcarItemImportacaoComFalha(input: MarcarItemImportacaoComFalhaInput): Promise<Result<ItemImportacao, ErroApp>> {
packages/core/src/importacoes/usecases/marcarImportacaoComFalha.ts:3:import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/importacoes/usecases/marcarImportacaoComFalha.ts:35:   * @returns `Ok(importacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/marcarImportacaoComFalha.ts:37:  return async function marcarImportacaoComFalha(input: MarcarImportacaoComFalhaInput): Promise<Result<Importacao, ErroApp>> {
packages/core/src/importacoes/usecases/solicitarImportacao.ts:3:import { ErroApp, IdPorta, RelogioPorta, Result, wrapOk } from "../../kernel";
packages/core/src/importacoes/usecases/solicitarImportacao.ts:38:   * @returns `Ok({ importacao })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/solicitarImportacao.ts:40:  return async function solicitarImportacao(input: SolicitarImportacaoInput): Promise<Result<SolicitarImportacaoOutput, ErroApp>> {
packages/core/src/importacoes/usecases/solicitarImportacao.ts:64:    return wrapOk({ importacao: criada.value });
packages/core/src/importacoes/usecases/listarImportacoesLocatario.ts:3:import { ErroApp, Result } from "../../kernel";
packages/core/src/importacoes/usecases/listarImportacoesLocatario.ts:25:   * @returns Lista de importações em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/listarImportacoesLocatario.ts:27:  return async function listarImportacoesLocatario(input: ListarImportacoesLocatarioInput): Promise<Result<Importacao[], ErroApp>> {
packages/core/src/importacoes/usecases/marcarImportacaoConcluida.ts:3:import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/importacoes/usecases/marcarImportacaoConcluida.ts:36:   * @returns `Ok(importacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/marcarImportacaoConcluida.ts:38:  return async function marcarImportacaoConcluida(input: MarcarImportacaoConcluidaInput): Promise<Result<Importacao, ErroApp>> {
packages/core/src/importacoes/usecases/marcarImportacaoEmExecucao.ts:3:import { ErroApp, executarEmTransacao, TransacaoPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/importacoes/usecases/marcarImportacaoEmExecucao.ts:35:   * @returns `Ok(importacaoAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/marcarImportacaoEmExecucao.ts:37:  return async function marcarImportacaoEmExecucao(input: MarcarImportacaoEmExecucaoInput): Promise<Result<Importacao, ErroApp>> {
packages/core/src/importacoes/usecases/marcarItemImportacaoProcessado.ts:3:import { ErroApp, Result } from "../../kernel";
packages/core/src/importacoes/usecases/marcarItemImportacaoProcessado.ts:31:   * @returns `Ok(itemAtualizado)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/marcarItemImportacaoProcessado.ts:33:  return async function marcarItemImportacaoProcessado(input: MarcarItemImportacaoProcessadoInput): Promise<Result<ItemImportacao, ErroApp>> {
packages/core/src/importacoes/usecases/listarItensImportacao.ts:3:import { ErroApp, Result } from "../../kernel";
packages/core/src/importacoes/usecases/listarItensImportacao.ts:25:   * @returns Lista de itens em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/listarItensImportacao.ts:27:  return async function listarItensImportacao(input: ListarItensImportacaoInput): Promise<Result<ItemImportacao[], ErroApp>> {
packages/core/src/importacoes/usecases/registrarItemImportacao.ts:3:import { ErroApp, IdPorta, RelogioPorta, Result } from "../../kernel";
packages/core/src/importacoes/usecases/registrarItemImportacao.ts:38:   * @returns `Ok(item)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/importacoes/usecases/registrarItemImportacao.ts:40:  return async function registrarItemImportacao(input: RegistrarItemImportacaoInput): Promise<Result<ItemImportacao, ErroApp>> {
packages/core/src/importacoes/validadores.ts:3:import { ErroApp, Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
packages/core/src/importacoes/validadores.ts:18:function mapearErro(resultado: Result<string | number, ErroApp>, campo: string, valor?: unknown): any {
packages/core/src/importacoes/validadores.ts:33:export function validarSolicitarImportacaoInput(input: SolicitarImportacaoInput): Result<SolicitarImportacaoInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:44:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:58:export function validarRegistrarItemImportacaoInput(input: RegistrarItemImportacaoInput): Result<RegistrarItemImportacaoInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:75:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:84:export function validarListarImportacoesLocatarioInput(input: ListarImportacoesLocatarioInput): Result<ListarImportacoesLocatarioInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:88:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:97:export function validarListarItensImportacaoInput(input: ListarItensImportacaoInput): Result<ListarItensImportacaoInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:104:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:113:export function validarMarcarImportacaoEmExecucaoInput(input: MarcarImportacaoEmExecucaoInput): Result<MarcarImportacaoEmExecucaoInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:117:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:126:export function validarMarcarImportacaoConcluidaInput(input: MarcarImportacaoConcluidaInput): Result<MarcarImportacaoConcluidaInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:130:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:143:export function validarMarcarImportacaoComFalhaInput(input: MarcarImportacaoComFalhaInput): Result<MarcarImportacaoComFalhaInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:150:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:159:export function validarMarcarItemImportacaoProcessadoInput(input: MarcarItemImportacaoProcessadoInput): Result<MarcarItemImportacaoProcessadoInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:163:  return wrapOk(input);
packages/core/src/importacoes/validadores.ts:176:export function validarMarcarItemImportacaoComFalhaInput(input: MarcarItemImportacaoComFalhaInput): Result<MarcarItemImportacaoComFalhaInput, ErroApp> {
packages/core/src/importacoes/validadores.ts:183:  return wrapOk(input);
packages/core/src/importacoes/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/importacoes/portasRepositorio.ts:21:  criarImportacao(params: RegistrarImportacaoParams): Promise<Result<Importacao, ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:29:  atualizarImportacao(importacao: Importacao): Promise<Result<Importacao, ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:37:  buscarPorId(importacaoId: ImportacaoId): Promise<Result<Importacao | null, ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:45:  listarPorLocatario(locatarioId: LocatarioId): Promise<Result<Importacao[], ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:61:  criarItem(params: RegistrarItemImportacaoParams): Promise<Result<ItemImportacao, ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:69:  atualizarItem(item: ItemImportacao): Promise<Result<ItemImportacao, ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:77:  buscarPorId(itemImportacaoId: ItemImportacaoId): Promise<Result<ItemImportacao | null, ErroApp>>;
packages/core/src/importacoes/portasRepositorio.ts:86:  listarPorImportacao(importacaoId: ImportacaoId, locatarioId: LocatarioId): Promise<Result<ItemImportacao[], ErroApp>>;
packages/core/src/importacoes/erros.ts:3:import { createErroApp, ErroApp, Result } from "../kernel";
packages/core/src/importacoes/erros.ts:13: * @returns `Err(ErroApp)` específico do pacote `importacoes`.
packages/core/src/importacoes/erros.ts:15:export function erroImportacaoInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
packages/core/src/importacoes/erros.ts:16:  return createErroApp({ codigo: "IMPORTACAO_INVALIDA", detalhes });
packages/core/src/importacoes/erros.ts:23: * @returns `Err(ErroApp)` com contexto da busca.
packages/core/src/importacoes/erros.ts:25:export function erroImportacaoNaoEncontrada(importacaoId: ImportacaoId): Result<never, ErroApp> {
packages/core/src/importacoes/erros.ts:26:  return createErroApp({ codigo: "IMPORTACAO_NAO_ENCONTRADA", detalhes: { importacaoId } });
packages/core/src/importacoes/erros.ts:33: * @returns `Err(ErroApp)` com contexto do item.
packages/core/src/importacoes/erros.ts:35:export function erroItemImportacaoNaoEncontrado(itemImportacaoId: ItemImportacaoId): Result<never, ErroApp> {
packages/core/src/importacoes/erros.ts:36:  return createErroApp({ codigo: "ITEM_IMPORTACAO_NAO_ENCONTRADO", detalhes: { itemImportacaoId } });
packages/core/src/importacoes/erros.ts:47: * @returns `Err(ErroApp)` específico de transição de status inválida.
packages/core/src/importacoes/erros.ts:49:export function erroTransicaoStatusImportacaoInvalida(entidade: string, id: string, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
packages/core/src/importacoes/erros.ts:50:  return createErroApp({ codigo: "IMPORTACAO_TRANSICAO_STATUS_INVALIDA", detalhes: { entidade, id, statusAtual, statusDestino } });
packages/core/src/auditoria/usecases/registrarEventoAuditoriaPlataforma.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/auditoria/usecases/registrarEventoAuditoriaPlataforma.ts:86:    return wrapOk<RegistrarEventoAuditoriaPlataformaOutput>({
packages/core/src/auditoria/usecases/listarAuditoriaLocatario.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/auditoria/usecases/listarAuditoriaLocatario.ts:37:    return wrapOk<ListarAuditoriaLocatarioOutput>({
packages/core/src/auditoria/usecases/registrarEventoAuditoriaLocatario.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/auditoria/usecases/registrarEventoAuditoriaLocatario.ts:77:    return wrapOk<RegistrarEventoAuditoriaLocatarioOutput>({
packages/core/src/auditoria/usecases/listarAuditoriaPlataforma.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/auditoria/usecases/listarAuditoriaPlataforma.ts:37:    return wrapOk<ListarAuditoriaPlataformaOutput>({
packages/core/src/auditoria/politicas.ts:3:import type { Result, ErroApp } from "../kernel";
packages/core/src/auditoria/politicas.ts:26:  autorizar(input: EntradaPoliticaAuditoria): Promise<Result<void, ErroApp>>;
packages/core/src/auditoria/politicas.ts:36:): Promise<Result<void, ErroApp> | null> {
packages/core/src/auditoria/tipos.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/auditoria/tipos.ts:91:  Promise<Result<RegistrarEventoAuditoriaLocatarioOutput, ErroApp>>;
packages/core/src/auditoria/tipos.ts:94:  Promise<Result<RegistrarEventoAuditoriaPlataformaOutput, ErroApp>>;
packages/core/src/auditoria/tipos.ts:134:  Promise<Result<ListarAuditoriaLocatarioOutput, ErroApp>>;
packages/core/src/auditoria/tipos.ts:137:  Promise<Result<ListarAuditoriaPlataformaOutput, ErroApp>>;
packages/core/src/auditoria/validadores.ts:3:import { type ErroApp, type Result, validarIdGenerico, validarNumeroPositivo, validarTextoObrigatorio, wrapOk } from "../kernel";
packages/core/src/auditoria/validadores.ts:15:function mapearErro<T>(resultado: Result<T, ErroApp>, campo: string, valor?: unknown): Result<T, ErroApp> {
packages/core/src/auditoria/validadores.ts:31:function validarLimiteOpcional(limite?: number): Result<number | undefined, ErroApp> {
packages/core/src/auditoria/validadores.ts:32:  if (limite === undefined) return wrapOk(undefined);
packages/core/src/auditoria/validadores.ts:41:  return wrapOk(limite);
packages/core/src/auditoria/validadores.ts:51:function validarIntervaloDatas(criadoDe?: Date, criadoAte?: Date): Result<void, ErroApp> {
packages/core/src/auditoria/validadores.ts:68:  return wrapOk(undefined);
packages/core/src/auditoria/validadores.ts:76:export function validarRegistrarEventoAuditoriaLocatarioInput(input: RegistrarEventoAuditoriaLocatarioInput): Result<RegistrarEventoAuditoriaLocatarioInput, ErroApp> {
packages/core/src/auditoria/validadores.ts:100:  return wrapOk(input);
packages/core/src/auditoria/validadores.ts:108:export function validarRegistrarEventoAuditoriaPlataformaInput(input: RegistrarEventoAuditoriaPlataformaInput): Result<RegistrarEventoAuditoriaPlataformaInput, ErroApp> {
packages/core/src/auditoria/validadores.ts:134:  return wrapOk(input);
packages/core/src/auditoria/validadores.ts:137:export function validarListarAuditoriaLocatarioInput(input: ListarAuditoriaLocatarioInput): Result<ListarAuditoriaLocatarioInput, ErroApp> {
packages/core/src/auditoria/validadores.ts:160:  return wrapOk(input);
packages/core/src/auditoria/validadores.ts:163:export function validarListarAuditoriaPlataformaInput(input: ListarAuditoriaPlataformaInput): Result<ListarAuditoriaPlataformaInput, ErroApp> {
packages/core/src/auditoria/validadores.ts:188:  return wrapOk(input);
packages/core/src/auditoria/portasRepositorio.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/auditoria/portasRepositorio.ts:10:  ): Promise<Result<EventoAuditoriaLocatario, ErroApp>>;
packages/core/src/auditoria/portasRepositorio.ts:14:  ): Promise<Result<EventoAuditoriaLocatario[], ErroApp>>;
packages/core/src/auditoria/portasRepositorio.ts:20:  ): Promise<Result<EventoAuditoriaPlataforma, ErroApp>>;
packages/core/src/auditoria/portasRepositorio.ts:24:  ): Promise<Result<EventoAuditoriaPlataforma[], ErroApp>>;
packages/core/src/auditoria/erros.ts:3:import { createErroApp, ErroApp, Result } from "../kernel";
packages/core/src/auditoria/erros.ts:12: * @returns `Err(ErroApp)` específico do pacote `auditoria`.
packages/core/src/auditoria/erros.ts:14:export function erroAuditoriaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
packages/core/src/auditoria/erros.ts:15:  return createErroApp({ codigo: "AUDITORIA_INVALIDA", mensagem: "Dados de auditoria são inválidos.", detalhes });
packages/core/src/locatarios/maquinaEstados.ts:3:import { ErroApp, Result, transicionarEstado, wrapOk, type TabelaTransicoes } from "../kernel";
packages/core/src/locatarios/maquinaEstados.ts:33:}): Result<LocatarioStatus, ErroApp> {
packages/core/src/locatarios/maquinaEstados.ts:68:export function exigirEstadoOperacionalLocatario(locatario: Locatario): Result<Locatario, ErroApp> {
packages/core/src/locatarios/maquinaEstados.ts:76:  return wrapOk(locatario);
packages/core/src/locatarios/usecases/ativarConfiguracaoLocatario.ts:5:import { executarEmTransacao, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/ativarConfiguracaoLocatario.ts:78:      return wrapOk<AtivarConfiguracaoLocatarioOutput>({
packages/core/src/locatarios/usecases/encerrarLocatario.ts:5:import { executarEmTransacao, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/encerrarLocatario.ts:60:      return wrapOk({ locatario: atualizado.value });
packages/core/src/locatarios/usecases/criarConfiguracaoLocatario.ts:5:import { executarEmTransacao, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/criarConfiguracaoLocatario.ts:110:      return wrapOk<CriarConfiguracaoLocatarioOutput>({
packages/core/src/locatarios/usecases/listarLocatarios.ts:5:import { wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/listarLocatarios.ts:33:   * @returns `Ok({ itens })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/locatarios/usecases/listarLocatarios.ts:44:    return wrapOk<ListarLocatariosOutput>({
packages/core/src/locatarios/usecases/obterLocatario.ts:5:import { wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/obterLocatario.ts:41:   * @returns `Ok(locatario)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/locatarios/usecases/obterLocatario.ts:60:    return wrapOk<ObterLocatarioOutput>({
packages/core/src/locatarios/usecases/helpers.ts:7:import { wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/helpers.ts:27:  return wrapOk(resultado.value);
packages/core/src/locatarios/usecases/helpers.ts:48:  return wrapOk(configuracao);
packages/core/src/locatarios/usecases/atualizarLocatario.ts:7:import { executarEmTransacao, wrapOk, type RelogioPorta, type TransacaoPorta } from "../../kernel";
packages/core/src/locatarios/usecases/atualizarLocatario.ts:93:      return wrapOk<AtualizarLocatarioOutput>({ locatario: atualizado.value });
packages/core/src/locatarios/usecases/suspenderLocatario.ts:6:import { executarEmTransacao, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/suspenderLocatario.ts:60:      return wrapOk({
packages/core/src/locatarios/usecases/criarLocatario.ts:7:import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/criarLocatario.ts:47:   * @returns `Ok({ locatarioId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/locatarios/usecases/criarLocatario.ts:138:      return wrapOk<CriarLocatarioOutput>({
packages/core/src/locatarios/usecases/atualizarConfiguracaoLocatario.ts:5:import { executarEmTransacao, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/atualizarConfiguracaoLocatario.ts:118:      return wrapOk<AtualizarConfiguracaoLocatarioOutput>({
packages/core/src/locatarios/usecases/reativarLocatario.ts:6:import { executarEmTransacao, wrapOk } from "../../kernel";
packages/core/src/locatarios/usecases/reativarLocatario.ts:62:      return wrapOk<ReativarLocatarioOutput>({
packages/core/src/locatarios/politicas.ts:3:import type { Result, ErroApp } from "../kernel";
packages/core/src/locatarios/politicas.ts:35:  autorizar(input: EntradaPoliticaLocatario): Promise<Result<void, ErroApp>>;
packages/core/src/locatarios/politicas.ts:51:export async function autorizarLocatario(deps: DepsPoliticaLocatario, input: EntradaPoliticaLocatario): Promise<Result<void, ErroApp> | null> {
packages/core/src/locatarios/tipos.ts:3:import type { ErroApp, Result, wrapOk } from "../kernel";
packages/core/src/locatarios/tipos.ts:126:export type CriarLocatarioResult = Promise<Result<CriarLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:143:export type ListarLocatariosResult = Promise<Result<ListarLocatariosOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:162:export type ObterLocatarioResult = Promise<Result<ObterLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:185:export type AtualizarLocatarioResult = Promise<Result<AtualizarLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:199:  ReturnType<typeof wrapOk<AtualizarLocatarioOutput>> | ReturnType<typeof locatarioInvalido>
packages/core/src/locatarios/tipos.ts:214:export type ReativarLocatarioResult = Promise<Result<ReativarLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:242:export type CriarConfiguracaoLocatarioResult = Promise<Result<CriarConfiguracaoLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:262:export type AtualizarConfiguracaoLocatarioResult = Promise<Result<AtualizarConfiguracaoLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/tipos.ts:276:export type AtivarConfiguracaoLocatarioResult = Promise<Result<AtivarConfiguracaoLocatarioOutput, ErroApp>>;
packages/core/src/locatarios/validadores.ts:3:import { ErroApp, Result, validarIdGenerico, validarTextoObrigatorio } from "../kernel";
packages/core/src/locatarios/validadores.ts:19:function mapearErro(resultado: Result<string, ErroApp>, campo: string, valor?: unknown): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:34:export function validarNomeLocatario(nome: string): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:44:export function validarLocatarioId(locatarioId: LocatarioId): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:53:export function validarLocatarioSlug(slug: LocatarioSlug): Result<string, ErroApp>{
packages/core/src/locatarios/validadores.ts:62:export function validarEmailLocatario(email: string): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:81:export function validarDocumentoLocatario(documento?: string | null): Result<string | null, ErroApp> {
packages/core/src/locatarios/validadores.ts:103:export function validarFusoHorarioLocatario(fusoHorario?: string): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:118:export function validarConfiguracaoLocatarioId(configuracaoId: ConfiguracaoLocatarioId): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:131:export function validarIdentidadeVisualLocatario(identidadeVisual: string): Result<string, ErroApp> {
packages/core/src/locatarios/validadores.ts:144:export function validarModoTemaLocatario(modoTema?: string): Result<ModoTemaLocatario, ErroApp> {
packages/core/src/locatarios/validadores.ts:165:export function validarCorTema(valor?: string | null, campo = "cor"): Result<string | null, ErroApp> {
packages/core/src/locatarios/validadores.ts:188:export function validarUrlLogoLocatario(urlLogo?: string | null): Result<string | null, ErroApp> {
packages/core/src/locatarios/portasRepositorio.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/locatarios/portasRepositorio.ts:42:  }): Promise<Result<{ locatarioId: LocatarioId }, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:50:  buscarPorId(params: {locatarioId: LocatarioId}): Promise<Result<Locatario | null, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:58:  }): Promise<Result<Locatario | null, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:66:  }): Promise<Result<Locatario | null, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:74:  listar(): Promise<Result<Locatario[], ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:83:  atualizar(locatario: Locatario): Promise<Result<Locatario, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:93:  }): Promise<Result<ConfiguracaoLocatario[], ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:103:  }): Promise<Result<ConfiguracaoLocatario | null, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:122:  }): Promise<Result<{ configuracaoId: string }, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:129:  atualizarConfiguracao(config: ConfiguracaoLocatario): Promise<Result<ConfiguracaoLocatario, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:139:  }): Promise<Result<ConfiguracaoLocatario | null, ErroApp>>;
packages/core/src/locatarios/portasRepositorio.ts:149:  }): Promise<Result<void, ErroApp>>;
packages/core/src/locatarios/erros.ts:3:import { createErroApp } from "../kernel";
packages/core/src/locatarios/erros.ts:24: * @returns `Err(ErroApp)` tipado para o domínio de locatários.
packages/core/src/locatarios/erros.ts:27:  return createErroApp({ codigo: "LOCATARIO_INVALIDO", mensagem: "Dados do locatário são inválidos.", detalhes });
packages/core/src/locatarios/erros.ts:34: * @returns `Err(ErroApp)` com o código específico do módulo.
packages/core/src/locatarios/erros.ts:37:  return createErroApp({ codigo: "LOCATARIO_NAO_ENCONTRADO", mensagem: "Locatário não encontrado.", detalhes: { locatarioId } });
packages/core/src/locatarios/erros.ts:47: * @returns `Err(ErroApp)` com status contextual em `detalhes`.
packages/core/src/locatarios/erros.ts:50:  return createErroApp({ codigo: "LOCATARIO_SUSPENSO", mensagem: "Locatário suspenso.", detalhes: { locatarioId, status: "SUSPENSO" } });
packages/core/src/locatarios/erros.ts:57: * @returns `Err(ErroApp)` com status contextual em `detalhes`.
packages/core/src/locatarios/erros.ts:60:  return createErroApp({ codigo: "LOCATARIO_ENCERRADO", mensagem: "Locatário encerrado.", detalhes: { locatarioId, status: "ENCERRADO" } });
packages/core/src/locatarios/erros.ts:69:  return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO", mensagem: "Locatário ausente no contexto autenticado.", detalhes: { locatarioId } });
packages/core/src/locatarios/erros.ts:78:  return createErroApp({
packages/core/src/locatarios/erros.ts:94:  return createErroApp({
packages/core/src/vendas/usecases/obterTransacao.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/obterTransacao.ts:15:    return wrapOk<ObterTransacaoOutput>({ transacao: transacao.value, itens: itens.value, historico: historico.value });
packages/core/src/vendas/usecases/atualizarItemTransacao.ts:7:import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/atualizarItemTransacao.ts:121:      return wrapOk<AtualizarItemTransacaoOutput>({
packages/core/src/vendas/usecases/adicionarItemTransacao.ts:3:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/adicionarItemTransacao.ts:128:      return wrapOk<AdicionarItemTransacaoOutput>({ 
packages/core/src/vendas/usecases/criarCompra.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/criarCompra.ts:16:      return wrapOk<CriarCompraOutput>({ transacaoId: res.value.transacaoId });
packages/core/src/vendas/usecases/criarVenda.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/criarVenda.ts:16:      return wrapOk<CriarVendaOutput>({ transacaoId: res.value.transacaoId });
packages/core/src/vendas/usecases/listarTransacoes.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/listarTransacoes.ts:13:    return wrapOk<ListarTransacoesOutput>({ itens: res.value });
packages/core/src/vendas/usecases/concluirTransacao.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/concluirTransacao.ts:28:      return wrapOk<ConcluirTransacaoOutput>({ transacao: atualizado.value });
packages/core/src/vendas/usecases/removerItemTransacao.ts:23:  wrapOk,
packages/core/src/vendas/usecases/removerItemTransacao.ts:100:      return wrapOk<RemoverItemTransacaoOutput>({
packages/core/src/vendas/usecases/confirmarTransacao.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/confirmarTransacao.ts:21:      return wrapOk<ConfirmarTransacaoOutput>({ transacao: atualizado.value });
packages/core/src/vendas/usecases/cancelarTransacao.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/vendas/usecases/cancelarTransacao.ts:21:      return wrapOk<CancelarTransacaoOutput>({ transacao: atualizado.value });
packages/core/src/vendas/tipos.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/vendas/tipos.ts:88:export type CriarVendaResult = Promise<Result<CriarVendaOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:92:export type CriarCompraResult = Promise<Result<CriarCompraOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:96:export type ObterTransacaoResult = Promise<Result<ObterTransacaoOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:100:export type ListarTransacoesResult = Promise<Result<ListarTransacoesOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:104:export type AdicionarItemTransacaoResult = Promise<Result<AdicionarItemTransacaoOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:108:export type ConfirmarTransacaoResult = Promise<Result<ConfirmarTransacaoOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:112:export type ConcluirTransacaoResult = Promise<Result<ConcluirTransacaoOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:116:export type CancelarTransacaoResult = Promise<Result<CancelarTransacaoOutput, ErroApp>>;
packages/core/src/vendas/tipos.ts:134:  Result<AtualizarItemTransacaoOutput, ErroApp>
packages/core/src/vendas/tipos.ts:148:  Result<RemoverItemTransacaoOutput, ErroApp>
packages/core/src/vendas/validadores.ts:3:import { createErroApp, wrapOk } from "../kernel";
packages/core/src/vendas/validadores.ts:4:import type { ErroApp, Result } from "../kernel";
packages/core/src/vendas/validadores.ts:8:export function validarLocatarioId(v: unknown): Result<LocatarioId, ErroApp> {
packages/core/src/vendas/validadores.ts:9:  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "vendas.validarLocatarioId" } });
packages/core/src/vendas/validadores.ts:10:  return wrapOk(v.trim() as LocatarioId);
packages/core/src/vendas/validadores.ts:12:export function validarTransacaoId(v: unknown): Result<TransacaoId, ErroApp> {
packages/core/src/vendas/validadores.ts:13:  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Transação inválida.", detalhes: { operacao: "vendas.validarTransacaoId" } });
packages/core/src/vendas/validadores.ts:14:  return wrapOk(v.trim() as TransacaoId);
packages/core/src/vendas/validadores.ts:16:export function validarItemTransacaoId(v: unknown): Result<ItemTransacaoId, ErroApp> {
packages/core/src/vendas/validadores.ts:17:  if (typeof v !== "string" || !v.trim()) return createErroApp({ codigo: "INVALIDO", mensagem: "Item inválido.", detalhes: { operacao: "vendas.validarItemTransacaoId" } });
packages/core/src/vendas/validadores.ts:18:  return wrapOk(v.trim() as ItemTransacaoId);
packages/core/src/vendas/validadores.ts:20:export function validarTipoTransacao(v: unknown): Result<TipoTransacaoComercial, ErroApp> {
packages/core/src/vendas/validadores.ts:21:  if (v !== "VENDA" && v !== "COMPRA") return createErroApp({ codigo: "INVALIDO", mensagem: "Tipo de transação inválido.", detalhes: { operacao: "vendas.validarTipoTransacao" } });
packages/core/src/vendas/validadores.ts:22:  return wrapOk(v);
packages/core/src/vendas/validadores.ts:24:export function validarStatusTransacao(v: unknown): Result<StatusTransacaoComercial, ErroApp> {
packages/core/src/vendas/validadores.ts:25:  if (!["RASCUNHO", "ABERTA", "CONFIRMADA", "CONCLUIDA", "CANCELADA"].includes(String(v))) return createErroApp({ codigo: "INVALIDO", mensagem: "Status de transação inválido.", detalhes: { operacao: "vendas.validarStatusTransacao" } });
packages/core/src/vendas/validadores.ts:26:  return wrapOk(v as StatusTransacaoComercial);
packages/core/src/vendas/validadores.ts:28:export function validarQuantidade(v: unknown): Result<number, ErroApp> {
packages/core/src/vendas/validadores.ts:29:  if (typeof v !== "number" || Number.isNaN(v) || v <= 0) return createErroApp({ codigo: "INVALIDO", mensagem: "Quantidade deve ser maior que zero.", detalhes: { operacao: "vendas.validarQuantidade" } });
packages/core/src/vendas/validadores.ts:30:  return wrapOk(v);
packages/core/src/vendas/validadores.ts:32:export function validarValorNaoNegativo(v: unknown, campo: string): Result<number, ErroApp> {
packages/core/src/vendas/validadores.ts:33:  if (v === undefined || v === null) return wrapOk(0);
packages/core/src/vendas/validadores.ts:34:  if (typeof v !== "number" || Number.isNaN(v) || v < 0) return createErroApp({ codigo: "INVALIDO", mensagem: `${campo} deve ser maior ou igual a zero.`, detalhes: { operacao: "vendas.validarValor", campo } });
packages/core/src/vendas/validadores.ts:35:  return wrapOk(v);
packages/core/src/vendas/validadores.ts:37:export function validarTextoOpcional(v: unknown): Result<string | null, ErroApp> {
packages/core/src/vendas/validadores.ts:38:  if (v === undefined || v === null || v === "") return wrapOk(null);
packages/core/src/vendas/validadores.ts:39:  if (typeof v !== "string") return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "vendas.validarTextoOpcional" } });
packages/core/src/vendas/validadores.ts:40:  return wrapOk(v.trim() || null);
packages/core/src/vendas/validadores.ts:45:    return createErroApp({
packages/core/src/vendas/validadores.ts:51:  return wrapOk(value);
packages/core/src/vendas/validadores.ts:56:    return createErroApp({
packages/core/src/vendas/validadores.ts:62:  return wrapOk(value);
packages/core/src/vendas/validadores.ts:67:    return createErroApp({
packages/core/src/vendas/validadores.ts:73:  return wrapOk(value);
packages/core/src/vendas/portasRepositorio.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/vendas/portasRepositorio.ts:17:  criarTransacao(transacao: TransacaoComercial): Promise<Result<{ transacaoId: TransacaoId }, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:23:  buscarTransacaoPorId(params: { locatarioId: LocatarioId; transacaoId: TransacaoId }): Promise<Result<TransacaoComercial | null, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:29:  listarTransacoes(params: { locatarioId: LocatarioId; tipo?: TipoTransacaoComercial; status?: StatusTransacaoComercial; cursor?: TransacaoId; limite?: number }): Promise<Result<TransacaoComercial[], ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:35:  atualizarTransacao(transacao: TransacaoComercial): Promise<Result<TransacaoComercial, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:41:  criarItem(item: ItemTransacaoComercial): Promise<Result<{ itemTransacaoId: ItemTransacaoId }, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:47:  buscarItemPorId(params: { locatarioId: LocatarioId; transacaoId: TransacaoId; itemTransacaoId: ItemTransacaoId }): Promise<Result<ItemTransacaoComercial | null, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:53:  listarItens(params: { locatarioId: LocatarioId; transacaoId: TransacaoId }): Promise<Result<ItemTransacaoComercial[], ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:59:  atualizarItem(item: ItemTransacaoComercial): Promise<Result<ItemTransacaoComercial, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:65:  criarHistorico(historico: HistoricoTransacaoComercial): Promise<Result<{ historicoId: string }, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:71:  listarHistorico(params: { locatarioId: LocatarioId; transacaoId: TransacaoId }): Promise<Result<HistoricoTransacaoComercial[], ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:76:}): Promise<Result<ItemTransacaoComercial[], ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:82:}): Promise<Result<void, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:93:  obterEstoquePadrao(params: { locatarioId: LocatarioId }): Promise<Result<{ estoqueId: EstoqueId } | null, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:104:  registrarMovimento(movimento: MovimentoEstoqueComercial): Promise<Result<void, ErroApp>>;
packages/core/src/vendas/portasRepositorio.ts:115:  buscarProdutoParaTransacao(params: { locatarioId: LocatarioId; produtoId: ProdutoId }): Promise<Result<{ produtoId: ProdutoId; nome: string; tipo: "PRODUTO" | "SERVICO"; status: "ATIVO" | "INATIVO" | "EXCLUIDO"; precoVenda: number; custoReferencia: number | null }, ErroApp>>;
packages/core/src/vendas/erros.ts:1:import { createErroApp } from "../kernel";
packages/core/src/vendas/erros.ts:5:  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Transação comercial não encontrada.", detalhes: { operacao: "vendas.transacaoNaoEncontrada", transacaoId } });
packages/core/src/vendas/erros.ts:8:  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Item da transação não encontrado.", detalhes: { operacao: "vendas.itemNaoEncontrado", itemTransacaoId } });
packages/core/src/vendas/erros.ts:11:  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Transação não pode ser editada no estado atual.", detalhes: { operacao: "vendas.transacaoNaoEditavel", transacaoId } });
packages/core/src/vendas/erros.ts:14:  return createErroApp({ codigo: "INVALIDO", mensagem: "Transação deve possuir ao menos um item.", detalhes: { operacao: "vendas.transacaoSemItens", transacaoId } });
packages/core/src/vendas/erros.ts:17:  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Transição de estado da transação inválida.", detalhes: { operacao: "vendas.transicaoInvalida", transacaoId, estadoAtual, evento } });
packages/core/src/vendas/erros.ts:20:  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Estoque padrão não encontrado para o locatário.", detalhes: { operacao: "vendas.estoquePadraoNaoEncontrado" } });
packages/core/src/vendas/erros.ts:24:  return createErroApp({
packages/core/src/fornecedores/usecases/reativarFornecedor.ts:1:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/reativarFornecedor.ts:17:      return wrapOk<ReativarFornecedorOutput>({ fornecedor: atualizado.value });
packages/core/src/fornecedores/usecases/listarFornecedores.ts:1:import { wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/listarFornecedores.ts:11:    return wrapOk<ListarFornecedorsOutput>({ itens: res.value });
packages/core/src/fornecedores/usecases/inativarFornecedor.ts:1:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/inativarFornecedor.ts:17:      return wrapOk<InativarFornecedorOutput>({ fornecedor: atualizado.value });
packages/core/src/fornecedores/usecases/excluirFornecedor.ts:7:import { executarEmTransacao, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/excluirFornecedor.ts:40:      return wrapOk<ExcluirFornecedorOutput>({
packages/core/src/fornecedores/usecases/criarFornecedor.ts:1:import { executarEmTransacao, type IdPorta, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/criarFornecedor.ts:18:      return wrapOk<CriarFornecedorOutput>({ fornecedorId: res.value.fornecedorId });
packages/core/src/fornecedores/usecases/obterFornecedor.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/obterFornecedor.ts:32:    return wrapOk<ObterFornecedorOutput>({ fornecedor: res.value });
packages/core/src/fornecedores/usecases/atualizarFornecedor.ts:1:import { executarEmTransacao, type RelogioPorta, type TransacaoPorta, wrapOk } from "../../kernel";
packages/core/src/fornecedores/usecases/atualizarFornecedor.ts:21:      return wrapOk<AtualizarFornecedorOutput>({ fornecedor: atualizado.value });
packages/core/src/fornecedores/tipos.ts:3:import type { ErroApp, Result } from "../kernel";
packages/core/src/fornecedores/tipos.ts:27:export type CriarFornecedorResult = Promise<Result<CriarFornecedorOutput, ErroApp>>;
packages/core/src/fornecedores/tipos.ts:31:export type ObterFornecedorResult = Promise<Result<ObterFornecedorOutput, ErroApp>>;
packages/core/src/fornecedores/tipos.ts:35:export type ListarFornecedorsResult = Promise<Result<ListarFornecedorsOutput, ErroApp>>;
packages/core/src/fornecedores/tipos.ts:39:export type AtualizarFornecedorResult = Promise<Result<AtualizarFornecedorOutput, ErroApp>>;
packages/core/src/fornecedores/tipos.ts:43:export type InativarFornecedorResult = Promise<Result<InativarFornecedorOutput, ErroApp>>;
packages/core/src/fornecedores/tipos.ts:47:export type ReativarFornecedorResult = Promise<Result<ReativarFornecedorOutput, ErroApp>>;
packages/core/src/fornecedores/tipos.ts:60:export type ExcluirFornecedorResult = Promise<Result<ExcluirFornecedorOutput, ErroApp>>;
packages/core/src/fornecedores/validadores.ts:3:import { createErroApp, wrapOk } from "../kernel";
packages/core/src/fornecedores/validadores.ts:4:import type { ErroApp, Result } from "../kernel";
packages/core/src/fornecedores/validadores.ts:8:export function validarLocatarioId(locatarioId: unknown): Result<LocatarioId, ErroApp> {
packages/core/src/fornecedores/validadores.ts:10:    return createErroApp({ codigo: "LOCATARIO_OBRIGATORIO" as never, mensagem: "Locatário obrigatório.", detalhes: { operacao: "fornecedors.validarLocatarioId" } });
packages/core/src/fornecedores/validadores.ts:12:  return wrapOk(locatarioId.trim() as LocatarioId);
packages/core/src/fornecedores/validadores.ts:15:export function validarFornecedorId(fornecedorId: unknown): Result<FornecedorId, ErroApp> {
packages/core/src/fornecedores/validadores.ts:17:    return createErroApp({ codigo: "INVALIDO", mensagem: "Fornecedor inválido.", detalhes: { operacao: "fornecedors.validarFornecedorId" } });
packages/core/src/fornecedores/validadores.ts:19:  return wrapOk(fornecedorId.trim() as FornecedorId);
packages/core/src/fornecedores/validadores.ts:22:export function validarNomeFornecedor(nome: unknown): Result<string, ErroApp> {
packages/core/src/fornecedores/validadores.ts:24:    return createErroApp({ codigo: "INVALIDO", mensagem: "Nome do fornecedor deve conter ao menos 2 caracteres.", detalhes: { operacao: "fornecedors.validarNome" } });
packages/core/src/fornecedores/validadores.ts:26:  return wrapOk(nome.trim());
packages/core/src/fornecedores/validadores.ts:29:export function validarEmailOpcional(email: unknown): Result<string | null, ErroApp> {
packages/core/src/fornecedores/validadores.ts:30:  if (email === undefined || email === null || email === "") return wrapOk(null);
packages/core/src/fornecedores/validadores.ts:32:    return createErroApp({ codigo: "INVALIDO", mensagem: "E-mail inválido.", detalhes: { operacao: "fornecedors.validarEmail" } });
packages/core/src/fornecedores/validadores.ts:34:  return wrapOk(email.trim().toLowerCase());
packages/core/src/fornecedores/validadores.ts:37:export function validarTextoOpcional(valor: unknown): Result<string | null, ErroApp> {
packages/core/src/fornecedores/validadores.ts:38:  if (valor === undefined || valor === null || valor === "") return wrapOk(null);
packages/core/src/fornecedores/validadores.ts:40:    return createErroApp({ codigo: "INVALIDO", mensagem: "Texto inválido.", detalhes: { operacao: "fornecedors.validarTextoOpcional" } });
packages/core/src/fornecedores/validadores.ts:42:  return wrapOk(valor.trim() || null);
packages/core/src/fornecedores/portasRepositorio.ts:1:import type { ErroApp, Result } from "../kernel";
packages/core/src/fornecedores/portasRepositorio.ts:13:  criar(fornecedor: Fornecedor): Promise<Result<{ fornecedorId: FornecedorId }, ErroApp>>;
packages/core/src/fornecedores/portasRepositorio.ts:19:  buscarPorId(params: { locatarioId: LocatarioId; fornecedorId: FornecedorId }): Promise<Result<Fornecedor | null, ErroApp>>;
packages/core/src/fornecedores/portasRepositorio.ts:25:  listarPorLocatario(params: { locatarioId: LocatarioId; cursor?: FornecedorId; limite?: number }): Promise<Result<Fornecedor[], ErroApp>>;
packages/core/src/fornecedores/portasRepositorio.ts:31:  atualizar(fornecedor: Fornecedor): Promise<Result<Fornecedor, ErroApp>>;
packages/core/src/fornecedores/erros.ts:1:import { createErroApp } from "../kernel";
packages/core/src/fornecedores/erros.ts:5:  return createErroApp({ codigo: "NAO_ENCONTRADO", mensagem: "Fornecedor não encontrado.", detalhes: { operacao: "fornecedors.naoEncontrado", fornecedorId } });
packages/core/src/fornecedores/erros.ts:9:  return createErroApp({ codigo: "NAO_AUTORIZADO", mensagem: "Fornecedor inativo não pode ser utilizado.", detalhes: { operacao: "fornecedors.inativo", fornecedorId } });
packages/core/src/assinaturas/usecases/cancelarAssinatura.ts:3:import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/cancelarAssinatura.ts:40: * @returns `Ok(assinaturaAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/cancelarAssinatura.ts:80:      return wrapOk<CancelarAssinaturaOutput>({
packages/core/src/assinaturas/usecases/ativarAssinatura.ts:3:import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/ativarAssinatura.ts:39: * @returns `Ok(assinaturaAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/ativarAssinatura.ts:72:      return wrapOk<AtivarAssinaturaOutput>({
packages/core/src/assinaturas/usecases/vincularModuloNaAssinatura.ts:3:import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/vincularModuloNaAssinatura.ts:45: * @returns `Ok(void)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/vincularModuloNaAssinatura.ts:91:      return wrapOk<VincularModuloNaAssinaturaOutput>({
packages/core/src/assinaturas/usecases/helpers.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/helpers.ts:34:  return wrapOk(assinatura.value);
packages/core/src/assinaturas/usecases/listarModulosHabilitadosLocatario.ts:3:import { wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/listarModulosHabilitadosLocatario.ts:41: * ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/listarModulosHabilitadosLocatario.ts:86:    return wrapOk<ListarModulosHabilitadosLocatarioOutput>({
packages/core/src/assinaturas/usecases/criarAssinatura.ts:3:import { IdPorta, RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/criarAssinatura.ts:42: * @returns `Ok({ assinatura })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/criarAssinatura.ts:77:    return wrapOk<CriarAssinaturaOutput>({ assinatura: criada.value });
packages/core/src/assinaturas/usecases/suspenderAssinatura.ts:3:import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/suspenderAssinatura.ts:39: * @returns `Ok(assinaturaAtualizada)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/suspenderAssinatura.ts:73:      return wrapOk<SuspenderAssinaturaOutput>({
packages/core/src/assinaturas/usecases/desvincularModuloDaAssinatura.ts:3:import { executarEmTransacao, TransacaoPorta, RelogioPorta, wrapOk } from "../../kernel";
packages/core/src/assinaturas/usecases/desvincularModuloDaAssinatura.ts:43: * @returns `Ok(void)` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
packages/core/src/assinaturas/usecases/desvincularModuloDaAssinatura.ts:81:      return wrapOk<DesvincularModuloDaAssinaturaOutput>({
packages/core/src/assinaturas/politicas.ts:3:import type { Result, ErroApp } from "../kernel";
packages/core/src/assinaturas/politicas.ts:28:  autorizar(input: EntradaPoliticaAssinatura): Promise<Result<void, ErroApp>>;
packages/core/src/assinaturas/politicas.ts:35:export async function autorizarAssinatura(deps: DepsPoliticaSegurancaAssinaturas, input: EntradaPoliticaAssinatura): Promise<Result<void, ErroApp> | null> {
packages/core/src/assinaturas/tipos.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/assinaturas/tipos.ts:95:export type AtivarAssinaturaResult = Promise<Result<AtivarAssinaturaOutput, ErroApp>>;
packages/core/src/assinaturas/tipos.ts:119:export type CancelarAssinaturaResult = Promise<Result<CancelarAssinaturaOutput, ErroApp>>;
packages/core/src/assinaturas/tipos.ts:144:export type CriarAssinaturaResult = Promise<Result<CriarAssinaturaOutput, ErroApp>>;
packages/core/src/assinaturas/tipos.ts:168:export type DesvincularModuloDaAssinaturaResult = Promise<Result<DesvincularModuloDaAssinaturaOutput, ErroApp>>;
packages/core/src/assinaturas/tipos.ts:193:export type ListarModulosHabilitadosLocatarioResult = Promise<Result<ListarModulosHabilitadosLocatarioOutput, ErroApp>>;
packages/core/src/assinaturas/tipos.ts:215:export type SuspenderAssinaturaResult = Promise<Result<SuspenderAssinaturaOutput, ErroApp>>;
packages/core/src/assinaturas/tipos.ts:241:export type VincularModuloNaAssinaturaResult = Promise<Result<VincularModuloNaAssinaturaOutput, ErroApp>>;
packages/core/src/assinaturas/validadores.ts:3:import { ErroApp, Result, validarData, validarIdGenerico, wrapOk } from "../kernel";
packages/core/src/assinaturas/validadores.ts:18:function mapearErro(resultado: Result<string | Date, ErroApp>, campo: string, valor?: unknown): any {
packages/core/src/assinaturas/validadores.ts:34:export function validarCriarAssinaturaInput(input: CriarAssinaturaInput): Result<CriarAssinaturaInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:46:  return wrapOk(input);
packages/core/src/assinaturas/validadores.ts:55:export function validarAtivarAssinaturaInput(input: AtivarAssinaturaInput): Result<AtivarAssinaturaInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:59:  return wrapOk(input);
packages/core/src/assinaturas/validadores.ts:68:export function validarSuspenderAssinaturaInput(input: SuspenderAssinaturaInput): Result<SuspenderAssinaturaInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:72:  return wrapOk(input);
packages/core/src/assinaturas/validadores.ts:85:export function validarCancelarAssinaturaInput(input: CancelarAssinaturaInput): Result<CancelarAssinaturaInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:94:  return wrapOk(input);
packages/core/src/assinaturas/validadores.ts:104:): Result<VincularModuloNaAssinaturaInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:111:  return wrapOk(input);
packages/core/src/assinaturas/validadores.ts:121:): Result<DesvincularModuloDaAssinaturaInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:128:  return wrapOk(input);
packages/core/src/assinaturas/validadores.ts:136:export function validarListarModulosHabilitadosLocatarioInput(input: ListarModulosHabilitadosLocatarioInput): Result<ListarModulosHabilitadosLocatarioInput, ErroApp> {
packages/core/src/assinaturas/validadores.ts:145:  return wrapOk(input);
packages/core/src/assinaturas/portasRepositorio.ts:3:import { ErroApp, Result } from "../kernel";
packages/core/src/assinaturas/portasRepositorio.ts:22:  criarAssinatura(params: RegistrarAssinaturaParams): Promise<Result<Assinatura, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:30:  atualizarAssinatura(assinatura: Assinatura): Promise<Result<Assinatura, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:38:  buscarPorId(assinaturaId: AssinaturaId): Promise<Result<Assinatura | null, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:46:  buscarAssinaturaAtivaPorLocatario(locatarioId: LocatarioId): Promise<Result<Assinatura | null, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:62:  vincularModulo(params: RegistrarModuloAssinaturaParams): Promise<Result<ModuloHabilitadoAssinatura, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:72:  desvincularModulo(assinaturaId: AssinaturaId, moduloId: ModuloId, desabilitadoEm: Date): Promise<Result<void, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:81:  buscarModuloVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Promise<Result<ModuloHabilitadoAssinatura | null, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:89:  listarModulosAtivosDaAssinatura(assinaturaId: AssinaturaId): Promise<Result<ModuloHabilitadoAssinatura[], ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:105:  validarPlanoAtivo(planoId: PlanoId): Promise<Result<ValidarPlanoAtivoResult | null, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:121:  validarModuloAtivo(moduloId: ModuloId): Promise<Result<ValidarModuloExistenteResult | null, ErroApp>>;
packages/core/src/assinaturas/portasRepositorio.ts:128:  listarModulosGratis(): Promise<Result<ListarModulosGratisResult[], ErroApp>>;
packages/core/src/assinaturas/erros.ts:3:import { createErroApp, ErroApp, Result } from "../kernel";
packages/core/src/assinaturas/erros.ts:22: * @returns `Err(ErroApp)` específico do pacote `assinaturas`.
packages/core/src/assinaturas/erros.ts:24:export function erroAssinaturaInvalida(detalhes?: Record<string, unknown>): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:25:  return createErroApp({ codigo: "ASSINATURA_INVALIDA", mensagem: "Dados da assinatura são inválidos.", detalhes });
packages/core/src/assinaturas/erros.ts:32: * @returns `Err(ErroApp)` com contexto da busca.
packages/core/src/assinaturas/erros.ts:34:export function erroAssinaturaNaoEncontrada(assinaturaId: AssinaturaId): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:35:  return createErroApp({ codigo: "ASSINATURA_NAO_ENCONTRADA", mensagem: "Assinatura não encontrada.", detalhes: { assinaturaId } });
packages/core/src/assinaturas/erros.ts:42: * @returns `Err(ErroApp)` específico de conflito de negócio.
packages/core/src/assinaturas/erros.ts:44:export function erroAssinaturaJaExisteParaLocatario(locatarioId: LocatarioId): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:45:  return createErroApp({ codigo: "ASSINATURA_ATIVA_JA_EXISTE", mensagem: "Já existe uma assinatura ativa para este locatário.", detalhes: { locatarioId } });
packages/core/src/assinaturas/erros.ts:54: * @returns `Err(ErroApp)` específico de fluxo de estado.
packages/core/src/assinaturas/erros.ts:56:export function erroTransicaoStatusInvalida(assinaturaId: AssinaturaId, statusAtual: string, statusDestino: string): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:57:  return createErroApp({ codigo: "ASSINATURA_TRANSICAO_STATUS_INVALIDA", mensagem: "A transição de status da assinatura é inválida.", detalhes: { assinaturaId, statusAtual, statusDestino } });
packages/core/src/assinaturas/erros.ts:64: * @returns `Err(ErroApp)` específico de validação de plano.
packages/core/src/assinaturas/erros.ts:66:export function erroPlanoInvalido(planoId: PlanoId): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:67:  return createErroApp({ codigo: "PLANO_INVALIDO", mensagem: "Plano inválido ou inativo.", detalhes: { planoId } });
packages/core/src/assinaturas/erros.ts:74: * @returns `Err(ErroApp)` específico do domínio comercial.
packages/core/src/assinaturas/erros.ts:76:export function erroModuloInvalido(moduloId: ModuloId): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:77:  return createErroApp({ codigo: "MODULO_INVALIDO", mensagem: "Módulo inválido ou inativo.", detalhes: { moduloId } });
packages/core/src/assinaturas/erros.ts:85: * @returns `Err(ErroApp)` específico de conflito de vínculo.
packages/core/src/assinaturas/erros.ts:87:export function erroModuloJaVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:88:  return createErroApp({ codigo: "MODULO_ASSINATURA_JA_VINCULADO", mensagem: "O módulo já está vinculado à assinatura.", detalhes: { assinaturaId, moduloId } });
packages/core/src/assinaturas/erros.ts:96: * @returns `Err(ErroApp)` específico de vínculo inexistente.
packages/core/src/assinaturas/erros.ts:98:export function erroModuloNaoVinculado(assinaturaId: AssinaturaId, moduloId: ModuloId): Result<never, ErroApp> {
packages/core/src/assinaturas/erros.ts:99:  return createErroApp({ codigo: "MODULO_ASSINATURA_NAO_VINCULADO", mensagem: "O módulo não está vinculado à assinatura.", detalhes: { assinaturaId, moduloId } });

## Possíveis try/catch no Core
packages/core/src/kernel/ROPHelpers.ts:62:  try {
packages/core/src/kernel/ROPHelpers.ts:64:  } catch (e) {
packages/core/src/kernel/ROPHelpers.ts:86:  try {
packages/core/src/kernel/ROPHelpers.ts:88:  } catch (e) {
packages/core/src/auditoria/usecases/registrarEventoAuditoriaPlataforma.ts:29:    try {
packages/core/src/auditoria/usecases/registrarEventoAuditoriaLocatario.ts:29:    try {
packages/core/src/locatarios/validadores.ts:198:  try {
