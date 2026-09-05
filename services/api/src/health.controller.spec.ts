import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns API health status", () => {
    const result = new HealthController().getHealth();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("clorisa-api");
    expect(result.uptimeSeconds).toEqual(expect.any(Number));
    expect(result.timestamp).toEqual(expect.any(String));
  });

  it("returns liveness status", () => {
    const result = new HealthController().getLive();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("clorisa-api");
  });
});
