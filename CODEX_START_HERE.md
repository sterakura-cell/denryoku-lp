# 次回Codex用：電力削減LPの引き継ぎ

新しいCodex会話を始めたら、まずこのファイルを読ませてください。

## 最初にCodexへ伝える文

```text
電力削減LPの続きです。
実サイトのファイルは C:\Users\pc\.claude\新電力　エナリス にあります。
まず CODEX_START_HERE.md を読んで、既存サイトの続きとして作業してください。
勝手に最初から作り直さず、既存ファイルを確認してから進めてください。
```

## 実サイトの保管場所

- ローカル実ファイル: `C:\Users\pc\.claude\新電力　エナリス`
- GitHub: `https://github.com/sterakura-cell/denryoku-lp.git`
- 公開サイト: `https://ripuro.soter-info.com/`
- Codexの入口になりやすいフォルダ: `C:\Users\pc\Documents\エナリス　電気代削減`

注意: Codexの新規会話では `Documents\エナリス　電気代削減` から始まることがあります。実サイト本体はこのフォルダです。

## 重要ページ

- パチンコ特化LP: `https://ripuro.soter-info.com/`
- 法人向け総合LP: `https://ripuro.soter-info.com/business-denkidai.html`
- 請求書チェック: `https://ripuro.soter-info.com/kouatsu-bill-checklist.html`
- コラム一覧: `https://ripuro.soter-info.com/columns.html`
- 図解ページ: `https://ripuro.soter-info.com/pachinko-denkidai-zukai.html`

## Google Analytics / Search Console

- GA測定ID: `G-M3PZ94WB0H`
- GAプロパティ名: `電力削減 エナリス`
- 閲覧ユーザー: `soter.st25@gmail.com` と `s.terakura@soter-info.com`
- フォーム送信イベント: `qualify_lead`
- `qualify_lead` はキーイベント設定済み
- Search Console: `https://ripuro.soter-info.com/` 登録済み

## これまでに実装済み

- GAタグ設置
- UTM計測用のhidden項目とlocalStorage保存
- 問い合わせフォーム送信テスト済み
- 総合LP追加
- 業界別LP、記事、トレンド記事を複数追加
- 請求書チェックリスト追加
- 収支インパクトシミュレーター追加
- 金額入力UI改善
- 専門用語をお客様向け表現に変更
- スマホ表示確認
- サイト内リンク切れ確認
- Xアカウント作成済み: `@denki_cost_lab`

## 作業時の注意

- 既存サイトを最初から作り直さない
- 変更後はできれば以下を確認する
  - `node --check script.js`
  - 主要ページのスマホ表示
  - フォーム導線
  - 公開URLの反映
- 未追跡ファイルがあっても、関係ないものは勝手に消さない

## 次にやるとよさそうなこと

- X投稿からの流入をGAで見る
- プロフィールURLにUTM付きURLを設定する
- 問い合わせフォーム営業用の送信文を整える
- 業界別の記事を追加する
- 実際の問い合わせ内容を見てLPのFAQを増やす
- GAでページ別閲覧数と問い合わせ導線を確認する

## UTM付きURL例

Xプロフィール用:

```text
https://ripuro.soter-info.com/business-denkidai.html?utm_source=x&utm_medium=social&utm_campaign=denki_profile&utm_content=profile_link
```

X投稿用:

```text
https://ripuro.soter-info.com/business-denkidai.html?utm_source=x&utm_medium=social&utm_campaign=denki_post&utm_content=post_001
```


## 2026-07-21 Claude Code実施分（CODEX向け引き継ぎ）

CODEXの容量不足のため、Claude Code（別AI）が以下を直接実施した。作り直し不要。

### 変更ファイル
- `pachinko-denkidai.html`
  1. 導入部（h1直下2段落目）に「パチ屋」表記を追加 — Search Consoleで「パチ屋 電気代」系クエリが週12回表示されていたが本文に「パチ屋」が0回だったため
  2. FAQ1問目の回答冒頭にも「パチ屋（パチンコホール）」を追加
  3. JSON-LDのFAQPageに6問目「燃料費調整額や市場価格の影響は？」を追加（ページ内FAQには元からあったがJSON-LDに漏れていた）
  4. Article schemaのdateModifiedと画面上の更新日を2026-07-21に更新
- `sitemap.xml`: pachinko-denkidai.htmlのlastmodを2026-07-21に更新

### 背景データ（Search Console 7/13-7/19）
- pachinko-denkidai.html: 表示137回・クリック1（CTR0.7%）・平均順位9.8
- 表示クエリは全て「パチンコ×電気代」系11種（最多「パチンコ屋 電気代」43回）
- タイトルは7/19に改善済みのため今回は変更していない（効果測定を混ぜないため）

### 次にやること（8/4頃）
- Search Consoleでpachinko-denkidai.htmlのCTR（0.7%→3%目標）と順位（9.8→6〜8位目標）を確認
- 新規記事を書く場合の推奨テーマ（既存記事と検索意図が被らないもの）:
  1. パチンコ店の電気代の内訳深掘り（空調・遊技機・照明どれが重いか）
  2. 削減方法の比較記事（切替・LED・空調更新の順番）
  3. パチンコ店の固定費全般の見直し
- 注意: 「業種名＋電気代」テンプレページの大量追加は一旦停止中（7/14-20に50本公開済み。スパム判定リスク回避のため、表示が付いたクラスタの強化を優先する方針）
