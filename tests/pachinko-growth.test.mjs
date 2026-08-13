import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function read(name) {
  return readFile(new URL(`../${name}`, import.meta.url), "utf8");
}

test("keeps the winning title while strengthening the answer and diagnosis journey", async () => {
  const html = await read("pachinko-denkidai.html");

  assert.match(html, /<title>【2026年】パチンコ屋の電気代はいくら？月額目安・内訳・削減方法<\/title>/);
  assert.match(html, /先に結論：/);
  assert.match(html, /dateModified": "2026-08-12"/);
  assert.match(html, /更新日：2026年8月12日/);
  assert.match(html, /自店の電気代を確認する次の3ページ/);
  assert.match(html, /href="pachinko-denkidai-checklist\.html"/);
  assert.match(html, /href="pachinko-denkidai-takai-riyu\.html"/);
  assert.match(html, /href="pachinko-kouatsu-keiyaku\.html"/);
  assert.match(html, /空調約40〜50%/);
  for (const location of ["article_top", "simulator_result", "article_bottom"]) {
    assert.match(html, new RegExp(`utm_content=${location}`), location);
  }
  assert.match(html, /data-journey="article_to_diagnosis"/);
  assert.match(html, /data-journey="simulator_to_diagnosis"/);
  assert.doesNotMatch(html, /href="\.\/#form"/);
});

test("adds traceable high-voltage case studies without presenting them as pachinko guarantees", async () => {
  const html = await read("pachinko-denkidai.html");

  assert.match(html, /パチンコホールの実績ではなく、他業種の参考事例/);
  assert.match(html, /2025年4月30日現在/);
  for (const amount of ["3,100万円", "506万円", "12,666万円", "14,858万円", "12,750万円"]) {
    assert.ok(html.includes(amount), amount);
  }
  for (const rate of ["29%減", "38%減", "20%減", "23%減", "24%減"]) {
    assert.match(html, new RegExp(rate), rate);
  }
  assert.match(html, /一律の保証値ではありません/);
  assert.match(html, /career\.eneres\.co\.jp\/data/);
});

test("routes supporting pages and hubs into the pachinko pillar", async () => {
  const [reasons, savings, home, columns] = await Promise.all([
    read("pachinko-denkidai-takai-riyu.html"),
    read("pachinko-denkidai-sakugen.html"),
    read("index.html"),
    read("columns.html"),
  ]);

  for (const html of [reasons, savings]) {
    assert.match(html, /data-journey="supporting_article_to_pillar"/);
    assert.match(html, /href="pachinko-denkidai\.html"/);
  }
  assert.match(home, /data-journey="home_to_pillar"/);
  assert.match(columns, /data-journey="columns_to_pillar"/);
});

test("turns the checklist into a same-condition 12-month comparison worksheet", async () => {
  const html = await read("pachinko-denkidai-checklist.html");

  assert.match(html, /dateModified":"2026-08-13"/);
  assert.match(html, /更新日：2026年8月13日/);
  assert.match(html, /12ヶ月を同じ項目で転記する/);
  for (const label of ["使用量（kWh）", "契約電力（kW）", "最大需要電力（kW）", "燃料費等調整額"]) {
    assert.ok(html.includes(label), label);
  }
  assert.match(html, /不明な項目は推測で埋めず/);
  assert.match(html, /同じ店舗の同じ月同士/);
  assert.match(html, /enecho\.meti\.go\.jp\/category\/electricity_and_gas\/electric\/measure\/faq\/001\.html/);
  assert.match(html, /href="pachinko-denkidai\.html"/);
  assert.match(html, /href="pachinko-denkidai-sakugen\.html"/);
  assert.match(html, /href="pachinko-kouatsu-keiyaku\.html"/);
});

test("explains the four electricity bill components with a current primary source", async () => {
  const html = await read("pachinko-denkidai-takai-riyu.html");
  assert.match(html, /dateModified":"2026-08-14"/);
  assert.match(html, /更新日：2026年8月14日/);
  for (const label of ["基本料金", "電力量料金", "燃料費等調整額", "再生可能エネルギー発電促進賦課金"]) {
    assert.ok(html.includes(label), label);
  }
  assert.match(html, /資源エネルギー庁「月々の電気料金の内訳」/);
  assert.match(html, /pachinko-denkidai-checklist\.html/);
  assert.match(html, /高圧契約のホールでは/);
  assert.doesNotMatch(html, /ホールの多くは高圧受電|工事不要・設備そのまま/);
});

test("updates sitemap dates only for pages changed in this pass", async () => {
  const sitemap = await read("sitemap.xml");
  for (const path of [
    "pachinko-denkidai.html",
    "pachinko-denkidai-takai-riyu.html",
    "pachinko-denkidai-sakugen.html",
  ]) {
    const escaped = path.replaceAll(".", "\\.");
    const expected = path === "pachinko-denkidai.html" ? "2026-08-12" : path === "pachinko-denkidai-takai-riyu.html" ? "2026-08-14" : "2026-07-22";
    assert.match(sitemap, new RegExp(`${escaped}</loc>\\s*<lastmod>${expected}</lastmod>`));
  }
  assert.match(sitemap, /pachinko-denkidai-checklist\.html<\/loc>\s*<lastmod>2026-08-13<\/lastmod>/);
});
