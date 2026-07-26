# SEOコンテンツ棚卸し（2026-07-26）

## 結論

- ルート直下のHTMLは57本。
- 7文字連続の本文断片で比較した最大重複率は36.9%で、完全コピーに近いページはなかった。
- 一方、実質本文334〜949文字で、業種固有の実績・根拠付き数値・事例・写真がない薄いページを17本確認した。
- 検索表示の急減と量産時期は一致するが、アルゴリズム評価の原因と断定できる証拠はまだない。サイト単位の品質リスクを下げる予防措置として、17本を `noindex,follow` に変更し、sitemapから除外する。
- `pachinko-denkidai.html`、`index.html`、`business-denkidai.html`、`columns.html`、`kouatsu-bill-checklist.html`、`pachinko-denkidai-zukai.html` は変更しない。

GitHub Pagesではサーバー側301を設定できないため、今回は選択肢(b)を採用した。将来CDNまたは別ホスティングでリダイレクト機能を持たせた時点で、17URLを `business-denkidai.html` へ301統合できる。

## 判定方法

- 実質文字数: `script`、`style`、`svg`、`noscript`、共通 `header`、`nav`、`footer` を除いた可視本文を正規化して計数。
- 重複率: 正規化本文の7文字shingleによるJaccard係数。表では最も近い1ページを表示。
- 独自情報:
  - `あり`: 業種固有の数値、試算ロジック、制度情報、根拠付き事例のいずれかがある。
  - `限定`: 業種固有の説明や診断導線はあるが、実績・一次情報はない。
  - `なし`: 業種名や設備名を差し替えた一般説明と仮定例が中心で、実績・一次情報・写真がない。

## 57本の一覧

