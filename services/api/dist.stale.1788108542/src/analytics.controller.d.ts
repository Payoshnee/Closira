export declare class AnalyticsController {
    getWardrobeAnalytics(): {
        metrics: {
            label: string;
            value: string;
            detail: string;
        }[];
        categoryBreakdown: {
            label: string;
            value: number;
        }[];
        usageBreakdown: {
            label: string;
            value: number;
        }[];
        colorBreakdown: {
            label: string;
            value: number;
        }[];
    };
}
