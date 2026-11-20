// Small unit tests that run with plain Node: `node --test scripts/qa/`
import test from "node:test";
import assert from "node:assert/strict";
import { formatAbn, isValidAbn } from "../../src/lib/abn.js";

test("ABN format", () => {
  assert.equal(formatAbn("51824753556"), "51 824 753 556");
  assert.equal(formatAbn("51 82"), "51 82");
});
test("ABN checksum", () => {
  assert.equal(isValidAbn("51 824 753 556"), true); // the ATO's published example ABN
  assert.equal(isValidAbn("12345678901"), false);
  assert.equal(isValidAbn("5182475355"), false);
});
