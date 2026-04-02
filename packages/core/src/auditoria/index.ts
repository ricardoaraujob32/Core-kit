// packages/core/src/auditoria/index.ts

export type {AuditoriaId, EscopoAuditoria, CategoriaAuditoria, EventoAuditoriaAtivaLocatario, EventoAuditoriaBase, EventoAuditoriaInterna,
  FiltrosAuditoriaBase, ListarAuditoriaAtivaLocatarioInput, ListarAuditoriaAtivaLocatarioOutput, ListarAuditoriaAtivaLocatarioResult, ListarAuditoriaInternaInput,
  ListarAuditoriaInternaOutput, ListarAuditoriaInternaResult, RegistrarEventoAuditoriaInternaInput, RegistrarEventoAuditoriaInternaOutput,
  RegistrarEventoAuditoriaInternaResult, VisibilidadeAuditoria
} from "./tipos";

export type { AuditoriaAtivaLocatarioRepositorio, AuditoriaInternaRepositorio } from "./portasRepositorio";

export { createFnListarAuditoriaAtivaLocatario } from "./usecases/listarAuditoriaAtivaLocatario";

export { createFnListarAuditoriaInterna } from "./usecases/listarAuditoriaInterna";

export { createFnRegistrarEventoAuditoriaInterna } from "./usecases/registrarEventoAuditoriaInterna";

export { EVENTOS_AUDITORIA } from "./eventos";

export { MetadadosAuditoria, metaAcao, metaAtualizacao, metaCriacao, metaImpersonacao } from "./metadados";

export { resolverEventoAuditoria } from "./resolverEventoAuditoria";
