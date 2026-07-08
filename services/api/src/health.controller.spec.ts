import { HealthController } from "./health.controller";

describe("HealthController", () => {
  it("returns API health status", () => {
    const result = new HealthController().getHealth();

    expect(result.status).toBe("ok");
    expect(result.service).toBe("closira-api");
    expect(result.timestamp).toEqual(expect.any(String));
  });
});

