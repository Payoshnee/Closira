export type AdminMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AdminHealthItem = {
  service: string;
  status: "ok" | "warning";
  detail: string;
};

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  wardrobeItems: number;
  outfits: number;
  aiJobs: number;
  plan: string;
  createdAt: string;
};

export type AdminAiJobRow = {
  id: string;
  user: string;
  type: string;
  provider: string;
  status: string;
  confidence: number;
  errorMessage?: string | null;
  createdAt: string;
};

export type AdminStorageRow = {
  provider: string;
  images: number;
  bytes: number;
  displayBytes: string;
};

export type AdminReport = {
  period: string;
  newUsers: number;
  wardrobeUsageLogs: number;
  revenue: number;
};

export type AdminAuditLogRow = {
  id: string;
  actor: string;
  action: string;
  entity: string;
  entityId?: string | null;
  createdAt: string;
};
