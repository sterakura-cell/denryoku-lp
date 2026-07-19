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
    var rate = Math.min(30, number("rate", 10));
    var groupMonthly = monthly * stores;
    var annual = groupMonthly * 12;
    var monthlySaving = groupMonthly * rate / 100;
    var annualSaving = monthlySaving * 12;
    var threeYear = annualSaving * 3;
    var perMachine = machines ? monthly / machines : 0;
    var effectiveRate = kwh ? monthly / kwh : 0;
    var loadFactor = kwh && contract ? kwh / (contract * 24 * 30) * 100 : 0;
    var renewableLevy = kwh ? kwh * 4.18 : 0;

    put("ps-annual", compactYen(annual));
    put("ps-annual-sub", stores > 1 ? stores + "店舗合計・月" + compactYen(groupMonthly) : "月" + compactYen(monthly));
    put("ps-daily", compactYen(monthly / days));
    put("ps-saving", compactYen(annualSaving));
    put("ps-saving-sub", rate + "%安くなるとした場合・1か月" + compactYen(monthlySaving));
    put("ps-three-year", compactYen(threeYear));
    put("ps-per-machine", perMachine ? yen(perMachine) : "台数を入れると表示");

    var indicators = [
      "全店舗の月額合計：" + yen(groupMonthly),
      "1店舗の年間電気代：" + yen(monthly * 12)
    ];
    if (kwh) {
      indicators.push("電気1kWhあたり、実際に払っている金額：" + effectiveRate.toFixed(1) + "円");
      indicators.push("再生可能エネルギーを支えるために加わるお金：月" + yen(renewableLevy) + "（2026年度）");
    } else {
      indicators.push("請求書の『使用電力量』を入れると、電気1kWhあたりの金額なども分かります。");
    }
    if (loadFactor) indicators.push("契約した電気をどれくらい使えているか：およそ" + loadFactor.toFixed(1) + "%");
    document.getElementById("ps-indicators").innerHTML = indicators.map(function (item) { return "<li>" + item + "</li>"; }).join("");

    var breakdown = [
      ["空調", 45],
      ["遊技・島設備", 30],
      ["照明・その他", 25]
    ];
    document.getElementById("ps-breakdown").innerHTML = breakdown.map(function (item) {
      return '<div class="sim-breakdown-row"><span>' + item[0] + '</span><i style="width:' + item[1] + '%"></i><b>' + compactYen(monthly * item[1] / 100) + '</b></div>';
    }).join("") + '<p class="sim-disclaimer">一般的な割合を使った目安です。お店によって変わります。</p>';

    var advice = [];
    if (loadFactor && loadFactor < 30) advice.push("契約している電気が大きすぎないか、請求書を見て確認する価値があります。");
    if (loadFactor && loadFactor >= 30) advice.push("よく電気を使うお店です。1か月だけでなく、1年分の合計で電力会社を比べましょう。");
    if (!loadFactor) advice.push("請求書の『使用電力量』と『契約電力』を入れると、もう少し詳しく分かります。");
    if (stores > 1) advice.push(stores + "店舗分の請求書を集め、電力会社との契約が終わる月を一覧にしましょう。");
    if (monthly >= 1000000) advice.push("1か月100万円以上なので、たった1%の差でも1年で" + compactYen(monthly * stores * 12 * 0.01) + "変わります。");
    advice.push("正確に比べるには、直近1年分の請求書を使います。途中でかかる追加料金や解約金も確認しましょう。");
    document.getElementById("ps-advice").innerHTML = advice.map(function (item) { return "<li>" + item + "</li>"; }).join("");

    lastResult = {
      monthly: monthly,
      stores: stores,
      days: days,
      machines: machines,
      kwh: kwh,
      contract: contract,
      rate: rate,
      annual: annual,
      annualSaving: annualSaving,
      threeYear: threeYear,
      detailFields: Number(Boolean(machines)) + Number(Boolean(kwh)) + Number(Boolean(contract))
    };

    if (shouldTrack) track("pachinko_simulator_used", {
      monthly_cost_band: monthly >= 2000000 ? "200万以上" : monthly >= 1000000 ? "100-199万" : "100万未満",
      store_count: stores,
      assumed_saving_rate: rate,
      detail_fields: Number(Boolean(machines)) + Number(Boolean(kwh)) + Number(Boolean(contract)),
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
      lastResult.rate + "%安くなるとした場合、1年で減る目安：" + yen(lastResult.annualSaving),
      "同じ状態が3年続いた場合の目安：" + yen(lastResult.threeYear),
      "正確に比べるには、直近1年分の請求書が必要です。",
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
