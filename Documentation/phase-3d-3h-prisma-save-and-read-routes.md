# Phase 3D to 3H - Clean Responses, Prisma Save, and Read Routes

## What We Built

In this phase, we took the transaction API from a validation-only route to a real database-backed route.

The route can now:

- accept a transaction request
- validate required fields
- reject invalid values
- return clean success and error JSON
- save valid transactions into PostgreSQL using Prisma
- fetch the latest transactions
- fetch one transaction by ID
- return `404` when a transaction ID does not exist
- reuse a shared error response helper

## Files Updated

```text
backend/src/server.js
backend/src/routes/transactionRoutes.js
backend/package.json
backend/package-lock.json
backend/src/generated/prisma/
```

## Phase 3D - Clean API Response Shape

Before this phase, the route returned a temporary response that mostly echoed the request body.

We changed the success response into a cleaner API format:

```json
{
  "success": true,
  "message": "Transaction received",
  "data": {
    "transaction": {}
  },
  "meta": {
    "receivedAt": "2026-06-30T15:05:34.916Z"
  }
}
```

We also changed error responses into this shape:

```json
{
  "success": false,
  "error": {
    "message": "Error message here"
  }
}
```

## Why Response Shape Matters

A frontend needs predictable response fields.

If every success response has `success`, `data`, and sometimes `meta`, React can read the response safely.

If every error response has `success: false` and `error.message`, React can display errors consistently.

## Important Bugs Fixed During Clean Response Work

### 1. Misspelled `success`

Incorrect:

```js
succes: true
```

Correct:

```js
success: true
```

JavaScript treats `succes` and `success` as two different property names.

### 2. Boolean vs String

Incorrect:

```js
success: "true"
```

Correct:

```js
success: true
```

`"true"` is text. `true` is a boolean.

### 3. Incorrect Date Syntax

Incorrect:

```js
newDate().toISOString()
```

Correct:

```js
new Date().toISOString()
```

`Date` is a JavaScript constructor, so it must be called with `new Date()`.

### 4. Missing Key Inside `meta`

Incorrect:

```js
meta: {
  new Date().toISOString()
}
```

Correct:

```js
meta: {
  receivedAt: new Date().toISOString()
}
```

Objects need key-value pairs.

### 5. Misspelled `receivedAt`

Incorrect:

```js
recievedAt
```

Correct:

```js
receivedAt
```

If the frontend reads `response.meta.receivedAt` but the backend sends `recievedAt`, the frontend gets `undefined`.

## Phase 3E - Prisma Save Setup

After the response cleanup, we connected the route to Prisma so valid transactions could be saved into PostgreSQL.

The transaction route now imports Prisma Client:

```js
import { PrismaClient } from "../generated/prisma/client.ts";
```

It also imports the PostgreSQL adapter:

```js
import { PrismaPg } from "@prisma/adapter-pg";
```

Then it creates a Prisma Client using the adapter:

```js
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});
```

## Why `dotenv/config` Was Added

We added this at the top of `server.js`:

```js
import "dotenv/config";
```

This loads the `.env` file before route files are imported.

That matters because `transactionRoutes.js` uses:

```js
process.env.DATABASE_URL
```

Without loading `.env`, Prisma would not know how to connect to PostgreSQL.

## Database-Ready Transaction Payload

The route now expects a payload that matches the Prisma `Transaction` model more closely:

```json
{
  "userId": "user_1",
  "amount": 500,
  "timestamp": "2026-06-29T14:00:00.000Z",
  "location": "Kolkata",
  "deviceId": "device_1",
  "merchantName": "amazon"
}
```

## Current Validation Rules

The route validates:

```text
userId is required
userId must be a non-empty string
amount is required
amount must be a number
amount must be greater than 0
timestamp is required
timestamp must be a valid date
location is required
location must be a non-empty string
deviceId is required
deviceId must be a non-empty string
merchantName is required
merchantName must be a non-empty string
```

