// packages/core/src/contextoExecucao.ts
export type IdLocatario = string;
export type IdUsuario = string;

export type Permissao =
  | "USUARIOS_LER"
  | "USUARIOS_CRIAR"
  | "USUARIOS_EDITAR"
  | "USUARIOS_REMOVER"
  | "AUDITORIA_LER"
  | "IMPORTACAO_EXECUTAR"
  | "EXPORTACAO_EXECUTAR";

export type ContextoExecucao = {
  locatarioId: IdLocatario;
  usuarioId: IdUsuario | null; // null = contexto técnico (job)
  permissoes: Set<Permissao>;
  agora: () => Date;
};
