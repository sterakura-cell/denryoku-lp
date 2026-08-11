import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const noindexPages = [
  "beauty-salon-denkidai.html",
  "care-facility-denkidai.html",
  "clinic-denkidai.html",
  "restaurant-denkidai.html",
  "building-common-area-denkidai.html",
  "building-vacancy-fixed-cost.html",
  "building-tenant-taikyo-denkidai.html",
  "chusho-kigyo-denkidai-shikinguri.html",
  "cold-storage-denkidai-takai-riyu.html",
  "denki-sakugen-ginko-hyoka.html",
  "denki-sakugen-yushi-shikinguri.html",
  "factory-denkidai-takai-riyu.html",
  "fixed-cost-sakugen-ginko-setsumei.html",
  "food-factory-denkidai-sakugen.html",
  "hotel-denkidai-takai-riyu.html",
  "hotel-fixed-cost-sakugen.html",
  "manufacturing-fixed-cost-sakugen.html",
];

const protectedPages = [
  "pachinko-denkidai.html",
  "index.html",
  "business-denkidai.html",
  "columns.html",
  "kouatsu-bill-checklist.html",
  "pachinko-denkidai-zukai.html",
];

async function read(name) {
  return readFile(new URL(`../${name}`, import.meta.url), "utf8");
}

test("marks thin pages noindex and removes them from the sitemap", async () => {
  const sitemap = await read("sitemap.xml");

  for (const page of noindexPages) {
    const html = await read(page);
    assert.match(
      html,
      /<meta name="robots" content="noindex, ?follow" ?\/?>/,
      `${page} must be noindex,follow`,
    );
    assert.ok(!sitemap.includes(page), `${page} must not be in sitemap.xml`);
  }
});

test("keeps protected winning pages indexable and discoverable", async () => {
  const sitemap = await read("sitemap.xml");

  for (const page of protectedPages) {
    const html = await read(page);
    assert.doesNotMatch(
      html,
      /<meta name="robots" content="noindex/,
      `${page} must remain indexable`,
    );

    if (page === "index.html") {
      assert.match(sitemap, /<loc>https:\/\/ripuro\.soter-info\.com\/<\/loc>/);
    } else {
      assert.ok(sitemap.includes(page), `${page} must remain in sitemap.xml`);
    }
  }
});

test("documents the complete 57-page inventory and the recovery decision", async () => {
  const audit = await read("SEO_CONTENT_AUDIT_2026-07-26.md");
  const tableRows = audit
    .split(/\r?\n/)
    .filter((line) => line.startsWith("| `/") && line.endsWith("|"));

  assert.equal(tableRows.length, 57);
  assert.match(audit, /GitHub Pagesではサーバー側301を設定できない/);
  assert.match(audit, /17本を `noindex,follow`/);
});

test("keeps the 2026 summer support guide current and routes readers to practical checks", async () => {
  const html = await read("denki-gas-shien-2026-summer.html");
  assert.match(html, /dateModified":"2026-08-11"/);
  assert.match(html, /最終確認：2026年8月11日/);
  assert.match(html, /2026年8月に確認すること/);
  assert.match(html, /高圧の8月使用分は2\.3円\/kWh/);
  assert.match(html, /href="kouatsu-bill-checklist\.html"/);
  assert.match(html, /href="natsu-demand-peak-2026\.html"/);
  assert.match(html, /enecho\.meti\.go\.jp\/category\/gekihen_lp\//);
});
