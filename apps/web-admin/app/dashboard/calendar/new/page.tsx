import { CalendarEditor } from "@/components/outfits";
import { listOutfits } from "@/lib/api/outfits";

export default async function NewCalendarEventPage() {
  const outfits = await listOutfits();

  return <CalendarEditor outfits={outfits} />;
}
