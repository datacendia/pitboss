/* Segment composition drills.
   These train the LOGIC of a segment — scope, sequence, negation, counts,
   property filters, window — not Fullstory's screen layout, which is not
   verified here and would teach false muscle memory if mocked. */

window.DRILL_EVENTS = [
  'Registration Started', 'Registration Completed', 'KYC Outcome',
  'Cashier Opened', 'Payment Method Selected', 'Deposit Attempted', 'Deposit Outcome',
  'Withdrawal Started', 'Withdrawal Requested',
  'Lobby Search', 'Game Tile Clicked', 'Game Launched', 'Game Load Outcome',
  'Selection Added', 'Stake Entered', 'Bet Placed',
  'Bonus Viewed', 'Bonus Claimed',
  'RG Tool Interaction', 'Support Contact Initiated',
  'JavaScript Error', 'Rage Click'
];

/* Property filters offered per event. Kept to the ones that matter. */
window.DRILL_PROPS = {
  'KYC Outcome': ['outcome = passed', 'outcome = failed', 'outcome = referred'],
  'Deposit Outcome': ['outcome = success', 'outcome = failed', 'isFirstDeposit = true', 'paymentMethod = card'],
  'Deposit Attempted': ['isFirstDeposit = true'],
  'Game Load Outcome': ['outcome = success', 'outcome = failed'],
  'Lobby Search': ['hadZeroResults = true', 'hadZeroResults = false'],
  'Bet Placed': ['isInPlay = true', 'isInPlay = false'],
  'Cashier Opened': ['isFirstDeposit = true'],
  'RG Tool Interaction': ['toolType = deposit limit', 'action = set']
};

window.DRILL_OPS = [
  { v: 'did', label: 'did' },
  { v: 'didnot', label: 'did NOT' },
  { v: 'then', label: 'THEN (after the row above)' },
  { v: 'count', label: 'did at least N times' }
];

window.DRILL_WINDOWS = [
  { v: 'session', label: 'within the same session' },
  { v: '24h', label: 'within 24 hours' },
  { v: '7d', label: 'within 7 days' },
  { v: '30d', label: 'within 30 days' }
];

/* Each exercise: the brief, the canonical answer, and why it is that way.
   `rows` order matters only when an op is "then". */
