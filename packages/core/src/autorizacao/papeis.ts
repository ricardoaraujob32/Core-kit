// packages/core/src/autorizacao/papeis.ts

import { Permissao } from "./permissoes";

/**
 * Papéis sugeridos (opcionais). Use se fizer sentido para o projeto.
 * Mantido em português para facilitar documentação e consistência.
 */
export const PAPEIS_PADRAO = {
  ADMIN: "ADMIN", // administração geral do locatário
  GERENTE: "GERENTE", // nível intermediário (ex.: gerente / supervisor)
  OPERADOR: "OPERADOR", // usuário operacional
  LEITOR: "LEITOR", // acesso somente leitura
} as const;

export type PapelPadrao = (typeof PAPEIS_PADRAO)[keyof typeof PAPEIS_PADRAO];

/**
 * "Papel" é um rótulo (apelido) que pode variar por locatário.
 * Ex.: "ADMIN_LOCATARIO", "GERENTE", "OPERADOR".
 *
 * Papel ajuda na UX e organização, mas o motor real de autorização usa permissões.
 */
export type Papel = string;

// export function mapPapelToPermissoes(papel: PapelPadrao): Permissao[]{
//   switch (PAPEIS_PADRAO) {
//     case PAPEIS_PADRAO.ADMIN:
//       return 
//     break;
  
//     case PAPEIS_PADRAO.GERENTE:
      
//     break;

//     case PAPEIS_PADRAO.OPERADOR:
      
//     break;

//     case PAPEIS_PADRAO.LEITOR:
      
//     break;

//     default:
//       break;
//   }
// }