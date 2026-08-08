export type AnalyticsMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AnalyticsSlice = {
  label: string;
  value: number;
};

export type WardrobeAnalytics = {
  metrics: AnalyticsMetric[];
  categoryBreakdown: AnalyticsSlice[];
  usageBreakdown: AnalyticsSlice[];
  colorBreakdown: AnalyticsSlice[];
};

