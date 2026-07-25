# Phase 3A - Transaction Route Structure

## What We Built

In this phase, we created the first real transaction API route for the Fraud Detection Dashboard.

We added a separate route file so transaction-related backend logic does not stay inside `server.js` forever.

## Files Created Or Updated

Created:

```text
backend/src/routes/transactionRoutes.js
```

Updated:

```text
backend/src/server.js
```

## Final Folder Structure

```text
backend/
  src/
    server.js
    routes/
      transactionRoutes.js
```

## New API Route

```text
POST /transactions
```

This route receives transaction JSON from the client and returns a temporary confirmation response.

Example request body:

```json
{
  "amount": 5000,
  "merchant": "amazon"
}
```

Example response:

```json
{
  "message": "Transaction received",
  "transaction": {
    "amount": 5000,
    "merchant": "amazon"
  }
}
```

## Why We Created A Separate Route File

At first, it is possible to keep all routes inside `server.js`.

But as the backend grows, `server.js` would become crowded with many different route types, such as transactions, users, fraud scoring, AI explanations, and dashboard data.

So we separated transaction routes into their own file:

```text
transactionRoutes.js
```

This keeps the backend easier to read, debug, and expand.

## Important Concepts Learned

### 1. `server.js` is the main entry point

`server.js` starts the Express app, adds middleware, connects route files, and starts the server with `app.listen()`.

### 2. `transactionRoutes.js` handles transaction-specific routes

This file is responsible for transaction-related API logic.

Right now, it only handles:

```text
POST /transactions
```

Later, it can also handle routes like:

```text
GET /transactions
GET /transactions/:id
```

### 3. `express.Router()` creates a mini route manager

Instead of putting every route directly on `app`, we created a router:

```js
const router = express.Router();
```

This router groups transaction routes together.

### 4. `export default router` shares the router

At the bottom of `transactionRoutes.js`, we exported the router so `server.js` can import and use it.

### 5. `app.use("/transactions", transactionRoutes)` mounts the router

This line tells Express:

```text
Any request starting with /transactions should go to transactionRoutes.js
```

Because the route file has:

```js
router.post("/", ...)
```

and `server.js` mounts it at:

```js
app.use("/transactions", transactionRoutes);
```

the final route becomes:

```text
POST /transactions
```

## Test We Ran

We started the backend:

```powershell
npm run dev
```

Then we tested the transaction route in a second PowerShell window:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/transactions" -Method POST -ContentType "application/json" -Body '{"amount":5000,"merchant":"amazon"}'
```

The backend successfully returned:

```text
Transaction received
amount = 5000
merchant = amazon
```

## Why We Used A Second PowerShell Window

The first PowerShell window was busy running the server.

The second PowerShell window acted like a client sending a request to the backend.

This helped us test the backend manually before connecting it to a frontend or database logic.

## Big Picture Connection

This route is the future transaction intake point for the Fraud Detection Dashboard.

Later, this same route will:

1. receive transaction data
2. validate the data
3. save the transaction to PostgreSQL using Prisma
4. run fraud detection rules
5. send real-time updates with Socket.io
6. call the ML microservice
7. request an AI explanation for suspicious transactions

## Interview Talking Point

A strong interview explanation:

```text
I created a separate transaction router using express.Router() and mounted it at /transactions. This kept server.js focused on app setup while transactionRoutes.js handled transaction-specific API logic. I first tested the route with a temporary response before adding database logic, so I could verify the API contract independently.
```

## Current Status

Phase 3A is complete.

Completed:

- Created transaction route file
- Added `POST /transactions`
- Connected the route file to `server.js`
- Tested the route with PowerShell
- Confirmed the backend receives transaction JSON successfully

Next recommended step:

```text
Phase 3B - Decide whether to add basic validation first or connect POST /transactions to Prisma and PostgreSQL.
```
