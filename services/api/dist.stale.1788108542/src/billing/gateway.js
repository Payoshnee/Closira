"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.planPrices = void 0;
const currency = process.env.BILLING_CURRENCY ?? "USD";
const taxMode = process.env.BILLING_TAX_MODE ?? "exclusive";
exports.planPrices = {
    FREE: { amount: 0, currency, label: `${currency} 0/mo`, taxMode, limits: ["50 wardrobe items", "25 AI requests/month", "Community support"] },
    PRO: { amount: 19, currency, label: `${currency} 19/mo`, taxMode, limits: ["500 wardrobe items", "1,000 AI requests/month", "Advanced outfits and analytics"] },
    STYLIST: { amount: 49, currency, label: `${currency} 49/mo`, taxMode, limits: ["Unlimited wardrobe items", "5,000 AI requests/month", "Priority AI styling workflows"] },
    ENTERPRISE: { amount: 199, currency, label: "Custom", taxMode, limits: ["Team controls", "Custom AI providers", "SLA and admin reporting"] }
};
//# sourceMappingURL=gateway.js.map