// apps/web/src/features/tenant-admin/usuarios/tipos.ts

export type StatusUsuario = "ATIVO" | "INATIVO" | "SUSPENSO" | "ENCERRADO";

export type Usuario = {
  usuarioId: string;
  locatarioId: string | null;
  email: string;
  nome: string;
  status: StatusUsuario;
  ultimoLoginEm: string | null;
  criadoEm: string;
  atualizadoEm: string;
  excluidoEm: string | null;
};

export type ListarUsuariosResponse = {
  itens: Usuario[];
};

export type ObterUsuarioResponse = {
  item: Usuario;
};

export type CriarUsuarioInput = {
  email: string;
  nome: string;
  senha: string;
};

export type CriarUsuarioResponse = {
  item: {
    usuarioId: string;
  };
};

export type AtualizarUsuarioInput = {
  email?: string;
  nome?: string;
};

export type AtualizarUsuarioResponse = {
  item: Usuario;
};

export type AcaoUsuarioResponse = {
  item: Usuario;
};

export type FiltroUsuarios = {
  busca?: string;
  status?: StatusUsuario | "TODOS";
};

export type UsuarioFormMode = "create" | "edit";

export type AlterarMinhaSenhaInput = {
  senhaAtual: string;
  novaSenha: string;
};

export type RedefinirSenhaUsuarioInput = {
  novaSenha: string;
};

export type AlterarSenhaUsuarioResponse = {
  item: {
    usuarioId: string;
  };
};

export type RedefinirSenhaUsuarioResponse = {
  item: {
    usuarioId: string;
  };
};
