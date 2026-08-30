type WardrobeItem = {
    id: string;
    title: string;
    categoryName: string;
    primaryColor: string;
    material: string;
    images: {
        id: string;
        imageType: "front";
        alt: string;
        gradient: string;
    }[];
};
type AiProvider = "native" | "openai" | "anthropic" | "gemini" | "azure-openai" | "ollama" | "custom";
type AiProviderSettings = {
    activeProvider: AiProvider;
    nativeEnabled: boolean;
    connectedProviders: AiProvider[];
    supportedProviders: {
        id: AiProvider;
        name: string;
        requiresApiKey: boolean;
        endpointLabel?: string;
    }[];
};
type StylingScenario = "Dinner" | "Office" | "Wedding" | "Travel" | "Minimalist Capsule";
export declare class AiController {
    getSettings(): AiProviderSettings;
    updateSettings(body: Partial<AiProviderSettings> & {
        provider?: AiProvider;
    }): AiProviderSettings;
    recommendOutfit(body: {
        prompt?: string;
        occasion?: string;
    }): {
        id: string;
        prompt: string;
        title: string;
        confidence: number;
        occasion: StylingScenario;
        explanation: string;
        items: WardrobeItem[];
        provider: AiProvider;
        fallbackUsed: boolean;
    };
    listRecommendations(): {
        id: string;
        prompt: string;
        title: string;
        confidence: number;
        occasion: StylingScenario;
        explanation: string;
        items: WardrobeItem[];
        provider: AiProvider;
        fallbackUsed: boolean;
    }[];
    shoppingCheck(body: {
        itemName?: string;
        occasion?: string;
    }): {
        id: string;
        itemName: string;
        recommendation: string;
        compatibilityScore: number;
        duplicateRisk: string;
        explanation: string;
        similarItems: WardrobeItem[];
        provider: AiProvider;
        fallbackUsed: boolean;
    };
    listShoppingChecks(): {
        id: string;
        itemName: string;
        recommendation: string;
        compatibilityScore: number;
        duplicateRisk: string;
        explanation: string;
        similarItems: WardrobeItem[];
        provider: AiProvider;
        fallbackUsed: boolean;
    }[];
}
export {};
