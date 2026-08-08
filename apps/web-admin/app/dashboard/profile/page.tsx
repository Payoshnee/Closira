import { ProfileForm } from "@/components/profile";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getProfile } from "@/lib/api/profile";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Profile</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Account and preferences</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Manage personal details, style preferences, privacy, and notification defaults.</p>
      </div>
      <Card className="p-5">
        <h2 className="text-lg font-bold text-charcoal">Style signals</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[...profile.stylePreferences, ...profile.favoriteColors].map((value) => (
            <Badge key={value}>{value}</Badge>
          ))}
        </div>
      </Card>
      <ProfileForm profile={profile} />
    </div>
  );
}

