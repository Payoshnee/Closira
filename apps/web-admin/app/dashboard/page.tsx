import { DashboardHome } from "@/components/dashboard";
import { getCurrentSession } from "@/lib/api/auth";
import { getWardrobeSummary } from "@/lib/api/wardrobe";

export default async function DashboardPage() {
  const [session, summary] = await Promise.all([getCurrentSession(), getWardrobeSummary()]);

  return <DashboardHome session={session} summary={summary} />;
}
