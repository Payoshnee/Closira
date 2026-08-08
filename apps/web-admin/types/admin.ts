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

