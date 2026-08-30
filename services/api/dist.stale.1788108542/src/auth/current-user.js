"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireCurrentUser = requireCurrentUser;
exports.requireAdminUser = requireAdminUser;
const common_1 = require("@nestjs/common");
function requireCurrentUser(request, auth) {
    const authHeader = request.headers.authorization;
    const bearer = authHeader?.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : undefined;
    const cookies = (request.cookies ?? {});
    const payload = auth.verifyAccessToken(bearer ?? cookies.closira_access);
    if (!payload.sub) {
        throw new common_1.UnauthorizedException("Authenticated user is required.");
    }
    return { id: payload.sub, email: payload.email, role: payload.role };
}
function requireAdminUser(request, auth) {
    const user = requireCurrentUser(request, auth);
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        throw new common_1.ForbiddenException("Admin access is required.");
    }
    return user;
}
//# sourceMappingURL=current-user.js.map