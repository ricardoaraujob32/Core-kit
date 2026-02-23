export function normalizarTexto(v: string): string {
  return v.trim();
}

// slug simples, previsível, “bom o bastante” pro MVP.
// (não resolve colisões; isso é do repositório/usecase)
export function normalizarSlug(v: string): string {
  const s = v
    .trim()
    .toLowerCase()
    .normalize("NFD") // remove acentos via regex abaixo
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  return s;
}

export function emailValido(v: string): boolean {
  // alinhado com o CHECK do SQL (case-insensitive)
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,63}$/i.test(v.trim());
}


function isBlank(s: unknown): boolean {
  return typeof s !== "string" || s.trim().length === 0;
}

export function validarSlugLocatario(slug: string): Result<string, ErroApp> {
  // slug: min 3, max 63 (compatível com subdomínios na prática)
  // permitido: a-z 0-9 e hífen, sem hífen no começo/fim
  if (isBlank(slug)) {
    return createErroApp({ codigo: "INVALIDO", detalhes: { campo: "slug", motivo: "obrigatorio" } });
  }

  const s = slug.trim();
  const okLen = s.length >= 3 && s.length <= 63;
  const okPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);

  if (!okLen || !okPattern) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Slug inválido.",
      detalhes: { campo: "slug", motivo: "formato", esperado: "a-z0-9 e hífen, sem espaços/maiúsculas" },
    });
  }

  return { ok: true, value: s };
}

export function validarCriarLocatarioInput(input: {
  nome: string;
  planoId: string;
  slug: string;
}): Result<{ nome: string; planoId: string; slug: string }, ErroApp> {
  if (isBlank(input.nome)) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Nome é obrigatório.",
      detalhes: { campo: "nome" },
    });
  }
  if (isBlank(input.planoId)) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Plano é obrigatório.",
      detalhes: { campo: "planoId" },
    });
  }

  const slugR = validarSlugLocatario(input.slug);
  if (!slugR.ok) return slugR;

  return {
    ok: true,
    value: {
      nome: input.nome.trim(),
      planoId: input.planoId.trim(),
      slug: slugR.value,
    },
  };
}

export function validarModoTema(modoTema: ModoTema): Result<ModoTema, ErroApp> {
  const allowed: ModoTema[] = ["CLARO", "ESCURO", "SISTEMA"];
  if (!allowed.includes(modoTema)) {
    return createErroApp({
      codigo: "INVALIDO",
      mensagem: "Modo de tema inválido.",
      detalhes: { campo: "modoTema", allowed },
    });
  }
  return { ok: true, value: modoTema };
}