window.DRILLS = [
{
  id: 'rg-users',
  level: 'Warm-up',
  brief: 'Sessions in which the player interacted with any responsible gambling tool.',
  context: 'Compliance want to know how many visits touch an RG tool at all.',
  scope: 'session', window: 'session',
  rows: [{ op: 'did', event: 'RG Tool Interaction' }],
  why: 'The simplest possible shape: one event, session scope, no window beyond the visit. Note what it deliberately does not do — it says nothing about who the player is or any inferred risk. Interaction only.'
},
{
  id: 'cashier-abandon',
  level: 'Core',
  brief: 'Sessions where the cashier was opened but no deposit was ever attempted.',
  context: 'Sizing cashier abandonment for the payments team.',
  scope: 'session', window: 'session',
  rows: [
    { op: 'did', event: 'Cashier Opened' },
    { op: 'didnot', event: 'Deposit Attempted' }
  ],
  why: 'The "did not" operator is the workhorse of gambling analytics — nearly every valuable segment is a negative. Session scope, because you are asking about the shape of a visit, not about a person across all time.'
},
{
  id: 'retry',
  level: 'Core',
  brief: 'Sessions where a deposit failed and the player then tried again.',
  context: 'You want the retry population so you can test whether the error message helps.',
  scope: 'session', window: 'session',
  rows: [
    { op: 'did', event: 'Deposit Outcome', prop: 'outcome = failed' },
    { op: 'then', event: 'Deposit Attempted' }
  ],
  why: 'This is the one people get wrong. Co-occurrence is not sequence: without ordering you also catch players who succeeded first and then made a second, unrelated deposit. The word "then" in the brief is always a signal to reach for the sequence operator.'
},
{
  id: 'friction',
  level: 'Core',
  brief: 'Sessions containing three or more deposit attempts.',
  context: 'A direct proxy for cashier friction — people the flow is exhausting.',
  scope: 'session', window: 'session',
  rows: [{ op: 'count', event: 'Deposit Attempted', n: 3 }],
  why: 'A count condition, not three separate "did" rows. This segment catches cashiers that eventually succeed but wear the player out on the way — a failure that a plain success rate hides completely.'
},
{
  id: 'never-verified',
  level: 'Scope',
  brief: 'Players who completed registration but have never passed verification.',
  context: 'Locked revenue sitting in the account base, and a CRM audience.',
  scope: 'user', window: '30d',
  rows: [
    { op: 'did', event: 'Registration Completed' },
    { op: 'didnot', event: 'KYC Outcome', prop: 'outcome = passed' }
  ],
  why: 'User scope, because "has never" is a property of the person across all their sessions. Session scope would only tell you which individual visits lacked the event, which is a different and far less useful question. The property filter matters too — a KYC Outcome of "referred" is not a pass.'
},
{
  id: 'deposited-no-play',
  level: 'Scope',
  brief: 'Players who deposited successfully but never launched a game or placed a bet.',
  context: 'Money in, no activity. Almost always a launch or navigation failure rather than a change of heart.',
  scope: 'user', window: '7d',
  rows: [
    { op: 'did', event: 'Deposit Outcome', prop: 'outcome = success' },
    { op: 'didnot', event: 'Game Launched' },
    { op: 'didnot', event: 'Bet Placed' }
  ],
  why: 'Two negatives, because a dual-product operator lets a player do either. Miss one and you quietly include every sports bettor in your "did not play" segment. User scope with a multi-day window, since the player may return to play later.'
},
{
  id: 'error-support',
  level: 'Sequence',
  brief: 'Sessions where the player hit a JavaScript error and then contacted support within the visit.',
  context: 'Converts an engineering defect list into a cost-to-serve number.',
  scope: 'session', window: 'session',
  rows: [
    { op: 'did', event: 'JavaScript Error' },
    { op: 'then', event: 'Support Contact Initiated' }
  ],
  why: 'Order carries the causal claim. Contact-then-error is someone reporting a different problem; error-then-contact is the error driving the contact. Multiply this population by the client’s cost per contact and the defect backlog gets prioritised.'
},
{
  id: 'zero-result',
  level: 'Sequence',
  brief: 'Sessions where a lobby search returned no results and the player never went on to launch a game.',
  context: 'Isolating search failure as a cause of a dead session.',
  scope: 'session', window: 'session',
  rows: [
    { op: 'did', event: 'Lobby Search', prop: 'hadZeroResults = true' },
    { op: 'didnot', event: 'Game Launched' }
  ],
  why: 'The property filter is doing the real work — without it you catch every search, including the successful ones. Pair this segment with the list of top zero-result queries and you have both the size of the problem and its cause.'
},
{
  id: 'failed-ftd',
  level: 'Hard',
  brief: 'Players whose first-ever deposit attempt failed.',
  context: 'The single most expensive failure in the funnel: acquisition cost already spent, nothing to show.',
  scope: 'user', window: '30d',
  rows: [
    { op: 'did', event: 'Deposit Outcome', prop: 'outcome = failed' },
    { op: 'did', event: 'Deposit Outcome', prop: 'isFirstDeposit = true' }
  ],
  why: 'Both filters are needed, and they describe the same event. If your tool cannot express two filters on one event row, that is exactly when you ask the client to send a combined property instead. Size this in players multiplied by their CPA and it stops being a UX conversation.'
},
{
  id: 'betslip-abandon',
  level: 'Hard',
  brief: 'Sessions where an in-play selection was added to the betslip but no bet was placed.',
  context: 'Sportsbook’s equivalent of cart abandonment, restricted to the time-critical population.',
  scope: 'session', window: 'session',
  rows: [
    { op: 'did', event: 'Selection Added' },
    { op: 'didnot', event: 'Bet Placed', prop: 'isInPlay = true' }
  ],
  why: 'In-play and pre-match are different products with different time pressure, so they are never analysed together. The filter belongs on the outcome you are measuring. Blending them produces a number that is wrong for both populations and actionable for neither.'
}
];
