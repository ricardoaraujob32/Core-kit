import { describe, it, expect } from "vitest";
import { ok, err, isOk, isErr } from "../src/result";

describe("Result", () => {
  it("ok(value) cria um result de sucesso", () => {
    const r = ok(123);

    expect(r).toEqual({ ok: true, value: 123 });
    expect(isOk(r)).toBe(true);
    expect(isErr(r)).toBe(false);

    // garante serialização previsível
    expect(JSON.parse(JSON.stringify(r))).toEqual({ ok: true, value: 123 });
  });

  it("err(error) cria um result de falha", () => {
    const r = err("erro");

    expect(r).toEqual({ ok: false, error: "erro" });
    expect(isOk(r)).toBe(false);
    expect(isErr(r)).toBe(true);

    // garante serialização previsível
    expect(JSON.parse(JSON.stringify(r))).toEqual({ ok: false, error: "erro" });
  });

  it("type guards funcionam em runtime (branches)", () => {
    const r1 = ok({ a: 1 });
    if (isOk(r1)) {
      expect(r1.value.a).toBe(1);
    } else {
      throw new Error("era para ser ok");
    }

    const r2 = err({ code: "X" });
    if (isErr(r2)) {
      expect(r2.error.code).toBe("X");
    } else {
      throw new Error("era para ser err");
    }
  });
});
