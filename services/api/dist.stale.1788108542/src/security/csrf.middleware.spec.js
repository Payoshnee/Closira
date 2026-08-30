"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const csrf_middleware_1 = require("./csrf.middleware");
describe("CsrfMiddleware", () => {
    const middleware = new csrf_middleware_1.CsrfMiddleware();
    it("allows safe methods", () => {
        const next = jest.fn();
        middleware.use(makeRequest({ method: "GET", path: "/api/v1/wardrobe" }), {}, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
    it("blocks authenticated mutations without a matching CSRF token", () => {
        const next = jest.fn();
        const request = makeRequest({
            method: "POST",
            path: "/api/v1/wardrobe/items",
            cookies: { closira_access: "access", closira_csrf: "cookie-token" },
            headers: { "x-csrf-token": "wrong-token" }
        });
        expect(() => middleware.use(request, {}, next)).toThrow(common_1.ForbiddenException);
        expect(next).not.toHaveBeenCalled();
    });
    it("allows authenticated mutations with a matching CSRF token", () => {
        const next = jest.fn();
        const request = makeRequest({
            method: "POST",
            path: "/api/v1/wardrobe/items",
            cookies: { closira_access: "access", closira_csrf: "cookie-token" },
            headers: { "x-csrf-token": "cookie-token" }
        });
        middleware.use(request, {}, next);
        expect(next).toHaveBeenCalledTimes(1);
    });
});
function makeRequest(input) {
    return {
        method: input.method,
        path: input.path,
        cookies: input.cookies ?? {},
        headers: input.headers ?? {}
    };
}
//# sourceMappingURL=csrf.middleware.spec.js.map