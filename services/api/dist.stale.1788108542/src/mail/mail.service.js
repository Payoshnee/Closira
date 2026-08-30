"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = require("nodemailer");
let MailService = MailService_1 = class MailService {
    logger = new common_1.Logger(MailService_1.name);
    async sendVerificationEmail(to, token) {
        const link = `${webUrl()}/verify-email?token=${encodeURIComponent(token)}`;
        await this.send({
            to,
            subject: "Verify your Closira email",
            text: `Verify your Closira email: ${link}`,
            html: `<p>Verify your Closira email:</p><p><a href="${link}">${link}</a></p>`
        });
        return link;
    }
    async sendPasswordResetEmail(to, token) {
        const link = `${webUrl()}/reset-password?token=${encodeURIComponent(token)}`;
        await this.send({
            to,
            subject: "Reset your Closira password",
            text: `Reset your Closira password: ${link}`,
            html: `<p>Reset your Closira password:</p><p><a href="${link}">${link}</a></p>`
        });
        return link;
    }
    async send(message) {
        if (!process.env.SMTP_HOST) {
            this.logger.warn(`SMTP not configured. Dev email for ${message.to}: ${message.text}`);
            return;
        }
        const transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT ?? 587),
            secure: process.env.SMTP_SECURE === "true",
            auth: process.env.SMTP_USER
                ? {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASSWORD
                }
                : undefined
        });
        await transporter.sendMail({
            from: process.env.MAIL_FROM ?? "Closira <no-reply@closira.local>",
            ...message
        });
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)()
], MailService);
function webUrl() {
    return (process.env.WEB_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
}
//# sourceMappingURL=mail.service.js.map