| URL | title | 実質文字数 | 独自情報 | 最大重複率（相手） | 方針 |
|---|---|---:|---|---|---|
| `/aojiru-oji-new-power-comparison.html` | 青汁王子こと三崎優太氏の新電力が話題？法人が電力会社を比較するときの見方 | 1,168 | なし（一次出典なし） | 4.8%（`/denki-sakugen-ginko-hyoka.html`） | 要出典 |
| `/baikyaku-mae-junbi.html` | 収益物件を高く売るには？売却前3ヶ月でできる資産価値向上策の比較 | 1,467 | あり（試算ロジック） | 11.5%（`/jisshitsu-rimawari-kaizen.html`） | 維持 |
| `/beauty-salon-denkidai.html` | 美容室の電気代が高い理由と見直し方｜空調・ドライヤー・給湯 | 495 | なし | 11.3%（`/restaurant-denkidai.html`） | noindex |
| `/bowling-denkidai.html` | ボウリング場の電気代はいくら？1日・月の目安と削減方法 | 1,609 | あり（業種別目安） | 29.8%（`/netcafe-denkidai.html`） | 維持 |
| `/building-common-area-denkidai.html` | ビル共用部の電気代が高い理由｜空調・エレベーター・ポンプ | 618 | なし | 23.4%（`/building-vacancy-fixed-cost.html`） | noindex |
| `/building-denkidai.html` | ビルオーナー向け電気代削減 無料診断｜空室・テナント撤退時の固定費見直し | 996 | 限定（診断LP） | 21.1%（`/hotel-denkidai.html`） | 維持 |
| `/building-tenant-taikyo-denkidai.html` | テナント撤退でビル収益が悪化したときの固定費見直し｜電気代削減の考え方 | 949 | なし | 11.5%（`/kouatsu-kihonryokin-takai.html`） | noindex |
| `/building-vacancy-fixed-cost.html` | 空室が増えたビルオーナーが見直すべき固定費｜電気代・共用部・動力 | 627 | なし | 23.8%（`/hotel-fixed-cost-sakugen.html`） | noindex |
| `/business-denkidai.html` | 【2026年】法人の電気代を下げる方法｜高圧電力を無料診断・工事不要 | 2,390 | あり | 7.0%（`/index.html`） | 保護 |
| `/care-facility-denkidai.html` | 介護施設の電気代が高い理由と見直し方｜空調・給湯・厨房 | 503 | なし | 10.5%（`/beauty-salon-denkidai.html`） | noindex |
| `/chusho-kigyo-denkidai-shikinguri.html` | 中小企業の資金繰り改善に電気代削減が効く理由｜固定費を下げる | 659 | なし | 8.3%（`/denki-sakugen-yushi-shikinguri.html`） | noindex |
| `/clinic-denkidai.html` | クリニックの電気代が高い理由と見直し方｜空調・医療機器・照明 | 334 | なし | 4.4%（`/beauty-salon-denkidai.html`） | noindex |
| `/cold-storage-denkidai-takai-riyu.html` | 冷蔵倉庫の電気代が高い理由｜冷蔵冷凍設備とピーク電力（最大デマンド） | 621 | なし | 28.0%（`/hotel-denkidai-takai-riyu.html`） | noindex |
| `/cold-storage-denkidai.html` | 食品工場・冷蔵倉庫向け電気代削減 無料診断｜冷蔵冷凍・空調・動力の固定費見直し | 1,219 | 限定（診断LP） | 36.6%（`/hotel-denkidai.html`） | 維持 |
| `/columns.html` | 電気代削減コラム一覧｜パチンコホール・ビル・工場・宿泊施設の固定費対策 | 2,631 | 対象外（一覧） | 5.9%（`/pachinko-tousan-news-koteihi.html`） | 保護 |
| `/denki-gas-shien-2026-summer.html` | 【2026年夏】法人の電気代補助はいくら？高圧1.8〜2.3円/kWhを解説 | 1,519 | あり（制度値・出典） | 4.7%（`/saiene-fukakin-2026-hojin.html`） | 維持 |
| `/denki-sakugen-ginko-hyoka.html` | 電気代削減は銀行評価にどう効く？固定費改善と融資相談の見せ方 | 803 | なし | 7.2%（`/fixed-cost-sakugen-ginko-setsumei.html`） | noindex |
| `/denki-sakugen-yushi-shikinguri.html` | 資金繰り改善で電気代を見直す理由｜融資前に固定費を下げる | 754 | なし | 8.3%（`/chusho-kigyo-denkidai-shikinguri.html`） | noindex |
| `/denkidai-minaoshi-cases.html` | 業種別の電気代見直し例｜計算例と請求書で見る場所 | 537 | あり（業種別試算） | 1.5%（`/business-denkidai.html`） | 維持 |
| `/douryoku-denkidai-takai.html` | 動力の電気代が高い理由｜ピーク電力（最大デマンド）で基本料金が決まる仕組み | 1,587 | 限定（仕組み説明） | 10.5%（`/kouatsu-kihonryokin-takai.html`） | 維持 |
| `/factory-denkidai-takai-riyu.html` | 工場の電気代が高い理由｜動力・コンプレッサー・ピーク電力（最大デマンド） | 705 | なし | 26.4%（`/cold-storage-denkidai-takai-riyu.html`） | noindex |
| `/factory-denkidai.html` | 工場・製造業向け電気代削減 無料診断｜動力・高圧電力・ピーク電力（最大デマンド）見直し | 1,286 | 限定（診断LP） | 28.2%（`/hotel-denkidai.html`） | 維持 |
| `/fixed-cost-sakugen-ginko-setsumei.html` | 固定費削減を銀行に説明する方法｜電気代見直しを経営改善に見せる | 689 | なし | 7.2%（`/denki-sakugen-ginko-hyoka.html`） | noindex |
| `/food-factory-denkidai-sakugen.html` | 食品工場の電気代削減｜品質管理を落とさず固定費を見直す方法 | 615 | なし | 24.4%（`/cold-storage-denkidai-takai-riyu.html`） | noindex |
| `/fudosan-kachi-denkidai.html` | 電気代削減でビル・収益物件の資産価値はいくら上がる？売却価格シミュレーター付き | 2,098 | あり（試算ロジック） | 10.0%（`/baikyaku-mae-junbi.html`） | 維持 |
| `/game-center-denkidai.html` | ゲームセンターの電気代はいくら？1日・月の目安と削減方法 | 2,065 | あり（業種別目安） | 36.9%（`/karaoke-denkidai.html`） | 維持 |
| `/googlec08a166324e62339.html` | — | 48 | 対象外（所有権確認） | 0.0% | 維持 |
| `/hotel-denkidai-takai-riyu.html` | ホテル・旅館の電気代が高い理由｜空調・給湯・厨房設備 | 628 | なし | 28.0%（`/cold-storage-denkidai-takai-riyu.html`） | noindex |
| `/hotel-denkidai.html` | ホテル・旅館向け電気代削減 無料診断｜空調・厨房・給湯の固定費見直し | 1,222 | 限定（診断LP） | 36.6%（`/cold-storage-denkidai.html`） | 維持 |
| `/hotel-fixed-cost-sakugen.html` | 宿泊業の固定費削減｜電気代見直しで利益を守る考え方 | 653 | なし | 23.8%（`/building-vacancy-fixed-cost.html`） | noindex |
| `/index.html` | 【2026年7月】パチンコホールの電気代削減｜工事不要・無料診断 | 3,908 | あり | 7.0%（`/business-denkidai.html`） | 保護 |
| `/jigyo-shokei-koteihi.html` | 事業承継の前に固定費を軽くする：利益体質にして渡す電気代削減 | 1,496 | あり（試算ロジック） | 9.1%（`/manda-kigyo-kachi-denkidai.html`） | 維持 |
| `/jisshitsu-rimawari-kaizen.html` | 実質利回りを上げる方法：表面利回りが変えられなくても収益は改善できる | 1,342 | あり（試算ロジック） | 11.5%（`/baikyaku-mae-junbi.html`） | 維持 |
| `/karaoke-denkidai.html` | カラオケ店の電気代はいくら？1日・月の目安と削減方法 | 1,781 | あり（業種別目安） | 36.9%（`/game-center-denkidai.html`） | 維持 |
| `/kouatsu-bill-checklist.html` | 高圧電力 請求書チェックリスト｜基本料金・ピーク電力（最大デマンド）・電気代削減 | 1,133 | あり | 4.6%（`/factory-denkidai-takai-riyu.html`） | 保護 |
| `/kouatsu-denki-ryokin-2026-kaitei.html` | 【2026年】高圧電気料金の改定で何が変わった？燃料費・市場価格調整を解説 | 1,836 | あり（制度情報） | 4.4%（`/denki-gas-shien-2026-summer.html`） | 維持 |
| `/kouatsu-kihonryokin-takai.html` | 高圧電力の基本料金が高い理由｜ピーク電力（最大デマンド）と契約電力の見直し方 | 987 | 限定（仕組み説明） | 12.1%（`/factory-denkidai-takai-riyu.html`） | 維持 |
| `/manda-kigyo-kachi-denkidai.html` | 会社売却・M&Aの前に企業価値を上げる：固定費削減は倍率で価値になる | 1,678 | あり（試算ロジック） | 10.0%（`/baikyaku-mae-junbi.html`） | 維持 |
| `/manufacturing-fixed-cost-sakugen.html` | 製造業の固定費削減｜電気代を工事なしで見直す方法 | 654 | なし | 23.8%（`/food-factory-denkidai-sakugen.html`） | noindex |
| `/natsu-demand-peak-2026.html` | 【2026年夏】高圧電力の最大デマンド対策｜空調ピークで基本料金を上げない方法 | 1,695 | あり（制度・対策） | 2.8%（`/denki-gas-shien-2026-summer.html`） | 維持 |
| `/netcafe-denkidai.html` | ネットカフェの電気代はいくら？24時間営業の月額目安と削減方法 | 1,524 | あり（業種別目安） | 29.8%（`/bowling-denkidai.html`） | 維持 |
| `/owner-change-90days.html` | オーナーチェンジ物件・会社買収後の90日：最初にやるべき収益改善は電気代 | 1,453 | あり（試算ロジック） | 11.1%（`/jisshitsu-rimawari-kaizen.html`） | 維持 |
| `/pachinko-denkidai-checklist.html` | パチンコ店の電気代削減チェックリスト｜請求書で見るべき7項目 | 1,053 | あり（業種別チェック） | 12.6%（`/pachinko-shikinguri-koteihi.html`） | 維持 |
| `/pachinko-denkidai-sakugen.html` | パチンコ店の電気代削減方法｜工事なし・初期費用なしで見直す順番 | 1,405 | あり（業種別手順） | 10.6%（`/pachinko-denkidai-takai-riyu.html`） | 維持 |
| `/pachinko-denkidai-takai-riyu.html` | パチンコホールの電気代が高い理由｜空調・遊技機・照明の内訳と下げ方 | 1,368 | あり（業種別内訳） | 10.6%（`/pachinko-denkidai-sakugen.html`） | 維持 |
| `/pachinko-denkidai-zukai.html` | 【図解】パチンコホールの電気代を下げる方法｜3分でわかる・工事なしで約20%オフ | 818 | あり | 7.4%（`/building-common-area-denkidai.html`） | 保護 |
| `/pachinko-denkidai.html` | 【2026年】パチンコ屋の電気代はいくら？月額目安・内訳・削減方法 | 4,616 | あり（根拠付き事例） | 11.2%（`/game-center-denkidai.html`） | 保護 |
| `/pachinko-kouatsu-keiyaku.html` | 高圧電力契約の見直し方｜パチンコ店が請求書で確認すべき項目 | 1,254 | あり（業種別チェック） | 11.2%（`/pachinko-denkidai-checklist.html`） | 維持 |
| `/pachinko-shikinguri-koteihi.html` | パチンコホールの資金繰り対策｜電気代など固定費を見直す順番 | 1,010 | あり（業種別試算） | 13.5%（`/pachinko-tousan-news-koteihi.html`） | 維持 |
| `/pachinko-tousan-news-koteihi.html` | パチンコ業界の倒産・閉店ニュースから考える固定費対策｜電気代見直しの重要性 | 1,042 | 限定（業界説明） | 15.1%（`/zentoshin-hasan-koteihi.html`） | 維持・要出典確認 |
| `/partner-submit.html` | パートナー専用｜請求書アップロード（電気代見直し） | 507 | 対象外（運用） | 4.0%（`/partner.html`） | 維持 |
| `/partner.html` | 税理士・管理会社さま向け 提携のご案内｜電気代見直し紹介プログラム | 1,004 | 対象外（運用） | 4.0%（`/partner-submit.html`） | 維持 |
| `/restaurant-denkidai.html` | 飲食店の電気代が高い理由と見直し方｜冷蔵庫・空調・厨房 | 456 | なし | 11.3%（`/beauty-salon-denkidai.html`） | noindex |
| `/saiene-fukakin-2026-hojin.html` | 【2026年度】再エネ賦課金は4.18円/kWh｜法人・高圧の負担を計算 | 1,257 | あり（制度値・出典） | 4.7%（`/denki-gas-shien-2026-summer.html`） | 維持 |
| `/sento-sauna-denkidai.html` | スーパー銭湯・サウナの電気代はいくら？月額目安と削減方法 | 1,742 | あり（業種別目安） | 26.5%（`/bowling-denkidai.html`） | 維持 |
| `/youryou-kyoshutsukin-2026.html` | 容量拠出金ってなに？請求書と見積書の見方をやさしく解説 | 1,382 | あり（制度情報・出典） | 3.0%（`/denki-gas-shien-2026-summer.html`） | 維持 |
| `/zentoshin-hasan-koteihi.html` | 全東信の破産手続きがSNSで話題に｜パチンコ業界が固定費を見直すべき理由 | 1,198 | あり（個別事象） | 15.1%（`/pachinko-tousan-news-koteihi.html`） | 維持・要出典確認 |

