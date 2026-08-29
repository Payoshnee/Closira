-- CreateEnum
CREATE TYPE "BillingGatewayStatus" AS ENUM ('ENABLED', 'DISABLED', 'TESTING');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "provider_key" TEXT NOT NULL DEFAULT 'manual';

-- AlterTable
ALTER TABLE "invoices" ADD COLUMN "provider_key" TEXT NOT NULL DEFAULT 'manual';

-- CreateTable
CREATE TABLE "billing_gateways" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "owner_id" UUID,
    "key" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "status" "BillingGatewayStatus" NOT NULL DEFAULT 'TESTING',
    "base_url" TEXT,
    "webhook_secret_ref" TEXT,
    "secret_ref" TEXT,
    "config" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_gateways_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_gateways_owner_id_key_key" ON "billing_gateways"("owner_id", "key");

-- CreateIndex
CREATE INDEX "billing_gateways_key_status_idx" ON "billing_gateways"("key", "status");

-- AddForeignKey
ALTER TABLE "billing_gateways" ADD CONSTRAINT "billing_gateways_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
