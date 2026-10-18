import { createHmac } from "crypto";
import assert from "assert";

// Mirror of lib/creem/signature.ts for Node smoke without TS loader
function compute(raw, secret) {
  return createHmac("sha256", secret).update(raw, "utf8").digest("hex");
}

const body = '{"id":"evt_1","eventType":"checkout.completed"}';
const secret = "whsec_test";
const sig = compute(body, secret);
assert.equal(sig.length, 64);
assert.equal(compute(body, secret), sig);
assert.notEqual(compute(body + "x", secret), sig);
console.log("creem signature smoke ok");
