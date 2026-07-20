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

test("offers a printable simulator report without presenting calculations as results", async () => {
  const script = await readFile(new URL("../script.js", import.meta.url), "utf8");
  const html = await readFile(new URL("../business-denkidai.html", import.meta.url), "utf8");
  const cases = await readFile(new URL("../denkidai-minaoshi-cases.html", import.meta.url), "utf8");
  assert.match(script, /simulator_report_print/);
  assert.match(script, /window\.print\(\)/);
  assert.match(html, /結果を1枚で保存・印刷する/);
  assert.match(cases, /実際の導入実績ではありません/);
  assert.match(cases, /20%を仮定した計算例/);
});

test("tracks industry-page journeys and labels examples as calculations", async () => {
  const script = await readFile(new URL("../script.js", import.meta.url), "utf8");
  const pages = await Promise.all(["beauty-salon-denkidai.html", "restaurant-denkidai.html", "care-facility-denkidai.html"].map((name) => readFile(new URL(`../${name}`, import.meta.url), "utf8")));
  assert.match(script, /journey_click/);
  assert.match(script, /data-journey/);
  for (const html of pages) {
    assert.match(html, /data-journey="industry_to_simulator"/);
    assert.match(html, /実際の導入実績ではなく/);
  }
});
