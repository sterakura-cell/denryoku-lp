(function () {
  "use strict";

  var form = document.getElementById("pachinko-sim-form");
  if (!form) return;

  var ids = ["monthly", "stores", "days", "machines", "kwh", "contract", "margin", "rate"];
  var fields = {};
  ids.forEach(function (id) { fields[id] = document.getElementById("ps-" + id); });
  var lastResult = null;
  var renderTimer = null;

  function number(id, fallback) {
    var value = Number(fields[id] && fields[id].value);
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  function yen(value) {
    return Math.round(value).toLocaleString("ja-JP") + "円";
  }

  function compactYen(value) {
    if (value >= 100000000) return (value / 100000000).toFixed(value >= 1000000000 ? 1 : 2).replace(/\.0+$/, "") + "億円";
    if (value >= 10000) return (value / 10000).toFixed(value >= 1000000 ? 0 : 1).replace(/\.0$/, "") + "万円";
    return yen(value);
  }

  function put(id, text) {
    var node = document.getElementById(id);
    if (node) node.textContent = text;
  }

  function track(name, params) {
    if (typeof window.gtag === "function") window.gtag("event", name, params || {});
  }

  function calculate(shouldTrack) {
    var monthly = number("monthly", 0);
    if (!monthly) {
      fields.monthly.setCustomValidity("月額電気代を入力してください");
      fields.monthly.reportValidity();
      return;
    }
    fields.monthly.setCustomValidity("");

    var stores = Math.min(100, number("stores", 1));
    var days = Math.min(31, number("days", 30));
    var machines = number("machines", 0);
    var kwh = number("kwh", 0);
    var contract = number("contract", 0);
    var margin = Math.min(100, number("margin", 10));
    var rate = Math.min(30, number("rate", 20));
    var groupMonthly = monthly * stores;
    var annual = groupMonthly * 12;
    var monthlySaving = groupMonthly * rate / 100;
    var annualSaving = monthlySaving * 12;
    var threeYear = annualSaving * 3;
    var salesEquivalent = monthlySaving / (margin / 100);
    var perMachine = machines ? monthly / machines : 0;
    var effectiveRate = kwh ? monthly / kwh : 0;
    var loadFactor = kwh && contract ? kwh / (contract * 24 * 30) * 100 : 0;
    var renewableLevy = kwh ? kwh * 4.18 : 0;

    var accuracy = 55;
    if (machines) accuracy += 10;
    if (kwh) accuracy += 20;
    if (contract) accuracy += 15;
    accuracy = Math.min(100, accuracy);
    var accuracyLabel = accuracy >= 90 ? "詳細" : accuracy >= 70 ? "標準" : "簡易";

    put("ps-accuracy-label", accuracyLabel);
    put("ps-accuracy-score", accuracy + " / 100");
    document.getElementById("ps-accuracy-bar").style.width = accuracy + "%";
    put("ps-annual", compactYen(annual));
    put("ps-annual-sub", stores > 1 ? stores + "店舗合計・月" + compactYen(groupMonthly) : "月" + compactYen(monthly));
    put("ps-daily", compactYen(monthly / days));
    put("ps-saving", compactYen(annualSaving));
    put("ps-saving-sub", rate + "%削減を仮定・月" + compactYen(monthlySaving));
    put("ps-three-year", compactYen(threeYear));
    put("ps-sales-equivalent", compactYen(salesEquivalent));
    put("ps-margin-sub", "月間・営業利益率" + margin + "%で換算");
    put("ps-per-machine", perMachine ? yen(perMachine) : "台数未入力");

    var indicators = [
      "全店舗の月額合計：" + yen(groupMonthly),
      "1店舗の年間電気代：" + yen(monthly * 12)
    ];
    if (kwh) {
      indicators.push("請求実効単価：" + effectiveRate.toFixed(1) + "円/kWh（請求総額÷使用量）");
      indicators.push("2026年度の再エネ賦課金相当：月" + yen(renewableLevy) + "（4.18円/kWh）");
    } else {
      indicators.push("月間使用量を追加すると、実効単価と再エネ賦課金相当を表示できます。");
    }
    if (loadFactor) indicators.push("概算負荷率：" + loadFactor.toFixed(1) + "%");
    document.getElementById("ps-indicators").innerHTML = indicators.map(function (item) { return "<li>" + item + "</li>"; }).join("");

    var breakdown = [
      ["空調", 45],
      ["遊技・島設備", 30],
      ["照明・その他", 25]
    ];
    document.getElementById("ps-breakdown").innerHTML = breakdown.map(function (item) {
      return '<div class="sim-breakdown-row"><span>' + item[0] + '</span><i style="width:' + item[1] + '%"></i><b>' + compactYen(monthly * item[1] / 100) + '</b></div>';
    }).join("") + '<p class="sim-disclaimer">記事内の用途別比率を中間値で仮置きした参考配分です。</p>';

    var advice = [];
    if (loadFactor && loadFactor < 30) advice.push("負荷率が低めです。最大デマンドと契約電力に過大な余地がないか確認します。");
    if (loadFactor && loadFactor >= 30) advice.push("使用量が安定している可能性があります。電力量単価と調整項目を含む年間総額の比較が重要です。");
    if (!loadFactor) advice.push("使用量と契約電力を入力すると、基本料金側と従量料金側のどちらを優先確認するか絞れます。");
    if (stores > 1) advice.push(stores + "店舗分を同じ条件でそろえ、本部単位で契約更新月と単価を一覧化します。");
    if (monthly >= 1000000) advice.push("月額100万円以上のため、1%の差でも年間" + compactYen(monthly * stores * 12 * 0.01) + "動きます。率より年間総額で比較します。");
    advice.push("正式試算では直近12ヶ月の請求書を使い、季節差・燃料費等調整・解約条件まで確認します。");
    document.getElementById("ps-advice").innerHTML = advice.map(function (item) { return "<li>" + item + "</li>"; }).join("");

    lastResult = {
      monthly: monthly,
      stores: stores,
      days: days,
      machines: machines,
      kwh: kwh,
      contract: contract,
      rate: rate,
      margin: margin,
      annual: annual,
      annualSaving: annualSaving,
      threeYear: threeYear,
      salesEquivalent: salesEquivalent,
      accuracy: accuracy
    };

    if (shouldTrack) track("pachinko_simulator_used", {
      monthly_cost_band: monthly >= 2000000 ? "200万以上" : monthly >= 1000000 ? "100-199万" : "100万未満",
      store_count: stores,
      assumed_saving_rate: rate,
      input_accuracy: accuracyLabel,
      has_kwh: Boolean(kwh),
      has_contract_kw: Boolean(contract)
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    calculate(true);
    document.getElementById("ps-results").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  Object.keys(fields).forEach(function (key) {
    var field = fields[key];
    if (!field) return;
    field.addEventListener("input", function () {
      if (key === "rate") put("ps-rate-output", field.value + "%");
      clearTimeout(renderTimer);
      renderTimer = setTimeout(function () { calculate(false); }, 180);
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-sim-preset]"), function (button) {
    button.addEventListener("click", function () {
      fields.monthly.value = button.getAttribute("data-sim-preset");
      Array.prototype.forEach.call(document.querySelectorAll("[data-sim-preset]"), function (item) { item.classList.remove("on"); });
      button.classList.add("on");
      calculate(true);
    });
  });

  document.getElementById("ps-copy").addEventListener("click", function () {
    if (!lastResult || !navigator.clipboard) return;
    var text = [
      "パチンコ店 電気代シミュレーション（概算）",
      "月額電気代：" + yen(lastResult.monthly) + " × " + lastResult.stores + "店舗",
      "現在の年間電気代：" + yen(lastResult.annual),
      lastResult.rate + "%削減を仮定した年間改善余地：" + yen(lastResult.annualSaving),
      "3年間の改善余地：" + yen(lastResult.threeYear),
      "正式比較には直近12ヶ月分の請求書が必要です。",
      "https://ripuro.soter-info.com/pachinko-denkidai.html#simulator"
    ].join("\n");
    navigator.clipboard.writeText(text).then(function () {
      put("ps-copy", "コピーしました");
      track("pachinko_simulator_copy", { assumed_saving_rate: lastResult.rate });
      setTimeout(function () { put("ps-copy", "結果をコピー"); }, 1800);
    });
  });

  document.getElementById("ps-print").addEventListener("click", function () {
    track("pachinko_simulator_print", {});
    window.print();
  });

  document.getElementById("ps-cta").addEventListener("click", function () {
    if (lastResult) {
      try { sessionStorage.setItem("ripuro_simulation", JSON.stringify(lastResult)); } catch (error) { /* storage unavailable */ }
      track("pachinko_simulator_cta_click", {
        monthly_cost_band: lastResult.monthly >= 2000000 ? "200万以上" : lastResult.monthly >= 1000000 ? "100-199万" : "100万未満",
        store_count: lastResult.stores,
        assumed_saving_rate: lastResult.rate
      });
    }
  });

  calculate(false);
})();
