/* Requirements library — what clients ask for, decoded. */
window.REQS = [
{n:1,t:"Our deposit funnel leaks and nobody knows where",q:"We lose people in the cashier but the platform report just says 'failed'.",theme:"payments",
 means:"They have an outcome count but no step-level view and no reason codes. The platform report is a black box that shows the last state, not the path to it.",
 fs:["Funnel: Cashier Opened → Payment Method Selected → Deposit Attempted → Deposit Outcome = success.","Segment by method, provider, new vs returning, device, market — always four cuts.","Event <code>Deposit Outcome</code> must carry <code>declineReason</code> and <code>providerCode</code> from the PSP response.","Segment: Deposit Attempted count ≥ 3 in a session — the friction proxy.","Watch five sessions per top decline reason; the message shown to the player is usually the problem, not the decline itself."],
 kpi:"Deposit success rate; deposit funnel step conversion; attempts per successful deposit",
 del:"Decline-reason league table with player-facing message audit, and a ranked fix list",
 got:"Card declines for gambling MCC are often the issuer's decision, not the site's. You cannot fix the decline — you can fix what happens next. An 'unable to process' message that offers no alternative method is where the money actually goes."},

{n:2,t:"Registration abandonment is too high",q:"Half the people who start signing up never finish.",theme:"acquisition",
 means:"Usually one specific field or one specific validation rule, not general reluctance. Nobody has looked at step level.",
 fs:["Funnel across <code>Registration Step Completed</code> with <code>stepNumber</code>.","Form field analysis on the abandoning step — time in field, re-entry count, order.","Segment by device; mobile web is almost always materially worse.","Capture <code>validationErrors</code> per step — the error text is the finding.","Compare affiliate vs organic; mismatched offer expectations show up as first-step abandonment."],
 kpi:"Registration completion rate; step-level drop-off; time to complete",
 del:"Step-by-step drop-off chart with the named field causing each drop and replay evidence",
 got:"In Great Britain some steps exist for legal reasons. Establish which ones before proposing to remove any. Shortening a form by deleting a regulated field is a very expensive suggestion."},

{n:3,t:"Mobile converts far worse than desktop",q:"Mobile is 70% of traffic and 40% of deposits.",theme:"acquisition",
 means:"Real, and usually a combination of layout, performance and input friction — not a single cause. Also often partly a mix effect nobody has controlled for.",
 fs:["Run every core funnel segmented by <code>deviceType</code> and compare step by step, not end to end.","Frustration signals filtered to mobile — rage and dead clicks cluster on tap targets that are too small or overlapped by sticky elements.","Page performance by device class; mid-range Android is the real test, not an iPhone.","Scroll and viewport analysis: is the primary action below the fold after the keyboard opens?","Segment comparison: mobile converters vs mobile non-converters."],
 kpi:"Conversion rate by device; mobile deposit success; mobile page performance",
 del:"Mobile-specific opportunity list, ranked, with a device-class performance appendix",
 got:"Control for traffic mix before claiming a UX problem. Mobile skews to social and affiliate traffic with different intent. Compare like-for-like sources or your headline number is wrong."},

{n:4,t:"Why do players abandon the betslip?",q:"They add selections and then just leave.",theme:"engagement",
 means:"Sportsbook's cart abandonment. Causes cluster into: price changed, stake entry friction, minimum or maximum stake rules, and login or funding interruption.",
 fs:["Funnel: Selection Added → Stake Entered → Bet Placed → Bet Outcome = accepted.","<code>Odds Changed In Betslip</code> with <code>direction</code>, <code>magnitudeBucket</code> and <code>playerAccepted</code>.","Segment: Selection Added AND NOT Bet Placed, split by in-play vs pre-match.","Stake entry method — quick-stake chips vs keyboard; keyboard entry on mobile is a known friction point.","Check whether the abandonment coincides with an insufficient-balance state pushing to the cashier."],
 kpi:"Betslip conversion rate; bet acceptance rate; price-change rejection rate",
 del:"Betslip funnel with rejection-cause breakdown and an in-play vs pre-match comparison",
 got:"In-play abandonment is time-sensitive in a way pre-match is not. A two-second delay loses the bet. Separate the two populations or the analysis is meaningless."},

{n:5,t:"Our A/B test won but revenue didn't move",q:"The test platform says +6% and finance sees nothing.",theme:"technical",
 means:"Either the win was upstream of the money, the effect decayed, or the winning variant shifted mix rather than adding volume. Classic CRO problem, and a good place to demonstrate real rigour.",
 fs:["Push the variant into Fullstory as a session property from the test platform.","Build the same funnel for each variant and look <em>past</em> the tested step to deposit and to first wager.","Watch winning-variant sessions that still failed downstream.","Segment comparison of variant A converters vs variant B converters.","If possible, join to the warehouse and compare NGR per exposed user, not just conversion."],
 kpi:"Downstream conversion by variant; NGR per exposed user",
 del:"Post-test diagnostic showing where the lift was lost, and a recommendation on measurement scope",
 got:"The commonest cause is a metric that stops at the wrong step. A variant that increases cashier opens but not successful deposits is not a win, and the test platform will never tell you that."},

{n:6,t:"Which payment methods are failing, and why?",q:"Our PSP says everything is fine.",theme:"payments",
 means:"The PSP reports on transactions that reached it. Failures before that point — and player behaviour after a decline — are invisible to them.",
 fs:["<code>Deposit Outcome</code> with <code>provider</code>, <code>providerCode</code>, <code>declineReason</code>, <code>threeDsUsed</code>, <code>threeDsOutcome</code>.","Success rate by method × provider × market, trended daily.","3DS step-up analysis: how many are challenged, how many complete, how long it takes.","Alert on any method dropping more than 5 points below its trailing average.","Segment: deposit failed THEN no retry within the session — the true loss population."],
 kpi:"Deposit success rate by method; 3DS completion rate; retry rate after decline",
 del:"Payments dashboard with per-method trend and alerting, plus a 3DS abandonment analysis",
 got:"Routing changes between PSPs happen without anyone telling the product team. When a success rate shifts overnight and nothing on the site changed, ask the payments team what they re-routed."},

{n:7,t:"Games fail to load and we only hear about it from support",q:"Players say they get a black screen.",theme:"technical",
 means:"Provider-side load failures that the operator has no visibility of, because the game is an iframe they do not own.",
 fs:["<code>Game Launched</code> and <code>Game Load Outcome</code> with <code>provider</code>, <code>secondsToLoad</code>, <code>errorCode</code>.","Failure rate by provider, game, device and market — providers vary enormously.","Alert when any provider's failure rate crosses threshold for 15 minutes.","Segment: Game Load Outcome = failed THEN Support Contact Initiated.","Measure what the player does next: retry, different game, or leave."],
 kpi:"Game load success rate; time to playable; post-failure abandonment",
 del:"Provider SLA report with failure rates by game and device — hand it to provider management",
 got:"This is commercial leverage, not just a bug report. Operators pay revenue share to game providers and have almost no objective quality data on them. A provider failure-rate report is one of the highest-value artefacts you can produce on a casino account."},

{n:8,t:"Site speed is hurting us but we can't prove it",q:"Engineering says performance is fine.",theme:"technical",
 means:"Lab metrics look fine; real-user experience on mid-range devices and poor networks does not. Nobody has connected speed to conversion.",
 fs:["Page performance by page group, device class and connection.","Segment sessions above and below a load-time threshold on the same page and compare downstream conversion.","Frustration signals correlated with slow pages — rage clicking during a wait is extremely common.","Lobby pages with large game grids are the usual culprit on casino sites."],
 kpi:"Page load time by device; conversion by load-time band; Core Web Vitals",
 del:"Speed-to-conversion curve showing the threshold where conversion falls off a cliff",
 got:"Present it as a curve with a breakpoint, not a correlation. 'Above 3.2 seconds, deposit conversion halves' produces action; 'speed correlates with conversion' produces a nod and nothing else."},

{n:9,t:"Support tickets we can't reproduce",q:"Half our bugs get closed as 'cannot reproduce'.",theme:"technical",
 means:"Agents are collecting symptoms, not evidence. The reproduction step is eating engineering time and destroying trust between departments.",
 fs:["Integrate replay links into the support tool via <code>FS('getSession')</code> so every ticket carries one automatically.","Train agents to search by uid and attach the timestamp.","Track the proportion of tickets carrying a replay link as an adoption metric.","Feed the console and network tabs into the bug template."],
 kpi:"Cannot-reproduce close rate; average handle time; time to resolution",
 del:"Support integration plus a one-page agent lookup card, and a before/after on reproduction rate",
 got:"This is the fastest department-wide adoption win available. Do it in week five, not week twelve — support teams evangelise internally in a way analysts do not."},

{n:10,t:"Give engineering a ranked list of what to fix",q:"Everything is a priority so nothing is.",theme:"technical",
 means:"They have an error log with thousands of entries and no way to rank by business impact.",
 fs:["Error clicks and JS errors grouped by signature, sorted by distinct sessions affected.","For the top ten, build a segment per error and measure downstream conversion versus a matched control.","Attach three replays per error showing the player-side consequence.","Price each using the client's own value-per-player figure."],
 kpi:"Error rate per session; conversion gap per error signature; sessions affected",
 del:"Ranked defect list with sessions affected, conversion impact and estimated annualised value",
 got:"Rank by <em>players affected × conversion gap</em>, not by error volume. A high-volume error on a page nobody converts from is worth less than a rare error in the cashier, and engineering leads know it."},

{n:11,t:"Which games should be on the lobby's first row?",q:"Merchandising is done by gut feel and supplier deals.",theme:"engagement",
 means:"A merchandising question that behaviour can answer, and usually a politically loaded one because supplier agreements are involved.",
 fs:["<code>Game Tile Clicked</code> with <code>lobbyPosition</code> and <code>rowName</code>.","Click-through rate by position to establish the positional decay curve.","Position-adjusted performance: which games over-perform relative to their slot?","Scroll depth on the lobby — how far down does the median player actually get?","Search analysis: what are players looking for that is not on screen?"],
 kpi:"Lobby click-through rate by position; games per session; search-to-launch rate",
 del:"Position-normalised game performance table plus a lobby scroll-depth analysis",
 got:"Raw click counts just re-measure position. Always normalise for position before ranking games, or you will recommend keeping whatever is already at the top."},

{n:12,t:"Our promotions don't convert",q:"We push a big welcome offer and it does nothing.",theme:"engagement",
 means:"Usually comprehension, not attractiveness. Wagering requirements and game weighting are genuinely hard to understand and are typically presented as a wall of terms.",
 fs:["<code>Bonus Viewed</code> with <code>termsExpanded</code>, <code>placement</code>, <code>wageringMultiple</code>.","Funnel: Bonus Viewed → Terms Expanded → Bonus Claimed → First Wager With Bonus.","Dead-click analysis on promotional tiles — decorative banners that look clickable are everywhere.","Segment: claimed bonus AND NOT wagered within 24h — the comprehension-failure population.","Watch sessions where the player opens terms, scrolls, and leaves."],
 kpi:"Bonus claim rate; terms engagement; bonus-to-first-wager conversion",
 del:"Promotion comprehension audit with rewritten terms presentation and a claim-funnel baseline",
 got:"Bonus terms are regulated. Any rewrite goes through compliance. Propose presentation changes — progressive disclosure, plain-language summary alongside the full terms — rather than changes to the terms themselves."},

{n:13,t:"Quantify frustration in money",q:"You keep showing me rage clicks. So what?",theme:"technical",
 means:"A fair challenge. Signals without a value attached are noise, and this client has been shown a dashboard by somebody before you.",
 fs:["Segment sessions containing the signal on a specific element.","Build the matched control: reached the same step, no signal.","Compare downstream conversion and 7-day return rate.","Multiply the gap by monthly affected players and the client's ARPU or average first deposit.","Present as a range with the causal caveat stated up front."],
 kpi:"Frustration rate per session; conversion delta; estimated annualised value",
 del:"Frustration value model — one page, their numbers, a defensible range",
 got:"Always use the client's own value figure from their finance team. The moment you use their number the finding becomes theirs to defend rather than yours to justify."},

{n:14,t:"Where does the app lose to the website, or the other way round?",q:"We assume the app is better but we don't really know.",theme:"engagement",
 means:"They have separate analytics for each and no comparable funnel. Usually the app is better at retention and worse at one specific flow nobody has isolated.",
 fs:["Identical event schema across web and app — this is the whole job and it is not trivial.","Same funnel definitions, segmented by platform.","Compare frustration signals and error rates per platform.","Check webview boundaries in the app: the cashier is usually a webview and usually the weak point."],
 kpi:"Conversion by platform; per-step delta; retention by platform",
 del:"Platform parity report with a per-step delta table and prioritised gaps",
 got:"Do not compare raw conversion. App users are self-selected loyalists and will always look better. Compare within a matched cohort — same tenure, same value band — or the comparison is meaningless."},

{n:15,t:"Reduce withdrawal-related support contacts",q:"Withdrawals generate more complaints than anything else.",theme:"retention",
 means:"Almost always a communication failure rather than a processing one. Players do not know the state of their money and the UI does not tell them.",
 fs:["Funnel: Withdrawal Started → Withdrawal Requested → (server event) Withdrawal Approved.","<code>Withdrawal Blocked</code> with <code>blockReason</code> and whether a resolution path was shown.","Segment: Withdrawal Started THEN Support Contact Initiated within 10 minutes.","Audit what the player is actually shown during pending states — replay it.","Measure repeat visits to the withdrawal status page as an anxiety proxy."],
 kpi:"Withdrawal completion rate; withdrawal-related contact rate; time to first status update",
 del:"Withdrawal journey audit with a communication redesign and a contact-driver breakdown",
 got:"Withdrawal complaints escalate to regulators and review sites faster than any other issue. Frame this to the client as reputational risk management, not just cost to serve — it gets prioritised far more quickly."},

{n:16,t:"Our search doesn't find what players want",q:"Players complain they can't find games.",theme:"engagement",
 means:"Zero-result searches, unhandled misspellings, and provider names that players use but the index does not contain.",
 fs:["<code>Lobby Search</code> with <code>queryLength</code>, <code>resultCount</code>, <code>hadZeroResults</code>, <code>refinementNumber</code>.","Zero-result rate and the top zero-result queries — this list is the finding.","Search-to-launch conversion: did searching actually lead to playing?","Thrashed-cursor and repeated-refinement sessions as a frustration proxy.","Segment: searched AND NOT launched any game."],
 kpi:"Search usage rate; zero-result rate; search-to-launch conversion",
 del:"Top zero-result query list with synonym and indexing recommendations",
 got:"The top zero-result queries are almost always games the operator does not carry, or the provider's name rather than the game's. Both are commercial findings — one for the games team, one for the search index."},

{n:17,t:"New player onboarding doesn't land",q:"First-session experience is weak and we can't see why.",theme:"retention",
 means:"The first session decides lifetime value and almost nobody measures it as its own funnel.",
 fs:["Segment: first session only, by <code>registrationDate</code> within one day.","Journey analysis forward from first login — what do they actually do?","Funnel: Registration Completed → KYC Passed → Deposit → First Game or Bet, measured within the first session and within 24h.","Compare first sessions of players who became depositors against those who did not.","For social gaming, the tutorial step funnel with skip rate."],
 kpi:"First-session conversion; time to first wager; D1 return rate",
 del:"First-session journey map with drop points and a prioritised onboarding redesign brief",
 got:"Do not confuse first session with first day. Many players register, get interrupted by verification, and return hours later. Measure both windows and say which you are using."},

{n:18,t:"Are our responsible gambling tools being used?",q:"Compliance want evidence, and we suspect nobody can find them.",theme:"compliance",
 means:"Both a compliance-evidence need and a genuine UX problem. RG tools are usually buried and worded punitively.",
 fs:["<code>RG Tool Interaction</code> with <code>toolType</code>, <code>action</code>, <code>entryPoint</code>.","Funnel: RG page viewed → tool opened → limit set or confirmed.","Viewport evidence that mandated messaging was actually displayed, not just present in the DOM.","Abandonment within the limit-setting flow — where do people give up?","Path analysis: how do people find these tools at all?"],
 kpi:"RG tool adoption rate; limit-setting completion; message display evidence",
 del:"RG journey audit plus a compliance evidence pack showing message display and interaction",
 got:"Never build a segment that identifies at-risk individuals for commercial use. Keep everything here at the level of interaction with a tool, never at the level of inferred harm. If a client pushes, decline in writing."},

{n:19,t:"Affiliate traffic converts badly — is it fraud or UX?",q:"One affiliate sends volume and no depositors.",theme:"acquisition",
 means:"Genuinely ambiguous and commercially contentious. Could be incentivised traffic, bot traffic, or a landing experience mismatch.",
 fs:["<code>affiliateId</code> and <code>campaignId</code> as session properties on every session.","Compare engagement depth by affiliate: pages, time, scroll, interactions — not just conversion.","Watch sessions from the suspect affiliate. Bot traffic looks unmistakably wrong in replay.","Compare the offer shown on the affiliate page against the offer on the landing page.","Device, geo and browser distribution by affiliate as a fraud signal."],
 kpi:"Reg-to-FTD by affiliate; engagement depth by source; cost per FTD by affiliate",
 del:"Affiliate traffic quality report with behavioural evidence, usable in a commercial renegotiation",
 got:"Be careful and be evidenced. This report may be used to withhold payment from a commercial partner. Show the behaviour, let the client draw the conclusion, and keep the replays."},

{n:20,t:"Cross-sell sportsbook players into casino",q:"Our banner doesn't work.",theme:"retention",
 means:"Placement and timing, almost always. A lobby banner asks a sports bettor to change mode at the wrong moment.",
 fs:["Instrument every cross-sell surface with a distinct <code>placement</code> property.","Funnel: cross-sell impression → click → casino lobby → first game launch.","Segment sports-only players and run journey analysis to find natural transition moments.","Test post-settlement placements — after a bet settles, win or lose — against lobby banners.","Measure the resulting casino session quality, not just the click."],
 kpi:"Cross-sell click-through; sports-to-casino conversion; dual-product player share",
 del:"Cross-sell placement performance comparison with a recommended trigger moment",
 got:"Measure the second casino session, not the first. A click-through that produces one curious visit and no return has not created a dual-product player and should not be counted as a success."},

{n:21,t:"BI and UX disagree about the numbers",q:"Your funnel says 68%, our report says 61%.",theme:"org",
 means:"Different definitions, almost never different facts. If you do not resolve this in week five it will poison everything you deliver afterwards.",
 fs:["Write both definitions down side by side, in full, including window and denominator.","Common causes: session vs user scope, different time windows, bot exclusion, consent-suppressed sessions, deduplication of retries.","Reconcile on a single day's data with the BI analyst in the room.","Document the residual gap and its cause in a note both teams sign."],
 kpi:"Definitional alignment — the reconciliation note itself is the deliverable",
 del:"Signed metric definitions document and a reconciliation note explaining the residual gap",
 got:"Never argue that your number is right. Establish that both are correct for their definition, agree which definition answers the business question, and move on. Being right is worth far less than being trusted."},

{n:22,t:"The consent banner is destroying our data",q:"We only see a fraction of sessions.",theme:"compliance",
 means:"Consent rates in gambling are often poor, and a badly designed banner both harms data and annoys players.",
 fs:["Instrument banner impression, interaction and outcome — noting this itself requires care about what is captured pre-consent.","Measure consent rate by market, device and traffic source.","Compare consented and non-consented session volumes against server-side page views to size the blind spot.","Audit the banner UX: is 'accept' genuinely as easy as 'reject', as regulators require?"],
 kpi:"Consent acceptance rate; measurable-session coverage; banner interaction time",
 del:"Consent impact assessment quantifying the blind spot, plus a compliant banner UX review",
 got:"You cannot fix this by capturing more without consent. Improve the banner's clarity, and be honest with the client about the size of the blind spot — then adjust every downstream number for it rather than pretending it is not there."},

{n:23,t:"Prove players actually saw the required messaging",q:"Compliance need evidence for an audit.",theme:"compliance",
 means:"An assurance need that most operators satisfy with a screenshot of the code, not evidence of display. Fullstory can do considerably better.",
 fs:["Instrument display of each mandated element with a distinct event, including viewport visibility rather than DOM presence.","Segment sessions where the message was displayed versus where it was not.","Retain sample replays as dated evidence within the retention window.","Build a compliance dashboard showing display coverage over time."],
 kpi:"Message display coverage; interaction rate with mandated messaging",
 del:"Compliance evidence pack: coverage dashboard, methodology note, sample replays",
 got:"'It is in the DOM' is not evidence it was seen. Use viewport visibility. This distinction is exactly what makes the evidence credible to an auditor and is worth explaining explicitly in the methodology note."},

{n:24,t:"We can't see what our VIPs experience",q:"A VIP complained and we had nothing to look at.",theme:"retention",
 means:"VIPs are a tiny population with enormous revenue weight, and they are invisible in aggregate reporting by construction.",
 fs:["<code>accountTier</code> as a user property so VIP sessions are always segmentable.","A dedicated VIP dashboard: error rate, frustration rate, performance, funnel conversion.","Alert on any error or failed deposit affecting a VIP-tier player.","Restrict access to this segment appropriately — it is a small, identifiable population."],
 kpi:"VIP error rate; VIP deposit success; VIP session quality",
 del:"VIP experience dashboard with a real-time alert route to the VIP team",
 got:"Access control genuinely matters here. A segment of a few hundred high-value individuals is close to personally identifying. Restrict it, log it, and say so to the DPO before you build it."},

{n:25,t:"Deflect live chat contacts",q:"Chat volume is eating our operations budget.",theme:"retention",
 means:"Contacts are a symptom. The question is which on-site failures cause them, and which could be pre-empted.",
 fs:["<code>Support Contact Initiated</code> with <code>pageContext</code> and <code>priorErrorSeen</code>.","Journey analysis backwards from contact initiation — the top five preceding paths are your fix list.","Segment: error THEN contact within 5 minutes, to size the technical contribution.","Measure self-service content views and whether they prevented a contact."],
 kpi:"Contact rate per session; contact drivers by preceding journey; deflection rate",
 del:"Contact-driver analysis ranked by volume and cost, with a deflection roadmap",
 got:"Deflection is not the same as suppression. Making it harder to reach support reduces contacts and increases complaints and churn. Measure the outcome for the player, not just the volume for operations, and say so before the client asks you to hide the chat button."},

{n:26,t:"The cashier has too many steps",q:"Can we make depositing one click?",theme:"payments",
 means:"Partly achievable, partly constrained by SCA, KYC and licence conditions. The real opportunity is usually saved methods and sensible defaults.",
 fs:["Time and step count from Cashier Opened to Deposit Outcome, segmented by saved vs new method.","Quantify the saved-method advantage in both success rate and time.","Funnel: adoption of method-saving at first deposit.","Identify steps that exist for regulatory reasons versus steps that exist by habit — ask, do not assume."],
 kpi:"Time to deposit; steps per deposit; saved-method adoption rate",
 del:"Cashier step audit separating regulated from discretionary steps, with a streamlining plan",
 got:"Strong Customer Authentication is not optional in Europe. Never propose removing it. Propose making the step-up expected and explained, which measurably reduces abandonment within the challenge."},

{n:27,t:"Which form field is breaking?",q:"The form fails and we can't tell where.",theme:"acquisition",
 means:"Field-level friction: validation that fires at the wrong time, formats that are not explained, and lookups that fail silently.",
 fs:["Autocaptured form interaction data: time in field, re-entries, focus order, abandonment field.","<code>Registration Failed</code> with <code>fieldName</code> and <code>failureReason</code>.","Replay the abandoning sessions and watch the moment of hesitation.","Compare across markets — address and phone formats break differently by locale."],
 kpi:"Field-level abandonment; time in field; validation error rate per field",
 del:"Field friction report with specific validation and copy recommendations",
 got:"Remember that input values are private by default. You can see that a field was struggled with and that validation fired; you cannot see what was typed. That is the correct behaviour — do not let anyone suggest turning it off."},

{n:28,t:"Put replays into our existing tools",q:"We're not going to log into another system.",theme:"org",
 means:"Fair and correct. Adoption follows the existing workflow; it does not create a new one.",
 fs:["Support tool: replay link on every ticket via <code>FS('getSession')</code>.","Jira: replay link in the bug template as a required field.","Sentry or equivalent: link the error to the session.","Slack: alert notifications with session links into the team's existing channel.","Experimentation platform: variant as a session property, both directions."],
 kpi:"Proportion of tickets and bugs carrying evidence; tool adoption by team",
 del:"Integration plan and configuration, plus adoption tracking by team",
 got:"Integrations are the highest-leverage adoption work you will do, and they are usually left until last because they feel like plumbing. Move them earlier. A team that receives replay links inside their own tool becomes a user without ever being trained."},

{n:29,t:"Executives want numbers, not videos",q:"I don't have time to watch recordings.",theme:"org",
 means:"Correct, and a good sign. The executive wants a trend and a decision, not evidence.",
 fs:["A capped executive dashboard: five to eight tiles, all rates, all trended, all with visible denominators.","Release annotations so movements have explanations attached.","A monthly one-page narrative: what moved, why, what we did, what is next.","Keep one short clip in reserve for the moment they ask 'what does that actually look like'."],
 kpi:"Whatever the board already watches — do not invent new executive metrics",
 del:"Executive dashboard and a monthly one-page narrative",
 got:"Never introduce a metric an executive has not seen before without explaining it against one they already trust. New metrics in an exec deck get challenged instead of acted on."},

{n:30,t:"Train forty people across five teams",q:"How do we roll this out without it fizzling?",theme:"org",
 means:"An enablement programme, not a training session. This is the difference between a renewal and a cancellation.",
 fs:["Role-based curriculum — see the training module for the full matrix.","Pre-build the segment, funnel and dashboard library before anyone logs in.","A named champion per team, given extra time.","Four weeks of weekly office hours after training.","Track weekly active users by team and intervene where it drops."],
 kpi:"Weekly active users by team; client-created objects; findings presented by client staff",
 del:"Enablement programme, role quick-reference cards, adoption dashboard",
 got:"The truest adoption metric is <strong>client-created segments</strong>. If they are only consuming what you built, they have not adopted the tool — they have adopted you, and that ends at the next budget cycle."},

{n:31,t:"Push notification opt-in is too low",q:"We can't reach players after they leave.",theme:"retention",
 means:"The prompt is asked at the wrong moment, usually on first load before any value has been delivered.",
 fs:["Instrument prompt impression, timing within the session, and outcome.","Compare opt-in rate by the moment it is asked — after first deposit and after first win are the usual winners.","Segment opted-in versus not and compare 7- and 30-day return rates to size the prize.","Replay the prompt in context; on mobile web it is often visually broken or double-prompted."],
 kpi:"Push opt-in rate; opt-in by prompt timing; return rate by opt-in status",
 del:"Opt-in timing analysis with a recommended trigger point and expected uplift",
 got:"Native permission dialogs cannot be replayed — they are outside the page. Instrument the moment you request and the result you receive, and infer the rest."},

{n:32,t:"Price changes are rejecting bets",q:"Players say we move the odds when they try to bet.",theme:"engagement",
 means:"Genuine sportsbook mechanics that players experience as bad faith. Rarely measured from the player's side, and the trading team usually has no idea of the UX cost.",
 fs:["<code>Odds Changed In Betslip</code> with direction, magnitude and whether the player accepted.","Rejection rate by market type, in-play versus pre-match, and time of day.","Segment: bet rejected THEN session ended — the churn signal.","Measure acceptance rate when 'accept any odds change' is offered versus when it is not.","Measure the time between stake entry and placement — long dwell increases rejection risk."],
 kpi:"Bet acceptance rate; price-change rejection rate; post-rejection abandonment",
 del:"Rejection analysis with UX recommendations on how changes are surfaced and confirmed",
 got:"You cannot change the trading model, and you should not try. You can change how a change is communicated and how quickly the player can respond. That distinction keeps the trading team on your side."},

{n:33,t:"Multi-brand, multi-market setup",q:"We have six brands in four markets. How do we structure this?",theme:"org",
 means:"An architecture decision that is painful to reverse. Get it right before capture goes live.",
 fs:["Default to a single org with <code>brand</code> and <code>marketCode</code> as user and session properties.","Separate orgs only where data residency or legal entity separation requires it.","Every shared segment and funnel must filter by brand — enforce this in the naming convention.","Brand-level dashboards plus one group-level comparison dashboard.","Plan licence pooling and quota allocation across brands before a peak period."],
 kpi:"Per-brand funnel conversion; group-level comparison",
 del:"Account architecture document with the property model and naming conventions",
 got:"The group-level cross-brand comparison is politically explosive and commercially invaluable. Decide with the sponsor who is allowed to see it before you build it, not after the first brand director sees their name at the bottom."},

{n:34,t:"Join behaviour to actual revenue",q:"Show me what this is worth in NGR.",theme:"org",
 means:"The Data Direct conversation. This is where the tool stops being a UX instrument and becomes part of the data estate.",
 fs:["Confirm the hashed uid is genuinely joinable to the warehouse player key — test it before promising anything.","Configure Data Direct to the client's warehouse.","Work with BI to build the first joined analysis: behaviour cohort against 30-day NGR.","Establish a repeatable opportunity-sizing model the client owns."],
 kpi:"NGR per behavioural cohort; value per resolved defect; cumulative programme value",
 del:"Warehouse pipeline, first joined analysis, and a reusable opportunity-sizing model",
 got:"This must be led by the client's BI team, with you as a contributor. A pipeline built by an agency and handed over is a pipeline nobody queries. Their name on it is what makes it survive."},

{n:35,t:"Geolocation checks are failing (US)",q:"Players in-state say they're being blocked.",theme:"compliance",
 means:"A US-specific friction point that is mandatory, frequently fails, and is almost never instrumented from the player's side.",
 fs:["Instrument geolocation attempt, outcome, failure reason, retry count and time taken.","Failure rate by state, device, browser and connection type.","Segment: geolocation failed THEN session ended, versus failed then retried successfully.","Audit the remediation guidance shown on failure — it is usually generic and unhelpful.","Correlate with support contacts."],
 kpi:"Geolocation success rate; retry success rate; post-failure abandonment",
 del:"Geolocation friction report by state and device with remediation-messaging recommendations",
 got:"The check itself is a licence condition and cannot be weakened. Everything here is about making failure recoverable and explicable — better instructions, clearer reasons, and a faster retry."}
];

