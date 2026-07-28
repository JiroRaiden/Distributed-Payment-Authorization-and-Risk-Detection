# Phase 4B - Amount Signal And Basic Decision Rule

## Goal

Add the first real fraud rule to the signal pipeline and make the decision engine respond to triggered signals.

This phase keeps the logic simple and explainable. It does not attempt to build a production-grade fraud model yet.

## Amount Signal Rule

The amount signal now uses a high-value transaction threshold:

```js
const HIGH_AMOUNT_THRESHOLD = 50000;
```

Rule:

```text
If amount is greater than or equal to 50000, trigger the amount signal.
```

Expected behavior:

```text
amount 500    -> triggered: false
amount 75000  -> triggered: true
```

## Why This Rule Was Chosen

This is a simple rule-based baseline for large-value transactions.

In an India/Kolkata-style payment context, smaller retail payments such as 500, 2000, or 10000 can be normal. A transaction of 50000 or more is large enough that the system can reasonably send it for review.

This is not the final fraud policy. In a more advanced version, the system should compare the amount against the user's own historical spending behavior instead of relying only on one global threshold.

## Decimal Handling

The amount is converted with:

```js
const amount = Number(transaction.amount);
```

This matters because Prisma Decimal values can be returned in a string-like form such as:

```json
"500"
```

Converting the amount to a number makes the threshold comparison clear:

```js
amount >= HIGH_AMOUNT_THRESHOLD
```

## Decision Engine Rule

The decision engine now checks whether any fraud signal was triggered:

```js
const hasTriggeredSignal = signals.some((signal) => signal.triggered);
```

Decision rule:

```text
If any signal is triggered, decision is "review".
If no signal is triggered, decision is "approve".
```

This keeps the first decision rule conservative. Suspicious transactions are not automatically blocked yet. They are marked for review.

## Current Response Examples

For a transaction with amount `75000`, the fraud review returns:

```js
{
  decision: "review",
  reason: "One or more fraud signals were triggered"
}
```

The amount signal returns:

```js
{
  signal: "amount",
  triggered: true,
  reason: "Transaction amount is unusually high"
}
```

For a transaction with amount `500`, the fraud review returns:

```js
{
  decision: "approve",
  reason: "No fraud signals were triggered"
}
```

The amount signal returns:

```js
{
  signal: "amount",
  triggered: false,
  reason: "Transaction amount is within the normal review range"
}
```

## Tests Completed

Tested `evaluateAmountSignal(...)` directly in Node:

- `amount: 500` returned `triggered: false`
- `amount: 75000` returned `triggered: true`

Tested `evaluateTransactionRisk(...)` directly in Node:

- `amount: 500` returned `decision: "approve"`
- `amount: 75000` returned `decision: "review"`

Tested through `POST /transactions`:

- `amount: 75000` saved successfully and returned `fraudReview.decision: "review"`
- `amount: 500` saved successfully and returned `fraudReview.decision: "approve"`

## What Is Intentionally Not Done Yet

- No user-specific average spending comparison
- No velocity rule implementation
- No device rule implementation
- No location rule implementation
- No merchant rule implementation
- No automatic block decision
- No fraud review persistence to database yet

## Interview Talking Points

- The project starts with an explainable rule-based baseline.
- High-value transactions are sent for review instead of being automatically blocked.
- The amount signal is isolated in its own service file, so the rule can be improved later without rewriting route code.
- The decision engine combines signal results and converts them into a simple transaction decision.
- A future production version would compare against user history, merchant category, velocity patterns, device trust, and location behavior.
