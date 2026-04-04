function classify(session) {
  const pages = session.events || [];
  const uniquePages = [...new Set(pages)];
  const hasCheckout = pages.some((p) => p.includes("/checkout") || p.includes("/payment"));
  const hasPricing = pages.some((p) => p.includes("/pricing"));

  if (hasPricing && hasCheckout) return "Buyer";
  if (session.pageViews >= 4 && uniquePages.length >= 3) return "Explorer";
  if (session.pageViews === 1) return "Bouncer";
  return "Unknown";
}

module.exports = { classify };