/* Onboarding plan generator logic */
window.BUILDER = {
  run: function(c){
    var out = [], risks = [], instr = [], kpis = [], reqs = [], weeks;
    var slow = (c.scale==='tier1'||c.scale==='b2b');
    var fast = (c.scale==='challenger');
    weeks = slow ? '12–16 weeks' : fast ? '3–5 weeks' : '6–9 weeks';

    /* Phase 1 */
    var p1 = ['Commercial discovery: revenue mix, the board-level numbers, the top three frustrations in their words',
              'Technical discovery: deployment surfaces, CSP, consent platform, router, app estate',
              'Data discovery: warehouse, the player identifier, who owns BI',
              'Stakeholder map and the "who can prioritise a fix" question'];
    if(c.platform!=='inhouse') p1.push('<strong>Deployment boundary workshop with the platform provider present</strong> — establish in writing which pages the client can tag');
    if(c.market==='gb') p1.push('Confirm which journeys carry UKGC-mandated friction that must not be optimised for completion');
    if(c.market==='us') p1.push('Map state-by-state requirements and the geolocation vendor');
    if(c.market==='multi') p1.push('Data residency review per licence, and whether it forces separate orgs');
    if(c.scale==='b2b') p1.push('Tenant separation requirements — which operator may see what');
    out.push({t:'Discover', w:slow?'Week 1–2':'Week 0–1', items:p1});

    /* Phase 2 */
    var p2 = ['Account architecture: org structure, brand and market property model',
              'Instrumentation spec — full event and property table with triggers and example values',
              'Privacy design walked page by page and signed by the DPO',
              'Identity design: hashed uid, where computed, how it joins to the warehouse',
              'Measurement plan: KPIs, funnels, dashboards, by audience'];
    if(c.scale==='tier1') p2.push('Cross-brand naming convention and segment governance model — agree before anyone builds anything');
    if(c.surface==='app') p2.push('<strong>Mobile event schema fully reviewed and frozen</strong> — you get one shot per release train');
    if(c.bi==='mature') p2.push('Data Direct design agreed with the BI lead in this phase, not later');
    out.push({t:'Design', w:slow?'Week 2–4':'Week 1–2', items:p2});

    /* Phase 3 */
    var p3 = [];
    if(c.dev==='none') p3.push('Deploy via tag manager; accept later initialisation and document the limitation');
    else p3.push('Deploy snippet or SDK to staging, then production; CSP and consent platform configured');
    p3.push('Identity wiring verified against a real warehouse record');
    if(c.surface!=='desktop') p3.push('SPA page rules verified on every route; element naming on key controls');
    p3.push('Custom events in priority order — money flows first, engagement second, content last');
    p3.push('Privacy audit in staging, repeated in production within 24 hours of go-live, screenshotted');
    p3.push('Volume reconciliation against the client’s own analytics');
    if(c.surface==='app') p3.push('Native SDK plus webview capture linkage verified end to end');
    if(c.platform==='whitelabel') p3.push('Instrument the <em>edges</em> of the provider-owned flows: every entry and every returned outcome');
    out.push({t:'Deploy', w:slow?'Week 4–7':fast?'Week 1–2':'Week 2–4', items:p3});

    /* Phase 4 */
    var p4 = ['Day-one segment library and the core funnels for this vertical',
              'Reconcile Fullstory figures against the client’s own reporting and document every gap',
              'Audience dashboards with agreed, written definitions',
              'First three alerts configured and threshold-tuned',
              '<strong>Deliver the first quantified finding</strong> — error clicks are the reliable source'];
    if(c.bi!=='none') p4.push('Agree the metric definitions document jointly with BI and have both sides sign it');
    out.push({t:'Validate', w:slow?'Week 7–9':fast?'Week 2–3':'Week 4–6', items:p4});

    /* Phase 5 */
    var p5 = ['Role-based training sessions — not one generic session',
              'One-page quick-reference per role, in their language',
              'Support tool replay-link integration (fastest adoption win available)',
              'Weekly office hours for four weeks',
              'Named champion per team'];
    if(c.goal==='tech') p5.push('Engineering integration: Jira template and error-monitoring link');
    if(c.goal==='acq'||c.goal==='ret') p5.push('CRM integration: Fullstory segments as trigger audiences');
    if(c.scale==='challenger') p5.push('Pre-build everything — assume they will not build their own objects');
    out.push({t:'Enable', w:slow?'Week 8–12':fast?'Week 3–4':'Week 5–8', items:p5});

    /* Phase 6 */
    var p6 = ['Fortnightly findings, monthly review, quarterly business review',
              'Fullstory evidence required in the client’s own bug and discovery templates',
              'Governance: naming conventions, dashboard owners, quarterly access and masking review',
              'Quantified, prioritised opportunity backlog feeding the roadmap'];
    if(c.bi==='mature') p6.push('Data Direct live; first NGR-joined analysis delivered with BI');
    else p6.push('Lightweight value model using the client’s own ARPU figure, since no warehouse join is available yet');
    out.push({t:'Embed', w:slow?'Week 12+':fast?'Week 4+':'Week 8+', items:p6});

    /* Instrumentation scope */
    instr = ['Registration Started / Step Completed / Failed / Completed','KYC Started / Document Uploaded / Outcome',
             'Cashier Opened, Payment Method Selected, Deposit Attempted, Deposit Outcome',
             'Withdrawal Started / Requested / Blocked','Support Contact Initiated','RG Tool Interaction'];
    if(c.vertical==='casino'||c.vertical==='both') instr.push('Lobby Viewed, Lobby Search, Game Tile Clicked, Game Launched, Game Load Outcome, Game Exited');
    if(c.vertical==='sportsbook'||c.vertical==='both') instr.push('Event Viewed, Selection Added, Stake Entered, Odds Changed In Betslip, Bet Placed, Bet Outcome, Cash Out Viewed/Taken');
    if(c.vertical==='poker') instr.push('Client Download, Table Joined, Tournament Registered, Seat Wait Time');
    if(c.vertical==='lottery') instr.push('Number Selection, Ticket Added, Subscription Started, Draw Reminder Interaction');
    if(c.vertical==='social') instr.push('Tutorial Step, Level Started/Completed/Failed, Store Opened, IAP Initiated/Completed/Failed, Rewarded Ad Offered/Watched');
    if(c.market==='us') instr.push('Geolocation Attempt / Outcome / Retry');
    if(c.market==='gb') instr.push('Affordability Prompt Shown / Outcome');
    if(c.market==='de'||c.market==='eu') instr.push('Deposit Limit Prompt (market-mandated) Shown / Set');
    instr.push('Experiment Exposure (variant as a session property)');

    /* KPI set */
    var base = ['Registration completion rate','KYC pass rate and time to verify','Deposit success rate by method','Reg-to-FTD conversion','Frustration rate per session','JS error rate per session'];
    if(c.vertical==='casino'||c.vertical==='both') base.push('Game load success rate','Lobby search zero-result rate','Games per session');
    if(c.vertical==='sportsbook'||c.vertical==='both') base.push('Betslip conversion rate','Bet acceptance rate','Price-change rejection rate');
    if(c.vertical==='social') base.push('ARPDAU','Payer conversion rate','D1 / D7 / D30 retention','Tutorial completion rate');
    if(c.goal==='ret') base.push('D1 / D7 / D30 return rate','Second-deposit rate','Withdrawal completion rate');
    if(c.goal==='support') base.push('Contact rate per session','Cannot-reproduce close rate');
    if(c.goal==='compliance') base.push('RG tool adoption rate','Mandated message display coverage');
    if(c.goal==='tech') base.push('Page load time by device class','Conversion by load-time band');
    kpis = base;

    /* Likely requirements */
    var rmap = {acq:[2,3,19,27,17],dep:[1,6,26,2],ret:[15,17,20,25,31],tech:[7,8,9,10,5],support:[9,25,15],compliance:[18,22,23,35]};
    reqs = (rmap[c.goal]||[]).slice();
    if(c.vertical==='casino'||c.vertical==='both'){ reqs.push(11,16,12,7); }
    if(c.vertical==='sportsbook'||c.vertical==='both'){ reqs.push(4,32); }
    if(c.scale==='tier1'){ reqs.push(33,21,34); }
    if(c.scale==='b2b'){ reqs.push(33,28); }
    if(c.surface==='app'){ reqs.push(14); }
    reqs = reqs.filter(function(v,i,a){return a.indexOf(v)===i;}).slice(0,10);

    /* Risks */
    if(c.platform==='whitelabel') risks.push('<strong>Deployment boundary.</strong> The provider owns the cashier and registration. Establish in writing what you can tag before committing to any deposit-funnel outcome, and be explicit and repeated about what is out of reach.');
    if(c.platform==='hybrid') risks.push('<strong>Cashier ownership.</strong> Confirm early whether the cashier is same-origin. If it is a cross-origin iframe you own no visibility inside it and must instrument the edges.');
    if(c.dev==='none') risks.push('<strong>No developer capacity.</strong> Tag-manager-only deployment costs you early initialisation and reliable custom events. Set expectations that the deposit-funnel analysis will be coarser, and build the business case for a dev slot.');
    if(c.dev==='medium') risks.push('<strong>Shared backlog.</strong> Instrumentation tickets will compete with feature work. Get the full event spec into one ticket rather than drip-feeding, and get it estimated in the first sprint planning.');
    if(c.surface==='app') risks.push('<strong>Release cadence.</strong> Mobile instrumentation ships with app releases. Freeze the schema early and plan for a long tail; deliver web findings while the app work waits in the queue.');
    if(c.market==='gb') risks.push('<strong>UKGC-mandated friction.</strong> Verification before deposit, affordability prompts and RG interruptions are legal requirements. Agree the "must not optimise for completion" list in discovery and state your position on it unprompted.');
    if(c.market==='us') risks.push('<strong>State fragmentation and geolocation.</strong> Every state differs and geolocation failure is a large, unmeasured loss. Instrument it early — it is usually an easy first win.');
    if(c.market==='multi') risks.push('<strong>Data residency.</strong> May force separate orgs and will complicate group reporting. Resolve with the DPO in week one, before account structure is set.');
    if(c.market==='ca') risks.push('<strong>Ontario advertising rules.</strong> Inducements cannot generally be advertised publicly, which removes most of the promotional surface you would normally optimise. Plan around it.');
    if(c.bi==='none') risks.push('<strong>No warehouse.</strong> You cannot join behaviour to NGR. Agree a value proxy — their own ARPU or average first deposit — in writing during discovery, or every opportunity you size will be argued about.');
    if(c.bi==='mature') risks.push('<strong>BI scepticism.</strong> A mature data team will challenge your numbers. Involve them from week one and run the reconciliation exercise before you present anything externally.');
    if(c.scale==='tier1') risks.push('<strong>Politics.</strong> Multiple brand owners with conflicting priorities. Insist on a cross-functional steering group, or you become the tool of one department and die with its budget.');
    if(c.scale==='challenger') risks.push('<strong>Follow-through.</strong> Enthusiasm is high and capacity is not. Pre-build everything and defend a short fortnightly rhythm.');
    if(c.scale==='b2b') risks.push('<strong>Tenant data segregation.</strong> An operator seeing another operator’s sessions is an existential incident. Design and review the access model before capture goes live.');
    if(c.vertical==='casino'||c.vertical==='both') risks.push('<strong>Game canvases do not replay.</strong> Say this in the first meeting, before someone discovers it in a demo and loses confidence in the tool.');
    if(c.vertical==='sportsbook'||c.vertical==='both') risks.push('<strong>Fixture-driven volume spikes.</strong> Configure quota alerts and sampling before the first major event, not after.');
    if(c.vertical==='social') risks.push('<strong>Overlap with existing telemetry.</strong> This team already has a strong event pipeline. Position Fullstory on the non-game surfaces where their data is thin, or you will be seen as duplication.');

    /* Contradictions — combinations that cannot all be true, or that
       mean the profile has been described from the wrong point of view. */
    var conflicts = [];
    if(c.platform==='whitelabel' && c.dev==='high')
      conflicts.push('<strong>High developer capacity on a white-label platform.</strong> Those developers cannot deploy to the cashier or registration, which is where the value is. Either the platform boundary is softer than stated, or that capacity should be redirected to the surfaces they do own — lobby, content and promotions. Establish which before you scope.');
    if(c.platform==='whitelabel' && c.goal==='dep')
      conflicts.push('<strong>Deposit success is the goal, but the provider owns the cashier.</strong> You can measure the edges and the outcome the page reports; you cannot instrument inside the flow. Either get the provider contracted in, or reset the goal to registration and verification, which you can actually move.');
    if(c.dev==='none' && c.surface==='app')
      conflicts.push('<strong>App-first with no developer capacity.</strong> Mobile instrumentation is impossible without engineering — there is no tag manager for a native app. This profile has no viable path to app data. Either secure engineering time or scope the engagement to mobile web and say so explicitly in the proposal.');
    if(c.dev==='none' && c.goal==='tech')
      conflicts.push('<strong>Technical quality is the goal but nobody can ship a fix.</strong> You will produce a ranked defect list that nothing happens to, which damages the account more than finding nothing would. Secure a standing engineering slot as a condition of this goal.');
    if(c.bi==='none' && (c.goal==='ret'||c.goal==='dep'))
      conflicts.push('<strong>No warehouse, but the goal needs revenue attribution.</strong> You cannot join behaviour to NGR here. Agree a value proxy — the client’s own ARPU or average first deposit — in writing during discovery, or every opportunity you size will be argued about rather than acted on.');
    if(c.vertical==='social' && c.market!=='none')
      conflicts.push('<strong>Social gaming with a gambling regulator selected.</strong> Free-to-play titles are not licensed by the UKGC, MGA or a US state regulator. Either this is actually a real-money product and the vertical is wrong, or it is a social-casino title where the regulatory column is advertising and consumer-protection law, not a gambling licence. Resolve this before writing the privacy design.');
    if(c.vertical!=='social' && c.market==='none')
      conflicts.push('<strong>A real-money vertical with no regulator.</strong> Every real-money gambling operator is licensed somewhere, even if that somewhere is Curacao. "Unregulated" usually means nobody in the room knows the licensing position. Find out before you touch identity or privacy design.');
    if((c.vertical==='sportsbook'||c.vertical==='both') && c.surface==='desktop')
      conflicts.push('<strong>Sportsbook with desktop as the dominant surface.</strong> Possible, but unusual — in-play betting is overwhelmingly mobile in most markets. Check whether "desktop" reflects where revenue comes from or simply where the people you spoke to happen to work.');
    if(c.scale==='b2b' && c.goal==='acq')
      conflicts.push('<strong>Acquisition as the goal for a B2B platform.</strong> Their customers are operators, won by sales teams, not by a registration funnel. Either you mean the end-player acquisition funnel inside their operators’ white-labelled front ends — which raises tenant data-segregation questions — or you mean back-office adoption. They are different engagements.');
    if(c.scale==='b2b' && c.goal==='compliance')
      conflicts.push('<strong>Compliance assurance on a multi-tenant platform.</strong> Each operator carries its own licence conditions, so there is no single compliance answer. Scope this per tenant, or reframe it as giving operators the evidence tooling rather than producing the evidence yourself.');
    if(c.market==='us' && c.platform==='whitelabel')
      conflicts.push('<strong>US market on a white-label platform.</strong> Geolocation and state certification sit with the platform provider, so the friction you most want to instrument is the part you least control. Get the provider into the kick-off or accept that geolocation stays a black box.');
    if(c.scale==='challenger' && c.bi==='mature')
      conflicts.push('<strong>A challenger with a mature data team.</strong> Unusual and worth checking — it often means they have one very capable analyst rather than a function. Plan for that person being unavailable at short notice rather than assuming a team behind them.');
    if(c.scale==='tier1' && c.dev==='none')
      conflicts.push('<strong>A tier-1 group with no developer capacity.</strong> Almost certainly a description of one brand team’s access rather than the group’s. Find the platform engineering function; it exists, and someone is gatekeeping it.');
    if(c.scale==='tier1' && c.platform==='whitelabel')
      conflicts.push('<strong>A tier-1 multi-brand group on a white label.</strong> Possible for a newly acquired or newly launched brand, but rare at group level. Confirm whether this is the whole estate or one brand within it, because the account architecture depends on the answer.');

    return {weeks:weeks, phases:out, instr:instr, kpis:kpis, reqs:reqs, risks:risks, conflicts:conflicts};
  }
};
