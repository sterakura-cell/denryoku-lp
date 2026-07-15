(function () {
  "use strict";

  // Google Analytics 4 measurement ID.
  // Replace the empty string with the issued ID, for example: "G-ABC123XXXX".
  var GA_MEASUREMENT_ID = "G-M3PZ94WB0H";

  if (!GA_MEASUREMENT_ID || GA_MEASUREMENT_ID.indexOf("G-") !== 0) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  var tag = document.createElement("script");
  tag.async = true;
  tag.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_MEASUREMENT_ID);
  document.head.appendChild(tag);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
})();