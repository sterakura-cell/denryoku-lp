/* ============================================================
   動力電気代 無料診断LP  /  script.js
   ・URLパラメータ ref で連絡先・紹介元コードを自動切替
   ・削減シミュレーター（ファーストビュー / 専用セクション）
   ・フォーム入力中の見込み度ランク表示
   ・明細アップロードの状態表示
   ・フォーム送信は仮実装（Googleフォーム/Formspree/HubSpot/GASに差し替え可）
   ============================================================ */

(function () {
  "use strict";

  /* ----------------------------------------------------------
     0. フォーム送信先の設定
     ----------------------------------------------------------
     送信先は「GAS優先 →（無ければ）Formspree →（無ければ）仮実装」の順で動きます。

     ■ Google Apps Script（推奨・スプレッドシート直結）
       GASをウェブアプリとしてデプロイして得た「.../exec」URLを下記に貼り付け。
       明細ファイルもDriveに自動保存されます。設定手順は GAS_SETUP.md を参照。

     ■ Formspree（メールで受け取る場合）
       https://formspree.io で作成した「https://formspree.io/f/xxxxxxx」を貼り付け。
     ---------------------------------------------------------- */
  var GAS_ENDPOINT       = ""; // 例: "https://script.google.com/macros/s/XXXX/exec"
  var FORMSPREE_ENDPOINT = ""; // 例: "https://formspree.io/f/xxxxxxx"

  // Formspree使用時のみ有効：ファイル添付を送信先が受け付けるか。
  //   false … 明細ファイルは送らず「明細あり/なし」のメモだけ送る（Formspree無料プラン向け）
  //   true  … 明細ファイルも一緒に送る（Formspree有料プラン）
  //   ※ GAS使用時は常に明細ファイルをDriveへ保存します（この値は無視）。
  var FORM_SUPPORTS_FILE = false;

  /* ----------------------------------------------------------
     1. 紹介元（ref）設定
     ---------------------------------------------------------- */
  // 連絡先パターン定義。ここを編集すれば担当・番号を増減できます。
  var REF_TABLE = {
    terakura: { code: "terakura", tel: "090-3698-7711", label: "寺倉" },
    father:   { code: "father",   tel: "090-5208-6616", label: "寺倉" }
  };
  var DEFAULT_REF = "terakura"; // ref が無い／不正なときの既定

  function getRef() {
    var params = new URLSearchParams(window.location.search);
    var ref = (params.get("ref") || "").toLowerCase().trim();
    return REF_TABLE[ref] ? ref : DEFAULT_REF;
  }

  function telHref(tel) {
    return "tel:" + tel.replace(/[^0-9]/g, "");
  }

  function applyRef() {
    var refKey = getRef();
    var conf = REF_TABLE[refKey];

    // 電話番号を表示している全要素を更新
    ["heroTel", "formTel", "finalTel", "footerTel", "stickyTel"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.textContent = conf.tel;
      el.setAttribute("href", telHref(conf.tel));
    });

    // hidden input：紹介元コード
    var refInput = document.getElementById("referralSource");
    if (refInput) refInput.value = conf.code;

    // hidden input：問い合わせ元LPの完全URL（どのLP経由かを記録）
    var urlInput = document.getElementById("landingUrl");
    if (urlInput) urlInput.value = window.location.href;
  }

  /* ----------------------------------------------------------
     2. 数値フォーマット・ランク判定
     ---------------------------------------------------------- */
  function yen(n) {
    return "¥" + Math.round(n).toLocaleString("ja-JP");
  }

  // ランク判定：S=月50万以上 / A=20万以上 / B=10万以上 / C=10万未満
  function rankOf(monthly) {
    if (monthly >= 500000) return "S";
    if (monthly >= 200000) return "A";
    if (monthly >= 100000) return "B";
    return "C";
  }

  var RANK_ADVICE = {
    S: "優先診断対象です。明細をご共有いただくことで、担当より優先的にご連絡いたします。",
    A: "削減できる可能性が高い対象です。明細をご共有いただくと、担当よりご連絡いたします。",
    B: "診断対象です。明細をもとに削減できる可能性を確認いたします。",
    C: "まずは無料診断で現状を確認しましょう。明細をご共有ください。"
  };

  /* ----------------------------------------------------------
     3. シミュレーター（共通ロジック）
     ---------------------------------------------------------- */
  // ファーストビューの簡易シミュレーター
  function bindHeroSim() {
    var input  = document.getElementById("heroSimInput");
    var result = document.getElementById("heroSimResult");
    if (!input || !result) return;

    input.addEventListener("input", function () {
      var m = parseFloat(input.value);
      if (!m || m <= 0) { result.hidden = true; return; }
      result.hidden = false;

      var year = m * 12;
      document.getElementById("heroYear").textContent  = yen(year);
      document.getElementById("heroCut15").textContent = yen(year * 0.15);
      document.getElementById("heroCut20").textContent = yen(year * 0.20);

      var r = rankOf(m);
      var rankEl = document.getElementById("heroRank");
      rankEl.textContent = "見込み度ランク：" + r;
      rankEl.className = "sim-rank rank-tone-" + r;
      rankEl.style.background = rankBg(r);
      rankEl.style.color = "#fff";
    });
  }

  function rankBg(r) {
    switch (r) {
      case "S": return "linear-gradient(135deg,#f0982a,#e0671b)";
      case "A": return "linear-gradient(135deg,#1f8be0,#1558bf)";
      case "B": return "linear-gradient(135deg,#1aa179,#14805f)";
      default:  return "#6b7888";
    }
  }

  // 専用シミュレーターセクション
  function bindMainSim() {
    var input    = document.getElementById("simInput");
    var grid     = document.getElementById("simGrid");
    var rankBox  = document.getElementById("simRankBox");
    if (!input) return;

    input.addEventListener("input", function () {
      var m = parseFloat(input.value);
      if (!m || m <= 0) { grid.hidden = true; rankBox.hidden = true; return; }
      grid.hidden = false; rankBox.hidden = false;

      var year = m * 12;
      document.getElementById("simYear").textContent  = yen(year);
      document.getElementById("simCut15").textContent = yen(year * 0.15);
      document.getElementById("simCut20").textContent = yen(year * 0.20);

      var r = rankOf(m);
      rankBox.className = "sim-rank-box rank-" + r;
      document.getElementById("simRankBadge").textContent = r;
      document.getElementById("simRankAdvice").textContent = RANK_ADVICE[r];
    });
  }

  /* ----------------------------------------------------------
     4. フォーム：月額入力 → ランク即時表示
     ---------------------------------------------------------- */
  function bindFormRank() {
    var input   = document.getElementById("formAmount");
    var rankBox = document.getElementById("formRank");
    if (!input || !rankBox) return;

    input.addEventListener("input", function () {
      var m = parseFloat(input.value);
      if (!m || m <= 0) { rankBox.hidden = true; return; }
      rankBox.hidden = false;

      var r = rankOf(m);
      rankBox.className = "form-rank rank-" + r;
      document.getElementById("formRankBadge").textContent = r;
      document.getElementById("formRankAdvice").textContent =
        "見込み度ランク " + r + "：" + RANK_ADVICE[r];
    });
  }

  /* ----------------------------------------------------------
     5. 明細アップロードの状態表示
     ---------------------------------------------------------- */
  function bindUpload() {
    var file  = document.getElementById("billFile");
    var state = document.getElementById("uploadState");
    if (!file || !state) return;

    file.addEventListener("change", function () {
      if (file.files && file.files.length > 0) {
        var names = Array.prototype.map.call(file.files, function (f) { return f.name; });
        state.textContent = "✓ " + file.files.length + "件のファイルを選択中：" + names.join("、");
      } else {
        state.textContent = "未選択（お申し込み後の送付でもOKです）";
      }
    });
  }

  /* ----------------------------------------------------------
     6. フォーム送信（仮実装）
     ----------------------------------------------------------
     ▼本番接続時の差し替えポイント
       - Googleフォーム / GAS / HubSpot: <form> の action と method を設定し、
         この preventDefault を外して通常送信、または fetch で送信する。
       - Formspree: <form action="https://formspree.io/f/xxxx" method="POST"> に変更。
     詳しくは README.md を参照。
     ---------------------------------------------------------- */
  function bindFormSubmit() {
    var form    = document.getElementById("diagnoseForm");
    var success = document.getElementById("formSuccess");
    var btn     = document.getElementById("submitBtn");
    if (!form) return;

    // Formspreeエンドポイントが設定されていれば action に反映
    if (FORMSPREE_ENDPOINT) form.setAttribute("action", FORMSPREE_ENDPOINT);

    // 送信前に自動計算値（ランク・年間・15%/20%）を隠しフィールドへセット
    function fillCalcFields() {
      var m = parseFloat((form.monthly_cost && form.monthly_cost.value) || "") || 0;
      var year = m * 12;
      setVal("calcRank",   m > 0 ? rankOf(m) : "対象外");
      setVal("calcAnnual", m > 0 ? year : "");
      setVal("calcCut15",  m > 0 ? Math.round(year * 0.15) : "");
      setVal("calcCut20",  m > 0 ? Math.round(year * 0.20) : "");
    }
    function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }

    function showSuccess() {
      success.hidden = false;
      form.style.display = "none";
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function setBusy(b) {
      if (!btn) return;
      btn.disabled = b;
      btn.textContent = b ? "送信中…" : "無料診断を申し込む（無料）";
    }
    function fail(msg) {
      alert("送信に失敗しました。お手数ですが、お電話でお問い合わせください。\n（" + (msg || "") + "）");
      setBusy(false);
    }

    // テキスト項目をオブジェクトに集約（ファイル・ボタンは除外）
    function collectFields() {
      var obj = {};
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === "file" || el.type === "submit" || el.type === "button") return;
        obj[el.name] = el.value;
      });
      return obj;
    }

    // 明細ファイルをbase64で読み込む（GAS送信用）
    function readFilesB64() {
      var input = document.getElementById("billFile");
      var files = (input && input.files) ? Array.prototype.slice.call(input.files) : [];
      return Promise.all(files.map(function (f) {
        return new Promise(function (resolve, reject) {
          var r = new FileReader();
          r.onload = function () {
            resolve({
              name: f.name,
              mimeType: f.type || "application/octet-stream",
              dataBase64: String(r.result).split(",")[1] || ""
            });
          };
          r.onerror = function () { reject(new Error("ファイル読込エラー")); };
          r.readAsDataURL(f);
        });
      }));
    }

    // --- Google Apps Script へ送信（明細はDriveへ・スプレッドシート追記） ---
    function submitToGAS() {
      setBusy(true);
      readFilesB64().then(function (files) {
        var payload = JSON.stringify({ fields: collectFields(), files: files });
        // no-cors + text/plain：プリフライト無しで確実に届く（応答は読まない＝楽観的に成功表示）
        return fetch(GAS_ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: payload
        });
      }).then(function () {
        showSuccess();
      }).catch(function (err) {
        fail(err.message);
      });
    }

    // --- Formspree へ送信（メール受信） ---
    function submitToFormspree() {
      var payload = new FormData(form);
      var fileInput = document.getElementById("billFile");
      if (!FORM_SUPPORTS_FILE) {
        payload.delete("bill_file");
        var hasFile = fileInput && fileInput.files && fileInput.files.length > 0;
        var names = hasFile
          ? Array.prototype.map.call(fileInput.files, function (f) { return f.name; }).join("、")
          : "";
        payload.set("bill_status", hasFile ? "明細あり（フォーム上で選択／折り返しで受領）：" + names : "明細なし（折り返しで依頼）");
      }
      setBusy(true);
      fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: payload,
        headers: { "Accept": "application/json" }
      })
        .then(function (res) {
          if (res.ok) { showSuccess(); }
          else {
            return res.json().then(function (j) {
              throw new Error((j && j.errors && j.errors[0] && j.errors[0].message) || "送信に失敗しました");
            });
          }
        })
        .catch(function (err) { fail(err.message); });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // 簡易バリデーション（必須項目）
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      fillCalcFields();

      // 送信先の優先順位：GAS → Formspree →（未設定なら）仮実装
      if (GAS_ENDPOINT)       { submitToGAS();       return; }
      if (FORMSPREE_ENDPOINT) { submitToFormspree(); return; }

      // --- 仮実装モード：送信せず完了画面のみ ---
      var preview = {};
      new FormData(form).forEach(function (v, k) {
        preview[k] = (v instanceof File) ? v.name : v;
      });
      console.log("[無料診断フォーム/仮実装] 送信予定データ:", preview);
      showSuccess();
    });
  }

  /* ----------------------------------------------------------
     7. 初期化
     ---------------------------------------------------------- */
  function init() {
    applyRef();
    bindHeroSim();
    bindMainSim();
    bindFormRank();
    bindUpload();
    bindFormSubmit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
