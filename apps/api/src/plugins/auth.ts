// apps/api/src/plugins/auth.ts

import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { env } from "../env";

/**
 * 
 */
export const authPlugin = fp(async (app) => {
  await app.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      issuer: env.JWT_ISSUER,
      expiresIn: "10m",
    },
    verify: {
      allowedIss: env.JWT_ISSUER,
    },
  });
});
