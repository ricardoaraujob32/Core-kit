import type { Assinatura } from "./tipos";

export function assinaturaPermiteUso(assinatura: Assinatura): boolean {
  // Regra do MVP:
  // - ATIVA e EM_TESTE: permite
  // - INADIMPLENTE/SUSPENSA/CANCELADA/EXPIRADA: bloqueia (ou permite só módulos essenciais via regra de módulos)
  return assinatura.status === "ATIVA" || assinatura.status === "EM_TESTE";
}

export function assinaturaEstaInadimplente(assinatura: Assinatura, agora: Date): boolean {
  if (!assinatura.proximoVencimentoEm) return false;
  return agora.getTime() > assinatura.proximoVencimentoEm.getTime();
}
