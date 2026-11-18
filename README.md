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

## Razorpay configuration

Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` as server environment variables in Vercel Project Settings → Environment Variables. Do not use a `NEXT_PUBLIC_` prefix. `.env.example` lists the names only; never commit actual credentials. Restart/redeploy after adding or changing them.

The app creates Razorpay orders in `/api/payments/create-order` using prices from the server product catalogue, then verifies captured payment signatures and provider order/payment details in `/api/payments/verify`. The key secret is only read in server modules. The public key ID is returned to the browser only to initialize Razorpay Checkout.

**Important before accepting live orders:** the current project has no durable order/fulfillment database, webhook reconciliation, or operational order workflow. A captured payment is verified and shown as a receipt in the current browser session, but this implementation does not persist the customer/order record for fulfillment. Connect durable order storage and a Razorpay webhook before enabling production sales. COD remains disabled until order storage exists.

## Customize

- Product catalogue, prices and image URLs: `lib/products.ts`
- Brand colors and typography: `tailwind.config.ts` and `app/globals.css`
- Payment shipping charge and INR formatting: `lib/checkout.ts`
- Product photos are currently remote Unsplash placeholders and should be replaced with brand-owned product images before launch.
