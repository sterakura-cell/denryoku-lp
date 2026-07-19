import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("tracks the complete electricity lead funnel", async () => {
  const source = await readFile(new URL("../script.js", import.meta.url), "utf8");
  for (const event of ["simulator_complete", "form_start", "phone_click", "lead_submit", "generate_lead"]) {
    assert.match(source, new RegExp(`["']${event}["']`), event);
  }
  assert.match(source, /lastTrackedAmount/);
  assert.match(source, /dataset\.formStarted/);
});

test("loads the production GA4 measurement id", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
  assert.match(html, /G-M3PZ94WB0H/);
});
