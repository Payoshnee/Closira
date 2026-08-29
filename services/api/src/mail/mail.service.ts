import { Injectable, Logger } from "@nestjs/common";
import nodemailer from "nodemailer";

type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendVerificationEmail(to: string, token: string) {
    const link = `${webUrl()}/verify-email?token=${encodeURIComponent(token)}`;
    await this.send({
      to,
      subject: "Verify your Closira email",
      text: `Verify your Closira email: ${link}`,
      html: `<p>Verify your Closira email:</p><p><a href="${link}">${link}</a></p>`
    });
    return link;
  }

  async sendPasswordResetEmail(to: string, token: string) {
    const link = `${webUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    await this.send({
      to,
      subject: "Reset your Closira password",
      text: `Reset your Closira password: ${link}`,
      html: `<p>Reset your Closira password:</p><p><a href="${link}">${link}</a></p>`
    });
    return link;
  }

  private async send(message: MailMessage) {
    if (!process.env.SMTP_HOST) {
      this.logger.warn(`SMTP not configured. Dev email for ${message.to}: ${message.text}`);
      return;
    }

    const transporter = nodemailer.createTransport({
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
}

function webUrl() {
  return (process.env.WEB_ORIGIN ?? "http://localhost:3000").replace(/\/$/, "");
}
