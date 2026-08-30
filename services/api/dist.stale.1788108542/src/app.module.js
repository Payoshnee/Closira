"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const ai_controller_1 = require("./ai.controller");
const admin_controller_1 = require("./admin.controller");
const analytics_controller_1 = require("./analytics.controller");
const auth_controller_1 = require("./auth/auth.controller");
const auth_service_1 = require("./auth/auth.service");
const login_lockout_service_1 = require("./auth/login-lockout.service");
const billing_controller_1 = require("./billing.controller");
const entitlements_service_1 = require("./billing/entitlements.service");
const calendar_controller_1 = require("./calendar.controller");
const health_controller_1 = require("./health.controller");
const request_logging_middleware_1 = require("./logging/request-logging.middleware");
const mail_service_1 = require("./mail/mail.service");
const error_tracking_service_1 = require("./monitoring/error-tracking.service");
const http_exception_filter_1 = require("./monitoring/http-exception.filter");
const metrics_controller_1 = require("./monitoring/metrics.controller");
const metrics_service_1 = require("./monitoring/metrics.service");
const outfits_controller_1 = require("./outfits.controller");
const profile_controller_1 = require("./profile.controller");
const prisma_service_1 = require("./prisma.service");
const csrf_middleware_1 = require("./security/csrf.middleware");
const storage_service_1 = require("./storage/storage.service");
const image_processing_service_1 = require("./storage/image-processing.service");
const taxonomy_controller_1 = require("./taxonomy.controller");
const uploads_controller_1 = require("./uploads.controller");
const wardrobe_controller_1 = require("./wardrobe.controller");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(request_logging_middleware_1.RequestLoggingMiddleware, csrf_middleware_1.CsrfMiddleware).forRoutes("*");
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        controllers: [health_controller_1.HealthController, auth_controller_1.AuthController, ai_controller_1.AiController, analytics_controller_1.AnalyticsController, taxonomy_controller_1.TaxonomyController, wardrobe_controller_1.WardrobeController, outfits_controller_1.OutfitsController, calendar_controller_1.CalendarController, billing_controller_1.BillingController, admin_controller_1.AdminController, profile_controller_1.ProfileController, uploads_controller_1.UploadsController, metrics_controller_1.MetricsController],
        providers: [
            prisma_service_1.PrismaService,
            auth_service_1.AuthService,
            login_lockout_service_1.LoginLockoutService,
            entitlements_service_1.EntitlementsService,
            storage_service_1.StorageService,
            image_processing_service_1.ImageProcessingService,
            mail_service_1.MailService,
            metrics_service_1.MetricsService,
            error_tracking_service_1.ErrorTrackingService,
            {
                provide: core_1.APP_FILTER,
                useClass: http_exception_filter_1.HttpExceptionFilter
            }
        ]
    })
], AppModule);
//# sourceMappingURL=app.module.js.map