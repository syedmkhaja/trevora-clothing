import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

const RECEIPT_PREFIX = "trevora-order-receipt:";

function receiptMac(orderId: string): Buffer {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) throw new Error("Payment verification is not configured.");
  return createHmac("sha256", secret).update(`${RECEIPT_PREFIX}${orderId}`).digest();
}

/** A short-lived HttpOnly-cookie bearer token, issued only after persisted verification. */
export function createOrderReceiptToken(orderId: string): string {
  return `${orderId}.${receiptMac(orderId).toString("hex")}`;
}

/** Validates the signed token before any order ID is used for database lookup. */
export function verifyOrderReceiptToken(token: string): string | null {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;
  const orderId = token.slice(0, separator);
  const suppliedHex = token.slice(separator + 1);
  if (!/^order_[A-Za-z0-9]+$/.test(orderId) || !/^[a-f\d]{64}$/i.test(suppliedHex)) return null;

  try {
    const expected = receiptMac(orderId);
    const supplied = Buffer.from(suppliedHex, "hex");
    return supplied.length === expected.length && timingSafeEqual(expected, supplied) ? orderId : null;
  } catch {
    return null;
  }
}
