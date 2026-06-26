/* ============================================================
   動力電気代 無料診断LP  /  Google Apps Script（フォーム受信）
   ------------------------------------------------------------
   役割：
     ・LPフォームのPOSTを受け取り、Googleスプレッドシートに1行追記
     ・明細ファイル（base64）をGoogleドライブに保存し、リンクをシートに記録
     ・（任意）新着をメール通知（S/Aランクは件名で分かるように）

   セットアップは GAS_SETUP.md を参照。
   ============================================================ */

// ▼ここだけ設定（任意）。新着通知メールを受け取りたいアドレスを入れると通知が届きます。
//   空のままなら通知メールは送りません（スプレッドシートには必ず記録されます）。
var NOTIFY_EMAIL = "";

// シート名・ドライブの保存フォルダ名（変更可）
var SHEET_NAME  = "問い合わせ";
var FOLDER_NAME = "動力電気代_明細";

// スプレッドシートの列（この順で1行になります）
var HEADERS = [
  "受付日", "紹介元コード", "問い合わせ元LP URL",
  "会社名", "担当者名", "電話番号", "メールアドレス", "所在地", "業種",
  "月額動力電気代", "年間電気代", "15%削減見込み", "20%削減見込み",
  "明細", "打合せ希望", "見込み度ランク",
  "動力使用", "キュービクル", "現在の電力会社", "備考",
  "対応状況", "次回対応日", "メモ"
];

/* デプロイ確認用（ブラウザでexec URLを開くと表示されます） */
function doGet() {
  return ContentService
    .createTextOutput("動力電気代LP 受信エンドポイントは稼働中です。")
    .setMimeType(ContentService.MimeType.TEXT);
}

/* フォーム受信 */
function doPost(e) {
  try {
    var data   = JSON.parse(e.postData.contents || "{}");
    var f      = data.fields || {};
    var files  = data.files  || [];

    // 1) 明細ファイルをドライブへ保存 → リンク文字列
    var billLinks = saveFiles_(files, f.company);

    // 2) スプレッドシートに追記
    var sheet = getSheet_();
    var row = [
      new Date(),
      f.referral_source || "",
      f.landing_url || "",
      f.company || "",
      f.contact_name || "",
      f.phone || "",
      f.email || "",
      f.address || "",
      f.industry || "",
      toNum_(f.monthly_cost),
      toNum_(f.annual_cost),
      toNum_(f.cut15),
      toNum_(f.cut20),
      billLinks || "なし",
      f.after_diagnosis || "",
      f.calc_rank || "",
      f.uses_power || "",
      f.cubicle || "",
      f.current_provider || "",
      f.note || "",
      "未対応",   // 対応状況の初期値
      "",         // 次回対応日
      ""          // メモ
    ];
    sheet.appendRow(row);

    // 3) （任意）メール通知
    notify_(f, billLinks);

    return json_({ result: "success" });
  } catch (err) {
    return json_({ result: "error", message: String(err) });
  }
}

/* ---- 補助関数 ---- */

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  // ヘッダーが無ければ作成
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function saveFiles_(files, company) {
  if (!files || !files.length) return "";
  var folder = getFolder_();
  var links = [];
  var stamp = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyyMMdd_HHmmss");
  for (var i = 0; i < files.length; i++) {
    var ff = files[i];
    if (!ff || !ff.dataBase64) continue;
    var bytes = Utilities.base64Decode(ff.dataBase64);
    var safeCompany = (company || "明細").replace(/[\\\/:*?"<>|]/g, "_").slice(0, 20);
    var name = safeCompany + "_" + stamp + "_" + (i + 1) + "_" + (ff.name || "file");
    var blob = Utilities.newBlob(bytes, ff.mimeType || "application/octet-stream", name);
    var file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (e) { /* 共有設定が制限されている場合はスキップ（リンクは記録） */ }
    links.push(file.getUrl());
  }
  return links.join("\n");
}

function getFolder_() {
  var it = DriveApp.getFoldersByName(FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(FOLDER_NAME);
}

function notify_(f, billLinks) {
  if (!NOTIFY_EMAIL) return;
  var rank = f.calc_rank || "－";
  var subject = "【動力電気代診断】" + (f.company || "新規") + "様／月額" +
                (f.monthly_cost || "?") + "円／ランク" + rank;
  var body =
    "新しい無料診断のお申し込みがありました。\n\n" +
    "会社名：" + (f.company || "") + "\n" +
    "担当者名：" + (f.contact_name || "") + "\n" +
    "電話番号：" + (f.phone || "") + "\n" +
    "メール：" + (f.email || "") + "\n" +
    "所在地：" + (f.address || "") + "\n" +
    "業種：" + (f.industry || "") + "\n" +
    "月額動力電気代：" + (f.monthly_cost || "") + "\n" +
    "年間電気代：" + (f.annual_cost || "") + "\n" +
    "15%削減見込み：" + (f.cut15 || "") + "\n" +
    "20%削減見込み：" + (f.cut20 || "") + "\n" +
    "見込み度ランク：" + rank + "\n" +
    "打合せ希望：" + (f.after_diagnosis || "") + "\n" +
    "現在の電力会社：" + (f.current_provider || "") + "\n" +
    "キュービクル：" + (f.cubicle || "") + "\n" +
    "備考：" + (f.note || "") + "\n" +
    "明細：" + (billLinks || "なし") + "\n\n" +
    "紹介元コード：" + (f.referral_source || "") + "\n" +
    "問い合わせ元LP：" + (f.landing_url || "") + "\n";
  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);
}

function toNum_(v) {
  var n = parseFloat(v);
  return isNaN(n) ? (v || "") : n;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
