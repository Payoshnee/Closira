"use client";

import { useActionState } from "react";
import { saveProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { UserProfile } from "@/types/profile";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [state, action, pending] = useActionState(saveProfile, {
    status: "ready" as const,
    message: ""
  });

  return (
    <Card className="p-6">
      <form action={action} className="grid gap-5 md:grid-cols-2">
        <label className="block text-sm font-medium text-charcoal">
          Name
          <Input className="mt-2" name="name" defaultValue={profile.name} required />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Email
          <Input className="mt-2" name="email" type="email" defaultValue={profile.email} required />
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
        <label className="block text-sm font-medium text-charcoal">
          Style preferences
          <Input className="mt-2" name="stylePreferences" defaultValue={profile.stylePreferences.join(", ")} placeholder="minimal, polished, streetwear" />
        </label>
        <label className="block text-sm font-medium text-charcoal">
          Favorite colors
          <Input className="mt-2" name="favoriteColors" defaultValue={profile.favoriteColors.join(", ")} placeholder="ivory, charcoal, rose" />
        </label>
        <label className="flex items-center gap-3 text-sm font-medium text-charcoal md:col-span-2">
          <input name="notificationsEnabled" type="checkbox" defaultChecked={profile.notificationsEnabled} className="h-4 w-4 rounded border-stone-300" />
          Notifications enabled
        </label>
        {state.message ? (
          <p className={`text-sm font-medium md:col-span-2 ${state.status === "error" ? "text-red-700" : "text-emerald-700"}`} role="status">
            {state.message}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? "Saving..." : "Save profile"}</Button>
        </div>
      </form>
    </Card>
  );
}
