import { describe, it, expect } from "vitest";
import { ok, err, isOk, isErr } from "../result";

describe("Result", () => {
  it("ok deve criar sucesso", () => {
    const r = ok(123);
    expect(isOk(r)).toBe(true);
    expect(r.value).toBe(123);
  });

  it("err deve criar falha", () => {
    const r = err("erro");
    expect(isErr(r)).toBe(true);
    expect(r.error).toBe("erro");
  });
});
