import { mockAdminHealth, mockAdminMetrics } from "@/lib/mock/admin";
import type { AdminHealthItem, AdminMetric } from "@/types/admin";

export async function getAdminMetrics(): Promise<AdminMetric[]> {
  // TODO: Replace mock adapter with admin metrics endpoints once implemented.
  return mockAdminMetrics;
}

export async function getAdminHealth(): Promise<AdminHealthItem[]> {
  // TODO: Replace mock adapter with admin health endpoints once implemented.
  return mockAdminHealth;
}
