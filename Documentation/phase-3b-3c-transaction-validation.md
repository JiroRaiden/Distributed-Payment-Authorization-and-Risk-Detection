# Phase 3B and 3C - Transaction Validation

## What We Built

In this phase, we improved the `POST /transactions` route by adding backend validation.

The route no longer accepts any random JSON blindly. It now checks whether the incoming transaction data is usable before returning a success response.

## File Updated

```text
backend/src/routes/transactionRoutes.js
```

## Why Validation Matters

Validation means checking incoming data before trusting it.

For a fraud detection system, bad input can cause bad results. If invalid transaction data reaches the rule engine, ML model, database, or dashboard, the system may behave incorrectly.

Example of bad data:

```json
{
  "amount": "banana",
  "merchant": "amazon"
}
```

This should be rejected because `amount` must be a number.

## Current Validation Rules

The transaction route now checks:

```text
amount must exist
merchant must exist
amount must be a number
amount must be greater than 0
merchant must be a string
```

## Missing Field Validation

We added a check to reject requests that do not include both `amount` and `merchant`.

Example invalid request:

```json
{
  "merchant": "amazon"
}
```

Example response:

```json
{
  "error": "amount and merchant are required"
}
```

The backend returns HTTP status code `400`, which means Bad Request.

## Amount Type And Value Validation

We added a check to make sure `amount` is a number and greater than `0`.

Example invalid request:

```json
{
  "amount": "banana",
  "merchant": "amazon"
}
```

This is rejected because `amount` is text, not a number.

Example invalid request:

```json
{
  "amount": -1,
  "merchant": "amazon"
}
```

This is rejected because the amount is a number, but it is not greater than `0`.

## Merchant Type Validation

We added a check to make sure `merchant` is text.

Example invalid request:

```json
{
  "amount": 5000,
  "merchant": 123
}
```

This is rejected because merchant names should be strings like `"amazon"`, not numbers.

## Type Validation vs Business Rule Validation

Type validation checks the kind of data.

Example:

```text
amount: "banana"
```

This is a type error because `amount` should be a number, but it is text.

Business rule validation checks whether the value makes sense for the project.

Example:

```text
amount: -1
```

This is a business rule error because `-1` is a number, but a transaction amount should be greater than `0`.

## Tests We Ran

### Missing Amount

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"merchant":"amazon"}'
```

Expected result:

```json
{
  "error": "amount and merchant are required"
}
```

### Missing Merchant

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"amount":5000}'
```

Expected result:

```json
{
  "error": "amount and merchant are required"
}
```

### Amount As Text

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"amount":"banana", "merchant":"amazon"}'
```

Expected result:

```json
{
  "error": "The entered amount should be a number greater than 0"
}
```

### Negative Amount

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"amount":-1, "merchant":"amazon"}'
```

Expected result:

```json
{
  "error": "The entered amount should be a number greater than 0"
}
```

### Merchant As Number

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"amount":5000, "merchant":123}'
```

Expected result:

```json
{
  "error": "merchant name must be a string"
}
```

### Valid Transaction

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"amount":5000, "merchant":"amazon"}'
```

Expected result:

```json
{
  "message": "Transaction received",
  "transaction": {
    "amount": 5000,
    "merchant": "amazon"
  }
}
```

## Important Concepts Learned

### 1. HTTP 400 Means Bad Request

We used status code `400` when the client sent missing or invalid transaction data.

### 2. PowerShell Shows 400 Responses As Errors

`Invoke-RestMethod` displays a red error when the backend returns HTTP `400`.

That does not mean the backend failed. It means the backend correctly rejected a bad request.

### 3. `typeof` Checks Data Type

We used `typeof` to check whether a value is a number or string.

Example:

```js
typeof transaction.amount !== "number"
```

This checks whether `amount` is not a number.

### 4. `||` Means OR

We used `||` when either condition should cause validation to fail.

Example:

```js
typeof transaction.amount !== "number" || transaction.amount <= 0
```

This means the request is invalid if the amount is not a number OR the amount is less than or equal to zero.

### 5. Strict Comparison Is Safer

We used `!==` instead of `!=` because strict comparison avoids JavaScript type conversion surprises.

## Big Picture Connection

This validation protects the future fraud detection pipeline.

Before a transaction reaches PostgreSQL, Prisma, fraud rules, the ML model, Socket.io, or the dashboard, the backend now checks that the transaction data has the correct basic shape.

## Interview Talking Point

A strong interview explanation:

```text
I added backend validation to the transaction API before saving data. The route rejects missing fields, non-numeric amounts, non-positive amounts, and non-string merchant values with HTTP 400 responses. This keeps bad transaction data from reaching the database, rule engine, ML model, or dashboard.
```

## Current Status

Phase 3B and 3C are complete.

Completed:

- Required field validation
- Amount type validation
- Amount value validation
- Merchant type validation
- Manual tests for invalid and valid requests

Next recommended step:

```text
Phase 3D - Clean up response shape and prepare the route for Prisma saving.
```
