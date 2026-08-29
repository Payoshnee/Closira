import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AdminController } from "./admin.controller";
import { AnalyticsController } from "./analytics.controller";
import { AuthController } from "./auth/auth.controller";
import { AuthService } from "./auth/auth.service";
import { BillingController } from "./billing.controller";
import { CalendarController } from "./calendar.controller";
import { HealthController } from "./health.controller";
import { RequestLoggingMiddleware } from "./logging/request-logging.middleware";
import { MailService } from "./mail/mail.service";
import { OutfitsController } from "./outfits.controller";
import { ProfileController } from "./profile.controller";
import { PrismaService } from "./prisma.service";
import { StorageService } from "./storage/storage.service";
import { TaxonomyController } from "./taxonomy.controller";
import { UploadsController } from "./uploads.controller";
import { WardrobeController } from "./wardrobe.controller";

@Module({
  controllers: [HealthController, AuthController, AiController, AnalyticsController, TaxonomyController, WardrobeController, OutfitsController, CalendarController, BillingController, AdminController, ProfileController, UploadsController],
  providers: [PrismaService, AuthService, StorageService, MailService]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes("*");
  }
}
