# 公開手順（GitHub Pages + 独自ドメイン + Formspree）

このLPを本番公開するための手順です。順番にやれば公開できます。
**所要時間の目安：30〜40分（DNSの反映待ちを除く）**

---

## 全体の流れ

1. Formspree でフォームの送信先を作る（→ 問い合わせがメールで届くようにする）
2. `script.js` にFormspreeのエンドポイントを設定する
3. GitHub にリポジトリを作ってファイルを上げる
4. GitHub Pages を有効にする
5. 独自ドメインを割り当てる（DNS設定）

---

## STEP 1. Formspree で送信先を作る（フォーム連携）

> ⚠️ これをやらないと、フォーム送信されても問い合わせがどこにも届きません。

1. https://formspree.io にアクセスし、無料登録（問い合わせを受け取りたいメールアドレスで）。
2. 「New Form」でフォームを作成。フォーム名は「動力電気代診断」など。
3. 発行される **エンドポイントURL**（`https://formspree.io/f/xxxxxxx` の形）をコピー。

### Formspree無料プランの注意（重要）

- 無料プラン：**月50件まで／ファイル添付は不可**。
- このLPは、無料プランでも安全に動くよう **明細ファイルは送らず「明細あり/なし」のメモだけ送る** 設定（`FORM_SUPPORTS_FILE = false`）になっています。
  → 明細は、届いた問い合わせに担当が折り返して受け取る運用です（明細は「任意・推奨」のため問題ありません）。
- 明細ファイルもフォームから直接受け取りたい場合は、Formspree有料プランにして
  `script.js` の `FORM_SUPPORTS_FILE` を `true` にするか、後述のGAS方式に切り替えます。

---

## STEP 2. script.js にエンドポイントを設定

`script.js` の先頭付近、ここを書き換えます。

```js
var FORMSPREE_ENDPOINT = ""; // ← ここに STEP1 のURLを貼る
```

↓

```js
var FORMSPREE_ENDPOINT = "https://formspree.io/f/xxxxxxx";
```

- 空のままだと「仮実装（完了画面は出るが送信されない）」のままです。必ず設定してください。
- 設定後、ローカルで一度フォーム送信し、登録メールに届くか確認するのが安全です
  （初回はFormspreeから確認メールが届くことがあります）。

---

## STEP 3. GitHub にアップロード

このフォルダ（`新電力　エナリス`）の中身を公開します。`.claude/` は自動で除外されます。

> git init と初回コミットは実施済みです。GitHubで空のPublicリポジトリ（例：`denryoku-lp`）を
> 作成したら、このフォルダで以下を実行します。

```bash
git remote add origin https://github.com/sterakura-cell/denryoku-lp.git
git push -u origin main
```

> GitHubのリポジトリは **Public** にしてください（GitHub Pages無料枠の条件）。
> 新規リポジトリ作成時、README/.gitignore/license は **追加しない**（チェックを外す）でください
> （こちらに既にコミットがあるため）。

---

## STEP 4. GitHub Pages を有効化

1. GitHubのリポジトリ → **Settings** → 左メニュー **Pages**。
2. **Source** を「Deploy from a branch」、Branch を **main / (root)** にして Save。
3. 1〜2分待つと `https://<アカウント>.github.io/denryoku-lp/` で公開されます。
   - まずはこのURLで表示・フォーム送信を確認。

---

## STEP 5. 独自ドメインを割り当てる

### 5-1. CNAMEファイル（設定済み）

リポジトリ直下に `CNAME` ファイルを作成済みです（中身：`ripuro.soter-info.com`）。
このままpushすればOKです。

### 5-2. DNSを設定（Squarespace の管理画面で）

soter-info.com は Google Domains → 現 **Squarespace** 管理です。
Squarespace にログイン → 対象ドメイン → **DNS設定（DNS Settings）** で、次の1件を追加します。

| 種類(Type) | ホスト(Host) | 値(Data / Content) |
|------|----------|-----|
| CNAME | `ripuro` | `sterakura-cell.github.io` |

※ 値の末尾に `.` が自動で付く場合がありますが問題ありません。
※ 既に `ripuro` の別レコードがあれば削除してから追加してください。

### 5-3. GitHub側でドメイン指定

Settings → Pages → **Custom domain** に `ripuro.soter-info.com` を入力して Save。
**「Enforce HTTPS」にチェック**（証明書発行に数分〜数十分かかることがあります）。

公開URL：**https://ripuro.soter-info.com/**

DNSの反映は数分〜最大48時間。たいていは数十分で見られるようになります。

---

## 公開後のチェックリスト

- [ ] `https://（独自ドメイン）` で表示される
- [ ] `?ref=terakura` で 090-3698-7711 / `?ref=father` で 090-5208-6616 に切り替わる
- [ ] フォーム送信 → 登録メールに会社名・ランク・年間電気代・15%/20%削減見込みが届く
- [ ] スマホで下部固定CTA（無料診断／電話相談）が出る
- [ ] HTTPS（鍵マーク）になっている

---

## 配布URL（公開後）

- 寺倉担当用：`https://ripuro.soter-info.com/?ref=terakura`
- 父担当用　：`https://ripuro.soter-info.com/?ref=father`

この2つを使い分けて案内すれば、どちらの紹介元・電話番号経由かが管理シートで判別できます。
（運用手順・管理シート項目・東京新電力への案件共有フォーマットは README.md を参照）
