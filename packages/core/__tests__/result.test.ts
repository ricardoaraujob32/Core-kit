import { describe, it, expect } from "vitest";
import { ok, err } from "../src/result";

describe("Result", () => {
  it("ok() cria resultado de sucesso", () => {
    const r = ok(123);

    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.value).toBe(123);
    }
  });

  it("err() cria resultado de erro", () => {
    const r = err("fail");

    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe("fail");
    }
  });
});
