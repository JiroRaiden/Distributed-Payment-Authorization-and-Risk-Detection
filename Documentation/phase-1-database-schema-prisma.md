# Phase 1 - Database Schema + Prisma

## Goal

Phase 1 creates the database structure for the Fraud Detection Dashboard using Prisma and PostgreSQL.

Think of the database like a filing cabinet. The schema decides which drawers exist and what kind of records each drawer can store.

## What We Built

We created the backend Node project and initialized Prisma.

Important files and folders:

```text
backend/package.json
backend/package-lock.json
backend/node_modules/
backend/.env
backend/.env.example
backend/.gitignore
backend/prisma/schema.prisma
backend/prisma.config.ts
backend/prisma/migrations/
```

## package.json

`package.json` is the identity card for the backend Node project.

It records project settings, scripts, and dependencies.

We changed:

```json
"type": "module"
```

This tells Node.js to use modern ES Module syntax, such as:

```js
import express from "express";
```

instead of CommonJS syntax:

```js
const express = require("express");
```

## Prisma Packages

We installed:

```powershell
npm install prisma @prisma/client
```

`prisma` is the developer tool used for commands like migrations.

`@prisma/client` is the runtime library the backend will use later to query the database.

Analogy:

- `prisma` is the construction crew that builds or updates the database.
- `@prisma/client` is the clerk the app uses every day to read and write records.

## npx

We used:

```powershell
npx prisma init
```

`npx` runs a tool installed in the current Node project.

We use `npx` for Prisma because Prisma is an npm package.

We do not use `npx` for PostgreSQL tools like `createdb` because those come from PostgreSQL, not npm.

## .env and .env.example

`.env` contains the real private database connection string.

It should not be committed to GitHub.

`.env.example` is a safe template that documents which variables the project needs.

Example:

```text
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME"
```

We created the real PostgreSQL database:

```powershell
createdb -U postgres fraud_dashboard
```

`-U postgres` means connect as the PostgreSQL user named `postgres`.

## prisma.config.ts

This file tells Prisma where the schema is and how to load the database URL.

Important line:

```ts
import "dotenv/config";
```

This loads variables from `.env`.

Important config:

```ts
schema: "prisma/schema.prisma"
```

This tells Prisma where the schema file lives.

```ts
url: process.env["DATABASE_URL"]
```

This tells Prisma to read the database connection string from the environment instead of hardcoding it.

## schema.prisma

`schema.prisma` is the database blueprint.

It defines:

- tables
- fields
- data types
- relationships
- constraints

## User Model

```prisma
model User {
  id           String        @id @default(cuid())
  email        String        @unique
  createdAt    DateTime      @default(now())
  transactions Transaction[]
}
```

Meaning:

- `id` uniquely identifies each user.
- `@id` marks the primary key.
- `@default(cuid())` automatically creates a unique text ID.
- `email String @unique` prevents duplicate emails.
- `createdAt DateTime @default(now())` records when the user was created.
- `transactions Transaction[]` means one user can have many transactions.

## Transaction Model

```prisma
model Transaction {
  id             String   @id @default(cuid())
  userId         String
  amount         Decimal
  timestamp      DateTime
  location       String
  deviceId       String
  merchantName   String
  flagged        Boolean  @default(false)
  ruleReasons    String[]
  mlScore        Float?
  llmExplanation String?
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

Meaning:

- `id` uniquely identifies each transaction.
- `userId` links the transaction to a user.
- `amount Decimal` stores money more safely than `Float`.
- `timestamp` stores when the transaction happened.
- `location` stores where it happened.
- `deviceId` stores which device was used.
- `merchantName` stores who received the money.
- `flagged Boolean @default(false)` starts transactions as not flagged.
- `ruleReasons String[]` stores which fraud rules fired.
- `mlScore Float?` stores an optional ML anomaly score.
- `llmExplanation String?` stores an optional AI explanation.
- `createdAt DateTime @default(now())` records when our system saved the transaction.

## Decimal for Money

We chose `Decimal` for `amount` instead of `Float`.

Reason:

Money should avoid floating-point precision issues.

Interview wording:

```text
I used Decimal for transaction amounts because financial data should avoid floating-point rounding errors.
```

## Foreign Key Relationship

This line connects transactions to users:

```prisma
user User @relation(fields: [userId], references: [id])
```

Meaning:

```text
Transaction.userId points to User.id
```

This prevents orphan transactions.

An orphan transaction would be a transaction that points to a user that does not exist.

## Migration

We ran:

```powershell
npx prisma migrate dev --name init
```

A migration turns the Prisma schema into real PostgreSQL tables.

Analogy:

- `schema.prisma` is the blueprint.
- `migration.sql` is the construction instruction sheet.
- PostgreSQL is where the structure is built.

Prisma created:

```text
prisma/migrations/20260628112642_init/migration.sql
```

The migration created:

- `User` table
- `Transaction` table
- unique email index
- foreign key from `Transaction.userId` to `User.id`

## Prisma Studio

We ran:

```powershell
npx prisma studio
```

Prisma Studio opened a visual database viewer.

We confirmed these tables exist:

```text
_prisma_migrations
Transaction
User
```

`_prisma_migrations` is Prisma's internal table for tracking which migrations have already run.

## Phase 1 Checkpoint

Phase 1 is complete when:

```powershell
npx prisma studio
```

shows:

```text
User
Transaction
```

Your Prisma Studio showed both tables, so Phase 1 is complete.

## Interview Talking Points

You should be able to say:

```text
I used Prisma to define my PostgreSQL database schema with User and Transaction models.
```

You should be able to say:

```text
Each transaction has a userId foreign key pointing to User.id, which prevents orphan transactions.
```

You should be able to say:

```text
I used Decimal for money values because financial systems should avoid floating-point precision errors.
```

You should be able to say:

```text
I used Prisma migrations so database schema changes are tracked and reproducible.
```

## Next Phase

Phase 2 is Express Server Skeleton.

In Phase 2, we will create the backend server and basic routes so HTTP requests can reach our application.
