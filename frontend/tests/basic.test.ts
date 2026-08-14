import { describe, expect, it } from "vitest";
import { yen } from "../lib/api";

describe("yen", () => {
  it("formats annual JPY salary in man-yen", () => {
    expect(yen(5000000)).toBe("¥500万");
  });
});
