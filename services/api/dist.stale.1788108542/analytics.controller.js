"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const common_1 = require("@nestjs/common");
let AnalyticsController = class AnalyticsController {
    getWardrobeAnalytics() {
        return {
            metrics: [
                { label: "Wardrobe value", value: "$640", detail: "Calculated from tracked item purchase metadata" },
                { label: "Average cost per wear", value: "$19.39", detail: "Derived from usage counts and purchase prices" },
                { label: "Unused items", value: "1", detail: "Items with no recorded wear history" },
                { label: "Reuse score", value: "72%", detail: "Based on wear distribution and favorites" }
            ],
            categoryBreakdown: [
                { label: "Western Wear", value: 24 },
                { label: "Traditional Wear", value: 18 },
                { label: "Accessories", value: 16 },
                { label: "Formal Wear", value: 11 },
                { label: "Footwear", value: 9 }
            ],
            usageBreakdown: [
                { label: "High rotation", value: 2 },
                { label: "Occasion only", value: 2 },
                { label: "Never worn", value: 1 }
            ],
            colorBreakdown: [
                { label: "Ivory", value: 2 },
                { label: "Rose", value: 1 },
                { label: "Charcoal", value: 1 },
                { label: "Gold", value: 1 }
            ]
        };
    }
};
exports.AnalyticsController = AnalyticsController;
__decorate([
    (0, common_1.Get)("wardrobe"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AnalyticsController.prototype, "getWardrobeAnalytics", null);
exports.AnalyticsController = AnalyticsController = __decorate([
    (0, common_1.Controller)("analytics")
], AnalyticsController);
//# sourceMappingURL=analytics.controller.js.map