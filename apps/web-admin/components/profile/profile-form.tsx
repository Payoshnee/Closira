import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/types/profile";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  return (
    <Card className="p-6">
      <form action="/dashboard/profile" className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-charcoal">
          Name
          <Input className="mt-2" name="name" defaultValue={profile.name} />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Email
          <Input className="mt-2" name="email" type="email" defaultValue={profile.email} />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Phone
          <Input className="mt-2" name="phone" defaultValue={profile.phone} />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Privacy mode
          <select name="privacyMode" defaultValue={profile.privacyMode} className="mt-2 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-charcoal shadow-line">
            <option value="strict">Strict</option>
            <option value="standard">Standard</option>
          </select>
        </label>
        <div className="md:col-span-2">
          <Button type="submit">Save profile</Button>
        </div>
      </form>
    </Card>
  );
}

