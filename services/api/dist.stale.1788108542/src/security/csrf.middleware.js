"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.csrfHeaderName = exports.csrfCookieName = exports.CsrfMiddleware = void 0;
const common_1 = require("@nestjs/common");
const CSRF_COOKIE = "closira_csrf";
const CSRF_HEADER = "x-csrf-token";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const PUBLIC_AUTH_PATHS = new Set([
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/forgot-password",
    "/api/v1/auth/reset-password",
    "/api/v1/auth/verify-email"
]);
let CsrfMiddleware = class CsrfMiddleware {
    use(request, _response, next) {
        if (SAFE_METHODS.has(request.method) || PUBLIC_AUTH_PATHS.has(request.path)) {
            next();
            return;
        }
        const hasAuthCookie = Boolean(request.cookies?.closira_access || request.cookies?.closira_refresh);
        if (!hasAuthCookie) {
            next();
            return;
        }
        const cookieToken = request.cookies?.[CSRF_COOKIE];
        const headerToken = request.headers[CSRF_HEADER];
        const submittedToken = Array.isArray(headerToken) ? headerToken[0] : headerToken;
        if (!cookieToken || !submittedToken || cookieToken !== submittedToken) {
            throw new common_1.ForbiddenException("Invalid or missing CSRF token.");
        }
        next();
    }
};
exports.CsrfMiddleware = CsrfMiddleware;
exports.CsrfMiddleware = CsrfMiddleware = __decorate([
    (0, common_1.Injectable)()
], CsrfMiddleware);
exports.csrfCookieName = CSRF_COOKIE;
exports.csrfHeaderName = CSRF_HEADER;
//# sourceMappingURL=csrf.middleware.js.map