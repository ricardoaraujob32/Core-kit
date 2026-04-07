// packages/core/src/bootstrap/tipos.ts

/**
 * 
 */
export type PermissaoBootstrap = {
  codigo: string;
  descricao?: string | null;
};

/**
 * 
 */
export type PapelBootstrap = {
  codigo: string;
  descricao?: string | null;
};

/**
 * 
 */
export type ModuloBootstrap = {
  codigo: string;
  nome?: string | null;
  ativo: boolean;
};

/**
 * 
 */
export type CatalogoAutorizacaoBootstrap = {
  permissoes: PermissaoBootstrap[];
  papeis: PapelBootstrap[];
  modulos: ModuloBootstrap[];
};
