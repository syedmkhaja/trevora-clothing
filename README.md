# TREVORA CLOTHING

Premium streetwear storefront built with Next.js App Router, TypeScript and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

## Checks

```bash
npm run typecheck
npm run build
```

## Production checkout configuration

Configure these Vercel environment variables for the existing project (Production and Preview as appropriate):

- `RAZORPAY_KEY_ID` — Razorpay public key ID, used only to initialize Checkout.
- `RAZORPAY_KEY_SECRET` — secret credential used only by server-side order creation and verification. Never prefix with `NEXT_PUBLIC_`.
- `RAZORPAY_WEBHOOK_SECRET` — webhook signing secret configured in the Razorpay Dashboard for the webhook URL `/api/payments/webhook`.
- `DATABASE_URL` — TLS-enabled PostgreSQL connection string for a managed PostgreSQL database. The app creates its two tables automatically on first payment API use; restrict database credentials and take regular backups.

### Razorpay setup

Configure a Razorpay webhook for `payment.captured` pointing to `https://<your-production-domain>/api/payments/webhook`. Keep its webhook signing secret separate from the API Key Secret. Set Razorpay to automatic capture (or implement an explicit capture operation before expecting successful verification). COD is disabled until order storage and fulfillment are implemented.

Order creation recalculates item amounts from the server-side product catalogue and persists a payment-attempt record before returning the Razorpay order. A durable order record is inserted only after server signature verification and captured status; unique constraints on Razorpay order/payment IDs make browser verification and repeated webhook delivery idempotent. Webhooks are signature-verified and provider payment/order state is re-fetched before storage.

Before accepting live customers, provision PostgreSQL, set all four variables, configure the webhook and automatic capture in Razorpay, test successful/failed/cancelled payment and webhook retry scenarios using test credentials, establish support/refund/fulfillment procedures, then perform a controlled live transaction. A database is mandatory: payments cannot be completed unless the attempt can be durably stored.

## Customize

- Product catalogue, prices and placeholder image URLs: `lib/products.ts`
- Brand colors and typography: `tailwind.config.ts` and `app/globals.css`
- Shipping charge and INR formatting: `lib/checkout.ts`
