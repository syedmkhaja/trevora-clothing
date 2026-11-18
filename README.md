# TREVORA CLOTHING

A premium, responsive streetwear storefront built with Next.js App Router, TypeScript and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and checks

```bash
npm run typecheck
npm run build
```

## Customize

- Product catalogue, prices, copy, categories and image URLs: `lib/products.ts`
- Brand colors and typography: `tailwind.config.ts` and `app/globals.css`
- Page metadata: each page's `metadata` export and `app/layout.tsx`
- Contact email and WhatsApp link: `components/contact-content.tsx` and `components/site-footer.tsx`

Product photos use remote Unsplash image URLs as placeholders. Replace them with owned product photography before launch. The cart persists in the visitor's browser via local storage. Checkout and form submissions are demo interactions; connect a payment provider, email marketing platform and form backend for production.
