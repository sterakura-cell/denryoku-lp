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
  var GAS_ENDPOINT       = "https://script.google.com/macros/s/AKfycbxL8mk2H8M2JW06vfXJDjteJJStyz5ssGi4WQCduGSi3G1BdT4q5tRZSO-UDMqpjo0/exec";
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
      el.setAttribute("href", telHref(conf.tel));
      if (id === "stickyTel") {
        el.setAttribute("aria-label", "電話で相談：" + conf.tel);
        var stickyLabel = el.querySelector("span");
        if (stickyLabel) stickyLabel.textContent = "電話";
        return;
      }
      el.textContent = conf.tel;
    });

    // hidden input：紹介元コード
    var refInput = document.getElementById("referralSource");
    if (refInput) refInput.value = conf.code;

    // hidden input：問い合わせ元LPの完全URL（どのLP経由かを記録）
    var urlInput = document.getElementById("landingUrl");
    if (urlInput) urlInput.value = window.location.href;

    // hidden input：営業先コード（?src=会社コード）。申込がどの会社への営業由来かを計測
    var srcInput = document.getElementById("campaignSrc");
    if (srcInput) srcInput.value = (ATTRIBUTION && ATTRIBUTION.campaign_src) || getSrc();
  }

  /* ----------------------------------------------------------
     1.5 訪問トラッキング（クリック率の計測）
     ----------------------------------------------------------
     ?src=会社コード 付きでLPが開かれたら、GASへ「訪問」ビーコンを1回送る。
     GAS側が「アクセスログ」シートに日時・srcを記録 → 送信URLのクリック数が分かる。
     no-cors の画像ビーコンなのでCORSもプリフライトも発生しない。 */
  function getSrc() {
    var params = new URLSearchParams(window.location.search);
    return (params.get("src") || "").toLowerCase().trim().slice(0, 40);
  }

  function cleanParam(value, max) {
    return (value || "").toString().trim().slice(0, max || 120);
  }

  /* srcが無い訪問も流入元（リファラ）で自動分類して記録する。
     insta-ref/youtube-ref等=リファラ判定、direct=リファラ無しの直接流入。
     SNS投稿には明示タグ（?src=insta 等）を推奨（アプリ内ブラウザはリファラを落とすため）。 */
  function classifyReferrer() {
    var r = (document.referrer || "").toLowerCase();
    if (!r) return "direct";
    if (r.indexOf("instagram.") >= 0) return "insta-ref";
    if (r.indexOf("youtube.") >= 0 || r.indexOf("youtu.be") >= 0) return "youtube-ref";
    if (r.indexOf("tiktok.") >= 0) return "tiktok-ref";
    if (r.indexOf("google.") >= 0 || r.indexOf("bing.") >= 0 || r.indexOf("yahoo") >= 0) return "search";
    if (r.indexOf("t.co") >= 0 || r.indexOf("twitter.") >= 0 || r.indexOf("x.com") >= 0) return "x-ref";
    if (r.indexOf("facebook.") >= 0 || r.indexOf("fb.") >= 0) return "fb-ref";
    if (r.indexOf("line.me") >= 0 || r.indexOf("line-apps") >= 0) return "line-ref";
    return "other-ref";
  }

  function readAttribution() {
    var params = new URLSearchParams(window.location.search);
    var explicitSource = params.get("utm_source") || getSrc();
    var source = cleanParam(explicitSource || classifyReferrer(), 80);
    return {
      utm_source: source,
      utm_medium: cleanParam(params.get("utm_medium") || "", 80),
      utm_campaign: cleanParam(params.get("utm_campaign") || params.get("campaign") || "", 120),
      utm_content: cleanParam(params.get("utm_content") || "", 120),
      utm_term: cleanParam(params.get("utm_term") || "", 120),
      campaign_src: cleanParam(getSrc() || source, 80),
      landing_url: window.location.href.slice(0, 500),
      landing_path: (window.location.pathname || "/").slice(0, 160),
      referrer: (document.referrer || "").slice(0, 500)
    };
  }

  function storeAttribution() {
    var current = readAttribution();
    try {
      var params = new URLSearchParams(window.location.search);
      var hasExplicit = !!(params.get("utm_source") || getSrc());
      var key = "denki_attribution";
      if (hasExplicit || !localStorage.getItem(key)) {
        localStorage.setItem(key, JSON.stringify(current));
      }
      return JSON.parse(localStorage.getItem(key) || "{}");
    } catch (e) {
      return current;
    }
  }

  var ATTRIBUTION = storeAttribution();

  function ensureHidden(form, name) {
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) {
      el = document.createElement("input");
      el.type = "hidden";
      el.name = name;
      form.appendChild(el);
    }
    return el;
  }

  function fillAttributionFields(form) {
    if (!form) return;
    var data = ATTRIBUTION || readAttribution();
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "campaign_src",
      "landing_url",
      "landing_path",
      "referrer"
    ].forEach(function (name) {
      ensureHidden(form, name).value = data[name] || "";
    });
  }

  function getPageKey() {
    var path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
    if (path === "/") return "lp";
    return path.replace(/^\//, "").replace(/\.html$/i, "") || "lp";
  }

  function trackGaEvent(name, params) {
    if (typeof window.gtag !== "function") return;
    window.gtag("event", name, params || {});
  }

  function trackVisit() {
    var attr = ATTRIBUTION || readAttribution();
    var src = attr.campaign_src || attr.utm_source || getSrc() || classifyReferrer(); // src無しでも流入元コードで必ず記録
    if (!GAS_ENDPOINT) return;
    try {
      var pageKey = getPageKey();
      var pageUrl = window.location.href.slice(0, 300);
      var pageTitle = (document.title || pageKey).slice(0, 120);

      // sessionStorageで同一セッション・同一ページの二重カウントを防止
      var key = "visit_" + src + "_" + pageKey;
      if (window.sessionStorage && sessionStorage.getItem(key)) return;
      if (window.sessionStorage) sessionStorage.setItem(key, "1");
      var img = new Image();
      var ref = document.referrer ? encodeURIComponent(document.referrer.slice(0, 120)) : "";
      var ua = navigator.userAgent ? encodeURIComponent(navigator.userAgent.slice(0, 180)) : "";
      img.src = GAS_ENDPOINT + "?beacon=1&src=" + encodeURIComponent(src) +
                "&utm_source=" + encodeURIComponent(attr.utm_source || "") +
                "&utm_medium=" + encodeURIComponent(attr.utm_medium || "") +
                "&utm_campaign=" + encodeURIComponent(attr.utm_campaign || "") +
                "&utm_content=" + encodeURIComponent(attr.utm_content || "") +
                "&utm_term=" + encodeURIComponent(attr.utm_term || "") +
                "&page=" + encodeURIComponent(pageKey) +
                "&url=" + encodeURIComponent(pageUrl) +
                "&title=" + encodeURIComponent(pageTitle) +
                "&t=" + Date.now() +
                (ref ? "&ref=" + ref : "") +
                (ua ? "&ua=" + ua : "");
    } catch (e) { /* 計測失敗はLP表示に影響させない */ }
  }

  /* ----------------------------------------------------------
     2. 数値フォーマット・ランク判定
     ---------------------------------------------------------- */
  function yen(n) {
    return "¥" + Math.round(n).toLocaleString("ja-JP");
  }

  function yenMan(n) {
    n = Math.round(Number(n) || 0);
    if (!n) return "未入力";
    var man = n / 10000;
    if (man >= 10000) return (man / 10000).toFixed(man % 10000 === 0 ? 0 : 1) + "億円";
    return man.toLocaleString("ja-JP", { maximumFractionDigits: 1 }) + "万円";
  }

  function bindMoneyReads() {
    var reads = document.querySelectorAll("[data-money-for]");
    Array.prototype.forEach.call(reads, function (read) {
      var id = read.getAttribute("data-money-for");
      var input = document.getElementById(id);
      var span = read.querySelector("span");
      if (!input || !span) return;
      function update() {
        var v = parseFloat(input.value || "") || 0;
        span.textContent = v ? yen(v) + "（" + yenMan(v) + "）" : "未入力";
      }
      input.addEventListener("input", update);
      input.addEventListener("change", update);
      update();
    });
  }

  // ランク判定（パチンコホール基準）：SS=月300万以上（大型・本部合算） / S=100万以上 / A=50万以上 / B=20万以上 / C=20万未満
  function rankOf(monthly) {
    if (monthly >= 3000000) return "SS";
    if (monthly >= 1000000) return "S";
    if (monthly >= 500000) return "A";
    if (monthly >= 200000) return "B";
    return "C";
  }

  var RANK_ADVICE = {
    SS: "最優先の診断対象です（大型店・本部クラス）。明細をご共有いただければ、担当より最優先でご連絡いたします。",
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

    var heroTimer = null;
    input.addEventListener("input", function () {
      clearTimeout(heroTimer);
      heroTimer = setTimeout(update, 350);   // 入力が止まってから計算（打鍵途中の中途半端な数字を出さない）
    });
    function update() {
      var m = parseFloat(input.value);
      if (!m || m < 10000) { result.hidden = true; return; }   // 1万円未満は入力途中とみなす
      result.hidden = false;

      var year = m * 12;
      document.getElementById("heroYear").textContent  = yen(year);
      document.getElementById("heroCut15").textContent = yen(year * 0.10);
      document.getElementById("heroCut20").textContent = yen(year * 0.20);

      var r = rankOf(m);
      var rankEl = document.getElementById("heroRank");
      rankEl.textContent = "見込み度ランク：" + r;
      rankEl.className = "sim-rank rank-tone-" + r;
      rankEl.style.background = rankBg(r);
      rankEl.style.color = "#fff";
    }
  }

  function rankBg(r) {
    switch (r) {
      case "SS": return "linear-gradient(135deg,#d4380d,#a8071a)";
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

    // GA4: 計算結果が初めて表示された時だけ1回送信（入力のたびの重複送信を防ぐ）
    var simCompleteTracked = false;
    function trackSimulatorComplete(m) {
      if (simCompleteTracked) return;
      simCompleteTracked = true;
      if (typeof window.gtag !== "function") return;
      var params = {
        monthly_cost: m,
        source_page: window.location.pathname
      };
      var industry = document.querySelector('#diagnoseForm [name="industry"]');
      if (industry && industry.value) params.facility_type = industry.value;
      window.gtag("event", "simulator_complete", params);
    }

    var simTimer = null;
    input.addEventListener("input", function () {
      clearTimeout(simTimer);
      simTimer = setTimeout(update, 350);
    });
    function update() {
      var m = parseFloat(input.value);
      if (!m || m < 10000) { grid.hidden = true; rankBox.hidden = true; return; }
      grid.hidden = false; rankBox.hidden = false;
      trackSimulatorComplete(m);

      var year = m * 12;
      document.getElementById("simYear").textContent  = yen(year);
      document.getElementById("simCut15").textContent = yen(year * 0.10);
      document.getElementById("simCut20").textContent = yen(year * 0.20);

      var r = rankOf(m);
      rankBox.className = "sim-rank-box rank-" + r;
      document.getElementById("simRankBadge").textContent = r;
      document.getElementById("simRankAdvice").textContent = RANK_ADVICE[r];
      if (input.dataset.lastTrackedAmount !== String(m)) {
        input.dataset.lastTrackedAmount = String(m);
        trackGaEvent("simulator_complete", {
          calculator_type: "monthly_bill",
          monthly_cost: m,
          annual_cost: year,
          lead_rank: r,
          page_path: window.location.pathname
        });
      }
    }
  }

  /* ----------------------------------------------------------
     4. フォーム：月額入力 → ランク即時表示
     ---------------------------------------------------------- */
  function bindFormRank() {
    var input   = document.getElementById("formAmount");
    var rankBox = document.getElementById("formRank");
    if (!input || !rankBox) return;

    try {
      var savedSimulation = JSON.parse(sessionStorage.getItem("ripuro_simulation") || "null");
      if (savedSimulation && savedSimulation.monthly) {
        input.value = savedSimulation.monthly;
        var handoff = document.createElement("input");
        handoff.type = "hidden";
        handoff.name = "simulation_summary";
        handoff.value = "店舗数:" + (savedSimulation.stores || 1) +
          " / 想定削減率:" + (savedSimulation.rate || "") + "%" +
          " / 年間改善余地:" + Math.round(savedSimulation.annualSaving || 0) + "円" +
          " / 精度:" + (savedSimulation.accuracy || "");
        var diagnoseForm = document.getElementById("diagnoseForm");
        if (diagnoseForm) diagnoseForm.appendChild(handoff);
        sessionStorage.removeItem("ripuro_simulation");
      }
    } catch (error) { /* storage unavailable */ }

    var frTimer = null;
    input.addEventListener("input", function () {
      clearTimeout(frTimer);
      frTimer = setTimeout(update, 350);
    });
    function update() {
      var m = parseFloat(input.value);
      if (!m || m < 10000) { rankBox.hidden = true; return; }
      rankBox.hidden = false;

      var r = rankOf(m);
      rankBox.className = "form-rank rank-" + r;
      document.getElementById("formRankBadge").textContent = r;
      document.getElementById("formRankAdvice").textContent =
        "見込み度ランク " + r + "：" + RANK_ADVICE[r];
    }
  }

  /* ----------------------------------------------------------
     4.5 金額プリセットチップ（ワンタップ入力）
     ---------------------------------------------------------- */
  function bindImpactSim() {
    var sales = document.getElementById("impactSales");
    var electric = document.getElementById("impactElectric");
    var profit = document.getElementById("impactProfit");
    var btn = document.getElementById("impactBtn");
    var result = document.getElementById("impactResult");
    var printBtn = document.getElementById("impactPrintBtn");
    var printReport = document.getElementById("impactPrintReport");
    if (!sales || !electric || !btn || !result) return;

    function render() {
      var s = parseFloat(sales.value || "") || 0;
      var e = parseFloat(electric.value || "") || 0;
      var p = parseFloat((profit && profit.value) || "") || 0;
      if (!e) {
        result.innerHTML = '<p class="headline">まず「月額電気代」を入れると、年間でどれくらい効くか表示します。</p><div class="big">-</div><ul class="impact-list"><li>請求書の合計金額をそのまま入れてください。</li><li>月商や利益は分かる範囲で大丈夫です。</li><li>50万・100万などのボタンでも入力できます。</li></ul>';
        if (printBtn) printBtn.hidden = true;
        return;
      }
      var annual = e * 12;
      var cut20 = Math.round(annual * 0.2);
      var cut40 = Math.round(annual * 0.4);
      var salesRate = s ? (e / s * 100).toFixed(1) : null;
      var profitBoost = p ? Math.round(cut20 / 12 / p * 100) : null;
      var headline = "20%削減できた場合、年間" + yenMan(cut20) + "の固定費改善余地";
      var items = [
        "現在の年間電気代は約" + yen(annual) + "（" + yenMan(annual) + "）です。",
        "条件が良い場合は、年間" + yenMan(cut40) + "規模の改善余地が出ることもあります。",
        "請求書を添付すると、毎月の固定費・一番電気を使ったタイミング・単価から精査できます。"
      ];
      if (salesRate) items.unshift("月商に対する電気代比率は約" + salesRate + "%です。");
      if (profitBoost) items.unshift("20%削減時の月間効果は、現在利益の約" + profitBoost + "%に相当します。");
      result.innerHTML = '<p class="headline">' + headline + '</p><div class="big">' + yenMan(cut20) + '<small>' + yen(cut20) + '</small></div><ul class="impact-list">' + items.map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul>";
      if (printBtn) printBtn.hidden = false;
      if (printReport) {
        var values = {
          "[data-report-date]": new Date().toLocaleDateString("ja-JP"),
          "[data-report-monthly]": yen(e),
          "[data-report-annual]": yen(annual),
          "[data-report-cut20]": yen(cut20),
          "[data-report-cut40]": yen(cut40)
        };
        Object.keys(values).forEach(function (selector) {
          var node = printReport.querySelector(selector);
          if (node) node.textContent = values[selector];
        });
      }
    }

    btn.addEventListener("click", function () {
      render();
      var amount = parseFloat(electric.value || "") || 0;
      if (amount) {
        trackGaEvent("simulator_complete", {
          calculator_type: "business_impact",
          monthly_cost: amount,
          annual_cost: amount * 12,
          page_path: window.location.pathname
        });
      }
    });
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        if (!parseFloat(electric.value || "")) return;
        render();
        document.body.classList.add("printing-report");
        trackGaEvent("simulator_report_print", { calculator_type: "business_impact", page_path: window.location.pathname });
        window.print();
      });
      window.addEventListener("afterprint", function () { document.body.classList.remove("printing-report"); });
    }
    [sales, electric, profit].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () {
        clearTimeout(el._impactTimer);
        el._impactTimer = setTimeout(render, 350);
      });
    });
    render();
  }

  function bindChips() {
    var boxes = document.querySelectorAll(".sim-chips");
    Array.prototype.forEach.call(boxes, function (box) {
      var target = document.getElementById(box.getAttribute("data-target"));
      if (!target) return;
      Array.prototype.forEach.call(box.querySelectorAll(".chip"), function (btn) {
        btn.addEventListener("click", function () {
          target.value = btn.getAttribute("data-v");
          Array.prototype.forEach.call(box.querySelectorAll(".chip"), function (c) { c.classList.remove("on"); });
          btn.classList.add("on");
          target.dispatchEvent(new Event("input"));
        });
      });
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
     5.5 電話リンククリック計測（GA4: phone_click）
     ----------------------------------------------------------
     tel:09036987711 へのクリック／タップをGA4へ送信する。
     documentへの委譲リスナーなので、applyRef()でhrefが書き換わった
     リンクも判定時のhrefで対象になる。preventDefaultしないため
     発信動作（リンク遷移）には影響しない。 */
  function bindPhoneClickTracking() {
    var TARGET_TEL = "09036987711";
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var link = target.closest('a[href^="tel:"]');
      if (!link) return;
      var digits = (link.getAttribute("href") || "").replace(/[^0-9]/g, "");
      if (digits !== TARGET_TEL) return;
      if (typeof window.gtag !== "function") return;
      window.gtag("event", "phone_click", {
        phone_number: TARGET_TEL,
        link_id: link.id || "",
        source_page: window.location.pathname
      });
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
    fillAttributionFields(form);

    form.addEventListener("input", function () {
      if (form.dataset.formStarted === "1") return;
      form.dataset.formStarted = "1";
      trackGaEvent("form_start", {
        form_name: form.getAttribute("id") || "diagnoseForm",
        page_path: window.location.pathname
      });
    });

    // Formspreeエンドポイントが設定されていれば action に反映
    if (FORMSPREE_ENDPOINT) form.setAttribute("action", FORMSPREE_ENDPOINT);

    // 送信前に自動計算値（ランク・年間・10%／20%の計算例）を隠しフィールドへセット
    function fillCalcFields() {
      var m = parseFloat((form.monthly_cost && form.monthly_cost.value) || "") || 0;
      var year = m * 12;
      setVal("calcRank",   m > 0 ? rankOf(m) : "対象外");
      setVal("calcAnnual", m > 0 ? year : "");
      setVal("calcCut15",  m > 0 ? Math.round(year * 0.10) : "");
      setVal("calcCut20",  m > 0 ? Math.round(year * 0.20) : "");
    }
    function setVal(id, v) { var el = document.getElementById(id); if (el) el.value = v; }

    function trackLeadEvent() {
      if (form.dataset.leadTracked === "1") return;
      form.dataset.leadTracked = "1";
      if (typeof window.gtag !== "function") return;
      var attr = ATTRIBUTION || readAttribution();
      var amount = parseFloat((form.monthly_cost && form.monthly_cost.value) || "") || 0;
      var leadParams = {
        event_category: "form",
        event_label: "diagnose_form",
        form_name: form.getAttribute("id") || "diagnoseForm",
        lp_type: (form.lp_type && form.lp_type.value) || "",
        industry: (form.industry && form.industry.value) || "",
        monthly_cost: amount || undefined,
        lead_rank: amount > 0 ? rankOf(amount) : "",
        utm_source: attr.utm_source || "",
        utm_medium: attr.utm_medium || "",
        utm_campaign: attr.utm_campaign || "",
        utm_content: attr.utm_content || ""
      };
      window.gtag("event", "qualify_lead", leadParams);
      window.gtag("event", "lead_submit", leadParams);
      window.gtag("event", "generate_lead", leadParams);
    }

    function showSuccess() {
      trackLeadEvent();
      success.hidden = false;
      form.style.display = "none";
      success.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    function setBusy(b) {
      if (!btn) return;
      btn.disabled = b;
      btn.textContent = b ? "送信中…" : "電気代を無料でチェックする";
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

      var phone = form.querySelector('[name="phone"]');
      var email = form.querySelector('[name="email"]');
      if (phone) phone.setCustomValidity("");
      if (email) email.setCustomValidity("");
      if ((phone || email) && !(phone && phone.value.trim()) && !(email && email.value.trim())) {
        var contactField = phone || email;
        if (contactField) {
          contactField.setCustomValidity("電話番号かメールアドレスの、どちらか1つを入力してください");
          contactField.reportValidity();
        }
        return;
      }

      // 簡易バリデーション（必須項目）
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      fillAttributionFields(form);
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
  function injectPlainLanguageGuide() {
    if (document.querySelector(".plain-language-guide")) return;
    var text = document.body.innerText || "";
    var terms = [
      ["高圧電力", "工場や大きなお店などで使う、法人向けの電気契約"],
      ["最大デマンド", "1か月の中で、いちばん電気を多く使った時間の値"],
      ["燃料費調整", "燃料の価格に合わせて、毎月増えたり減ったりするお金"],
      ["市場価格調整", "電気の仕入れ価格に合わせて、増えたり減ったりするお金"],
      ["特別高圧", "とても大きな工場などで使う電気契約"],
      ["負荷率", "1日の中で、電気をどれくらい一定に使っているかを見る数字"],
      ["実効単価", "請求額を使用量で割った、実際の電気1kWhあたりの金額"]
    ].filter(function (item) { return text.indexOf(item[0]) >= 0; }).slice(0, 5);
    var hasEstimate = /(?:20|30|40)[％%]|削減例/.test(text);
    if (!terms.length && !hasEstimate) return;

    if (!document.getElementById("plain-language-style")) {
      var style = document.createElement("style");
      style.id = "plain-language-style";
      style.textContent =
        ".plain-language-guide{max-width:1100px;margin:24px auto;padding:18px 20px;border:1px solid #dce6ef;border-radius:12px;background:#f7fbff;color:#334155;font-family:\"Yu Gothic\",Meiryo,sans-serif}" +
        ".plain-language-guide h2{margin:0 0 10px;color:#0e1f3d;font-size:18px;text-align:left}" +
        ".plain-language-guide dl{display:grid;gap:7px;margin:0}.plain-language-guide div{display:grid;grid-template-columns:140px 1fr;gap:10px}" +
        ".plain-language-guide dt{font-weight:800}.plain-language-guide dd{margin:0}.plain-language-guide p{margin:12px 0 0;padding-top:10px;border-top:1px solid #dce6ef;font-size:12px}" +
        "@media(max-width:640px){.plain-language-guide{margin:16px 14px;padding:16px}.plain-language-guide div{grid-template-columns:1fr;gap:1px}.plain-language-guide dd{font-size:13px}}";
      document.head.appendChild(style);
    }

    var guide = document.createElement("aside");
    guide.className = "plain-language-guide";
    guide.setAttribute("aria-label", "むずかしい言葉と数字の見方");
    var html = "<h2>むずかしい言葉を、かんたんに</h2>";
    if (terms.length) {
      html += "<dl>" + terms.map(function (item) {
        return "<div><dt>" + item[0] + "</dt><dd>" + item[1] + "</dd></div>";
      }).join("") + "</dl>";
    }
    if (hasEstimate) html += "<p><b>数字の見方：</b>ページ内の削減率は計算例または過去の一部の例です。実際の金額は、今の請求書と新しい見積書を同じ条件で比べて確認します。</p>";
    guide.innerHTML = html;

    var main = document.querySelector("main");
    var hero = main && main.querySelector(".hero");
    if (hero && hero.parentNode) hero.parentNode.insertBefore(guide, hero.nextSibling);
    else if (main) main.insertBefore(guide, main.firstChild);
  }

  function movePriorityForm() {
    var path = (window.location.pathname || "/").toLowerCase();
    if (!(path === "/" || path.endsWith("/index.html") || path.endsWith("/business-denkidai.html"))) return;
    var main = document.querySelector("main");
    var hero = main && main.querySelector(".hero");
    var formSection = document.getElementById("form");
    if (hero && formSection && hero.parentNode === formSection.parentNode) {
      hero.parentNode.insertBefore(formSection, hero.nextSibling);
    }
  }

  function injectGroupTrail() {
    if (document.querySelector(".soter-group-trail")) return;

    if (!document.getElementById("soter-group-trail-style")) {
      var style = document.createElement("style");
      style.id = "soter-group-trail-style";
      style.textContent =
        ".soter-group-trail{background:#111b2b;color:#fff;padding:22px 20px;border-top:1px solid rgba(255,255,255,.12)}" +
        ".soter-group-trail__inner{max-width:1100px;margin:auto;display:flex;align-items:center;justify-content:space-between;gap:24px}" +
        ".soter-group-trail__label{font-size:10px;letter-spacing:.18em;color:rgba(255,255,255,.55);white-space:nowrap}" +
        ".soter-group-trail__links{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:18px}" +
        ".soter-group-trail a{color:#fff;font-size:11px;text-decoration:none;border-bottom:1px solid rgba(255,255,255,.35);padding-bottom:3px}" +
        "@media(max-width:640px){.soter-group-trail{padding:24px 20px 92px}.soter-group-trail__inner{align-items:flex-start;flex-direction:column}.soter-group-trail__links{justify-content:flex-start;flex-direction:column;gap:13px}}";
      document.head.appendChild(style);
    }

    var trail = document.createElement("aside");
    trail.className = "soter-group-trail";
    trail.setAttribute("aria-label", "Soterグループの関連サービス");
    trail.innerHTML =
      '<div class="soter-group-trail__inner">' +
        '<span class="soter-group-trail__label">SOTER GROUP</span>' +
        '<div class="soter-group-trail__links">' +
          '<a data-group-destination="portal" href="https://soter-info.com/?utm_source=ripuro.soter-info.com&utm_medium=referral&utm_campaign=group_navigation&utm_content=footer">Soter Inc. 総合案内</a>' +
          '<a data-group-destination="business" href="https://shindan.soter-info.com/?utm_source=ripuro.soter-info.com&utm_medium=referral&utm_campaign=group_navigation&utm_content=footer_business">法人施設向け 動力電気代無料診断</a>' +
        '</div>' +
      '</div>';

    var footer = document.querySelector(".site-footer");
    if (footer && footer.parentNode) footer.parentNode.insertBefore(trail, footer);
    else document.body.appendChild(trail);

    trail.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var link = target.closest("a[data-group-destination]");
      if (!link || typeof window.gtag !== "function") return;
      window.gtag("event", "group_navigation_click", {
        destination: link.getAttribute("data-group-destination"),
        source_page: window.location.pathname
      });
    });
  }

  function bindContactTracking() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var phone = target.closest('a[href^="tel:"]');
      if (!phone) return;
      trackGaEvent("phone_click", {
        cta_location: phone.id || phone.className || "phone_link",
        page_path: window.location.pathname
      });
    });
  }

  function bindJourneyTracking() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;
      var link = target.closest("a[data-journey]");
      if (!link) return;
      trackGaEvent("journey_click", {
        journey_step: link.getAttribute("data-journey") || "unknown",
        content_group: link.getAttribute("data-content-group") || "general",
        destination: link.getAttribute("href") || "",
        page_path: window.location.pathname
      });
    });
  }

  function init() {
    applyRef();
    trackVisit();
    injectPlainLanguageGuide();
    movePriorityForm();
    bindHeroSim();
    bindMainSim();
    bindMoneyReads();
    bindFormRank();
    bindImpactSim();
    bindChips();
    bindUpload();
    bindPhoneClickTracking();
    bindFormSubmit();
    bindContactTracking();
    bindJourneyTracking();
    injectGroupTrail();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
