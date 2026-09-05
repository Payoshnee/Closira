import { Cpu, KeyRound, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { saveAiProviderSettings } from "@/lib/actions/ai";
import type { AiProviderSettings } from "@/types/ai";

export function AiSettingsPanel({ settings }: { settings: AiProviderSettings | null }) {
  if (!settings) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-charcoal">AI settings unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">Start the NestJS API to configure native or custom AI providers.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">Active provider</p>
            <h2 className="mt-2 text-2xl font-bold text-charcoal">{settings.supportedProviders.find((provider) => provider.id === settings.activeProvider)?.name}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">Clorisa can use native AI or route the same styling, shopping, analysis, and future try-on tasks through a connected provider.</p>
          </div>
          <Badge>{settings.activeProvider}</Badge>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {settings.supportedProviders.map((provider) => {
          const isConnected = settings.connectedProviders.includes(provider.id);
          return (
            <Card key={provider.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-charcoal">{provider.name}</h3>
                  <p className="mt-2 text-sm text-stone-600">{provider.requiresApiKey ? "Requires an API key or secure server-side credential." : "Can run without a hosted API key."}</p>
                </div>
                {provider.id === "native" ? <Cpu className="h-5 w-5 text-rose-700" aria-hidden="true" /> : <KeyRound className="h-5 w-5 text-rose-700" aria-hidden="true" />}
              </div>
              <form action={saveAiProviderSettings} className="mt-5 space-y-3">
                <input type="hidden" name="provider" value={provider.id} />
                <label className="block text-sm font-medium text-charcoal">
                  Model
                  <Input className="mt-2" name="model" placeholder={provider.id === "native" ? "clorisa-baseline" : "gpt-4o-mini, claude-3-5-sonnet, gemini-1.5-pro"} />
                </label>
                {provider.endpointLabel ? (
                  <label className="block text-sm font-medium text-charcoal">
                    {provider.endpointLabel}
                    <Input className="mt-2" name="baseUrl" placeholder={provider.id === "ollama" ? "http://localhost:11434" : "https://api.example.com/v1"} />
                  </label>
                ) : null}
                {provider.requiresApiKey ? (
                  <label className="block text-sm font-medium text-charcoal">
                    API key
                    <Input className="mt-2" name="apiKey" type="password" placeholder="Stored server-side in production" />
                  </label>
                ) : null}
                <Button type="submit" variant={isConnected ? "secondary" : "primary"}>
                  <LinkIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                  {isConnected ? "Use provider" : "Connect provider"}
                </Button>
              </form>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
