import { describe, expect, it } from "vitest";
import { isDemoMode, yen } from "../lib/api";
import { fallbackForPath } from "../lib/fallbackData";

describe("yen", () => {
  it("formats annual JPY salary in man-yen", () => {
    expect(yen(5000000)).toBe("¥500万");
  });

  it("does not format a missing salary as zero", () => {
    expect(yen(null)).toBe("Salary not listed");
  });
});

describe("portfolio demo", () => {
  it("uses bundled data when no backend is configured", () => {
    expect(isDemoMode()).toBe(true);
    expect(fallbackForPath("/api/v1/jobs")).toMatchObject({ total: 2 });
  });

  it("does not invent data for unsupported endpoints", () => {
    expect(fallbackForPath("/api/v1/unsupported")).toBeNull();
  });
});
