import { AiSettingsPanel } from "@/components/ai";
import { getAiProviderSettings } from "@/lib/api/aiStylist";

export default async function AiSettingsPage() {
  const settings = await getAiProviderSettings();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">AI settings</p>
        <h1 className="mt-2 text-3xl font-bold text-charcoal">Choose native or custom AI</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">Use Clorisa Native AI or connect providers such as ChatGPT, Claude, Gemini, Azure OpenAI, Ollama, or a custom OpenAI-compatible endpoint.</p>
      </div>
      <AiSettingsPanel settings={settings} />
    </div>
  );
}
