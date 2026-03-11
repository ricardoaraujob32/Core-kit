import Fastify from "fastify";
import { criarDependenciasAplicacao } from "./dependencyInjection";
import { registrarRotaHealth } from "./routes/health";
import { registrarRotasAuth } from "./routes/auth";
import { registrarRotasSuperAdminLocatarios } from "./routes/superadmin/locatarios";
import { registrarRotasUsuarios } from "./routes/usuarios";

export async function criarServidor() {
  const app = Fastify({
    logger: true,
  });

  const deps = criarDependenciasAplicacao();

  await registrarRotaHealth(app);
  await registrarRotasAuth(app, deps);
  await registrarRotasSuperAdminLocatarios(app, deps);
  await registrarRotasUsuarios(app, deps);

  return app;
}

export async function iniciarServidor(): Promise<void>{
  const app = await criarServidor();
    
  const port: number = Number(process.env.PORT ?? 3000);
  const host: string = String(process.env.HOST ?? "0.0.0.0");
   
  await app.listen({ port, host });
}