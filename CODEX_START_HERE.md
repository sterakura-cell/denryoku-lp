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

