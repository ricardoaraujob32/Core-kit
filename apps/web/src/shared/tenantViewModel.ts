// apps/web/src/shared/tenantViewModel.ts

export type TenantViewModel = {
  /**
   * Chave técnica para React, links, ações internas e parâmetros de rota.
   * Pode ser UUID. Não deve ser usada como título visual no tenant.
   */
  key: string;

  /**
   * Identificação principal orientada ao domínio.
   */
  titulo: string;

  /**
   * Informação secundária para ajudar o usuário a reconhecer o registro.
   */
  subtitulo?: string;

  /**
   * Informação complementar de negócio: preço, valor, data, quantidade, etc.
   */
  contexto?: string;

  /**
   * Status textual da entidade, quando existir.
   */
  status?: string;
};

export function fallbackTexto(valor: unknown, fallback = "-"): string {
  if (valor === null || valor === undefined || valor === "") {
    return fallback;
  }

  return String(valor);
}

export function juntarPartes(
  partes: Array<string | null | undefined | false>,
  separador = " — ",
): string | undefined {
  const texto = partes
    .filter((parte): parte is string => Boolean(parte && parte.trim()))
    .join(separador);

  return texto || undefined;
}

export function formatarMoedaBR(valor: number | string | null | undefined): string | undefined {
  if (valor === null || valor === undefined || valor === "") {
    return undefined;
  }

  const numero = typeof valor === "number" ? valor : Number(valor);

  if (Number.isNaN(numero)) {
    return String(valor);
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

export function formatarDataBR(valor: string | Date | null | undefined): string | undefined {
  if (!valor) {
    return undefined;
  }

  const data = valor instanceof Date ? valor : new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return String(valor);
  }

  return new Intl.DateTimeFormat("pt-BR").format(data);
}
