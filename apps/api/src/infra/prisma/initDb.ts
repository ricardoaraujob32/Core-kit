//

import { clientePrisma } from "./client";

/**
 * Inicializa a conexão com o banco de dados.
 *
 * Responsabilidades:
 * - abrir a conexão do Prisma explicitamente no startup;
 * - validar conectividade básica antes da aplicação aceitar requisições;
 * - falhar cedo caso o banco não esteja disponível.
 *
 * Observação:
 * - este arquivo não carrega catálogos nem executa bootstrap de autorização;
 * - ele cuida apenas da prontidão da infraestrutura de banco.
 */
export async function initDb(): Promise<void> {
  await clientePrisma.$connect();

  /**
   * Smoke check simples para garantir que a conexão está funcional.
   *
   * Mantemos a verificação mínima para:
   * - confirmar conectividade real;
   * - evitar acoplamento com tabelas específicas;
   * - falhar cedo em caso de banco indisponível.
   */
  await clientePrisma.$queryRaw`SELECT 1`;
}