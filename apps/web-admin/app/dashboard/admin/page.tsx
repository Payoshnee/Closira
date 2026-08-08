import { AdminDashboard } from "@/components/admin";
import { getAdminHealth, getAdminMetrics } from "@/lib/api/admin";

export default async function AdminPage() {
  const [metrics, health] = await Promise.all([getAdminMetrics(), getAdminHealth()]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Operational dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Monitor users, wardrobe growth, AI jobs, storage, and service health.</p>
      </div>
      <AdminDashboard metrics={metrics} health={health} />
    </div>
  );
}
