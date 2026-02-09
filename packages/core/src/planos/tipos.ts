export type IdPlano = string;

export type CodigoModulo =
  | "LOCATARIO"
  | "AUTENTICACAO"
  | "BACKUP"
  | "USUARIOS"
  | "ESTOQUE"
  | "FINANCEIRO_LEVE"
  | "IMPORTACAO"
  | "EXPORTACAO_SIMPLES"
  | "EXPORTACAO_AVANCADA"
  | "AUDITORIA";

export type LimitesPlano = {
  limiteUsuarios: number;               // ex: 3 básico
  limiteIdentidadesVisuais: number;     // ex: 1 básico
};

export type Plano = {
  id: IdPlano;
  nome: string;
  ativo: boolean;
  limites: LimitesPlano;
};
