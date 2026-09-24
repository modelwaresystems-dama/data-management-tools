/* Build stamp — bump number/built on each deploy. version.js is loaded
   cache-busted (always fresh); each page declares window.PAGE_BUILD, and if the
   page is older than this build it force-reloads itself once (self-healing cache). */
window.APP_VERSION = { number: "1.9.12", built: "2026-09-24 12:00 SAST" };

(function () {
  try {
    var v = window.APP_VERSION || {};
    // self-heal: cached HTML page older than this build -> one cache-busting reload
    var want = v.number || "", have = window.PAGE_BUILD || "";
    if (want && have && want !== have) {
      var u = new URL(location.href);
      if (u.searchParams.get("_v") !== want) {
        u.searchParams.set("_v", want);
        location.replace(u.toString());
        return;
      }
    }
    function inject() {
      if (document.getElementById("ds-verstamp")) return;
      var d = document.createElement("div");
      d.id = "ds-verstamp";
      d.textContent = "v" + (v.number || "?") + " · " + (v.built || "");
      d.title = "Build version — the page auto-refreshes when a new build is out";
      d.style.cssText =
        "position:fixed;right:8px;bottom:6px;z-index:2147483000;" +
        "font:700 11px/1.2 'IBM Plex Mono',ui-monospace,SFMono-Regular,monospace;" +
        "color:#FFFFFF;background:rgba(12,18,32,.85);" +
        "padding:4px 9px;border-radius:6px;pointer-events:none;letter-spacing:.03em;" +
        "border:1px solid rgba(47,212,192,.7);";
      document.body.appendChild(d);
    }
    if (document.readyState !== "loading") inject();
    else document.addEventListener("DOMContentLoaded", inject);
  } catch (e) {}
})();
