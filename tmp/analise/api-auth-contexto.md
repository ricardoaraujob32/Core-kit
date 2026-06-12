# Análise API Auth / Contexto

## Possíveis pontos de composição de auth
apps/api/src/infra/prisma/auth/TransacaoPorta.ts:17: *   de montagem, como `criarAuthHttpRuntime` ou equivalente.
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:15:import { AuthRuntimeTechnicalPorts, createAuthRuntimeFromDeps } from "./authRuntimeFromDeps";
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:19: * Parâmetros opcionais para composição do runtime técnico da borda.
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:76: * - este runtime NÃO abre contexto SQL;
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:122: * compondo um runtime sobre o `tx` contextualizado.
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:127: * - o runtime contextualizado reaproveita os mesmos composers do runtime base.
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:137:  fn: (runtime: ReturnType<typeof createAuthRuntimeBase>) => Promise<T>,
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:145:      const runtime = createAuthRuntimeFromDeps(null, deps, technical);
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:146:      return fn(runtime);
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:23:  emitirSessaoDeps: {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:35:  emitirSessaoPlataformaDeps: {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:45:  rotacionarRefreshDeps: {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:54:  validarSessaoDeps: {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:64:  resolverContextoAutorizadoDeps: {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:91:  const emitirSessaoDeps = {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:103:  const emitirSessaoPlataformaDeps = {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:113:  const rotacionarRefreshDeps = {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:122:  const validarSessaoDeps = {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:132:  const resolverContextoAutorizadoDeps = {
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:145:    emitirSessaoDeps,
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:146:    emitirSessaoPlataformaDeps,
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:147:    rotacionarRefreshDeps,
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:148:    validarSessaoDeps,
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:150:    resolverContextoAutorizadoDeps,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:1:// apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:7:import { createFnEmitirSessaoPlataforma } from "packages/core/src/auth/usecases/emitirSessaoPlataforma";
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:10: * Portas técnicas já resolvidas para a composição do runtime.
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:19: * Cria o runtime final de auth a partir de deps já montadas.
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:33:  const validarSessao = createFnValidarSessao(deps.validarSessaoDeps);
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:34:  const emitirSessao = createFnEmitirSessao(deps.emitirSessaoDeps);
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:35:  const emitirSessaoPlataforma = createFnEmitirSessaoPlataforma(deps.emitirSessaoPlataformaDeps);
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:36:  const rotacionarRefresh = createFnRotacionarRefresh(deps.rotacionarRefreshDeps);
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:44:    emitirSessao,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:45:    emitirSessaoPlataforma,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:46:    rotacionarRefresh,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:47:    validarSessao,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:50:    emitirSessaoDeps: deps.emitirSessaoDeps,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:51:    rotacionarRefreshDeps: deps.rotacionarRefreshDeps,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:52:    validarSessaoDeps: deps.validarSessaoDeps,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:54:    resolverContextoAutorizadoDeps: deps.resolverContextoAutorizadoDeps,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:58:    async resolverContextoAutorizado(input: {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:66:      console.log("[autorizacao.runtime.resolverContextoAutorizado.start]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:74:        console.error("[autorizacao.runtime.resolverContextoAutorizado.err][sem-usuario]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:79:        throw new Error("resolverContextoAutorizado requer usuarioId.");
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:89:      console.log("[autorizacao.runtime.resolverContextoAutorizado.ctxBase]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:102:        console.error("[auth.runtime.resolverContextoAutorizado.err][modulos]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:111:      console.log("[auth.runtime.resolverContextoAutorizado.modulos]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:124:        console.error("[autorizacao.runtime.resolverContextoAutorizado.err][snapshot]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:133:      console.log("[autorizacao.runtime.resolverContextoAutorizado.snapshot]", {
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:155:      console.log("[autorizacao.runtime.resolverContextoAutorizado.ok]", {
apps/api/src/infra/prisma/autorizacao/autorizacaoHttpRuntime.ts:22: * - este runtime não abre contexto SQL;
apps/api/src/infra/prisma/autorizacao/autorizacaoUseCaseDeps.ts:10:  resolverContextoAutorizadoDeps: {
apps/api/src/infra/prisma/autorizacao/autorizacaoUseCaseDeps.ts:23: * Traduz adapters concretos para os blocos de dependências usados pelo runtime.
apps/api/src/infra/prisma/autorizacao/autorizacaoUseCaseDeps.ts:30:    resolverContextoAutorizadoDeps: {
apps/api/src/infra/prisma/autorizacao/autorizacaoRuntimeFromDeps.ts:9: * Cria o runtime final de autorização a partir de deps já montadas.
apps/api/src/infra/prisma/autorizacao/autorizacaoRuntimeFromDeps.ts:23:    resolverContextoAutorizadoDeps: deps.resolverContextoAutorizadoDeps,
apps/api/src/infra/prisma/autorizacao/autorizacaoRuntimeFromDeps.ts:26:    resolverContextoAutorizado: createFnResolverContextoAutorizado(
apps/api/src/infra/prisma/autorizacao/autorizacaoRuntimeFromDeps.ts:27:      deps.resolverContextoAutorizadoDeps,
apps/api/src/bootstrap/authBootstrap.ts:8:  runtime: ReturnType<typeof createAuthHttpRuntime>;
apps/api/src/bootstrap/authBootstrap.ts:17: * - compor runtime oficial de auth;
apps/api/src/bootstrap/authBootstrap.ts:24:  const runtime = createAuthHttpRuntime(
apps/api/src/bootstrap/authBootstrap.ts:33:    runtime,
apps/api/src/bootstrap/authorizationBootstrap.ts:9:  runtime: ReturnType<typeof createAutorizacaoHttpRuntime>;
apps/api/src/bootstrap/authorizationBootstrap.ts:21: * - instanciar o runtime oficial de autorização;
apps/api/src/bootstrap/authorizationBootstrap.ts:26:  const runtime = createAutorizacaoHttpRuntime();
apps/api/src/bootstrap/authorizationBootstrap.ts:53:    runtime,
apps/api/src/bootstrap/authorizationBootstrap.ts:70:      "Authorization bootstrap ainda não foi inicializado. Execute o application bootstrap antes de usar o runtime.",
apps/api/src/middlewares/authGuard.ts:14:  validarSessao: ReturnType<typeof createAuthHttpRuntime>["validarSessao"];
apps/api/src/middlewares/authGuard.ts:20:const authRuntime = createAuthHttpRuntime();
apps/api/src/middlewares/authGuard.ts:32:  validarSessao: authRuntime.validarSessao,
apps/api/src/middlewares/authGuard.ts:97:    const resultado = await request.server.applicationBootstrap.auth.runtime.validarSessao({
apps/api/src/modules/auth/auth.plataforma.controller.ts:20:  const resultado = await getAuthBootstrap().runtime.emitirSessaoPlataforma({
apps/api/src/modules/auth/auth.controller.ts:39: * 1. cria runtime de auth;
apps/api/src/modules/auth/auth.controller.ts:40: * 2. executa `emitirSessao`;
apps/api/src/modules/auth/auth.controller.ts:53:  const resultado = await getAuthBootstrap().runtime.emitirSessao({
apps/api/src/modules/auth/auth.controller.ts:118: * 1. cria runtime de auth;
apps/api/src/modules/auth/auth.controller.ts:119: * 2. executa `rotacionarRefresh`;
apps/api/src/modules/auth/auth.controller.ts:128:  // const resultado = await authRuntime.rotacionarRefresh({
apps/api/src/modules/auth/auth.controller.ts:133:  // await auditar(criarContextoAuditoriaAuth(request, { locatarioId: request.body.locatarioId, agenteTipo: "TOKEN_REFRESH", }),
apps/api/src/modules/auth/auth.controller.ts:167:    const resultado = await getAuthBootstrap().runtime.rotacionarRefresh({
apps/api/src/modules/auth/auth.controller.ts:221:  const resultado = await getAuthBootstrap().runtime.logout({
apps/api/src/modules/clientes/clientes.controller.ts:18:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/clientes/clientes.controller.ts:19:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/clientes/clientes.controller.ts:20:    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
apps/api/src/modules/usuarios/usuarios.controller.ts:22: * - reaproveitar `relogio`, `idPorta` e `hashPorta` do runtime oficial de auth.
apps/api/src/modules/usuarios/usuarios.controller.ts:31:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/usuarios/usuarios.controller.ts:32:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/usuarios/usuarios.controller.ts:33:    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
apps/api/src/modules/usuarios/usuarios.controller.ts:34:    hashPorta: getAuthBootstrap().runtime.emitirSessaoDeps.hashPorta,
apps/api/src/modules/usuarios/usuarios.controller.ts:184: * 2. gera hash da senha via porta técnica oficial do runtime de auth;
apps/api/src/modules/usuarios/usuarios.controller.ts:209:  const senhaHashRes = await getAuthBootstrap().runtime.emitirSessaoDeps.hashPorta.gerarHashSenha(body.senha);
apps/api/src/modules/usuarios/usuarios.senha.controller.ts:18:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/usuarios/usuarios.senha.controller.ts:19:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/produtos/produtos.controller.ts:18:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/produtos/produtos.controller.ts:19:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/produtos/produtos.controller.ts:20:    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
apps/api/src/modules/locatarios/locatarios.controller.ts:28:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/locatarios/locatarios.controller.ts:29:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/locatarios/locatarios.controller.ts:30:    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
apps/api/src/modules/vendas/vendas.controller.ts:26:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/vendas/vendas.controller.ts:27:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/vendas/vendas.controller.ts:28:    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
apps/api/src/modules/fornecedores/fornecedores.controller.ts:18:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/modules/fornecedores/fornecedores.controller.ts:19:    relogio: getAuthBootstrap().runtime.emitirSessaoDeps.relogio,
apps/api/src/modules/fornecedores/fornecedores.controller.ts:20:    idPorta: getAuthBootstrap().runtime.emitirSessaoDeps.idPorta,
apps/api/src/modules/assinaturas/assinaturaModulos.controller.ts:25:    relogio: getAuthBootstrap().runtime.technical.relogio,
apps/api/src/modules/assinaturas/assinaturaModulos.controller.ts:26:    transacao: getAuthBootstrap().runtime.transacao,
apps/api/src/http/context.ts:12: * - o runtime concreto é fornecido pelo bootstrap da aplicação;
apps/api/src/http/context.ts:15:type ResolverContextoAutorizadoFn = ReturnType<typeof getAuthorizationBootstrap>["runtime"]["resolverContextoAutorizado"];
apps/api/src/http/context.ts:20:type ListarModulosHabilitadosFn = ReturnType<typeof getAuthorizationBootstrap>["runtime"]["listarModulosHabilitados"];
apps/api/src/http/context.ts:33:  resolverContextoAutorizado: ResolverContextoAutorizadoFn;
apps/api/src/http/context.ts:56: * - este arquivo não recompõe runtime localmente.
apps/api/src/http/context.ts:59:  get resolverContextoAutorizado() {
apps/api/src/http/context.ts:60:    return getAuthorizationBootstrap().runtime.resolverContextoAutorizado;
apps/api/src/http/context.ts:63:    return getAuthorizationBootstrap().runtime.listarModulosHabilitados;
apps/api/src/http/context.ts:175: * 3. resolve autorização via Core (`resolverContextoAutorizado`);
apps/api/src/http/context.ts:262:    const contextoAutorizado = await deps.resolverContextoAutorizado({
apps/api/src/http/context.ts:272:      console.error("[http.contexto.build.err][resolverContextoAutorizado]", {

## Possíveis aberturas de contexto SQL/RLS
apps/api/src/infra/prisma/execucaoComContexto.ts:11: * - RLS;
apps/api/src/infra/prisma/execucaoComContexto.ts:53:export async function executarComContexto<T>(prisma: PrismaClient, contexto: ContextoBanco, 
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:38: * - este adapter não deve abrir contexto SQL por conta própria;
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:59:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:65:            locatario_id: true,
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:78:          locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:102:     * - o contexto SQL, quando necessário, deve ser aberto pela composição.
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:138:            locatario_id: null,
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:143:            locatario_id: true,
apps/api/src/infra/prisma/auth/usuario/usuariosRepositorioAuthPrisma.ts:154:                locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auth/authPrismaContexto.ts:5:import { executarComContexto } from "../execucaoComContexto";
apps/api/src/infra/prisma/auth/authPrismaContexto.ts:31: * com contexto SQL previamente propagado ao banco.
apps/api/src/infra/prisma/auth/authPrismaContexto.ts:39: * - * - este helper é o ponto oficial de abertura de contexto SQL/RLS para auth;
apps/api/src/infra/prisma/auth/authPrismaContexto.ts:49:export async function executarAuthComContexto<T>(
apps/api/src/infra/prisma/auth/authPrismaContexto.ts:55:  return executarComContexto(
apps/api/src/infra/prisma/auth/locatario/locatariosRepositorioAuthPrisma.ts:35:            locatario_id: true,
apps/api/src/infra/prisma/auth/locatario/locatariosRepositorioAuthPrisma.ts:45:          locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:5:import { AuthContextoBanco, executarAuthComContexto } from "./authPrismaContexto";
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:76: * - este runtime NÃO abre contexto SQL;
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:78: * - se o chamador precisar de RLS/contexto, deve abrir isso fora.
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:103: * - builders que não precisem abrir RLS manualmente
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:121: * Executa uma operação de auth dentro de contexto SQL/RLS,
apps/api/src/infra/prisma/auth/authHttpRuntime.ts:143:  return executarAuthComContexto(prisma, contexto, technical.idPorta, async (adapters) => {
apps/api/src/infra/prisma/auth/authPrismaAdapters.ts:38: * - não abrir contexto SQL/RLS.
apps/api/src/infra/prisma/auth/rbac/rbacAuthPortaPrisma.ts:49:            locatario_id: ctxBase.locatarioId,
apps/api/src/infra/prisma/auth/authUseCaseDeps.ts:83: * - não abrir contexto SQL/RLS.
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:46:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:92:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:99:            locatario_id: true,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:124:              locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:137:              locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:147:            locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:173:            token_id_usuario_id_locatario_id: {
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:176:              locatario_id: params.chave.locatarioId,
apps/api/src/infra/prisma/auth/tokens/tokensAuthPortaPrisma.ts:183:            proximo_locatario_id: params.proximo?.locatarioId ?? null,
apps/api/src/infra/prisma/auth/assinatura/modulosHabilitadosRepositorioPrisma.ts:84:            locatario_id: locatarioId,
apps/api/src/infra/prisma/auth/authRuntimeFromDeps.ts:25: * - não abrir contexto SQL/RLS.
apps/api/src/infra/prisma/autorizacao/autorizacaoHttpRuntime.ts:22: * - este runtime não abre contexto SQL;
apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts:97:              locatario_id: locatarioId,
apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts:127:              locatario_id: locatarioId,
apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts:143:                  locatario_id: true,
apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts:180:            assinaturaLocatarioId: row.assinaturas?.locatario_id ?? null,
apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts:229:          if (vinculo.assinaturas.locatario_id !== locatarioId) {
apps/api/src/infra/prisma/autorizacao/rbac/autorizacaoRepositorioPrisma.ts:234:              assinaturaLocatarioId: vinculo.assinaturas.locatario_id,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:10:  locatario_id: string;
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:24:  locatario_id: true,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:49:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:78:            locatario_id: cliente.locatarioId,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:110:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:129:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:136:                  cliente_id_locatario_id: {
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:138:                    locatario_id: params.locatarioId,
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:162:            cliente_id_locatario_id: {
apps/api/src/infra/prisma/clientes/clientesRepositorioPrisma.ts:164:              locatario_id: cliente.locatarioId,
apps/api/src/infra/prisma/modulos/modulosHabilitadosRepositorioPrisma.ts:31:          WHERE locatario_id = ${locatarioId}
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:11:  locatario_id: string | null;
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:24:  locatario_id: true,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:87:    locatarioId: row.locatario_id as LocatarioId | null,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:127:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:171:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:211:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:252:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:297:            locatario_id: usuario.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:300:            locatario_id: usuario.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:345:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/usuarios/usuariosRepositorioPrisma.ts:378:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:10:  locatario_id: string;
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:25:  locatario_id: true,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:50:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:83:            locatario_id: produto.locatarioId,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:117:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:136:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:144:                  produto_id_locatario_id: {
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:146:                    locatario_id: params.locatarioId,
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:170:            produto_id_locatario_id: {
apps/api/src/infra/prisma/produtos/produtosRepositorioPrisma.ts:172:              locatario_id: produto.locatarioId,
apps/api/src/infra/prisma/auditoria/auditoriaInternaRepositorioPrisma.ts:12:  locatario_id: string;
apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts:11:  locatario_id: string;
apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts:48:    locatarioId: row.locatario_id,
apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts:104:          locatario_id: input.locatarioId,
apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts:122:          locatario_id: true,
apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts:160:            locatario_id: input.locatarioId,
apps/api/src/infra/prisma/auditoria/auditoriaAtivaLocatarioRepositorioPrisma.ts:202:            locatario_id: true,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:10:  locatario_id: string;
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:24:  locatario_id: string;
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:43:  locatario_id: true,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:57:  locatario_id: true,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:100:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:138:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:176:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:228:          where: { locatario_id: params.locatarioId },
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:326:          where: { locatario_id: locatario.locatarioId },
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:368:          where: { locatario_id: params.locatarioId },
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:395:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:423:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:452:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:493:            locatario_id_configuracao_id: {
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:494:              locatario_id: config.locatarioId,
apps/api/src/infra/prisma/locatarios/locatariosRepositorioPrisma.ts:537:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:14:  locatario_id: string;
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:30:  locatario_id: string;
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:57:  locatario_id: true,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:73:  locatario_id: true,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:150:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:179:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:214:            locatario_id: transacao.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:250:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:269:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:278:                  transacao_id_locatario_id: {
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:280:                    locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:304:            transacao_id_locatario_id: {
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:306:              locatario_id: transacao.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:360:            locatario_id: item.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:393:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:414:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:453:            locatario_id_item_transacao_id_transacao_id: {
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:454:              locatario_id: item.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:518:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:559:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/vendas/vendasRepositorioPrisma.ts:607:            locatario_id: movimento.locatarioId,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:10:  locatario_id: string;
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:24:  locatario_id: true,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:49:    locatarioId: row.locatario_id as LocatarioId,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:78:            locatario_id: fornecedor.locatarioId,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:110:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:129:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:136:                  fornecedor_id_locatario_id: {
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:138:                    locatario_id: params.locatarioId,
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:162:            fornecedor_id_locatario_id: {
apps/api/src/infra/prisma/fornecedores/fornecedoresRepositorioPrisma.ts:164:              locatario_id: fornecedor.locatarioId,
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:42:          select: { locatario_id: true },
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:55:            locatario_id_assinatura_id_modulo_id: {
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:56:              locatario_id: assinatura.locatario_id,
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:62:            locatario_id: assinatura.locatario_id,
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:103:          select: { locatario_id: true },
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:110:            locatario_id_assinatura_id_modulo_id: {
apps/api/src/infra/prisma/assinaturas/assinaturasModulosRepositorioPrisma.ts:111:              locatario_id: assinatura.locatario_id,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:10:  locatario_id: string;
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:22:    locatarioId: row.locatario_id,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:39:            locatario_id: params.locatarioId,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:49:            locatario_id: true,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:73:            assinatura_id_locatario_id: {
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:75:              locatario_id: assinatura.locatarioId,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:87:            locatario_id: true,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:113:            locatario_id: true,
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:136:          where: { locatario_id: locatarioId, status: "ATIVA", excluido_em: null },
apps/api/src/infra/prisma/assinaturas/assinaturasRepositorioPrisma.ts:140:            locatario_id: true,

## Possíveis usos de as any
apps/api/src/modules/locatarios/locatarios.controller.ts:130:  //       ? (resultado.value as any).nome ?? (resultado.value as any).locatario ?? null
apps/api/src/modules/locatarios/locatarios.controller.ts:399:  //     ? (resultado.value as any).locatario ?? (resultado.value as any).nome ?? null
apps/api/src/plugins/auth.ts:11:  await app.register(jwt as any, {
packages/core/src/kernel/contextoExecucao.ts:108:  return ( (valor as any)[CTX_BRAND] === true && typeof (valor as any).locatarioId === "string" && (valor as any).locatarioId.length > 0);
