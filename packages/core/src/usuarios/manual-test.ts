// manual-test.ts
import { criarUsuario } from "./usecases/criarUsuario";
import { listarUsuarios } from "./usecases/listarUsuarios";
import { createUsuariosMemoryRepo} from ".";

const ctx = { locatarioId: "tenant-1" };

const repo = createUsuariosMemoryRepo();

async function run() {
  const a = await criarUsuario(
    ctx,
    { usuariosRepo: repo, gerarId: () => "u1" },
    { nome: " Alice  Silva " }
  );

  console.log("Criar:", a);

  const b = await listarUsuarios(ctx, { usuariosRepo: repo });
  console.log("Listar:", b);
}

run();
