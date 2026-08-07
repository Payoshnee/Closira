import { SimplePage } from "@/components/marketing/simple-page";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <SimplePage eyebrow="Privacy" title="Your wardrobe should stay yours." description="Closira is designed around private images, explicit consent, and clear controls for AI-powered features.">
      <Card className="space-y-4 p-6 text-sm leading-7 text-stone-700">
        <p>Closira stores wardrobe and profile data for product functionality and does not treat private wardrobe photos as public assets.</p>
        <p>Future virtual try-on and beauty preview features must be opt-in, clearly labeled, and controlled by user consent.</p>
        <p>Production policies will be finalized before public launch and kept aligned with the security and privacy documentation.</p>
      </Card>
    </SimplePage>
  );
}

