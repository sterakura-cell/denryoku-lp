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
  assert.match(html, /空調約40〜50%/);
  for (const location of ["article_top", "simulator_result", "article_bottom"]) {
    assert.match(html, new RegExp(`utm_content=${location}`), location);
  }
  assert.match(html, /data-journey="article_to_diagnosis"/);
  assert.match(html, /data-journey="simulator_to_diagnosis"/);
  assert.doesNotMatch(html, /href="\.\/#form"/);
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

test("updates sitemap dates only for pages changed in this pass", async () => {
  const sitemap = await read("sitemap.xml");
  for (const path of [
    "pachinko-denkidai.html",
    "pachinko-denkidai-takai-riyu.html",
    "pachinko-denkidai-sakugen.html",
  ]) {
    const escaped = path.replaceAll(".", "\\.");
    assert.match(sitemap, new RegExp(`${escaped}</loc>\\s*<lastmod>2026-07-22</lastmod>`));
  }
});
