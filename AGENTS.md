# ShopLedger

## Stack

- Node.js with CommonJS, Express 4, and body-parser for JSON requests.
- Static HTML, CSS, and browser JavaScript in `public/`.
- Synchronous JSON storage in `data/db.json`.

## Module map

- `routes/customers.js` lists Khata customers and recent settlements, and records settlements.
- `routes/orders.js` lists, retrieves, places, and cancels orders.
- `routes/products.js` lists products and active coupons.
- `routes/reports.js` serves the dashboard, GST reconciliation, pricing preview, and admin export.
- `lib/coupons.js` normalizes and validates coupon codes and computes discounts.
- `lib/dates.js` formats dates, normalizes date strings, and labels fiscal years.
- `lib/inventory.js` looks up products, checks sellable stock, deducts stock, releases reservations, and summarizes inventory.
- `lib/invoice.js` computes invoice figures and renders printable HTML.
- `lib/ledger.js` looks up Khata customers, charges and reverses order debits, and records settlements.
- `lib/orders.js` adds, retrieves, filters, and cancels order records.
- `lib/pricing.js` computes checkout totals, allocating coupon discounts across lines before GST.
- `lib/reports.js` builds dashboard summaries and compares invoice figures with saved order figures.
- `lib/store.js` reads and writes the JSON database and maintains the audit log.
- `lib/tax.js` resolves item GST rates and splits GST into CGST and SGST.

## Commands

- Start the app with `node server.js`.
- Run tests with `node --test`. The package's test script is a placeholder.

## Rules

1. Write characterization tests before changing behaviour.
2. Change only the module(s) the ticket is about.
3. Use in-memory data for tests. Tests must never read or write `data/db.json`.
4. Add no dependencies.
5. Make the smallest fix that works.

## Current ticket

The printable invoice total and GST breakdown do not match what the customer was billed. Checkout applies HSN rates to discounted lines, while the invoice recomputes GST on gross lines and uses the fallback rate for newly saved lines.

Allowed files for the fix are `lib/invoice.js` and, only if truly needed, `lib/tax.js`.
