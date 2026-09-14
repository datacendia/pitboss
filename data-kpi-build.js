/* KPI build recipes — part 1: Acquisition, Registration & KYC, Payments, Casino */
window.KPI_BUILD = window.KPI_BUILD || {};
Object.assign(window.KPI_BUILD, {

/* ---------- ACQUISITION ---------- */
"Unique visitors":{p:"seg",pre:"None — autocaptured.",
 steps:["Segment (user), scope <em>All users</em>, no conditions, window = last 30 days.","Metric &rarr; <strong>Unique users</strong> from that segment, charted daily.","Add a second metric <strong>Session count</strong> on the same card to show sessions per user."],
 cut:"Device type, market, brand, traffic source",
 note:"Reconcile against the client's own server-side counts in week four. A gap over 10–15% is consent suppression or ad-blocking, not a Fullstory fault — but you must be the one to raise it."},

"Landing page conversion rate":{p:"funnel",pre:"<code>Registration Started</code>; landing pages grouped by a page rule.",
 steps:["Create a <strong>page group</strong> for landing pages (URL pattern or <code>pageName</code>).","Funnel (session scope): Step 1 = Page view where page group = Landing; Step 2 = <code>Registration Started</code>.","Metric &rarr; funnel step-1-to-2 conversion, charted daily.","Duplicate the card per landing variant using <code>offerShown</code>."],
 cut:"affiliateId, campaignId, deviceType, market",
 note:"Use a page group, not a URL list. Gambling landing URLs carry tracking parameters and a literal match will silently miss most traffic."},

"Registration start rate":{p:"funnel",pre:"<code>Registration Started</code> with <code>entryPoint</code>.",
 steps:["Funnel (session): Step 1 = any page view; Step 2 = <code>Registration Started</code>.","Metric &rarr; conversion, daily.","Break out by <code>entryPoint</code> to see which CTA actually drives sign-ups."],
 cut:"entryPoint, deviceType, source",
 note:"If several CTAs open the same form, <code>entryPoint</code> is the only way to tell them apart — autocapture will merge them."},

"Cost per acquisition (CPA)":{p:"ext",pre:"Marketing spend from the client's finance or acquisition team.",
 steps:["Build the FTD count in Fullstory: user segment with <code>Deposit Outcome</code> outcome = success AND <code>isFirstDeposit</code> = true.","Export or read that count per source per period.","Divide the client's spend by it outside Fullstory — a spreadsheet or the warehouse."],
 cut:"Channel, affiliateId, campaignId",
 note:"Never compute CPA yourself from a spend figure you were told verbally. Get it from finance in writing; it is the number every business case you write will rest on."},

"Reg-to-FTD conversion":{p:"funnel",pre:"<code>Registration Completed</code>, <code>Deposit Outcome</code>, identity set.",
 steps:["Funnel (<strong>user scope</strong>): Step 1 = <code>Registration Completed</code>; Step 2 = <code>Deposit Outcome</code> where outcome = success.","Set the conversion window to 7 days, then build a second card at 30 days — the gap is your verification-delay story.","Metric &rarr; conversion, charted weekly (daily is too noisy at this population size)."],
 cut:"affiliateId, market, deviceType, registration cohort week",
 note:"Must be user scope. Session scope will undercount badly because most players do not register and deposit in the same visit — verification usually interrupts them."},

"Click-to-registration rate":{p:"funnel",pre:"<code>affiliateId</code> captured as a session property on landing.",
 steps:["Session segment: <code>affiliateId</code> is set.","Funnel within that segment: page view &rarr; <code>Registration Started</code>.","Metric per affiliate; build one dashboard card with a breakdown by <code>affiliateId</code>."],
 cut:"affiliateId, campaignId, device",
 note:"Fullstory only sees clicks that reached the site. The affiliate's own click count will always be higher; agree whose denominator you are using before presenting anything."},

"Traffic quality index by source":{p:"dist",pre:"<code>affiliateId</code> / <code>campaignId</code> as session properties.",
 steps:["Build four metrics per source: median page views, median session duration, <code>Registration Started</code> rate, FTD rate.","Use <strong>segment comparison</strong> between a suspect source and a known-good source to see which events differ most.","Assemble as one dashboard row so the sources sit side by side."],
 cut:"affiliateId, device, geo",
 note:"Engagement depth exposes low-quality traffic faster than conversion does, because bot and incentivised traffic converts at zero but also behaves visibly wrong in replay."},

"Bounce / single-page-session rate":{p:"seg",pre:"None — autocaptured.",
 steps:["Session segment: page-view count = 1.","Metric &rarr; that segment as a percentage of all sessions, daily.","Add a second segment: page-view count = 1 AND session duration &lt; 10s to isolate genuine bounces from slow readers."],
 cut:"Landing page group, source, device",
 note:"On a single-page app this is meaningless unless virtual page views are correctly signalled. Check that first or you will report a 96% bounce rate."},

"Offer match rate":{p:"rate",pre:"<code>offerShown</code> on landing; <code>campaignId</code> from the referring link.",
 steps:["Session segment A: <code>campaignId</code> is set.","Session segment B: A AND <code>offerShown</code> equals the offer the campaign promised (one segment per campaign).","Metric &rarr; B as a share of A."],
 cut:"campaignId, affiliateId, market",
 note:"This is an audit, not a trend. Run it once a quarter and after every campaign launch; a mismatch is usually a stale landing page nobody owns."},

"Share of mobile traffic":{p:"dist",pre:"None — autocaptured.",
 steps:["Metric &rarr; session count, broken down by <code>deviceType</code>.","Chart as a stacked area over 90 days to show the trend, not just today's split."],
 cut:"Market, brand, source",
 note:"Split mobile web from native app explicitly. Clients routinely say 'mobile' meaning both, and they behave nothing alike."},

"App install-to-registration":{p:"funnel",pre:"Mobile SDK installed; first-open event; <code>Registration Completed</code>.",
 steps:["Funnel (user scope) within the app platform segment: first session &rarr; <code>Registration Completed</code>.","Conversion window 7 days.","Compare against the same funnel on mobile web."],
 cut:"OS, app version, acquisition source",
 note:"Installs themselves come from the app stores, not Fullstory. Use first-open as your denominator and say so explicitly when you present it."},

"Return-visitor share":{p:"rate",pre:"<code>setIdentity</code> firing reliably on login and session restore.",
 steps:["Session segment A: all sessions.","Session segment B: sessions with an identity attached.","Metric &rarr; B ÷ A, daily."],
 cut:"Device, market",
 note:"This doubles as your identity-health check. A sudden fall means <code>setIdentity</code> broke in a release, which silently destroys every user-scope analysis you have."},

/* ---------- REGISTRATION & KYC ---------- */
"Registration completion rate":{p:"funnel",pre:"<code>Registration Started</code> and <code>Registration Completed</code>.",
 steps:["Funnel (session): <code>Registration Started</code> &rarr; <code>Registration Completed</code>.","Metric &rarr; conversion, daily.","Pin a second card segmented to mobile web only — it is almost always the worst and the biggest."],
 cut:"deviceType, market, affiliateId, brand",
 note:"Set the conversion window to the session, not 30 days. A player who returns days later to finish is a different story and should be measured separately."},

"Step-level drop-off":{p:"funnel",pre:"<code>Registration Step Completed</code> with <code>stepNumber</code> and <code>stepName</code>.",
 steps:["Funnel with one step per <code>stepNumber</code> — five steps means five funnel steps, not one event.","Read step-to-step conversion directly off the funnel.","Click into the drop at the worst step and open the failing sessions.","Save a segment for that step's abandoners so you can trend it after a fix."],
 cut:"deviceType, market",
 note:"Any single step losing more than 25% deserves a replay session that afternoon. Build the funnel on <code>stepNumber</code> rather than page URL — multi-step forms on an SPA often share one URL."},

"Time to complete registration":{p:"time",pre:"<code>totalSeconds</code> on <code>Registration Completed</code>.",
 steps:["Metric &rarr; median of the <code>totalSeconds</code> property on <code>Registration Completed</code>.","Chart median and 90th percentile together — the tail is where the pain is.","Add <code>secondsOnStep</code> medians per step as a secondary card."],
 cut:"deviceType, market",
 note:"Report the 90th percentile alongside the median. A median of 110 seconds with a P90 of 9 minutes means a large minority are struggling badly, and the median hides them completely."},

"Field-level abandonment":{p:"dist",pre:"Autocaptured form interaction; <code>Registration Failed</code> with <code>fieldName</code> ideally.",
 steps:["Open the registration page's form analysis and read the last-engaged field for abandoning sessions.","Cross-check with a segment on <code>Registration Failed</code> broken down by <code>fieldName</code>.","Build a segment per problem field and watch five sessions each."],
 cut:"deviceType, market, locale",
 note:"Values are private by default, and should stay that way. You are reading <em>which</em> field and <em>how long</em> was spent in it, never what was typed."},

"Validation error rate per field":{p:"rate",pre:"<code>validationErrors</code> property on <code>Registration Step Completed</code> / <code>Registration Failed</code>.",
 steps:["Session segment: registration events where <code>validationErrors</code> is set.","Metric &rarr; that segment as a share of sessions reaching the step.","Break down by the error string itself — the exact message text is the deliverable."],
 cut:"fieldName, locale, deviceType",
 note:"Send the error <em>text</em> as the property value, not an error code. The wording is the finding; a code means another round trip to a developer to decode it."},

"KYC auto-pass rate":{p:"rate",pre:"<code>KYC Outcome</code> with <code>outcome</code> and <code>vendor</code>.",
 steps:["Funnel (user): <code>KYC Started</code> &rarr; <code>KYC Outcome</code> where outcome = passed AND attemptNumber = 1.","Metric &rarr; conversion, weekly.","Second card broken down by <code>vendor</code> if more than one verification provider is in use."],
 cut:"market, vendor, deviceType, age band if available",
 note:"Separate first-attempt auto-pass from eventual pass. Clients quote the eventual figure because it looks better; the first-attempt figure is the one that predicts drop-off."},

"KYC manual-review rate":{p:"rate",pre:"<code>KYC Outcome</code> with outcome = referred.",
 steps:["User segment: <code>KYC Outcome</code> outcome = referred.","Metric &rarr; share of all <code>KYC Started</code>.","Build the follow-on funnel: referred &rarr; document uploaded &rarr; eventually passed, to size the true loss."],
 cut:"vendor, market, deviceType",
 note:"The referral itself is not the loss. The loss is what happens next — and the conversion from 'referred' to 'verified' is usually far worse than anyone at the client realises."},

"Document upload success rate":{p:"funnel",pre:"<code>KYC Document Uploaded</code> with <code>fileRejected</code>, <code>attemptNumber</code>, <code>uploadMethod</code>.",
 steps:["Funnel: <code>KYC Started</code> &rarr; <code>KYC Document Uploaded</code> &rarr; uploaded with <code>fileRejected</code> = false.","Metric &rarr; conversion at the final step.","Break down by <code>uploadMethod</code> (camera vs file picker) and by device — camera capture on older Android is the classic failure."],
 cut:"uploadMethod, deviceType, OS version, documentType",
 note:"Never capture the document itself or its number. <code>fs-exclude</code> the entire upload component and prove it in a replay before this goes live."},

"Time to verification":{p:"time",pre:"<code>secondsToOutcome</code> on <code>KYC Outcome</code>.",
 steps:["Metric &rarr; median <code>secondsToOutcome</code>, split by outcome.","Chart automatic and manual paths as separate series — averaging them together is meaningless.","Add a P90 series for the manual path."],
 cut:"vendor, outcome, market",
 note:"The automatic path is seconds; the manual path can be days. If the client only has one number, they are hiding the manual tail from themselves."},

"KYC abandonment rate":{p:"seg",pre:"<code>KYC Started</code>, <code>KYC Outcome</code>.",
 steps:["User segment: <code>KYC Started</code> AND <strong>did not</strong> <code>KYC Outcome</code> with outcome = passed, within 7 days.","Metric &rarr; that segment as a share of all users who started KYC.","Save the segment — it is also a CRM re-engagement audience."],
 cut:"market, deviceType, whether manual review was triggered",
 note:"This is usually the single largest loss in a GB gambling funnel and it is frequently nobody's KPI. Bringing it to the table with a number attached is a strong first-week move."},

"Verified-to-deposit rate":{p:"funnel",pre:"<code>KYC Outcome</code> passed; <code>Deposit Outcome</code> success.",
 steps:["Funnel (user): <code>KYC Outcome</code> passed &rarr; <code>Deposit Outcome</code> success, 7-day window.","Metric &rarr; conversion, weekly.","Build the inverse segment (verified, never deposited) as a CRM audience."],
 cut:"market, deviceType, affiliateId",
 note:"Verified-but-never-deposited is money already spent with nothing to show. Size it in players and in CPA terms and it becomes a board-level number."},

"Affordability prompt completion":{p:"funnel",pre:"Custom events for prompt shown and prompt outcome.",
 steps:["Funnel: Affordability Prompt Shown &rarr; Affordability Prompt Completed.","Metric &rarr; conversion, weekly.","Separate card: abandonment within the prompt, with replays."],
 cut:"market, prompt trigger, player tenure",
 note:"Report this as a clarity metric, never as a conversion target. Your recommendation is always about comprehension and explanation — say so on the slide itself, in writing."},

"Geolocation success rate (US)":{p:"funnel",pre:"Custom Geolocation Attempt / Outcome events with reason code and retry count.",
 steps:["Funnel: Geolocation Attempt &rarr; Outcome = passed.","Metric &rarr; conversion, daily, broken down by state.","Second segment: failed AND no successful retry in session — the true loss.","Third card: breakdown of failure reason codes."],
 cut:"state, deviceType, browser, connection type",
 note:"Almost nobody instruments this, and it is usually a large silent loss. On any US account, put it in the first two weeks of work."},

/* ---------- PAYMENTS ---------- */
"Deposit success rate":{p:"funnel",pre:"<code>Deposit Attempted</code>, <code>Deposit Outcome</code> with <code>outcome</code>, <code>paymentMethod</code>, <code>provider</code>.",
 steps:["Funnel (session): <code>Deposit Attempted</code> &rarr; <code>Deposit Outcome</code> where outcome = success.","Metric &rarr; conversion, daily. This is your single most important dashboard tile.","Duplicate the card broken down by <code>paymentMethod</code>, then by <code>provider</code>.","Set an alert: any method falling 5 points below its trailing 7-day average.","Prefer the server-side <code>Deposit Outcome</code> via the Events API as the authoritative source."],
 cut:"paymentMethod, provider, market, deviceType, isFirstDeposit",
 note:"An aggregate number is nearly useless — the method mix moves and masks real failures. Always publish it split by method, and never let a client put the blended figure on a board slide alone."},

"First deposit success rate":{p:"funnel",pre:"<code>isFirstDeposit</code> on the deposit events.",
 steps:["Duplicate the deposit funnel with a filter <code>isFirstDeposit</code> = true.","Metric &rarr; conversion, weekly.","Place it next to the returning-player card so the gap is visible."],
 cut:"paymentMethod, market, affiliateId, deviceType",
 note:"The gap between first and returning is the cost of unfamiliarity plus issuer scrutiny. Quantify it in lost FTDs multiplied by their CPA and it stops being a UX conversation."},

"Attempts per successful deposit":{p:"rate",pre:"<code>Deposit Attempted</code>, <code>Deposit Outcome</code>.",
 steps:["Metric A &rarr; count of <code>Deposit Attempted</code> events.","Metric B &rarr; count of <code>Deposit Outcome</code> success events.","Chart A ÷ B as a ratio card, daily.","Also build a session segment: <code>Deposit Attempted</code> count &ge; 3 — the friction population to watch."],
 cut:"paymentMethod, deviceType, isFirstDeposit",
 note:"Above 1.5 is a genuine problem. This metric catches cashiers that eventually succeed but exhaust the player on the way, which a pure success rate hides entirely."},

"Decline rate by reason":{p:"dist",pre:"<code>declineReason</code> and <code>providerCode</code> on <code>Deposit Outcome</code>.",
 steps:["Metric &rarr; count of <code>Deposit Outcome</code> where outcome = failed, broken down by <code>declineReason</code>.","Sort descending; take the top eight.","For each, build a segment and watch three sessions to audit the message the player actually sees.","Table the result: reason, volume, message shown, recommended message."],
 cut:"paymentMethod, provider, market",
 note:"The deliverable is the message audit, not the league table. You usually cannot change the decline; you can always change what happens next."},

"Issuer decline rate":{p:"dist",pre:"Provider codes mapped to issuer-decline categories.",
 steps:["Agree the code-to-category mapping with the payments team — do not guess it.","Segment: <code>Deposit Outcome</code> failed AND <code>providerCode</code> in the issuer-decline set.","Metric &rarr; share of card attempts, daily."],
 cut:"Card scheme, market, BIN range if supplied",
 note:"Gambling MCC codes are declined structurally by some issuers. Framing this correctly protects you from being blamed for a number you cannot move."},

"3DS challenge rate":{p:"rate",pre:"<code>threeDsUsed</code> on <code>Deposit Attempted</code> or <code>Deposit Outcome</code>.",
 steps:["Session segment: card deposits where <code>threeDsUsed</code> = true.","Metric &rarr; share of all card deposit attempts, daily.","Trend it — issuers change their risk rules without warning."],
 cut:"provider, market, amount bucket",
 note:"A rising challenge rate with a flat success rate is fine. A rising challenge rate with a falling success rate means the challenge experience is broken, and that is yours to fix."},

"3DS completion rate":{p:"funnel",pre:"<code>threeDsOutcome</code> on <code>Deposit Outcome</code>.",
 steps:["Funnel: deposit attempt with <code>threeDsUsed</code> = true &rarr; <code>threeDsOutcome</code> = completed.","Metric &rarr; conversion, daily.","Add a timing card: median seconds inside the challenge.","Watch abandoning sessions — the challenge often opens in a way mobile browsers handle badly."],
 cut:"provider, deviceType, market",
 note:"The challenge itself is often a third-party page you cannot capture. Instrument the hand-off and the return, and treat the middle as a timed black box."},

"Retry rate after decline":{p:"seg",pre:"<code>Deposit Outcome</code> with attempt ordering.",
 steps:["Session segment using <strong>sequence</strong>: <code>Deposit Outcome</code> failed <em>then</em> <code>Deposit Attempted</code> again, same session.","Metric &rarr; share of all failed deposits, daily."],
 cut:"declineReason, paymentMethod, deviceType",
 note:"Sequence, not co-occurrence. Without ordering you will count players who succeeded and then made a second unrelated deposit."},

"Retry success rate":{p:"seg",pre:"As above, plus the retry outcome.",
 steps:["Extend the sequence segment: failed &rarr; retried &rarr; <code>Deposit Outcome</code> success.","Metric &rarr; share of retries that succeeded.","Break down by whether the player switched <code>paymentMethod</code> between attempts."],
 cut:"declineReason, method switched or not",
 note:"This is the cleanest available measure of whether an error message works. A low retry-success rate on a recoverable decline means your message is sending players down a dead end."},

"Time to deposit":{p:"time",pre:"<code>secondsElapsed</code> on <code>Deposit Outcome</code>, or timing between Cashier Opened and the outcome.",
 steps:["Metric &rarr; median <code>secondsElapsed</code> on successful deposits.","Split by <code>isSavedMethod</code> — the gap is the business case for saved methods.","Add a P90 series."],
 cut:"paymentMethod, isSavedMethod, deviceType",
 note:"Measure only successful deposits here. Including failures mixes in abandonment time and makes the number uninterpretable."},

"Saved-method adoption":{p:"rate",pre:"<code>isSavedMethod</code> on <code>Payment Method Selected</code>.",
 steps:["Session segment: deposits where <code>isSavedMethod</code> = true.","Metric &rarr; share of returning-player deposits, weekly.","Build a second funnel: first deposit &rarr; method saved, to measure the save prompt itself."],
 cut:"paymentMethod, deviceType, player tenure",
 note:"Restrict the denominator to returning players. Including first deposits, where nothing can be saved yet, drags the number down and hides the real trend."},

"Payment method mix":{p:"dist",pre:"<code>paymentMethod</code> on <code>Deposit Outcome</code>.",
 steps:["Metric &rarr; successful deposits broken down by <code>paymentMethod</code>, as a stacked area over 90 days.","Overlay the success rate per method on a second card.","Add <code>position</code> from <code>Payment Method Selected</code> to test whether mix is driven by preference or by ordering."],
 cut:"market, deviceType, isFirstDeposit",
 note:"Method order in the UI drives mix far more than clients expect. If the top-listed method also has the worst success rate, you have found real money in an afternoon."},

"Average deposit value":{p:"dist",pre:"<code>depositAmountBucket</code> on deposit events.",
 steps:["Metric &rarr; successful deposits broken down by <code>depositAmountBucket</code>.","Read the distribution shape, not a mean — buckets cannot produce a true average.","For the exact figure, join <code>depositId</code> to the warehouse via Data Direct."],
 cut:"paymentMethod, isFirstDeposit, market",
 note:"Deliberately bucketed. If a client insists on the exact mean, that is a warehouse question — do not be talked into sending raw amounts into a third-party tool."},

"Cashier abandonment rate":{p:"seg",pre:"<code>Cashier Opened</code>, <code>Deposit Attempted</code>.",
 steps:["Session segment: <code>Cashier Opened</code> AND <strong>did not</strong> <code>Deposit Attempted</code>.","Metric &rarr; share of all <code>Cashier Opened</code> sessions, daily.","Break down by <code>entryPoint</code> — cashier opens triggered by an insufficient-balance prompt behave differently from deliberate ones."],
 cut:"entryPoint, isFirstDeposit, deviceType",
 note:"Some cashier opens are just balance checks. Use <code>entryPoint</code> and <code>promptedBy</code> to separate intent, or you will over-report abandonment substantially."},

"Withdrawal completion rate":{p:"funnel",pre:"<code>Withdrawal Started</code>, <code>Withdrawal Requested</code>, <code>Withdrawal Blocked</code>.",
 steps:["Funnel: <code>Withdrawal Started</code> &rarr; <code>Withdrawal Requested</code>.","Metric &rarr; conversion, daily.","Second card: <code>Withdrawal Blocked</code> broken down by <code>blockReason</code>.","Third: sequence segment, withdrawal started <em>then</em> support contact within 10 minutes."],
 cut:"method, amount bucket, verificationRequired",
 note:"A block at withdrawal is legitimate when verification is outstanding — but being told so for the first time at that moment is a design failure, and the replay will show you exactly how it lands."},

"Withdrawal processing time":{p:"wh",pre:"Server-side event via the Events API when funds are actually sent.",
 steps:["Push a Withdrawal Settled event server-side with the elapsed time as a property.","Metric &rarr; median elapsed, split by method.","Correlate with support contacts about withdrawals on the same dashboard."],
 cut:"method, amount bucket, market",
 note:"The browser cannot know this — it only knows what the page displayed. This is the clearest example of why server-side events matter on a gambling account."},

"Reverse-withdrawal rate":{p:"rate",pre:"Custom event when a pending withdrawal is cancelled.",
 steps:["Session segment: Withdrawal Cancelled event present.","Metric &rarr; share of all withdrawal requests, weekly.","Add a card measuring how prominently the cancel control is placed (interaction rate on that element)."],
 cut:"Time since request, amount bucket, player tenure",
 note:"Treat a high rate as a design and RG question, not a retention win. Regulators take an interest in how easy operators make it to reverse a withdrawal, and you do not want your recommendation in that file."},

"Chargeback rate":{p:"ext",pre:"Chargeback data from the payments team; <code>depositId</code> as the join key.",
 steps:["Obtain chargeback records with the deposit identifier.","Join to Fullstory sessions by <code>depositId</code> via Data Direct.","Review the sessions behind disputed deposits for a common confusion pattern."],
 cut:"paymentMethod, market, isFirstDeposit",
 note:"Chargebacks often follow a misunderstanding — an accidental deposit, an unclear bonus term, a confusing amount field. The replays are the value here, not the rate."},

"Payment error rate":{p:"signal",pre:"None beyond page grouping — JS and network errors are autocaptured.",
 steps:["Session segment: JS error OR failed network request on the cashier page group.","Metric &rarr; share of cashier sessions, daily.","Group by error signature and rank by sessions affected.","Alert on any new signature crossing a volume threshold."],
 cut:"deviceType, browser, provider",
 note:"Cashier errors are the highest-value errors on the entire site. Give them their own alert route separate from the general error backlog."},

/* ---------- CASINO ---------- */
"Games per session":{p:"dist",pre:"<code>Game Launched</code> with <code>gameId</code>.",
 steps:["Metric &rarr; median distinct <code>gameId</code> per session.","Chart the distribution as well as the median — the shape tells you whether players browse or settle.","Segment new versus established players and compare."],
 cut:"Player tenure, deviceType, lobbyCategory",
 note:"A high number is not automatically good. New players launching six games in a session are often searching for something they cannot find, not enjoying variety — check against session outcome."},

"Game launch success rate":{p:"funnel",pre:"<code>Game Launched</code> and <code>Game Load Outcome</code> with <code>provider</code>, <code>errorCode</code>.",
 steps:["Funnel: <code>Game Launched</code> &rarr; <code>Game Load Outcome</code> outcome = success.","Metric &rarr; conversion, daily.","Break down by <code>provider</code>, then by <code>gameId</code> within the worst provider.","Alert when any provider crosses a failure threshold for 15 minutes.","Export monthly as the provider SLA report."],
 cut:"provider, gameId, deviceType, market",
 note:"This is commercial leverage as much as a technical metric. Operators pay revenue share to providers with almost no objective quality data — you are supplying it."},

"Time to playable":{p:"time",pre:"<code>secondsToLoad</code> on <code>Game Load Outcome</code>.",
 steps:["Metric &rarr; median <code>secondsToLoad</code> on successful loads.","Split by <code>provider</code> and by device class.","Add a P90 series; the tail is where abandonment happens.","Pair with the 60-second abandonment metric to show the consequence."],
 cut:"provider, deviceType, connection, market",
 note:"Ask the provider to fire a 'ready' callback if one exists. Without it you are timing to iframe load, which is earlier than playable and flatters the number."},

"Lobby-to-launch conversion":{p:"funnel",pre:"<code>Lobby Viewed</code>, <code>Game Launched</code>.",
 steps:["Funnel (session): <code>Lobby Viewed</code> &rarr; <code>Game Launched</code>.","Metric &rarr; conversion, daily.","Break down by <code>lobbyCategory</code> and by <code>isPersonalised</code>.","Segment the non-converters and run journey analysis on what they did instead."],
 cut:"lobbyCategory, deviceType, player tenure, isPersonalised",
 note:"Compare personalised against default lobbies directly. Most operators have invested in personalisation and have never measured whether it beats the default ordering."},

"Tile click-through by position":{p:"dist",pre:"<code>Game Tile Clicked</code> with <code>lobbyPosition</code> and <code>rowName</code>.",
 steps:["Metric &rarr; clicks broken down by <code>lobbyPosition</code>, to establish the positional decay curve.","Compute each game's clicks relative to the curve's expected value for its position.","Rank games by that position-adjusted figure.","Cross-reference with scroll depth to find positions almost nobody reaches."],
 cut:"lobbyCategory, deviceType, rowName",
 note:"Never rank games by raw clicks — you will simply re-measure position and recommend keeping whatever is already at the top. The normalisation is the entire analysis."},

"Lobby scroll depth":{p:"perf",pre:"None — autocaptured; lobby pages grouped.",
 steps:["Open the lobby page group's scroll analysis.","Read median and 75th-percentile depth.","Convert depth into rows and games so the finding is concrete: 'the median player never sees row four'.","Segment by device — mobile depth is far shallower."],
 cut:"deviceType, lobbyCategory, player tenure",
 note:"Express it in rows, not percentages. 'Median scroll 28%' means nothing to a merchandising manager; 'half your catalogue is below the median player's last row' books a meeting."},

"Search usage rate":{p:"rate",pre:"<code>Lobby Search</code>.",
 steps:["Session segment: <code>Lobby Search</code> present.","Metric &rarr; share of lobby sessions, daily.","Compare converted versus non-converted sessions on search usage."],
 cut:"deviceType, player tenure",
 note:"Rising search usage usually means browsing is failing, not that search is succeeding. Read it alongside scroll depth and lobby-to-launch."},

"Zero-result search rate":{p:"rate",pre:"<code>hadZeroResults</code> and the query string on <code>Lobby Search</code>.",
 steps:["Session segment: <code>Lobby Search</code> with <code>hadZeroResults</code> = true.","Metric &rarr; share of all searches, daily.","Break down by the query value and export the top fifty — that list is the deliverable.","Split the list into games not carried and games misindexed."],
 cut:"market, deviceType",
 note:"Capture the query text, not just the length — but check with the DPO first, since free-text search is player input. Game names are low risk; get it agreed rather than assumed."},

"Search-to-launch rate":{p:"seg",pre:"<code>Lobby Search</code>, <code>Game Launched</code>.",
 steps:["Session segment using <strong>sequence</strong>: <code>Lobby Search</code> <em>then</em> <code>Game Launched</code> within the session.","Metric &rarr; share of searching sessions.","Add <code>refinementNumber</code> to see how many attempts it took."],
 cut:"hadZeroResults, deviceType",
 note:"Multiple refinements before a launch is a success with a bad taste. Report refinement count alongside the headline rate."},

"Demo-to-real conversion":{p:"funnel",pre:"<code>isDemo</code> on <code>Game Launched</code>.",
 steps:["Funnel (user): <code>Game Launched</code> with isDemo = true &rarr; <code>Game Launched</code> with isDemo = false, 7-day window.","Metric &rarr; conversion, weekly.","Compare demo-first players against those who went straight to real money on deposit rate and retention."],
 cut:"gameId, provider, player tenure",
 note:"Some markets restrict demo play or require verification before it. Confirm the rules per market before recommending anything about demo placement."},

"Spins per session":{p:"wh",pre:"Platform wager data; session or player join key.",
 steps:["Not capturable inside the game canvas — obtain spin counts from the platform.","Join to Fullstory sessions via Data Direct on the player hash and time window.","Correlate with Fullstory-side behaviour: load time, lobby path, prior errors."],
 cut:"provider, gameId, deviceType",
 note:"Say plainly that this comes from their platform, not from Fullstory. Overclaiming what the tool captures is the fastest way to lose a technical stakeholder."},

"Session length (casino)":{p:"time",pre:"None — autocaptured.",
 steps:["Metric &rarr; median session duration for sessions containing a <code>Game Launched</code> event.","Chart median and P90.","Segment by player tenure and by whether a deposit occurred."],
 cut:"deviceType, player tenure, deposit in session",
 note:"Filter to sessions with actual game activity. Idle tabs and background sessions inflate this badly on casino sites, where players commonly leave a tab open."},

"Game abandonment within 60s":{p:"rate",pre:"<code>secondsInGame</code> on <code>Game Exited</code>.",
 steps:["Session segment: <code>Game Exited</code> where <code>secondsInGame</code> &lt; 60.","Metric &rarr; share of all game launches, daily.","Break down by <code>gameId</code> and <code>provider</code>.","Cross-reference with <code>secondsToLoad</code> — slow loads and fast exits correlate strongly."],
 cut:"gameId, provider, secondsToLoad band, deviceType",
 note:"This is your best available proxy for in-game experience, given you cannot see inside the canvas. Pair it with load time and you can distinguish 'broken' from 'not what they expected'."},

"Live dealer join rate":{p:"funnel",pre:"<code>Live Dealer Table Joined</code> with <code>secondsWaiting</code>, <code>seatsAvailable</code>.",
 steps:["Funnel: live lobby viewed &rarr; <code>Live Dealer Table Joined</code>.","Metric &rarr; conversion, daily.","Second card: median <code>secondsWaiting</code>, and abandonment rate by waiting-time band."],
 cut:"gameType, time of day, deviceType",
 note:"Live capacity is the hidden variable. Plot join rate against <code>seatsAvailable</code> and you will usually find a clear threshold where players give up."},

"Jackpot banner engagement":{p:"rate",pre:"<code>Jackpot Banner Interaction</code>; banner impressions.",
 steps:["Metric &rarr; banner clicks ÷ banner impressions, by <code>placement</code>.","Cross-check dead clicks on the banner element — decorative banners that look clickable are extremely common.","Follow through to <code>Game Launched</code> to measure whether the click produced play."],
 cut:"placement, jackpot value bucket, deviceType",
 note:"Measure the launch, not the click. A banner with a high click-through and no subsequent play is a navigation trap, not a success."},

"RTP display compliance":{p:"seg",pre:"A custom event fired when the RTP element becomes <strong>visible in the viewport</strong>.",
 steps:["Instrument viewport visibility, not DOM presence — use an intersection observer to fire the event.","Session segment: RTP Displayed event present.","Metric &rarr; share of eligible game sessions, weekly.","Retain sample replays within the retention window as dated evidence."],
 cut:"market, gameId, deviceType",
 note:"'It is in the DOM' is not evidence of display and an auditor will say so. The viewport distinction is what makes this credible, and it belongs in your methodology note."},

"Provider mix by revenue":{p:"wh",pre:"<code>provider</code> on launch events; revenue from the warehouse.",
 steps:["Metric &rarr; game launches broken down by <code>provider</code> (the Fullstory half).","Join to revenue by provider via Data Direct.","Place launch share, failure rate and revenue share on one card so the commercial trade-off is visible."],
 cut:"provider, deviceType, market",
 note:"The combination is the story: a provider with high revenue share and a high failure rate is costing more than their contract suggests, and nobody has put those two numbers together before."}

});
/* KPI build recipes — part 2: Sportsbook, Poker & Bingo, Social, Retention, RG, Technical, Support, Experience */
window.KPI_BUILD = window.KPI_BUILD || {};
Object.assign(window.KPI_BUILD, {

/* ---------- SPORTSBOOK ---------- */
"Betslip conversion rate":{p:"funnel",pre:"<code>Selection Added</code>, <code>Stake Entered</code>, <code>Bet Placed</code>.",
 steps:["Funnel (session): <code>Selection Added</code> &rarr; <code>Stake Entered</code> &rarr; <code>Bet Placed</code>.","Metric &rarr; end-to-end conversion, daily.","Build <strong>two separate cards</strong>, filtered <code>isInPlay</code> true and false — never one blended number.","Segment the abandoners at each step and watch five sessions per step."],
 cut:"isInPlay, betType, deviceType, legCount, market",
 note:"In-play and pre-match are different products with different time pressure. Blending them produces a number that is wrong for both and actionable for neither."},

"Bet acceptance rate":{p:"funnel",pre:"<code>Bet Placed</code> and <code>Bet Outcome</code> with <code>rejectionReason</code>.",
 steps:["Funnel: <code>Bet Placed</code> &rarr; <code>Bet Outcome</code> outcome = accepted.","Metric &rarr; conversion, daily.","Break down rejections by <code>rejectionReason</code>.","Alert on any fall — acceptance failures feel like cheating to players."],
 cut:"isInPlay, marketType, rejectionReason, deviceType",
 note:"Use the server-confirmed outcome where you can. The browser knows what the page said; only the server knows what the book actually did."},

"Price-change rejection rate":{p:"rate",pre:"<code>Odds Changed In Betslip</code> with <code>direction</code>, <code>magnitudeBucket</code>, <code>playerAccepted</code>.",
 steps:["Session segment: <code>Bet Outcome</code> rejected where <code>rejectionReason</code> = odds change.","Metric &rarr; share of all bets placed, daily, split in-play and pre-match.","Second card: acceptance rate by <code>magnitudeBucket</code> and <code>direction</code>.","Sequence segment: rejected <em>then</em> session ended — the churn signal.","Compare sessions with 'accept any change' enabled against those without."],
 cut:"isInPlay, marketType, magnitudeBucket, secondsInBetslip",
 note:"Almost no sportsbook measures this from the player's side. Plotting rejection against time-in-betslip usually shows a clear dwell threshold, which is a UX fix rather than a trading one — and that keeps the trading team on your side."},

"Time in betslip":{p:"time",pre:"<code>secondsInBetslip</code> on <code>Bet Placed</code>.",
 steps:["Metric &rarr; median <code>secondsInBetslip</code>, split in-play and pre-match.","Add a P90 series.","Cross-plot against rejection rate to find the dwell threshold where bets start failing."],
 cut:"isInPlay, legCount, deviceType, usedQuickStake",
 note:"Longer dwell directly raises rejection risk in-play. This metric is the bridge between a UX friction and a commercial loss — use it that way."},

"In-play share of turnover":{p:"dist",pre:"<code>isInPlay</code> on <code>Bet Placed</code>.",
 steps:["Metric &rarr; <code>Bet Placed</code> count broken down by <code>isInPlay</code>, as a stacked area.","For turnover rather than bet count, join <code>betId</code> to the warehouse.","Overlay betslip conversion for each to show where the friction is concentrated."],
 cut:"sportId, deviceType, time of day",
 note:"Bet count and turnover share differ — in-play stakes are typically smaller and more frequent. State which you are reporting."},

"Multiples attach rate":{p:"rate",pre:"<code>legCount</code> on <code>Bet Placed</code>.",
 steps:["Session segment: <code>Bet Placed</code> where <code>legCount</code> &gt; 1.","Metric &rarr; share of all bets placed, weekly.","Break down by <code>legCount</code> band and by device."],
 cut:"legCount, deviceType, sportId",
 note:"Multiples carry much higher margin, so this is a commercial metric, not just an engagement one. Frame it in those terms and it gets attention."},

"Average legs per multiple":{p:"dist",pre:"<code>legCount</code> on <code>Bet Placed</code>.",
 steps:["Metric &rarr; distribution of <code>legCount</code> for bets where legCount &gt; 1.","Read the modal value and the tail.","Compare betslip abandonment by <code>legCount</code> — long multiples abandon far more."],
 cut:"deviceType, sportId, isInPlay",
 note:"Abandonment rises steeply with leg count. If the client wants more legs, the UX of managing a long betslip on mobile is where the work is."},

"Bet builder adoption":{p:"funnel",pre:"<code>Bet Builder Interaction</code> with <code>action</code> and <code>isValidCombination</code>.",
 steps:["Funnel: <code>Bet Builder Interaction</code> opened &rarr; valid combination reached &rarr; <code>Bet Placed</code>.","Metric &rarr; conversion at each step.","Break down abandonment by <code>isValidCombination</code> = false — invalid combinations are the usual blocker."],
 cut:"sportId, deviceType, legCount",
 note:"Players hitting invalid combinations repeatedly are being told 'no' without being told why. That is a copy fix with a measurable return."},

"Cash-out usage rate":{p:"rate",pre:"<code>Cash Out Viewed</code> and <code>Cash Out Taken</code>.",
 steps:["Session segment: <code>Cash Out Taken</code> present.","Metric &rarr; share of sessions where cash-out was viewed, daily.","Second card: median <code>secondsToDecision</code>."],
 cut:"offerValueBucket, isInPlay, deviceType",
 note:"Denominator matters. Share of <em>eligible open bets</em> is the honest figure; share of all sessions flatters it and will be challenged."},

"Cash-out offer decline rate":{p:"rate",pre:"<code>Cash Out Viewed</code> with <code>valueChanged</code>.",
 steps:["Session segment: <code>Cash Out Viewed</code> AND <strong>did not</strong> <code>Cash Out Taken</code>.","Metric &rarr; share of cash-out views.","Split by <code>valueChanged</code> = true — value moving mid-decision is a serious trust issue.","Watch sessions where the value changed and the player abandoned."],
 cut:"valueChanged, offerValueBucket, secondsToDecision",
 note:"A value that moves while the player is deciding reads as manipulation, whatever the trading justification. Show the client the replay, not the number."},

"Navigation depth to selection":{p:"perf",pre:"<code>Event Viewed</code>, <code>Selection Added</code>.",
 steps:["Journey analysis forward from session start to <code>Selection Added</code>.","Read the median path length and the most common routes.","Compare converting and non-converting paths.","Build a segment for paths longer than the median and watch five."],
 cut:"sportId, isInPlay, deviceType, entry point",
 note:"Deep-link entries from marketing frequently bypass the intended path. Segment by entry type or the median is an average of two quite different journeys."},

"Quick-stake usage":{p:"rate",pre:"<code>usedQuickStake</code> on <code>Stake Entered</code>.",
 steps:["Session segment: <code>Stake Entered</code> where <code>usedQuickStake</code> = true.","Metric &rarr; share of all stake entries, by device.","Compare betslip conversion and time-in-betslip for quick-stake versus keyboard entry."],
 cut:"deviceType, isInPlay, stakeBucket",
 note:"Suppress rage-click detection on the quick-stake chips first, or they will dominate your frustration reporting and discredit it."},

"In-play stream start rate":{p:"funnel",pre:"<code>In-Play Stream Started</code> with <code>secondsToStart</code>, <code>failed</code>.",
 steps:["Funnel: eligible event viewed &rarr; <code>In-Play Stream Started</code> with failed = false.","Metric &rarr; conversion, daily.","Second card: median <code>secondsToStart</code> and failure rate by device.","Correlate stream failure with bet abandonment in the same session."],
 cut:"deviceType, connection, sportId, market",
 note:"Streaming rights are expensive and stream failures are rarely measured against betting outcomes. Connecting the two is a high-value, under-served analysis."},

"Hold percentage":{p:"wh",pre:"Warehouse: GGR and handle by period.",
 steps:["Not a Fullstory metric. Obtain from the client's BI team.","Use it to convert a behavioural finding into a revenue figure.","Where you need it per segment, request it by cohort via the Data Direct join."],
 cut:"sportId, marketType, isInPlay",
 note:"Know it, quote it correctly, never claim to measure it. Analysts who overclaim here lose the trading team permanently."},

"Bets per active":{p:"wh",pre:"Warehouse bet counts; Fullstory behavioural segments.",
 steps:["Define the behavioural cohorts in Fullstory (for example: experienced a rejection, versus did not).","Export the cohort membership via Data Direct.","Have BI compute bets per active for each cohort and compare."],
 cut:"Cohort definition, tenure, device",
 note:"This is the template for every high-value joined analysis: you define the behaviour, BI supplies the money. Never try to do both halves yourself."},

"Suspended-market interaction rate":{p:"signal",pre:"Element naming on selection controls; JS errors autocaptured.",
 steps:["Segment: error clicks or dead clicks on elements named as selections.","Metric &rarr; share of sessions with a selection interaction, daily.","Break down by <code>sportId</code> and by in-play state.","Watch five sessions to confirm the suspended-market pattern."],
 cut:"sportId, isInPlay, deviceType",
 note:"Suspensions are legitimate and frequent in-play. The fix is never fewer suspensions; it is making the suspended state visually obvious before the player taps."},

/* ---------- POKER & BINGO ---------- */
"Client download completion":{p:"funnel",pre:"Custom Download Initiated event on the download control.",
 steps:["Funnel: download page viewed &rarr; Download Initiated.","Metric &rarr; conversion, weekly.","Follow with a user-scope funnel: Download Initiated &rarr; first client session, 7-day window."],
 cut:"OS, deviceType, market",
 note:"Installation happens outside the browser. Be explicit that you measure intent and eventual first use, with a gap in between you cannot see."},

"Seat-fill time":{p:"time",pre:"Custom Table Joined event with a waiting-duration property.",
 steps:["Metric &rarr; median wait seconds on Table Joined.","Chart by hour of day to expose liquidity troughs.","Build an abandonment segment: table search started, no join within 120 seconds."],
 cut:"Game type, stake level, hour of day",
 note:"Plot abandonment against wait time and you will find the threshold where players leave. That threshold is the operating target for the liquidity team."},

"Tournament registration completion":{p:"funnel",pre:"Custom registration events with a buy-in confirmation step.",
 steps:["Funnel: tournament viewed &rarr; registration started &rarr; buy-in confirmed.","Metric &rarr; conversion, weekly.","Segment abandoners at the buy-in step — insufficient balance is the usual cause."],
 cut:"Buy-in band, tournament type, deviceType",
 note:"Where abandonment is balance-driven, the fix is a deposit path inside the registration flow, not a change to the registration flow itself."},

"Hands per hour":{p:"wh",pre:"Platform game data.",
 steps:["Obtain from the poker platform; not visible to a DOM recorder.","Join to Fullstory sessions by player hash for behavioural correlation."],
 cut:"Table type, stake level, client version",
 note:"Say plainly this is platform data. Your contribution is correlating it with the surrounding experience, not producing it."},

"Rake per active":{p:"wh",pre:"Warehouse.",
 steps:["Obtain from BI.","Use as the value figure when pricing poker-side opportunities."],
 cut:"Stake level, player tenure",
 note:"Poker economics differ from casino — the operator takes a cut of a pot, not a house edge. Use rake, not GGR, when you value a poker finding."},

"Table liquidity":{p:"wh",pre:"Platform seat occupancy data.",
 steps:["Obtain occupancy from the platform.","In Fullstory, instrument the lobby experience during low-liquidity periods: how do empty tables appear, and what do players do?","Segment sessions occurring during low-liquidity windows and compare abandonment."],
 cut:"Hour of day, stake level, game type",
 note:"You cannot create liquidity, but you can stop the lobby advertising empty rooms. That is a real and deliverable UX win."},

"Bingo tickets per player":{p:"dist",pre:"Custom ticket purchase events with a quantity bucket.",
 steps:["Metric &rarr; median tickets per purchasing session.","Distribution by quantity bucket.","Funnel: room viewed &rarr; tickets purchased."],
 cut:"Room type, ticket price band, deviceType",
 note:"Bucket the quantity. Exact purchase values belong in the warehouse, not in a third-party analytics tool."},

"Chat engagement rate":{p:"rate",pre:"Chat <em>interaction</em> events only — never message content.",
 steps:["Session segment: chat interaction event present.","Metric &rarr; share of sessions in a room, weekly.","Compare retention between chat users and non-users."],
 cut:"Room type, deviceType, player tenure",
 note:"<code>fs-exclude</code> the chat transcript itself. You are measuring that chat was used, never what was said — this is a firm line and worth stating to the client unprompted."},

/* ---------- SOCIAL GAMING ---------- */
"DAU / MAU stickiness":{p:"seg",pre:"Identity set on every session.",
 steps:["User segment A: active in the last 1 day. User segment B: active in the last 30 days.","Metric &rarr; A ÷ B, charted daily.","Segment by acquisition cohort to see whether stickiness is improving for newer players."],
 cut:"Acquisition source, platform, tenure cohort",
 note:"Define 'active' as a meaningful action, not as a session start. A player who opens the app and closes it is not active in any sense the client cares about."},

"ARPDAU":{p:"wh",pre:"IAP and ad revenue from the platform; DAU from Fullstory or their own telemetry.",
 steps:["Count daily active users in Fullstory.","Take revenue from the store and ad network reports.","Compute outside Fullstory; place the resulting figure on the dashboard as an annotation or an imported number."],
 cut:"Platform, acquisition cohort, geo",
 note:"Fullstory supplies the denominator and the behavioural explanation, not the revenue. Be precise about that division of labour with a data-literate game team."},

"Payer conversion rate":{p:"funnel",pre:"<code>IAP Completed</code> with <code>isFirstPurchase</code>.",
 steps:["Funnel (user): first session &rarr; <code>IAP Completed</code> where isFirstPurchase = true, 30-day window.","Metric &rarr; conversion, by install cohort week.","Segment first-time payers and run journey analysis backwards from the purchase to find the trigger moment."],
 cut:"Install cohort, platform, geo, level reached",
 note:"The backwards journey from first purchase is the most valuable analysis available to a F2P studio, and their aggregate funnel cannot produce it."},

"ARPPU":{p:"dist",pre:"<code>priceTier</code> on <code>IAP Completed</code>.",
 steps:["Metric &rarr; purchases broken down by <code>priceTier</code>.","Count purchases per paying user over the period.","Combine with revenue from the store report outside Fullstory."],
 cut:"Platform, payer tenure, geo",
 note:"Use price tiers, not raw prices — currency and regional pricing make raw values incomparable across markets."},

"D1 retention":{p:"seg",pre:"Identity set; install or first-session date as a user property.",
 steps:["User segment: first session on day X AND any session on day X+1.","Metric &rarr; share of the day-X install cohort, charted by cohort date.","Repeat as a saved segment template for D7 and D30."],
 cut:"Acquisition source, platform, tutorial completion",
 note:"Cohort by install date, not by calendar day of return, or a marketing spike will look like a retention improvement."},

"D7 retention":{p:"seg",pre:"As D1.",
 steps:["User segment: first session on day X AND any session on day X+7.","Metric &rarr; share of the cohort.","Overlay tutorial completion as a segment split — it is usually the strongest single predictor."],
 cut:"Acquisition source, platform, level reached by D1",
 note:"Compare D7 between tutorial completers and skippers. If the gap is large, tutorial work is the highest-return thing on the roadmap."},

"D30 retention":{p:"seg",pre:"As D1.",
 steps:["User segment: first session on day X AND any session on day X+30.","Metric &rarr; share of the cohort, charted weekly.","Split by whether the player made a purchase in the first 7 days."],
 cut:"Acquisition source, payer status, platform",
 note:"At D30 the population is small. Chart weekly cohorts, not daily, or the noise will swamp the signal."},

"Tutorial completion rate":{p:"funnel",pre:"<code>Tutorial Step Completed</code> with <code>stepNumber</code> and <code>skipped</code>.",
 steps:["Funnel with one step per tutorial step.","Metric &rarr; end-to-end conversion and step-to-step drop-off.","Separate card: skip rate per step.","Watch five abandoning sessions at the worst step — this is where replay beats their existing telemetry outright."],
 cut:"Platform, device class, acquisition source",
 note:"Their analytics already shows the drop. What it cannot show is the player hesitating, tapping the wrong thing, and quitting. That is the entire value proposition on a F2P account."},

"Level churn point":{p:"dist",pre:"<code>Level Failed</code> / <code>Level Completed</code> with <code>levelNumber</code>, <code>attemptNumber</code>.",
 steps:["Metric &rarr; last level reached, distributed by <code>levelNumber</code>, for churned users.","Identify the modal churn level.","Segment players who failed that level 3+ times and watch sessions.","Compare <code>boostersUsed</code> between those who passed and those who quit."],
 cut:"Platform, acquisition cohort, payer status",
 note:"A difficulty spike and a comprehension failure look identical in aggregate data and completely different in replay. That distinction is what you are there to supply."},

"Store open rate":{p:"rate",pre:"<code>Store Opened</code> with <code>trigger</code> and <code>entryPoint</code>.",
 steps:["Session segment: <code>Store Opened</code> present.","Metric &rarr; share of sessions, daily.","Break down by <code>trigger</code> — organic browse versus low-currency prompt behave very differently."],
 cut:"trigger, entryPoint, payer status",
 note:"Separate prompted opens from voluntary ones. Blending them makes the store look healthier than it is."},

"IAP funnel conversion":{p:"funnel",pre:"<code>IAP Initiated</code>, <code>IAP Completed</code>, <code>IAP Failed</code> with <code>failureReason</code>.",
 steps:["Funnel: <code>Store Opened</code> &rarr; <code>IAP Initiated</code> &rarr; <code>IAP Completed</code>.","Metric &rarr; conversion at each step, daily.","Break down failures by <code>failureReason</code> and by platform.","Watch sessions that failed at the payment sheet."],
 cut:"Platform, priceTier, isFirstPurchase",
 note:"The store's payment sheet is native and outside your capture. Instrument the hand-off and the return, and treat the sheet as a timed black box."},

"Rewarded ad completion":{p:"funnel",pre:"<code>Rewarded Ad Offered</code> / <code>Watched</code> with <code>adNetwork</code>, <code>placement</code>.",
 steps:["Funnel: offered &rarr; started &rarr; completed.","Metric &rarr; conversion, by <code>adNetwork</code> and <code>placement</code>.","Compare retention between players who take rewarded ads and those who never do."],
 cut:"adNetwork, placement, platform",
 note:"Ad networks vary enormously in load reliability. A per-network completion rate is a commercial lever with the ad partner, not just a UX number."},

"Ad ARPDAU":{p:"wh",pre:"Ad network revenue reports; DAU.",
 steps:["Take revenue from the mediation platform.","Take DAU from Fullstory or their telemetry.","Compute outside Fullstory; correlate placement performance using the Fullstory ad events."],
 cut:"adNetwork, placement, geo",
 note:"Your contribution is placement-level behaviour — where ads are offered and whether players accept — not the revenue figure itself."},

"Session length (social)":{p:"time",pre:"None — autocaptured.",
 steps:["Metric &rarr; median session duration for sessions with gameplay activity.","Chart median and P90.","Split by payer status and by tenure cohort."],
 cut:"Platform, payer status, tenure",
 note:"Filter to sessions with real activity. Background and idle sessions distort this on mobile more than on web."},

"Sessions per day":{p:"dist",pre:"Identity set.",
 steps:["Metric &rarr; sessions ÷ daily active users, charted daily.","Distribution of sessions per user per day to find the heavy tail.","Compare payers and non-payers."],
 cut:"Payer status, platform, tenure",
 note:"Frequency predicts monetisation better than session length does in most F2P titles. Lead with this one."},

"Daily reward streak retention":{p:"dist",pre:"<code>Daily Reward Claimed</code> with <code>streakDay</code>.",
 steps:["Metric &rarr; claim counts distributed by <code>streakDay</code>.","Identify the day where the streak population collapses.","Segment players who broke a long streak and examine the preceding session."],
 cut:"Platform, tenure, payer status",
 note:"A streak break is often a notification failure rather than a disengagement. Check the push opt-in status of the breaking cohort before concluding anything."},

/* ---------- RETENTION & VALUE ---------- */
"D1 / D7 / D30 return rate":{p:"seg",pre:"Identity set; <code>registrationDate</code> as a user property.",
 steps:["User segment per window: registered on day X AND a session on day X+1 / +7 / +30.","Metric &rarr; share of the registration cohort, charted by cohort week.","Overlay first-deposit status as a split — depositors retain far better and the blended figure hides it."],
 cut:"Registration cohort, affiliateId, deviceType, deposited or not",
 note:"Build all three as a saved segment template so the client can reuse them. Cohort by registration date, never by calendar week of return."},

"Second-deposit rate":{p:"funnel",pre:"<code>Deposit Outcome</code> success with ordering.",
 steps:["User segment: successful deposit count &ge; 2 within 30 days of the first.","Metric &rarr; share of first-time depositors, by FTD cohort week.","Segment the non-repeaters and run journey analysis on their first session after depositing."],
 cut:"FTD cohort, first deposit method, bonus claimed or not",
 note:"The second deposit is the strongest early predictor of lifetime value in real-money gambling. If the client tracks only the first, this is a valuable thing to hand them."},

"Time to second deposit":{p:"time",pre:"Deposit events with identity and ordering.",
 steps:["User-scope sequence: first successful deposit <em>then</em> second successful deposit.","Metric &rarr; median days between them.","Chart the distribution — a long tail means a reactivation opportunity, not a lost player."],
 cut:"FTD cohort, deposit method, vertical",
 note:"Pair with the CRM team. If the median is four days, a campaign on day six is arriving after most players have already decided."},

"Monthly active players":{p:"seg",pre:"Identity set; a defined wagering or play event.",
 steps:["User segment: any play event in the last 30 days.","Metric &rarr; unique users, charted daily as a rolling 30-day figure.","Split by vertical for a dual-product operator."],
 cut:"Vertical, brand, market, tier",
 note:"Agree the definition of 'active' in writing with BI. Logged-in-but-did-not-play is not active, and the two definitions will produce different numbers on every slide."},

"Churn rate":{p:"seg",pre:"Identity; play events; a churn window agreed with the client.",
 steps:["User segment: active in the previous period AND <strong>no</strong> activity in the last N days.","Metric &rarr; share of the prior-period active base, monthly.","Save the segment as a CRM reactivation audience.","Run journey analysis on the last session before churn."],
 cut:"Tier, tenure, vertical, last-session outcome",
 note:"The last session before churn is the most under-analysed data on a gambling account. Look for a failed deposit, a game error or a withdrawal problem — it is very often there."},

"Reactivation rate":{p:"funnel",pre:"Lapsed-user segment; campaign landing instrumented with <code>campaignId</code>.",
 steps:["User segment: lapsed (no activity 60+ days).","Funnel: campaign landing page view &rarr; session with a play event, 7-day window.","Metric &rarr; conversion, per campaign.","Separate card: the reactivation <em>landing experience</em> — does it require re-verification or show an ineligible offer?"],
 cut:"campaignId, channel, lapse duration",
 note:"Measure the landing experience, not just the open rate. Reactivation links that deep-link into a re-verification wall are extremely common and entirely invisible to the CRM tool."},

"ARPU / NGR per active":{p:"wh",pre:"Warehouse NGR; player hash join.",
 steps:["Obtain NGR per active from BI, for the period and segment you need.","Use it as the multiplier in every opportunity you price.","Where you need it per behavioural cohort, export the cohort via Data Direct and have BI return the figure."],
 cut:"Vertical, tier, market, cohort",
 note:"This is the single most important number you will borrow from a client. Get it in writing, use their figure and not an industry estimate, and cite it on every slide where it appears."},

"Lifetime value":{p:"wh",pre:"Warehouse LTV model.",
 steps:["Obtain the client's own LTV model output.","Join behavioural cohorts to it via Data Direct.","Compare LTV for players who did and did not experience a given defect."],
 cut:"Acquisition source, cohort, tier",
 note:"Never build your own LTV model. Use theirs, even if you think it is wrong — arguing about the model destroys the finding it was meant to support."},

"LTV : CAC ratio":{p:"ext",pre:"Both figures from the client.",
 steps:["Obtain both from finance.","Use as the framing for any acquisition-side business case.","Show how a conversion improvement moves the effective CAC."],
 cut:"Channel, affiliateId, market",
 note:"The most persuasive form of a CRO business case: 'this fix reduces your effective CPA by £38 without touching media spend'."},

"VIP revenue concentration":{p:"wh",pre:"<code>accountTier</code> as a user property; revenue from the warehouse.",
 steps:["Segment users by <code>accountTier</code> in Fullstory.","Obtain NGR share per tier from BI.","Build a VIP-only dashboard: error rate, frustration rate, deposit success, page performance.","Alert on any error or failed deposit affecting a VIP-tier player."],
 cut:"Tier, vertical, market",
 note:"Restrict access to this segment. A few hundred identified high-value individuals is close to personally identifying data — agree the access model with the DPO before you build it."},

"Cross-sell rate":{p:"seg",pre:"Vertical-identifying events on both products.",
 steps:["User segment A: played sportsbook only in the period.","User segment B: played both.","Metric &rarr; B ÷ (A+B), monthly.","Funnel: cross-sell impression &rarr; click &rarr; casino lobby &rarr; first game launch &rarr; <strong>second casino session</strong>.","Break down by <code>placement</code>."],
 cut:"placement, trigger moment, tier",
 note:"Count the second casino session, not the first. A single curious visit is not a dual-product player and counting it as one will make a failing banner look successful."},

"Bonus-to-deposit conversion":{p:"funnel",pre:"<code>Bonus Claimed</code>, <code>Deposit Outcome</code>.",
 steps:["Funnel (user): <code>Bonus Claimed</code> &rarr; <code>Deposit Outcome</code> success, 24-hour window.","Metric &rarr; conversion, by <code>bonusType</code>.","Segment claimants who never deposited and watch sessions — comprehension is usually the blocker."],
 cut:"bonusType, wageringMultiple, placement",
 note:"Add a step for whether the terms were expanded. Claim-without-understanding predicts both non-conversion and later complaints."},

"Wagering completion rate":{p:"wh",pre:"Platform wagering-progress data; Fullstory for the progress display.",
 steps:["Obtain completion rates from the platform.","In Fullstory, instrument the wagering-progress display: is it shown, is it in the viewport, is it interacted with?","Compare completion between players who viewed progress and those who never did."],
 cut:"bonusType, wageringMultiple, vertical",
 note:"You cannot see wagering progress, but you can see whether the player was ever shown it. That comparison is the deliverable and it is usually stark."},

"Bonus cost ratio":{p:"wh",pre:"Warehouse.",
 steps:["Obtain from finance.","Use when arguing that a comprehension fix reduces wasted bonus spend."],
 cut:"bonusType, market, vertical",
 note:"Bonuses granted to players who never wager them are pure cost. Sizing that population in Fullstory gives finance a number they have never had."},

"Push opt-in rate":{p:"funnel",pre:"Custom events for prompt shown and permission outcome.",
 steps:["Funnel: prompt shown &rarr; permission granted.","Metric &rarr; conversion, broken down by <strong>when</strong> the prompt fired (session number, or the preceding event).","Compare 7- and 30-day return rates between opted-in and not, to size the prize.","Replay the prompt context on mobile web — double-prompting and broken layouts are common."],
 cut:"Prompt timing, platform, player tenure",
 note:"The native permission dialog is outside the page and cannot be replayed. Instrument the request and the result, and infer the middle."},

"Email/SMS opt-in rate":{p:"rate",pre:"<code>marketingOptIn</code> on <code>Registration Completed</code>.",
 steps:["Metric &rarr; share of registrations where <code>marketingOptIn</code> = true, weekly.","Break down by the consent UI variant if more than one exists.","Check the presentation complies with local marketing-consent rules before recommending any change."],
 cut:"market, deviceType, registration variant",
 note:"Consent wording is regulated under PECR and equivalent rules. Any change here goes through compliance — propose clarity, never pre-ticked defaults."},

"Account closure rate":{p:"funnel",pre:"<code>Account Closure Started</code> with <code>reasonSelected</code>.",
 steps:["Funnel: <code>Account Closure Started</code> &rarr; closure completed.","Metric &rarr; completion rate and volume, monthly.","Break down by <code>reasonSelected</code>.","Audit the step count against registration — closure should never be harder."],
 cut:"reasonSelected, tenure, tier",
 note:"Optimise this for <strong>speed</strong>, never for retention. A closure flow with more friction than registration is something a regulator will notice, and you do not want your recommendation attached to it."},

/* ---------- RESPONSIBLE GAMBLING ---------- */
"RG tool adoption rate":{p:"rate",pre:"<code>RG Tool Interaction</code> with <code>toolType</code>, <code>action</code>, <code>entryPoint</code>.",
 steps:["User segment: any <code>RG Tool Interaction</code> in the period.","Metric &rarr; share of active players, monthly.","Break down by <code>toolType</code>.","Add a discoverability card: journey analysis showing how players reach RG pages."],
 cut:"toolType, entryPoint, market, tenure",
 note:"Keep everything at the interaction level. Never combine this with any risk classification or loss data — that crosses from UX analytics into health-adjacent profiling."},

"Deposit limit setting rate":{p:"rate",pre:"<code>RG Tool Interaction</code> where toolType = deposit limit, action = set.",
 steps:["User segment: deposit limit set in the period.","Metric &rarr; share of active players, monthly.","Compare rates between markets where prompting is mandated and where it is not."],
 cut:"market, entryPoint, tenure",
 note:"Rising adoption is a good outcome and should be presented as one. Make sure the client's stakeholders understand you are optimising this <em>upward</em>."},

"Limit-setting completion":{p:"funnel",pre:"Instrumented steps within the limit-setting flow.",
 steps:["Funnel: RG page viewed &rarr; limit tool opened &rarr; limit confirmed.","Metric &rarr; conversion, monthly.","Segment abandoners and watch every session you can — the population is small and each one is informative."],
 cut:"toolType, deviceType, entryPoint",
 note:"Any friction here is a defect, full stop. This is the one journey where you optimise completion aggressively and nobody will object."},

"Reality check interaction rate":{p:"rate",pre:"Viewport-visibility event for the reality-check display, plus an acknowledgement event.",
 steps:["Instrument display via intersection observer, not DOM insertion.","Funnel: displayed &rarr; acknowledged.","Metric &rarr; acknowledgement rate and median time to acknowledge.","Retain sample replays as dated compliance evidence."],
 cut:"market, deviceType, session duration at trigger",
 note:"Instant dismissal at scale suggests the message has become wallpaper. That is a genuine finding for compliance, not a UX nicety."},

"Time-out uptake":{p:"rate",pre:"<code>RG Tool Interaction</code> where toolType = time-out.",
 steps:["User segment: time-out taken in the period.","Metric &rarr; share of active players, monthly.","Funnel from the RG page to completion to check for friction."],
 cut:"Duration selected, entryPoint, market",
 note:"Low uptake with high abandonment inside the flow is a design failure. Low uptake with clean completion is simply low demand — the funnel is what distinguishes them."},

"Self-exclusion completion":{p:"funnel",pre:"Instrumented steps in the self-exclusion flow.",
 steps:["Funnel across every step of the self-exclusion journey.","Metric &rarr; completion rate, monthly. Investigate any drop-off at all.","Audit the step count and the language used at each step.","Keep replay evidence of the flow working as a compliance artefact."],
 cut:"market, deviceType, entryPoint",
 note:"This should be close to 100%. Any friction is a regulatory exposure for the client, and flagging it unprompted is one of the strongest trust-building moves available to you."},

"RG tool discoverability":{p:"perf",pre:"RG pages grouped; <code>entryPoint</code> on RG interactions.",
 steps:["Journey analysis backwards from RG page views to find how players arrive.","Measure median click depth from the lobby and from the cashier.","Audit whether an RG entry point exists on the cashier and in-game surfaces.","Report as clicks-to-reach, per surface."],
 cut:"Entry surface, deviceType, market",
 note:"Express it as clicks from the places players actually are — the cashier and the game — not from the homepage, which almost nobody visits mid-session."},

"Mandated message display coverage":{p:"seg",pre:"A viewport-visibility event per mandated element.",
 steps:["Fire a distinct event when each mandated element becomes visible in the viewport.","Session segment: message displayed.","Metric &rarr; share of eligible sessions, weekly. Target 100%.","Investigate every gap — usually a layout or a lazy-loading issue on one device class.","Retain dated sample replays as evidence."],
 cut:"market, deviceType, page group",
 note:"This is the compliance use case most clients have never considered, and it wins you a champion in a department that normally has no reason to care about your work."},

"Limit-increase request rate":{p:"rate",pre:"<code>limitChangeDirection</code> on <code>RG Tool Interaction</code>.",
 steps:["User segment: limit change with direction = increase.","Metric &rarr; share of limit holders, monthly.","Verify any mandated cooling-off period is actually enforced in the flow and instrument it."],
 cut:"market, limit type, tenure",
 note:"Report it, do not optimise it. Your only recommendation here is that the cooling-off period works as designed and is clearly explained."},

/* ---------- TECHNICAL ---------- */
"JavaScript error rate":{p:"signal",pre:"None — autocaptured.",
 steps:["Session segment: one or more JS errors.","Metric &rarr; share of all sessions, daily.","Group errors by signature; rank by <strong>distinct sessions affected</strong>, not by raw count.","For the top ten, build a segment each and measure downstream conversion against a matched control.","Alert on any new signature crossing a session threshold in an hour."],
 cut:"Page group, browser, deviceType, app version",
 note:"Rank by players affected multiplied by conversion gap. A high-volume error on a page nobody converts from matters less than a rare one in the cashier, and engineering leads know it."},

"Error click rate":{p:"signal",pre:"None — derived automatically.",
 steps:["Session segment: error click present.","Metric &rarr; share of sessions, daily.","Break down by the clicked element.","For each of the top five, quantify the conversion gap and attach three replays.","Deliver as a ranked list with estimated annualised value."],
 cut:"Page group, element, deviceType",
 note:"This is the exercise to run on day one of capture on every account. Thirty minutes of work, and the most reliable route to a credible first finding."},

"Page load time (LCP)":{p:"perf",pre:"None — autocaptured; page groups defined.",
 steps:["Metric &rarr; 75th-percentile LCP by page group.","Split by device class — mid-range Android is the real test.","Build load-time bands as segments and compare downstream conversion across them.","Present the result as a curve with a visible breakpoint."],
 cut:"Page group, deviceType, connection, market",
 note:"'Above 3.2 seconds, deposit conversion halves' produces action. 'Speed correlates with conversion' produces a nod and nothing else."},

"Interaction responsiveness (INP)":{p:"perf",pre:"None — autocaptured.",
 steps:["Metric &rarr; 75th-percentile INP by page group.","Focus on betslip, cashier and lobby pages specifically.","Correlate poor INP with rage clicks on the same elements."],
 cut:"Page group, deviceType, browser",
 note:"On an in-play sportsbook this is more commercially important than load time. A slow tap is a lost bet at exactly the moment the player cared most."},

"Cumulative Layout Shift":{p:"perf",pre:"None — autocaptured.",
 steps:["Metric &rarr; 75th-percentile CLS by page group.","Prioritise pages with interactive controls — odds boards and betslips.","Segment sessions with high CLS and check for mis-taps and error clicks."],
 cut:"Page group, deviceType",
 note:"Live odds updates cause shifts that move a button under a player's thumb mid-tap. Show the replay; the number alone never lands."},

"Time to first byte":{p:"perf",pre:"None — autocaptured.",
 steps:["Metric &rarr; median and P90 TTFB by page group.","Split by market to expose CDN edge and routing problems.","Compare against the client's own server-side monitoring."],
 cut:"market, page group, deviceType",
 note:"A market-specific TTFB problem is an infrastructure finding the client's own monitoring often misses, because it averages across regions."},

"API failure rate":{p:"signal",pre:"None — network activity autocaptured.",
 steps:["Segment sessions containing failed requests to the key endpoints (cashier, game launch, betslip).","Metric &rarr; share of relevant sessions, daily.","Break down by endpoint and status code.","Correlate each failure with what the player saw and did next."],
 cut:"Endpoint, status code, deviceType, market",
 note:"The valuable part is the pairing: a failed request plus the replay of the player being told nothing about it. That combination is what no APM tool can give them."},

"App crash-free sessions":{p:"ext",pre:"Mobile SDK plus the client's crash reporting.",
 steps:["Obtain crash-free rate from their crash tool.","Link Fullstory sessions to crash records where the SDK supports it.","Review the final seconds of sessions preceding a crash."],
 cut:"OS, app version, device model",
 note:"Fullstory does not replace crash reporting. Its contribution is the user context immediately before the crash, which the crash tool never has."},

"Conversion by load-time band":{p:"perf",pre:"Performance data plus a conversion event.",
 steps:["Create session segments for load-time bands: under 1s, 1–2s, 2–3s, 3–5s, over 5s.","For each band, measure the deposit or bet conversion rate.","Chart as a bar series in band order.","Identify the breakpoint and express it as players and money per month."],
 cut:"Page group, deviceType, market",
 note:"State the correlational caveat before anyone else does. Slow sessions skew toward older devices and worse networks, which independently predict lower conversion — say so, then show the size of the effect anyway."},

"Third-party script impact":{p:"perf",pre:"None — network timing autocaptured.",
 steps:["Review network timing by host on key page groups.","Rank third-party hosts by contribution to load time.","Segment sessions where a third-party host was slow and compare conversion.","Deliver as a quarterly tag audit."],
 cut:"Page group, host, deviceType",
 note:"Gambling sites carry unusually heavy tag loads — affiliates, chat, CRM, testing, consent. A tag audit routinely finds a tag nobody remembers commissioning."},

/* ---------- SUPPORT ---------- */
"Contact rate per session":{p:"rate",pre:"<code>Support Contact Initiated</code> with <code>pageContext</code>.",
 steps:["Session segment: <code>Support Contact Initiated</code> present.","Metric &rarr; share of all sessions, daily.","Break down by <code>pageContext</code> to find which surfaces generate contacts.","Overlay with releases to catch contact spikes after a deploy."],
 cut:"pageContext, deviceType, player tenure",
 note:"Break it down by the page the player was on when they gave up. That single breakdown usually reorders the client's support-improvement roadmap."},

"Error-driven contact share":{p:"seg",pre:"JS errors autocaptured; <code>Support Contact Initiated</code>.",
 steps:["Session segment using <strong>sequence</strong>: JS error or failed request <em>then</em> <code>Support Contact Initiated</code> within 5 minutes.","Metric &rarr; share of all support contacts, weekly.","Multiply by the client's cost per contact to price the engineering backlog."],
 cut:"Error signature, page group, deviceType",
 note:"This converts a technical defect list into an operations budget line. It is the argument that gets errors prioritised when 'it is a bug' has failed."},

"Cannot-reproduce close rate":{p:"ext",pre:"Support tool data; replay links attached to tickets.",
 steps:["Baseline the rate from the support tool before the integration goes live.","Integrate replay links via <code>FS('getSession')</code>.","Re-measure after four weeks.","Report the before-and-after alongside handle time."],
 cut:"Ticket category, channel, agent team",
 note:"Take the baseline <em>before</em> you integrate. This is the cleanest before-and-after result available in an onboarding, and you only get one chance at the 'before'."},

"Average handle time":{p:"ext",pre:"Support tool data.",
 steps:["Obtain from the support platform.","Compare tickets with and without an attached replay link.","Present alongside the reproduction-rate improvement."],
 cut:"Ticket category, channel, agent team",
 note:"Agents with a replay stop interrogating the player about browser and steps. The saving is real and it is easy to evidence."},

"Self-service deflection rate":{p:"seg",pre:"Help content page group; <code>Support Contact Initiated</code>.",
 steps:["Session segment: help content viewed AND <strong>did not</strong> initiate contact in the same session.","Metric &rarr; share of help-content sessions, weekly.","Break down by help article to find which content actually deflects.","Measure the outcome for the player too, not only the contact avoided."],
 cut:"Article, pageContext, deviceType",
 note:"Deflection is not suppression. If the client asks you to hide the chat button, say clearly that contacts will fall and complaints will rise, and offer to measure both."},

"Contact drivers by journey":{p:"perf",pre:"<code>Support Contact Initiated</code>.",
 steps:["Journey analysis <strong>backwards</strong> from <code>Support Contact Initiated</code>.","Take the top five preceding paths.","Build a segment per path and size it in contacts per month.","Cost each using the client's cost per contact and rank."],
 cut:"pageContext, deviceType, player tenure",
 note:"Backwards journey analysis is the single most under-used feature in the product and it produces the support team's roadmap in an afternoon."},

/* ---------- EXPERIENCE ---------- */
"Frustration rate per session":{p:"signal",pre:"Repeat-click controls suppressed first.",
 steps:["<strong>First</strong>, suppress rage-click detection on steppers, quick-stake chips and spin buttons.","Session segment: any frustration signal present.","Metric &rarr; share of sessions, daily, by page group.","Trend it against releases."],
 cut:"Page group, deviceType, signal type",
 note:"Do the suppression before you report anything. A first frustration report topped by the spin button destroys your credibility and you will not get it back easily."},

"Rage click rate":{p:"signal",pre:"Suppression configured; elements named.",
 steps:["Session segment: rage click present.","Metric &rarr; share of sessions, daily.","Break down by clicked element and rank.","For the top elements, check whether the click was during a wait — pair with page performance."],
 cut:"Element, page group, deviceType",
 note:"Most genuine rage clicks are waiting, not anger. Look for a slow network call underneath before you call it a design problem."},

"Dead click rate":{p:"signal",pre:"Element naming helps considerably.",
 steps:["Session segment: dead click present.","Filter to elements styled as interactive — buttons, links, cards, banners.","Metric &rarr; share of sessions, daily.","Rank by element; promotional banners and game-tile badges dominate on casino sites."],
 cut:"Element, page group, deviceType",
 note:"Filter before reporting. People click headings and images; the signal only matters where something <em>looks</em> like a control and is not."},

"Thrashed cursor rate":{p:"signal",pre:"None — derived.",
 steps:["Session segment: cursor thrashing present.","Metric &rarr; share of sessions, by page group.","Concentrate on lobby and search pages.","Watch five sessions — this signal is almost always worth watching rather than counting."],
 cut:"Page group, deviceType",
 note:"Desktop-weighted by nature. On a mobile-dominant gambling account it is a supporting signal, not a headline one."},

"Form abandonment rate":{p:"rate",pre:"None — autocaptured form interaction.",
 steps:["Session segment: form fields engaged AND form not submitted.","Metric &rarr; share of sessions that engaged the form.","Read the last-engaged field for the abandoning population.","Build a segment per problem field and watch sessions."],
 cut:"Form, fieldName, deviceType, locale",
 note:"Field values stay private. You are analysing which field and how long, which is enough — and is the right boundary to hold."},

"Scroll depth":{p:"perf",pre:"Page groups defined.",
 steps:["Read median and 75th-percentile depth per page group.","Translate into content terms — rows, games, sections.","Check where key content and controls sit relative to the median.","Split by device."],
 cut:"Page group, deviceType, player tenure",
 note:"Always convert percentages into content. 'The median player never reaches the responsible-gambling footer' is a sentence that changes a design; '31% median scroll' is not."},

"Task success rate":{p:"funnel",pre:"Start and end events defined per task.",
 steps:["Define the task precisely with the design team: what counts as starting, what counts as succeeding.","Funnel from start to success within a session.","Metric &rarr; conversion, plus median time to success.","Keep a standard set of five tasks and trend them release over release."],
 cut:"Task, deviceType, player tenure",
 note:"The cleanest metric you can give a design team, because it is defined in their language. Agree the definitions once and never change them, or the trend is worthless."},

"Net Promoter Score":{p:"ext",pre:"Survey tool integrated; session ID passed with the response.",
 steps:["Pass the Fullstory session URL into the survey response payload.","Segment detractor sessions and watch them.","Compare behaviour between promoters and detractors using segment comparison."],
 cut:"Survey trigger point, tenure, tier",
 note:"A detractor score with a watchable session behind it is worth ten without. The score itself is not the deliverable — the pattern behind the low scores is."},

"Customer effort score":{p:"ext",pre:"Survey integration.",
 steps:["Trigger the survey immediately after a defined journey.","Join the response to the session.","Compare reported effort against measured time and step count for that journey."],
 cut:"Journey, deviceType, outcome",
 note:"Where reported effort and measured effort disagree, the perception is the problem — usually an unexplained wait. That is a communication fix, not a speed fix."},

"Accessibility error rate":{p:"ext",pre:"A dedicated accessibility audit tool.",
 steps:["Run the audit outside Fullstory.","Use Fullstory to find and watch real keyboard-only, zoomed and assistive-technology journeys.","Quantify how many sessions show the failing pattern."],
 cut:"Page group, deviceType",
 note:"Fullstory is not an accessibility scanner and should never be presented as one. Its contribution is showing that real people hit the barrier the audit predicted."}

});
