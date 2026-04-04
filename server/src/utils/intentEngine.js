function classify(session) {
  const pages = session.events || [];
  const hasCheckout = pages.some((p) => p.includes("/checkout") || p.includes("/payment"));
  const hasPricing = pages.some((p) => p.includes("/pricing"));

  if (hasCheckout) return "Purchase Intent";
  if (hasPricing && !hasCheckout) return "Research Intent";
  if (session.pageViews >= 5) return "Explorer Intent";
  if (session.pageViews === 1) return "Bounce";
  return "Browsing";
}

module.exports = { classify };
