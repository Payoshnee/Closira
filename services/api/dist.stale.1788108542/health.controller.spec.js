"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const health_controller_1 = require("./health.controller");
describe("HealthController", () => {
    it("returns API health status", () => {
        const result = new health_controller_1.HealthController().getHealth();
        expect(result.status).toBe("ok");
        expect(result.service).toBe("closira-api");
        expect(result.timestamp).toEqual(expect.any(String));
    });
});
//# sourceMappingURL=health.controller.spec.js.map