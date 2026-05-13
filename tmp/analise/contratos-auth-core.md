# Contratos Auth Core

packages/core/src/auth/usecases/rotacionarRefresh.ts:69:    const refreshValido = await deps.tokensPorta.validarRefresh({
packages/core/src/auth/usecases/rotacionarRefresh.ts:78:    const accessRes = await deps.jwtPorta.emitirAccessToken({
packages/core/src/auth/usecases/rotacionarRefresh.ts:89:      const novoRefresh = await deps.tokensPorta.criarRefresh({
packages/core/src/auth/usecases/logout.ts:41:    const refreshValido = await deps.tokensPorta.validarRefresh({
packages/core/src/auth/usecases/emitirSessaoPlataforma.ts:89:    const senhaOk = await deps.hashPorta.compararSenha(
packages/core/src/auth/usecases/emitirSessaoPlataforma.ts:122:    const accessTokenResult = await deps.jwtPorta.emitirAccessToken({
packages/core/src/auth/usecases/emitirSessaoPlataforma.ts:135:    const refreshHash = await deps.hashPorta.gerarHashRefresh(
packages/core/src/auth/usecases/emitirSessaoPlataforma.ts:141:    const persistir = await deps.tokensPorta.criarRefresh({
packages/core/src/auth/usecases/emitirSessao.ts:142:    const senhaOk = await deps.hashPorta.compararSenha(
packages/core/src/auth/usecases/emitirSessao.ts:165:    const accessRes = await deps.jwtPorta.emitirAccessToken({
packages/core/src/auth/usecases/emitirSessao.ts:176:      return deps.tokensPorta.criarRefresh({
packages/core/src/auth/tipos.ts:42:export type UsuarioAuth = {
packages/core/src/auth/tipos.ts:53:export type LocatarioAuth = {
packages/core/src/auth/tipos.ts:64:export interface JwtPayloadAuth {
packages/core/src/auth/index.ts:29:export type { HashAuthPorta, JwtAuthPorta, TokensAuthPorta, RbacAuthPorta, EventosSegurancaPorta } from "./portasServico";
packages/core/src/auth/index.ts:31:export type { LocatariosRepositorioAuth, UsuariosRepositorioAuth } from "./portasRepositorio";
packages/core/src/auth/portasServico.ts:14:export interface HashAuthPorta {
packages/core/src/auth/portasServico.ts:19:  gerarHashSenha(senha: string): Promise<Result<string, ErroApp>>;
packages/core/src/auth/portasServico.ts:27:  compararSenha(senha: string, senhaHash: string): Promise<Result<boolean, ErroApp>>;
packages/core/src/auth/portasServico.ts:36:export interface JwtAuthPorta {
packages/core/src/auth/portasServico.ts:43:  emitirAccessToken(params: {
packages/core/src/auth/portasServico.ts:86:export interface TokensAuthPorta {
packages/core/src/auth/portasServico.ts:93:  criarRefresh(params: {
packages/core/src/auth/portasServico.ts:112:  validarRefresh(params: {
packages/core/src/auth/portasServico.ts:141:export interface RbacAuthPorta {
packages/core/src/auth/portasRepositorio.ts:15:export interface UsuariosRepositorioAuth {
packages/core/src/auth/portasRepositorio.ts:44:export interface LocatariosRepositorioAuth {
packages/core/src/auth/erros.ts:5:export type CodigoErroAuth =
packages/core/src/kernel/portasGenericas.ts:59:  gerarHash(textoPlano: string): Promise<string>;
packages/core/src/kernel/portasGenericas.ts:68:  comparar(textoPlano: string, hash: string): Promise<boolean>;
