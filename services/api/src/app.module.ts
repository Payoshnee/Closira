import { APP_FILTER } from "@nestjs/core";
import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AdminController } from "./admin.controller";
import { AnalyticsController } from "./analytics.controller";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { LoginLockoutService } from "./auth/login-lockout.service";
import { BillingController } from "./billing.controller";
import { EntitlementsService } from "./billing/entitlements.service";
import { CalendarController } from "./calendar.controller";
import { HealthController } from "./health.controller";
import { RequestLoggingMiddleware } from "./logging/request-logging.middleware";
import { MailService } from "./mail/mail.service";
import { ErrorTrackingService } from "./monitoring/error-tracking.service";
import { HttpExceptionFilter } from "./monitoring/http-exception.filter";
import { MetricsController } from "./monitoring/metrics.controller";
import { MetricsService } from "./monitoring/metrics.service";
import { OutfitsController } from "./outfits.controller";
import { ProfileController } from "./profile.controller";
import { PrismaService } from "./prisma.service";
import { CsrfMiddleware } from "./security/csrf.middleware";
import { StorageService } from "./storage/storage.service";
import { ImageProcessingService } from "./storage/image-processing.service";
import { TaxonomyController } from "./taxonomy.controller";
import { UploadsController } from "./uploads.controller";
import { WardrobeController } from "./wardrobe.controller";

@Module({
  controllers: [HealthController, AuthController, AiController, AnalyticsController, TaxonomyController, WardrobeController, OutfitsController, CalendarController, BillingController, AdminController, ProfileController, UploadsController, MetricsController],
  providers: [
    PrismaService,
    AuthService,
    LoginLockoutService,
    EntitlementsService,
    StorageService,
    ImageProcessingService,
    MailService,
    MetricsService,
    ErrorTrackingService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware, CsrfMiddleware).forRoutes("*");
  }
}