## Empty String and Whitespace Handling

We noticed that this should not be accepted:

```json
{
  "userId": "",
  "location": "",
  "deviceId": "",
  "merchantName": ""
}
```

An empty string is technically a string, but it has no useful value.

We also reject whitespace-only values like:

```json
{
  "userId": "   "
}
```

That is handled with `.trim()`:

```js
typeof transaction.userId !== "string" || transaction.userId.trim() === ""
```

## Timestamp Validation

The route converts the timestamp string into a JavaScript Date:

```js
const parsedTimestamp = new Date(transaction.timestamp);
```

Then it checks whether the date is valid:

```js
Number.isNaN(parsedTimestamp.getTime())
```

When saving to Prisma, we save:

```js
timestamp: parsedTimestamp
```

not:

```js
timestamp: transaction.timestamp
```

This means the database receives the validated Date value.

## Prisma Create Code

The route saves a transaction with:

```js
const savedTransaction = await prisma.transaction.create({
  data: {
    userId: transaction.userId,
    amount: transaction.amount,
    timestamp: parsedTimestamp,
    location: transaction.location,
    deviceId: transaction.deviceId,
    merchantName: transaction.merchantName,
  },
});
```

The response returns the saved database row:

```js
data: {
  transaction: savedTransaction,
}
```

This is better than returning the raw request body because the saved row includes database-generated fields like `id` and `createdAt`.

## Foreign Key Error Faced

When we first tested saving a transaction, Prisma returned this error:

```text
Foreign key constraint violated on the constraint: Transaction_userId_fkey
```

Prisma error code:

```text
P2003
```

Cause:

The transaction used:

```json
{
  "userId": "user_1"
}
```

but there was no matching user with ID `user_1` in the `User` table.

## How We Fixed The Foreign Key Error

We opened Prisma Studio:

```powershell
npx prisma studio
```

Then we created a `User` row:

```text
id: user_1
email: user_1@gmail.com
```

After saving that user, the transaction save worked.

## Why The Foreign Key Matters

The Prisma schema says:

```prisma
user User @relation(fields: [userId], references: [id])
```

This means every transaction must point to a real user.

A transaction that points to a missing user would be an orphan transaction.

PostgreSQL rejects orphan transactions to protect data integrity.

## Successful Save Result

After creating `user_1`, the POST request returned a saved transaction:

```json
{
  "success": true,
  "message": "Transaction received",
  "data": {
    "transaction": {
      "id": "cmr0s3p0r000108skg7xxjelp",
      "userId": "user_1",
      "amount": "500",
      "timestamp": "2026-06-29T14:00:00.000Z",
      "location": "Kolkata",
      "deviceId": "device_1",
      "merchantName": "amazon",
      "flagged": false,
      "ruleReasons": [],
      "mlScore": null,
      "llmExplanation": null,
      "createdAt": "2026-06-30T15:05:34.827Z"
    }
  }
}
```

The `id` and `createdAt` fields prove the row came from PostgreSQL, not just from the request body.

## Why Amount Comes Back As A String

The response showed:

```json
"amount": "500"
```

This is normal because the Prisma schema uses `Decimal` for `amount`.

Prisma returns Decimal values safely instead of converting them into JavaScript floating-point numbers.

This is good for money-like values because JavaScript numbers can have rounding issues.

## Phase 3F - GET `/transactions`

We added a route to fetch recent transactions:

```http
GET /transactions
```

The route uses:

```js
const transactions = await prisma.transaction.findMany({
  orderBy: {
    createdAt: "desc",
  },
  take: 50,
});
```

This returns the latest 50 transactions, newest first.

## Successful GET `/transactions` Test

