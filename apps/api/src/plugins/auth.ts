import fp from "fastify-plugin";
import jwt from "@fastify/jwt";
import { env } from "../env";

export const authPlugin = fp(async (app) => {
  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: {
      issuer: env.JWT_ISSUER,
      expiresIn: "15m",
    },
  });
});