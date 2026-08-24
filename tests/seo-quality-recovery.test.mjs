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

test("keeps the high-voltage bill checklist evidence-led and connected", async () => {
  const html = await read("kouatsu-bill-checklist.html");
  const sitemap = await read("sitemap.xml");
  assert.match(html, /dateModified":"2026-08-20"/);
  assert.match(html, /項目数だけで削減可否は判断しません/);
  assert.match(html, /href="kouatsu-kihonryokin-takai\.html"/);
  assert.match(html, /契約変更や設備対応の有無、費用条件は契約内容によって異なります/);
  assert.doesNotMatch(html, /3つ以上当てはまる場合は、請求書ベースで無料診断する価値があります/);
  assert.doesNotMatch(html, /工事不要・初期費用なし/);
  assert.match(sitemap, /kouatsu-bill-checklist\.html<\/loc>\s*<lastmod>2026-08-20<\/lastmod>/);
});

test("connects the basic-fee guide back to the bill checklist", async () => {
  const html = await read("kouatsu-kihonryokin-takai.html");
  const sitemap = await read("sitemap.xml");
  assert.match(html, /dateModified":"2026-08-21"/);
  assert.match(html, /更新日：2026年8月21日/);
  assert.match(html, /href="kouatsu-bill-checklist\.html"/);
  assert.match(sitemap, /kouatsu-kihonryokin-takai\.html<\/loc>\s*<lastmod>2026-08-21<\/lastmod>/);
});

test("routes the corporate LP through the current high-voltage guides", async () => {
  const html = await read("business-denkidai.html");
  const sitemap = await read("sitemap.xml");
  assert.match(html, /高圧電力の請求書は、この順番で確認/);
  assert.match(html, /href="kouatsu-bill-checklist\.html"/);
  assert.match(html, /href="kouatsu-kihonryokin-takai\.html"/);
  assert.match(html, /href="kouatsu-denki-ryokin-2026-kaitei\.html"/);
  assert.match(html, /削減率を先に決めず/);
  assert.match(sitemap, /business-denkidai\.html<\/loc>\s*<lastmod>2026-08-23<\/lastmod>/);
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<h2 class="report-title">電気代見直し 概算レポート<\/h2>/);
});

test("publishes machine-readable context for industry calculation examples", async () => {
  const html = await read("denkidai-minaoshi-cases.html");
  const sitemap = await read("sitemap.xml");
  assert.match(html, /"@type":"WebPage"/);
  assert.match(html, /"@type":"BreadcrumbList"/);
  assert.match(html, /"dateModified":"2026-08-24"/);
  assert.match(html, /実際の導入実績や削減保証ではありません/);
  assert.match(html, /property="og:image" content="https:\/\/ripuro\.soter-info\.com\/ogp-business\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(sitemap, /denkidai-minaoshi-cases\.html<\/loc>\s*<lastmod>2026-08-24<\/lastmod>/);
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
