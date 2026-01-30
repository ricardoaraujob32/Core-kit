// manual-test.ts
import { criarUsuario } from "./usecases/criarUsuario";
import { listarUsuarios } from "./usecases/listarUsuarios";
import { createUsuariosMemoryRepo} from ".";

async function main() {
const ctx = { locatarioId: "tenant-1" };
const repo = createUsuariosMemoryRepo();

console.log("Criando Alice...");
  const a = await criarUsuario(ctx, { usuariosRepo: repo, gerarId: () => "u1" }, { nome: "Alice" });
  console.log(a);

  console.log("Criando Bob...");
  const b = await criarUsuario(ctx, { usuariosRepo: repo, gerarId: () => "u2" }, { nome: "Bob" });
  console.log(b);

  console.log("Tentando duplicar Alice...");
  const dup = await criarUsuario(ctx, { usuariosRepo: repo, gerarId: () => "u3" }, { nome: "Alice" });
  console.log(dup);

  console.log("Listando...");
  const list = await listarUsuarios(ctx, { usuariosRepo: repo });
  console.log(list);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
