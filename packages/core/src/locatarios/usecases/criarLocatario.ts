// packages/core/src/locatarios/usecases/criarLocatario.ts

import type { CriarLocatarioInput, CriarLocatarioOutput, CriarLocatarioResult } from "../tipos";
import type { LocatariosRepositorio } from "../portasRepositorio";
import { validarCorTema, validarDocumentoLocatario, validarEmailLocatario, validarFusoHorarioLocatario, validarIdentidadeVisualLocatario, validarLocatarioSlug, 
  validarModoTemaLocatario, validarNomeLocatario, validarUrlLogoLocatario } from "../validadores";
import { executarEmTransacao, IdPorta, RelogioPorta, TransacaoPorta, wrapOk } from "../../kernel";
import { emailLocatarioJaExiste, slugLocatarioJaExiste } from "../erros";
import { autorizarLocatario, PoliticaSegurancaLocatariosPorta } from "../politicas";

/**
 * Cria a função de caso de uso responsável por registrar um novo locatário.
 *
 * Este caso de uso:
 * - valida o nome do locatário;
 * - gera um novo identificador por meio da `IdPorta`;
 * - materializa o instante de criação via `RelogioPorta`;
 * - persiste o locatário com status inicial `"ATIVO"`;
 * - devolve apenas o identificador criado no output.
 *
 * Dependências:
 * - `locRepo`: persistência do agregado de locatários;
 * - `idPorta`: geração de identidade estável;
 * - `relogio`: materialização do tempo corrente para o domínio.
 *
 * @param deps Dependências externas necessárias para a execução do caso de uso.
 * @returns Função `criarLocatario` pronta para receber a entrada do caso de uso.
 */
export function createFnCriarLocatario(deps: {
  locatariosRepositorio: LocatariosRepositorio;
  idPorta: IdPorta;
  relogio: RelogioPorta;
  transacao?: TransacaoPorta;
  politicaSeguranca?: PoliticaSegurancaLocatariosPorta;
}) {
  /**
   * Executa o caso de uso de criação de locatário.
   *
   * Fluxo:
   * 1. valida o nome recebido;
   * 2. gera `locatarioId`;
   * 3. obtém `criadoEm`;
   * 4. persiste o locatário;
   * 5. retorna o identificador criado.
   *
   * @param input Dados mínimos necessários para criar o locatário.
   * @returns `Ok({ locatarioId })` em caso de sucesso, ou `Err(ErroApp)` em caso de falha.
   */
  return async function criarLocatario(input: CriarLocatarioInput): CriarLocatarioResult {
    const { locatariosRepositorio } = deps;

    const nome = validarNomeLocatario(input.nome);
    if (!nome.ok) return nome;

    const slug = validarLocatarioSlug(input.slug);
    if (!slug.ok) return slug;

    const email = validarEmailLocatario(input.email);
    if (!email.ok) return email;

    const documento = validarDocumentoLocatario(input.documento);
    if (!documento.ok) return documento;

    const fusoHorario = validarFusoHorarioLocatario(input.fusoHorario);
    if (!fusoHorario.ok) return fusoHorario;

    const modoTema = validarModoTemaLocatario(input.configuracaoInicial?.modoTema);
    if (!modoTema.ok) return modoTema;

    const identidadeVisual = validarIdentidadeVisualLocatario(
      input.configuracaoInicial?.identidadeVisual ?? slug.value,
    );
    if (!identidadeVisual.ok) return identidadeVisual;

    const corPrimaria = validarCorTema(input.configuracaoInicial?.corPrimaria, "corPrimaria");
    if (!corPrimaria.ok) return corPrimaria;

    const corSecundaria = validarCorTema(input.configuracaoInicial?.corSecundaria, "corSecundaria");
    if (!corSecundaria.ok) return corSecundaria;

    const corTerciaria = validarCorTema(input.configuracaoInicial?.corTerciaria, "corTerciaria");
    if (!corTerciaria.ok) return corTerciaria;

    const urlLogo = validarUrlLogoLocatario(input.configuracaoInicial?.urlLogo);
    if (!urlLogo.ok) return urlLogo;

    const autorizacao = await autorizarLocatario(deps, {
      operacao: "LOCATARIO_CRIAR",
      dados: {
        slug: slug.value,
        email: email.value,
      },
    });
    if (autorizacao && !autorizacao.ok) return autorizacao;

    return executarEmTransacao(deps.transacao, async () => {
      const slugExistente = await locatariosRepositorio.buscarPorSlug({
        slug: slug.value,
      });
      if (!slugExistente.ok) return slugExistente;
      if (slugExistente.value) return slugLocatarioJaExiste(slug.value);

      const emailExistente = await locatariosRepositorio.buscarPorEmail({
        emailNormalizado: email.value,
      });
      if (!emailExistente.ok) return emailExistente;
      if (emailExistente.value) return emailLocatarioJaExiste(email.value);

      const agora = deps.relogio.agora();
      const locatarioId = deps.idPorta.gerarId();
      const configuracaoId = deps.idPorta.gerarId();

      const resultado = await locatariosRepositorio.criar({
        locatarioId,
        nome: nome.value,
        slug: slug.value,
        documento: documento.value,
        email: email.value,
        fusoHorario: fusoHorario.value,
        status: "ATIVO",
        criadoEm: agora,
        atualizadoEm: agora,
        configuracaoInicial: {
          configuracaoId,
          modoTema: modoTema.value,
          identidadeVisual: identidadeVisual.value,
          corPrimaria: corPrimaria.value,
          corSecundaria: corSecundaria.value,
          corTerciaria: corTerciaria.value,
          urlLogo: urlLogo.value,
          ativa: Boolean(input.configuracaoInicial?.ativa),
          criadoEm: agora,
          atualizadoEm: agora,
        },
      });
      if (!resultado.ok) return resultado;

      return wrapOk<CriarLocatarioOutput>({
        locatarioId: resultado.value.locatarioId,
      });
    });
  };
}
