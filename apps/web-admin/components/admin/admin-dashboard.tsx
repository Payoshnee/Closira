import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { AdminHealthItem, AdminMetric } from "@/types/admin";

export function AdminDashboard({ metrics, health }: { metrics: AdminMetric[]; health: AdminHealthItem[] }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <p className="text-sm font-medium text-stone-600">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold text-charcoal">{metric.value}</p>
            <p className="mt-2 text-xs text-stone-500">{metric.detail}</p>
          </Card>
        ))}
      </div>
      <Card className="p-6">
        <h2 className="text-xl font-bold text-charcoal">Service health</h2>
        <div className="mt-5 space-y-3">
          {health.map((item) => (
            <div key={item.service} className="flex items-center justify-between gap-4 rounded-lg bg-ivory-100 p-4">
              <div>
                <p className="font-semibold text-charcoal">{item.service}</p>
                <p className="mt-1 text-sm text-stone-600">{item.detail}</p>
              </div>
              {item.status === "ok" ? <CheckCircle2 className="h-5 w-5 text-sage" aria-label="ok" /> : <AlertTriangle className="h-5 w-5 text-amber-700" aria-label="warning" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