The test returned:

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "cmr0spaxi00008oskc2zult6d",
        "userId": "user_1",
        "amount": "500",
        "location": "Kolkata",
        "deviceId": "device_1",
        "merchantName": "amazon"
      }
    ]
  }
}
```

This proved Prisma could read saved transactions from PostgreSQL.

## Phase 3G - GET `/transactions/:id`

We added a detail route:

```http
GET /transactions/:id
```

Example:

```http
GET /transactions/cmr0spaxi00008oskc2zult6d
```

The route uses:

```js
const transaction = await prisma.transaction.findUnique({
  where: {
    id: req.params.id,
  },
});
```

If the transaction exists, it returns:

```json
{
  "success": true,
  "data": {
    "transaction": {}
  }
}
```

If the transaction does not exist, it returns:

```json
{
  "success": false,
  "error": {
    "message": "Transaction not found"
  }
}
```

with HTTP status code `404`.

## Bug Fixed In GET `/transactions/:id`

At first, the route returned a success body with HTTP status `400`:

```js
return res.status(400).json({
  success: true,
  data: {
    transaction,
  },
});
```

That was wrong because `400` means Bad Request.

We fixed it to:

```js
return res.json({
  success: true,
  data: {
    transaction,
  },
});
```

Lesson:

The response body and HTTP status code must agree.

## Phase 3H - Error Response Refactor

The route had repeated error response blocks like:

```js
return res.status(400).json({
  success: false,
  error: {
    message: "userId must be a non-empty string",
  },
});
```

We created a helper function:

```js
function sendError(res, statusCode, message) {
  return res.status(statusCode).json({
    success: false,
    error: {
      message,
    },
  });
}
```

Now validation and catch blocks can use:

```js
return sendError(res, 400, "userId must be a non-empty string");
```

This keeps the route shorter and makes all error responses consistent.

## Current Endpoints

### Health Check

```http
GET /health
```

Returns:

```json
{
  "status": "ok"
}
```

### Create Transaction

```http
POST /transactions
```

Creates and saves one transaction.

### List Transactions

```http
GET /transactions
```

Returns latest 50 transactions, newest first.

### Get Transaction By ID

```http
GET /transactions/:id
```

Returns one transaction by ID.

## Tests Completed

### POST Valid Transaction

Confirmed that a valid transaction saves to PostgreSQL.

### GET All Transactions

Confirmed that saved transactions can be fetched.

### GET Transaction By ID

Confirmed that a real transaction ID returns one transaction.

### GET Fake Transaction ID

Confirmed that a fake ID returns:

```json
{
  "success": false,
  "error": {
    "message": "Transaction not found"
  }
}
```

### Regression Test After Refactor

After adding `sendError`, all routes were tested again and still worked.

This proved the refactor did not change behavior.

## Important Concepts Learned

### 1. API Response Contract

The frontend depends on consistent response fields like `success`, `data`, and `error.message`.

### 2. Prisma Client

Prisma Client lets the Express route talk to PostgreSQL using JavaScript methods instead of raw SQL.

### 3. Prisma Adapter

The PostgreSQL adapter tells Prisma how to connect to the PostgreSQL database.

### 4. Foreign Key Constraint

A transaction cannot reference a user that does not exist.

### 5. `POST` vs `GET`

`POST /transactions` creates data.

`GET /transactions` reads many records.

`GET /transactions/:id` reads one record.

### 6. Refactoring

Refactoring changes code structure without changing behavior.

## Interview Talking Point

A strong explanation:

```text
I built the transaction API step by step. First I cleaned the response shape, then connected Prisma, then handled the foreign key issue by creating a valid parent User row. After that I added read routes for listing transactions and fetching one transaction by ID. Finally, I refactored repeated error responses into a shared helper while confirming the API behavior stayed the same.
```

## Current Status

Phase 3D is complete.

Phase 3E is complete.

Phase 3F is complete.

Phase 3G is complete.

Phase 3H is complete.

Phase 3 overall is about 95-100 percent complete.

## Next Recommended Step

Commit and push the latest backend route and documentation updates.

After that, the next project phase should move toward fraud-signal scaffolding, starting with simple signal files or a decision-engine stub while keeping the actual fraud logic as TODOs for later.