## noindex対象17本

```text
beauty-salon-denkidai.html
care-facility-denkidai.html
clinic-denkidai.html
restaurant-denkidai.html
building-common-area-denkidai.html
building-vacancy-fixed-cost.html
building-tenant-taikyo-denkidai.html
chusho-kigyo-denkidai-shikinguri.html
cold-storage-denkidai-takai-riyu.html
denki-sakugen-ginko-hyoka.html
denki-sakugen-yushi-shikinguri.html
factory-denkidai-takai-riyu.html
fixed-cost-sakugen-ginko-setsumei.html
food-factory-denkidai-sakugen.html
hotel-denkidai-takai-riyu.html
hotel-fixed-cost-sakugen.html
manufacturing-fixed-cost-sakugen.html
```

## 公開後のユーザー作業

1. Search Consoleの `https://ripuro.soter-info.com/` プロパティを開く。
2. 「サイトマップ」で `https://ripuro.soter-info.com/sitemap.xml` を再送信する。
3. 2026-07-27以降、「ページのインデックス登録」で「クロール済み - インデックス未登録」「重複しています」「noindex タグによって除外されました」の件数を記録する。
4. 7〜14日後に、日別表示回数と `pachinko-denkidai.html` の「パチンコ屋 電気代」系クエリを確認する。

`noindex タグによって除外されました` が17URL分増えること自体は今回の意図どおり。検索表示の回復は再クロール後に判定し、今回の変更だけを原因と断定しない。
