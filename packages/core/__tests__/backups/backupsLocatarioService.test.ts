import { describe, expect, it } from "vitest";
import { criarBackupsLocatarioService } from "../usecases/backupsLocatarioService";
import {
  BackupsLocatarioRepositorioMemoria,
  RestauracoesLocatarioRepositorioMemoria,
} from "../repositorioMemoria";

function criarDeps() {
  const backupsLocatarioRepositorio =
    new BackupsLocatarioRepositorioMemoria();
  const restauracoesLocatarioRepositorio =
    new RestauracoesLocatarioRepositorioMemoria();

  const agoraFixo = new Date("2026-03-11T15:00:00.000Z");
  let contadorIds = 0;

  const service = criarBackupsLocatarioService({
    backupsLocatarioRepositorio,
    restauracoesLocatarioRepositorio,
    agora: () => agoraFixo,
    gerarId: () => {
      contadorIds += 1;
      return `id-${contadorIds}`;
    },
  });

  return {
    service,
    backupsLocatarioRepositorio,
    restauracoesLocatarioRepositorio,
    agoraFixo,
  };
}

describe("backupsLocatarioService", () => {
  it("solicita backup manual do locatário", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarBackupLocatario({
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.backup.backupId).toBe("id-1");
    expect(resultado.value.backup.locatarioId).toBe("loc-1");
    expect(resultado.value.backup.solicitadoPorUsuarioId).toBe("user-1");
    expect(resultado.value.backup.status).toBe("SOLICITADO");
    expect(resultado.value.backup.origem).toBe("MANUAL");
    expect(resultado.value.backup.solicitadoEm).toEqual(ctx.agoraFixo);
  });

  it("impede solicitar backup quando já existe backup em aberto para o locatário", async () => {
    const ctx = criarDeps();

    const primeiro = await ctx.service.solicitarBackupLocatario({
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
    });

    expect(primeiro.ok).toBe(true);

    const segundo = await ctx.service.solicitarBackupLocatario({
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-2",
    });

    expect(segundo.ok).toBe(false);
    if (segundo.ok) return;

    expect(segundo.error.codigo).toBe("BACKUP_EM_ABERTO_JA_EXISTE");
  });

  it("permite solicitar backup para outro locatário mesmo com backup em aberto diferente", async () => {
    const ctx = criarDeps();

    const primeiro = await ctx.service.solicitarBackupLocatario({
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
    });

    expect(primeiro.ok).toBe(true);

    const segundo = await ctx.service.solicitarBackupLocatario({
      locatarioId: "loc-2",
      solicitadoPorUsuarioId: "user-2",
    });

    expect(segundo.ok).toBe(true);
    if (!segundo.ok) return;

    expect(segundo.value.backup.locatarioId).toBe("loc-2");
  });

  it("lista backups do locatário em ordem decrescente de solicitação", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-1",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-10T10:00:00.000Z"),
      criadoEm: new Date("2026-03-10T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-10T10:10:00.000Z"),
      concluidoEm: new Date("2026-03-10T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-10T10:01:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-1",
      tamanhoBytes: 100,
      checksum: "abc",
      falhaMotivo: null,
    });

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-2",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-11T10:00:00.000Z"),
      criadoEm: new Date("2026-03-11T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-11T10:10:00.000Z"),
      concluidoEm: new Date("2026-03-11T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-11T10:01:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-2",
      tamanhoBytes: 200,
      checksum: "def",
      falhaMotivo: null,
    });

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-3",
      locatarioId: "loc-2",
      solicitadoPorUsuarioId: "user-2",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-11T11:00:00.000Z"),
      criadoEm: new Date("2026-03-11T11:00:00.000Z"),
      atualizadoEm: new Date("2026-03-11T11:10:00.000Z"),
      concluidoEm: new Date("2026-03-11T11:10:00.000Z"),
      iniciadoEm: new Date("2026-03-11T11:01:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-3",
      tamanhoBytes: 300,
      checksum: "ghi",
      falhaMotivo: null,
    });

    const resultado = await ctx.service.listarBackupsLocatario({
      locatarioId: "loc-1",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.locatarioId).toBe("loc-1");
    expect(resultado.value.backups).toHaveLength(2);
    expect(resultado.value.backups[0]?.backupId).toBe("bkp-2");
    expect(resultado.value.backups[1]?.backupId).toBe("bkp-1");
  });

  it("solicita restauração quando o backup existe, pertence ao locatário e está concluído", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-ok",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-10T10:00:00.000Z"),
      criadoEm: new Date("2026-03-10T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-10T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-10T10:01:00.000Z"),
      concluidoEm: new Date("2026-03-10T10:10:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-1",
      tamanhoBytes: 123,
      checksum: "checksum-1",
      falhaMotivo: null,
    });

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "bkp-ok",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "Recuperar dados após erro operacional",
    });

    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;

    expect(resultado.value.restauracao.restauracaoId).toBe("id-1");
    expect(resultado.value.restauracao.backupId).toBe("bkp-ok");
    expect(resultado.value.restauracao.locatarioId).toBe("loc-1");
    expect(resultado.value.restauracao.status).toBe("SOLICITADA");
    expect(resultado.value.restauracao.motivo).toBe(
      "Recuperar dados após erro operacional",
    );
  });

  it("impede solicitar restauração quando já existe restauração em aberto para o locatário", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-ok",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-10T10:00:00.000Z"),
      criadoEm: new Date("2026-03-10T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-10T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-10T10:01:00.000Z"),
      concluidoEm: new Date("2026-03-10T10:10:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-1",
      tamanhoBytes: 123,
      checksum: "checksum-1",
      falhaMotivo: null,
    });

    await ctx.restauracoesLocatarioRepositorio.criarRestauracao({
      restauracaoId: "res-1",
      backupId: "bkp-ok",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "admin-1",
      status: "SOLICITADA",
      motivo: "Primeira tentativa",
      solicitadoEm: new Date("2026-03-11T10:00:00.000Z"),
      criadoEm: new Date("2026-03-11T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-11T10:00:00.000Z"),
      iniciadoEm: null,
      concluidoEm: null,
      falhaMotivo: null,
    });

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "bkp-ok",
      solicitadoPorUsuarioId: "admin-2",
      motivo: "Segunda tentativa",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("RESTAURACAO_EM_ABERTO_JA_EXISTE");
  });

  it("falha quando o backup informado não existe", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "inexistente",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "Teste",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("BACKUP_NAO_ENCONTRADO");
  });

  it("falha quando o backup pertence a outro locatário", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-outro",
      locatarioId: "loc-2",
      solicitadoPorUsuarioId: "user-2",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-10T10:00:00.000Z"),
      criadoEm: new Date("2026-03-10T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-10T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-10T10:01:00.000Z"),
      concluidoEm: new Date("2026-03-10T10:10:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-2",
      tamanhoBytes: 456,
      checksum: "checksum-2",
      falhaMotivo: null,
    });

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "bkp-outro",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "Teste de isolamento",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe(
      "BACKUP_NAO_PERTENCE_AO_LOCATARIO",
    );
  });

  it("falha quando o backup não está concluído", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-pendente",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "SOLICITADO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-10T10:00:00.000Z"),
      criadoEm: new Date("2026-03-10T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-10T10:00:00.000Z"),
      iniciadoEm: null,
      concluidoEm: null,
      expiradoEm: null,
      arquivoRef: null,
      tamanhoBytes: null,
      checksum: null,
      falhaMotivo: null,
    });

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "bkp-pendente",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "Teste",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe(
      "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO",
    );
  });

  it("falha quando o backup está expirado", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-expirado",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-09T10:00:00.000Z"),
      criadoEm: new Date("2026-03-09T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-09T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-09T10:01:00.000Z"),
      concluidoEm: new Date("2026-03-09T10:10:00.000Z"),
      expiradoEm: new Date("2026-03-10T10:00:00.000Z"),
      arquivoRef: "arquivo-exp",
      tamanhoBytes: 789,
      checksum: "checksum-exp",
      falhaMotivo: null,
    });

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "bkp-expirado",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "Teste",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe(
      "BACKUP_NAO_DISPONIVEL_PARA_RESTAURACAO",
    );
  });

  it("valida entrada ao solicitar backup", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarBackupLocatario({
      locatarioId: "",
      solicitadoPorUsuarioId: "user-1",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("BACKUP_INVALIDO");
  });

  it("valida entrada ao listar backups", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.listarBackupsLocatario({
      locatarioId: "",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("BACKUP_INVALIDO");
  });

  it("valida entrada ao solicitar restauração", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "",
    });

    expect(resultado.ok).toBe(false);
    if (resultado.ok) return;

    expect(resultado.error.codigo).toBe("BACKUP_INVALIDO");
  });

  describe("backupsLocatarioService auditoria", () => {
  it("gera auditoria ao solicitar backup", async () => {
    const ctx = criarDeps();

    const resultado = await ctx.service.solicitarBackupLocatario({
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
    });

    expect(resultado.ok).toBe(true);

    const eventos = ctx.auditoriaLocatarioRepositorio.listarEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]?.evento).toBe("backup.locatario.solicitado");
    expect(eventos[0]?.locatarioId).toBe("loc-1");
    expect(eventos[0]?.usuarioId).toBe("user-1");
    expect(eventos[0]?.entidadeTipo).toBe("backup_locatario");
  });

  it("gera auditoria ao solicitar restauração", async () => {
    const ctx = criarDeps();

    await ctx.backupsLocatarioRepositorio.criarBackup({
      backupId: "bkp-ok",
      locatarioId: "loc-1",
      solicitadoPorUsuarioId: "user-1",
      status: "CONCLUIDO",
      origem: "MANUAL",
      solicitadoEm: new Date("2026-03-10T10:00:00.000Z"),
      criadoEm: new Date("2026-03-10T10:00:00.000Z"),
      atualizadoEm: new Date("2026-03-10T10:10:00.000Z"),
      iniciadoEm: new Date("2026-03-10T10:01:00.000Z"),
      concluidoEm: new Date("2026-03-10T10:10:00.000Z"),
      expiradoEm: null,
      arquivoRef: "arquivo-1",
      tamanhoBytes: 123,
      checksum: "checksum-1",
      falhaMotivo: null,
    });

    const resultado = await ctx.service.solicitarRestauracaoLocatario({
      locatarioId: "loc-1",
      backupId: "bkp-ok",
      solicitadoPorUsuarioId: "admin-1",
      motivo: "Recuperar dados",
    });

    expect(resultado.ok).toBe(true);

    const eventos = ctx.auditoriaLocatarioRepositorio.listarEventos();
    expect(eventos).toHaveLength(1);
    expect(eventos[0]?.evento).toBe(
      "backup.locatario.restauracao.solicitada",
    );
    expect(eventos[0]?.entidadeTipo).toBe("restauracao_locatario");
  });
});
});