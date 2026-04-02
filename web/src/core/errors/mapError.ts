// frontend/src/core/errors/mapError.ts

import { HttpError } from "../api/httpClient";
import type { AppErrorCode } from "./errorCodes";

export type UiError = {
  code: AppErrorCode | "UNKNOWN";
  title: string;
  message: string;
  status?: number;
};

function buildDefaultMessageByCode(code: AppErrorCode): UiError {
  switch (code) {
    case "NAO_AUTENTICADO":
      return {
        code,
        title: "Sessão inválida",
        message: "Sua sessão expirou ou é inválida. Faça login novamente.",
      };

    case "NAO_AUTORIZADO":
      return {
        code,
        title: "Acesso negado",
        message: "Você não possui permissão para realizar esta ação.",
      };

    case "INVALIDO":
      return {
        code,
        title: "Dados inválidos",
        message: "Verifique os dados informados e tente novamente.",
      };

    case "NAO_ENCONTRADO":
      return {
        code,
        title: "Não encontrado",
        message: "O recurso solicitado não foi encontrado.",
      };

    case "CONFLITO":
      return {
        code,
        title: "Conflito",
        message: "Não foi possível concluir a operação por conflito de dados.",
      };

    case "ERRO_INTERNO":
      return {
        code,
        title: "Erro interno",
        message: "Ocorreu um erro interno. Tente novamente mais tarde.",
      };
    default:
      return {
        code: "UNKNOWN",
        title: "Erro",
        message: "Ocorreu um erro inesperado.",
      };
  }
}

export function mapError(error: unknown): UiError {
  if (error instanceof HttpError) {
    const code = error.code as AppErrorCode | undefined;

    if (code) {
      const mapped = buildDefaultMessageByCode(code);

      return {
        ...mapped,
        status: error.status,
        message: error.message?.trim() || mapped.message,
      };
    }

    if (error.status === 401) {
      return {
        code: "NAO_AUTENTICADO",
        title: "Sessão inválida",
        message: "Sua sessão expirou ou é inválida. Faça login novamente.",
        status: error.status,
      };
    }

    if (error.status === 403) {
      return {
        code: "NAO_AUTORIZADO",
        title: "Acesso negado",
        message: "Você não possui permissão para acessar este recurso.",
        status: error.status,
      };
    }

    if (error.status === 404) {
      return {
        code: "NAO_ENCONTRADO",
        title: "Não encontrado",
        message: "O recurso solicitado não foi encontrado.",
        status: error.status,
      };
    }

    if (error.status === 409) {
      return {
        code: "CONFLITO",
        title: "Conflito",
        message: "Não foi possível concluir a operação por conflito de dados.",
        status: error.status,
      };
    }

    if (error.status >= 400 && error.status < 500) {
      return {
        code: "INVALIDO",
        title: "Solicitação inválida",
        message: error.message || "A solicitação não pôde ser processada.",
        status: error.status,
      };
    }

    return {
      code: "ERRO_INTERNO",
      title: "Erro interno",
      message: error.message || "Ocorreu um erro interno.",
      status: error.status,
    };
  }

  if (error instanceof Error) {
    return {
      code: "UNKNOWN",
      title: "Erro inesperado",
      message: error.message || "Ocorreu um erro inesperado.",
    };
  }

  return {
    code: "UNKNOWN",
    title: "Erro inesperado",
    message: "Ocorreu um erro inesperado.",
  };
}