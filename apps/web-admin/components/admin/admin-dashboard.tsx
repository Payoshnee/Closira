import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { AdminAiJobRow, AdminAuditLogRow, AdminHealthItem, AdminMetric, AdminReport, AdminStorageRow, AdminUserRow } from "@/types/admin";

export function AdminDashboard({
  metrics,
  health,
  users,
  aiJobs,
  storage,
  report,
  auditLogs
}: {
  metrics: AdminMetric[];
  health: AdminHealthItem[];
  users: AdminUserRow[];
  aiJobs: AdminAiJobRow[];
  storage: AdminStorageRow[];
  report: AdminReport | null;
  auditLogs: AdminAuditLogRow[];
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-5">
            <p className="text-sm font-medium text-stone-600">{metric.label}</p>
            <p className="mt-3 text-3xl font-bold text-charcoal">{metric.value}</p>
            <p className="mt-2 text-xs text-stone-500">{metric.detail}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
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

        <Card className="p-6">
          <h2 className="text-xl font-bold text-charcoal">30 day report</h2>
          {report ? (
            <dl className="mt-5 grid gap-4">
              <Metric label="New users" value={String(report.newUsers)} />
              <Metric label="Wardrobe usage logs" value={String(report.wardrobeUsageLogs)} />
              <Metric label="Revenue" value={String(report.revenue)} />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-stone-600">Report unavailable.</p>
          )}
        </Card>
      </div>

      <TableCard title="Users">
        <thead className="bg-ivory-100 text-xs uppercase text-stone-500">
          <tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Plan</th><th className="px-5 py-3">Usage</th></tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-5 py-4"><p className="font-semibold text-charcoal">{user.name}</p><p className="text-xs text-stone-500">{user.email}</p></td>
              <td className="px-5 py-4"><Badge>{user.role}</Badge></td>
              <td className="px-5 py-4 text-stone-600">{user.plan}</td>
              <td className="px-5 py-4 text-stone-600">{user.wardrobeItems} items · {user.outfits} outfits · {user.aiJobs} AI jobs</td>
            </tr>
          ))}
        </tbody>
      </TableCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <TableCard title="AI job monitoring">
          <thead className="bg-ivory-100 text-xs uppercase text-stone-500">
            <tr><th className="px-5 py-3">Type</th><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Confidence</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {aiJobs.map((job) => (
              <tr key={job.id}>
                <td className="px-5 py-4 font-semibold text-charcoal">{job.type}</td>
                <td className="px-5 py-4 text-stone-600">{job.provider}</td>
                <td className="px-5 py-4"><Badge>{job.status}</Badge></td>
                <td className="px-5 py-4 text-stone-600">{Math.round(job.confidence * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </TableCard>

        <TableCard title="Storage monitoring">
          <thead className="bg-ivory-100 text-xs uppercase text-stone-500">
            <tr><th className="px-5 py-3">Provider</th><th className="px-5 py-3">Images</th><th className="px-5 py-3">Bytes</th></tr>
          </thead>
          <tbody className="divide-y divide-stone-200 bg-white">
            {storage.map((row) => (
              <tr key={row.provider}>
                <td className="px-5 py-4 font-semibold text-charcoal">{row.provider}</td>
                <td className="px-5 py-4 text-stone-600">{row.images}</td>
                <td className="px-5 py-4 text-stone-600">{row.displayBytes}</td>
              </tr>
            ))}
          </tbody>
        </TableCard>
      </div>

      <TableCard title="Audit logs">
        <thead className="bg-ivory-100 text-xs uppercase text-stone-500">
          <tr><th className="px-5 py-3">Actor</th><th className="px-5 py-3">Action</th><th className="px-5 py-3">Entity</th><th className="px-5 py-3">Created</th></tr>
        </thead>
        <tbody className="divide-y divide-stone-200 bg-white">
          {auditLogs.map((log) => (
            <tr key={log.id}>
              <td className="px-5 py-4 font-semibold text-charcoal">{log.actor}</td>
              <td className="px-5 py-4 text-stone-600">{log.action}</td>
              <td className="px-5 py-4 text-stone-600">{log.entity}</td>
              <td className="px-5 py-4 text-stone-600">{log.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </TableCard>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase text-stone-500">{label}</dt>
      <dd className="mt-1 text-2xl font-bold text-charcoal">{value}</dd>
    </div>
  );
}

function TableCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-stone-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-charcoal">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">{children}</table>
      </div>
    </Card>
  );
}
