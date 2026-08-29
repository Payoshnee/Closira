import { apiGet } from "@/lib/api/client";
import { mockAdminHealth, mockAdminMetrics } from "@/lib/mock/admin";
import type { AdminAiJobRow, AdminAuditLogRow, AdminHealthItem, AdminMetric, AdminReport, AdminStorageRow, AdminUserRow } from "@/types/admin";

export async function getAdminMetrics(): Promise<AdminMetric[]> {
  const result = await apiGet<AdminMetric[]>("/admin/metrics");
  return result.data ?? mockAdminMetrics;
}

export async function getAdminHealth(): Promise<AdminHealthItem[]> {
  const result = await apiGet<AdminHealthItem[]>("/admin/health");
  return result.data ?? mockAdminHealth;
}

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  const result = await apiGet<AdminUserRow[]>("/admin/users");
  return result.data ?? [];
}

export async function listAdminAiJobs(): Promise<AdminAiJobRow[]> {
  const result = await apiGet<AdminAiJobRow[]>("/admin/ai/jobs");
  return result.data ?? [];
}

export async function listAdminStorage(): Promise<AdminStorageRow[]> {
  const result = await apiGet<AdminStorageRow[]>("/admin/storage");
  return result.data ?? [];
}

export async function getAdminReport(): Promise<AdminReport | null> {
  const result = await apiGet<AdminReport>("/admin/reports");
  return result.data ?? null;
}

export async function listAdminAuditLogs(): Promise<AdminAuditLogRow[]> {
  const result = await apiGet<AdminAuditLogRow[]>("/admin/audit-logs");
  return result.data ?? [];
}
