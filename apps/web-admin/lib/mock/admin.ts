import type { AdminHealthItem, AdminMetric } from "@/types/admin";

export const mockAdminMetrics: AdminMetric[] = [
  { label: "Users", value: "128", detail: "Early access accounts" },
  { label: "Wardrobe items", value: "2.4k", detail: "Tracked across users" },
  { label: "AI jobs", value: "312", detail: "Queued or completed this month" },
  { label: "Storage", value: "18 GB", detail: "Private image storage estimate" }
];

export const mockAdminHealth: AdminHealthItem[] = [
  { service: "API", status: "ok", detail: "Health endpoint documented" },
  { service: "AI service", status: "ok", detail: "FastAPI health endpoint available" },
  { service: "Storage", status: "warning", detail: "Production bucket integration pending" }
];

