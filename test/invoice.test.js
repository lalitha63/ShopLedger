const { test } = require('node:test');
const assert = require('node:assert').strict;
const invoice = require('../lib/invoice');
const pricing = require('../lib/pricing');

function compareFigures(order, expectedInvoice, expectedCheckout) {
  const { rows, ...invoiceTotals } = invoice.computeInvoiceFigures(order);
  const { lines, taxable, ...checkoutTotals } = pricing.computeTotals(order.items, order.coupon);

  assert.deepEqual({
    ...invoiceTotals,
    lineGst: rows.map(({ gstPercent, lineTax }) => [gstPercent, lineTax])
  }, expectedInvoice);

  assert.deepEqual({
    ...checkoutTotals,
    lineGst: lines.map(({ gstPercent, tax }) => [gstPercent, tax])
  }, expectedCheckout);
}

// These synthetic orders model the ticket scenarios without loading the store.
test('CURRENT BEHAVIOUR: #1001 invoice uses the 5% and 12% HSN slabs', () => {
  const order = {
    id: 1001,
    coupon: '',
    items: [
      { name: 'Rice', price: 100, qty: 5, hsn: '1006' },
      { name: 'Ghee', price: 250, qty: 2, hsn: '0405' }
    ]
  };

  const expected = {
    subtotal: 1000, discount: 0, tax: 85, cgst: 42.5, sgst: 42.5, total: 1085,
    lineGst: [[5, 25], [12, 60]]
  };

  compareFigures(order, expected, expected);
});

test('CURRENT BEHAVIOUR: #1002 invoice applies SAVE10 before GST', () => {
  const order = {
    id: 1002,
    coupon: 'SAVE10',
    items: [{ name: 'Rice', price: 100, qty: 8, hsn: '1006', gstRate: 5 }]
  };

  const expected = {
    subtotal: 800, discount: 80, tax: 36, cgst: 18, sgst: 18, total: 756,
    lineGst: [[5, 36]]
  };

  compareFigures(order, expected, expected);
});

test('CURRENT BEHAVIOUR: #1004 invoice honors the SAVE10 cap on 2240', () => {
  const order = {
    id: 1004,
    coupon: 'SAVE10',
    items: [{ name: 'Groundnut oil', price: 280, qty: 8, hsn: '1508' }]
  };

  const expected = {
    subtotal: 2240, discount: 150, tax: 104.5, cgst: 52.25, sgst: 52.25, total: 2194.5,
    lineGst: [[5, 104.5]]
  };

  compareFigures(order, expected, expected);
});

test('CURRENT BEHAVIOUR: #1008 invoice matches checkout at 18% without a coupon', () => {
  const order = {
    id: 1008,
    coupon: '',
    items: [
      { name: 'Tea', price: 250, qty: 2, hsn: '0902' },
      { name: 'Syrup', price: 125, qty: 2, hsn: '2106' }
    ]
  };

  const expected = {
    subtotal: 750, discount: 0, tax: 135, cgst: 67.5, sgst: 67.5, total: 885,
    lineGst: [[18, 90], [18, 45]]
  };

  compareFigures(order, expected, expected);
});

test('invoice matches checkout for mixed GST slabs with a capped SAVE10 discount', () => {
  const items = [
    { name: 'Rice', price: 100, qty: 10, hsn: '1006' },
    { name: 'Ghee', price: 250, qty: 4, hsn: '0405' }
  ];
  const expected = {
    subtotal: 2000, discount: 150, tax: 157.25, cgst: 78.63, sgst: 78.62, total: 2007.25,
    lineGst: [[5, 46.25], [12, 111]]
  };

  compareFigures({ items, coupon: 'SAVE10' }, expected, expected);
});
