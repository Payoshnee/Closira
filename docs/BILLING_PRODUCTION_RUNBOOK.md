# Billing Production Runbook

Closira supports a gateway-agnostic checkout path plus provider-specific webhook normalization for Stripe, Razorpay, Paddle, PayPal, manual, and custom compatible gateways.

## Required Environment

Set these per environment:

```bash
DEFAULT_BILLING_GATEWAY=stripe
BILLING_CURRENCY=USD
BILLING_TAX_MODE=exclusive
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
```

For other gateways, use the upper snake-case key:

```bash
RAZORPAY_SECRET_KEY=...
RAZORPAY_WEBHOOK_SECRET=...
PADDLE_SECRET_KEY=...
PADDLE_WEBHOOK_SECRET=...
PAYPAL_SECRET_KEY=...
PAYPAL_WEBHOOK_SECRET=...
```

## Staging Verification

Run after deploying the API with real credentials:

```bash
API_BASE_URL=https://staging-api.example.com/api/v1 \
BILLING_GATEWAY=stripe \
STRIPE_SECRET_KEY=... \
STRIPE_WEBHOOK_SECRET=... \
infra/scripts/verify-billing-gateways.sh stripe
```

Then perform one real sandbox checkout in each enabled provider dashboard and confirm:

- checkout session is created
- webhook signature is accepted
- subscription status updates to `ACTIVE`, `PAST_DUE`, or `CANCELED`
- entitlements match the selected plan
- failed payments move the subscription to `PAST_DUE` or `INCOMPLETE`
- invoice records appear and can be downloaded

## Tax And Currency

`BILLING_CURRENCY` controls display/default plan currency. `BILLING_TAX_MODE` should match provider configuration, typically `exclusive`, `inclusive`, or `provider_managed`.

Final tax behavior still requires a finance/legal review for launch countries.
