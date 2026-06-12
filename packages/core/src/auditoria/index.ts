// packages/core/src/auditoria/index.ts

export type {
  AuditoriaId, CategoriaAuditoria, EventoAuditoriaBase, EventoAuditoriaLocatario, EventoAuditoriaPlataforma, ListarAuditoriaLocatarioInput,
  FiltrosAuditoriaBase, ListarAuditoriaLocatarioOutput, ListarAuditoriaLocatarioResult, ListarAuditoriaPlataformaInput, ListarAuditoriaPlataformaOutput,
  ListarAuditoriaPlataformaResult, RegistrarEventoAuditoriaLocatarioInput, RegistrarEventoAuditoriaLocatarioOutput, RegistrarEventoAuditoriaLocatarioResult,
  RegistrarEventoAuditoriaPlataformaInput, RegistrarEventoAuditoriaPlataformaOutput, RegistrarEventoAuditoriaPlataformaResult 
} from "./tipos";

export type { AuditoriaLocatarioRepositorio, AuditoriaPlataformaRepositorio } from "./portasRepositorio";

export { createFnListarAuditoriaLocatario } from "./usecases/listarAuditoriaLocatario";

export { createFnRegistrarEventoAuditoriaLocatario } from "./usecases/registrarEventoAuditoriaLocatario";

export { createFnListarAuditoriaPlataforma } from "./usecases/listarAuditoriaPlataforma";

export { createFnRegistrarEventoAuditoriaPlataforma } from "./usecases/registrarEventoAuditoriaPlataforma";

export { EVENTOS_AUDITORIA } from "./eventos";

export type { MetadadosAuditoria } from "./metadados";
export { metaAcao, metaAtualizacao, metaCriacao, metaImpersonacao } from "./metadados";

export { resolverEventoAuditoria } from "./resolverEventoAuditoria";
