export type AdminStatus = { available: false; reason: string };
export async function getAdminStatus(): Promise<AdminStatus> {
  return { available: false, reason: "Admin APIs are scheduled for Run 6." };
}
