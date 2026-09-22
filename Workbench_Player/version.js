/* Build stamp — bump `number` and `built` on each deploy.
   Shows a small badge in the corner of every page so you can confirm which
   version a client has loaded (a stale/cached client will show an older stamp). */
window.APP_VERSION = { number: "1.6.0", built: "2026-09-22 08:10 SAST" };

(function () {
  try {
    var v = window.APP_VERSION || {};
    function inject() {
      if (document.getElementById("ds-verstamp")) return;
      var d = document.createElement("div");
      d.id = "ds-verstamp";
      d.textContent = "v" + (v.number || "?") + " · " + (v.built || "");
      d.title = "Build version — reload (Ctrl+Shift+R) to get the latest";
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
