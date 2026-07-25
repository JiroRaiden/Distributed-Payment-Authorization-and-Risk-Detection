# Phase 4A - Fraud Signal Service Structure

## Goal

Create the first fraud detection service structure without adding real fraud thresholds, scoring weights, or final decision rules.

## What Was Added

Created signal modules:

- `amountSignal.js`
- `velocitySignal.js`
- `deviceSignal.js`
- `locationSignal.js`
- `merchantSignal.js`

Created decision engine:

- `decisionEngine.js`

## Current Behavior

Each signal returns:

```js
{
  signal: "signal-name",
  triggered: false,
  reason: "TODO: Define signal-specific fraud rule"
}
```

The decision engine returns:

```js
{
  decision: "review",
  signals,
  reason: "TODO: Define final decision rule"
}
```

## API Integration

`POST /transactions` now saves the transaction and includes a fraud review in the response.

Response data now includes:

```js
data: {
  transaction: savedTransaction,
  fraudReview,
}
```

## Important Design Choice

Fraud logic is separated from route handling.

The route is responsible for HTTP request and response behavior.

The service layer is responsible for fraud evaluation structure.

This keeps the backend easier to test, explain, and extend.

## What Is Intentionally Not Done Yet

- No fraud thresholds
- No scoring weights
- No automatic block or approve rules
- No database persistence for fraud review results yet

These decisions will be designed in later phases.

## Test Completed

Confirmed with `POST /transactions` that:

- transaction saves successfully
- response includes `fraudReview`
- fraud review includes all 5 signal results
- final decision is currently `"review"`

## Interview Talking Points

- The route layer should stay focused on HTTP behavior.
- The service layer can hold business logic such as fraud evaluation.
- Returning signal-level reasons makes the system easier to explain, debug, and show on a dashboard.
- The project currently has fraud evaluation structure, but not final fraud policy.
