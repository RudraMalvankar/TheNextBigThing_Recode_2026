(function () {
  var s = document.currentScript || document.getElementsByTagName("script")[document.getElementsByTagName("script").length - 1];
  var site = s && s.getAttribute("data-site");
  if (!site) return;

  var api = ((s && s.getAttribute("data-api")) || window.INSIGHTOS_API_URL || "").replace(/\/$/, "");
  var sk = "insightos:session:" + site;
  var sid = sessionStorage.getItem(sk);
  if (!sid) {
    sid = crypto && crypto.randomUUID ? crypto.randomUUID() : Date.now() + Math.random().toString(16).slice(2);
    sessionStorage.setItem(sk, sid);
  }

  var q = [];
  var pageStart = Date.now();
  var marks = {};
  var ids = new WeakMap();
  var idn = 0;
  var buckets = {};
  var tick = 0;

  function eid(el) {
    if (!ids.has(el)) ids.set(el, ++idn);
    return ids.get(el);
  }

  function label(el) {
    return (el && el.dataset && el.dataset.label) || (el && el.getAttribute && el.getAttribute("aria-label")) || (el && el.innerText && el.innerText.trim().slice(0, 50)) || (el && el.tagName) || "ELEMENT";
  }

  function push(e) {
    q.push(e);
  }

  function pageview(timeOnPage) {
    push({ type: "pageview", page: location.pathname, referrer: document.referrer || "", sessionId: sid, timestamp: Date.now(), timeOnPage: timeOnPage || null });
  }

  function onRoute() {
    pageStart = Date.now();
    marks = {};
    pageview();
  }

  var p = history.pushState;
  var r = history.replaceState;
  history.pushState = function () {
    p.apply(history, arguments);
    onRoute();
  };
  history.replaceState = function () {
    r.apply(history, arguments);
    onRoute();
  };
  addEventListener("popstate", onRoute);

  function rage(el, ts) {
    var k = eid(el);
    var b = buckets[k] || [];
    b.push(ts);
    buckets[k] = b.filter(function (t) {
      return ts - t <= 600;
    });
    return buckets[k].length >= 3;
  }

  document.addEventListener(
    "click",
    function (ev) {
      var ts = Date.now();
      var el = ev.target;
      var isRage = rage(el, ts);
      push({
        type: isRage ? "rage_click" : "click",
        page: location.pathname,
        clickX: innerWidth ? ev.clientX / innerWidth : 0,
        clickY: innerHeight ? ev.clientY / innerHeight : 0,
        label: label(el),
        sessionId: sid,
        timestamp: ts,
      });
    },
    { passive: true },
  );

  addEventListener(
    "scroll",
    function () {
      if (tick) return;
      tick = setTimeout(function () {
        var h = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight, 1);
        var d = Math.round(((scrollY + innerHeight) / h) * 100);
        var t = [25, 50, 75, 100];
        for (var i = 0; i < 4; i += 1) {
          var m = t[i];
          if (d >= m && !marks[m]) {
            marks[m] = 1;
            push({ type: "scroll", page: location.pathname, scrollDepth: m, sessionId: sid, timestamp: Date.now() });
          }
        }
        tick = 0;
      }, 500);
    },
    { passive: true },
  );

  function send(payload) {
    if (!api) return;
    var url = api + "/api/track";
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))) return;
    } catch (_e) {}
    fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: body, keepalive: true }).catch(function () {});
  }

  function flush(force) {
    if (!q.length || (!force && document.visibilityState === "hidden")) return;
    var events = q.slice();
    q.length = 0;
    send({ siteId: site, sessionId: sid, events: events });
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState !== "hidden") return;
    push({ type: "pageview", page: location.pathname, sessionId: sid, timeOnPage: (Date.now() - pageStart) / 1000, timestamp: Date.now() });
    flush(true);
  });

  addEventListener("pagehide", function () {
    flush(true);
  });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", onRoute, { once: true });
  else onRoute();

  setInterval(function () {
    flush(false);
  }, 2000);
})();
