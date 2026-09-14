/* Benchmark confidence. Default is "est" — my estimate, smell test only.
   Anything not listed here is an estimate and must NOT be quoted as a figure. */
window.KPI_CONF_TIERS = {
  pub: {label:"published", cls:"p",
        d:"A published, citable standard — a web performance threshold or a card-scheme rule. Safe to state, with the source named."},
  ind: {label:"industry",  cls:"i",
        d:"A range widely reported across the industry and consistent with published operator reporting. Reasonable to offer as context; say it is an industry range, never a target."},
  req: {label:"requirement", cls:"b",
        d:"Not a benchmark at all — a regulatory or operational requirement. The number is what the rule demands, and any shortfall is a defect, not a performance gap."},
  cli: {label:"client only", cls:"w",
        d:"Not benchmarkable across operators. Use the client's own trailing baseline; there is no honest external comparison."},
  est: {label:"estimate",  cls:"c",
        d:"My estimate from how these businesses typically behave. Use it to judge whether a client's figure is roughly normal or obviously broken. NEVER quote it to a client as a benchmark."}
};

window.KPI_CONF = {};
(function () {
  var assign = function (tier, names) { names.forEach(function (n) { window.KPI_CONF[n] = tier; }); };

  assign("pub", [
    "Page load time (LCP)", "Interaction responsiveness (INP)", "Cumulative Layout Shift",
    "Time to first byte", "Chargeback rate"
  ]);

  assign("ind", [
    "Cost per acquisition (CPA)", "Share of mobile traffic", "Bounce / single-page-session rate",
    "3DS challenge rate", "Withdrawal processing time",
    "In-play share of turnover", "Hold percentage", "Hands per hour",
    "DAU / MAU stickiness", "ARPDAU", "Payer conversion rate", "ARPPU",
    "D1 retention", "D7 retention", "D30 retention", "Ad ARPDAU",
    "LTV : CAC ratio", "VIP revenue concentration", "Bonus cost ratio",
    "App crash-free sessions"
  ]);

  assign("req", [
    "Offer match rate", "Affordability prompt completion", "RTP display compliance",
    "Reality check interaction rate", "Self-exclusion completion", "Limit-setting completion",
    "Mandated message display coverage", "Limit-increase request rate"
  ]);

  assign("cli", [
    "Unique visitors", "Traffic quality index by source", "Field-level abandonment",
    "Decline rate by reason", "Average deposit value", "Payment method mix",
    "Reverse-withdrawal rate", "Spins per session", "Provider mix by revenue",
    "Tile click-through by position", "Bets per active", "Suspended-market interaction rate",
    "Rake per active", "Table liquidity", "Bingo tickets per player",
    "Level churn point", "Daily reward streak retention",
    "Monthly active players", "ARPU / NGR per active", "Lifetime value",
    "Account closure rate", "RG tool discoverability", "Time-out uptake",
    "Cannot-reproduce close rate", "Average handle time", "Self-service deflection rate",
    "Error-driven contact share", "Contact drivers by journey",
    "Conversion by load-time band", "Third-party script impact",
    "Form abandonment rate", "Scroll depth", "Task success rate",
    "Net Promoter Score", "Customer effort score", "Accessibility error rate",
    "Cash-out offer decline rate"
  ]);
})();
