import { SimplePage } from "@/components/marketing/simple-page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";

export default function ContactPage() {
  return (
    <SimplePage eyebrow="Contact" title="Talk to Clorisa." description="Send product questions, early-access requests, or partnership notes.">
      <Card className="max-w-2xl p-6">
        <form className="space-y-4" action="mailto:hello@clorisa.com" method="post">
          <label className="block text-sm font-medium text-charcoal">
            Name
            <Input className="mt-2" name="name" autoComplete="name" required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Email
            <Input className="mt-2" name="email" type="email" autoComplete="email" required />
          </label>
          <label className="block text-sm font-medium text-charcoal">
            Message
            <Textarea className="mt-2" name="message" required />
          </label>
          <Button type="submit">Send message</Button>
        </form>
      </Card>
    </SimplePage>
  );
}

