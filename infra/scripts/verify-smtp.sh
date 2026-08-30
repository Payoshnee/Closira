#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SMTP_HOST:-}" ]]; then
  echo "Missing SMTP_HOST" >&2
  exit 1
fi

SMTP_PORT="${SMTP_PORT:-587}"
MAIL_FROM="${MAIL_FROM:-Closira <no-reply@closira.local>}"
MAIL_TO="${1:-${TEST_EMAIL_TO:-}}"

if [[ -z "${MAIL_TO}" ]]; then
  echo "Usage: TEST_EMAIL_TO=user@example.com infra/scripts/verify-smtp.sh" >&2
  exit 1
fi

node <<'NODE'
const nodemailer = require("nodemailer");

async function main() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });

  await transporter.verify();
  await transporter.sendMail({
    from: process.env.MAIL_FROM || "Closira <no-reply@closira.local>",
    to: process.env.TEST_EMAIL_TO || process.argv[1],
    subject: "Closira SMTP verification",
    text: "Closira SMTP verification passed.",
    html: "<p>Closira SMTP verification passed.</p>",
  });
  console.log("SMTP verification email sent.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
NODE
