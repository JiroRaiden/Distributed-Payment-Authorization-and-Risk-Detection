# Phase 0 - Environment Setup

## Goal

Phase 0 is about checking that the computer has the basic tools needed before we start writing project code.

Think of it like checking that a kitchen has electricity, gas, and water before cooking. For this project, the tools are Node.js, npm, PostgreSQL, and environment variables.

## Tools We Checked

### Node.js

Node.js lets JavaScript run outside the browser.

In this project, Node.js will run our backend server. That backend will receive transactions, call fraud logic, save data, and send responses.

Command:

```powershell
node -v
```

Your result:

```powershell
v24.12.0
```

### npm

npm is Node's package manager.

It installs JavaScript libraries such as Express, Prisma, Socket.io, and React tools.

Command:

```powershell
npm -v
```

Your result:

```powershell
11.6.2
```

### PostgreSQL

PostgreSQL is the database.

It will store users, transactions, fraud flags, ML scores, and explanations permanently.

Command:

```powershell
psql --version
```

Your result:

```powershell
psql (PostgreSQL) 18.4
```

## PostgreSQL vs psql

PostgreSQL is the actual database server.

`psql` is a terminal tool used to talk to PostgreSQL.

Analogy:

- PostgreSQL is the bank vault.
- `psql` is one tool that lets us open and inspect the vault.

## PATH Problem We Fixed

At first, PowerShell could not recognize `psql`.

That happened because PostgreSQL was installed on the E drive, but PowerShell did not know where to find `psql.exe`.

We found it here:

```text
E:\PostgreSQL\18\bin\psql.exe
```

The important folder was:

```text
E:\PostgreSQL\18\bin
```

That folder needed to be added to PATH.

PATH is the list of folders PowerShell checks when you type a command.

## Important Command Detail

This worked:

```powershell
psql --version
```

This did not work:

```powershell
psql -v
```

Reason:

For `psql`, `-v` does not mean version. It means "set a variable", so it expects another value after it.

## .env vs .env.example

### .env

`.env` stores real private configuration.

Examples:

```text
DATABASE_URL=postgresql://postgres:real_password@localhost:5432/fraud_dashboard
OPENAI_API_KEY=real_api_key_here
```

This file should not be committed to GitHub.

### .env.example

`.env.example` is a safe blueprint.

It shows what settings the project needs, but it does not contain real secrets.

Example:

```text
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DATABASE_NAME
OPENAI_API_KEY=your_openai_api_key_here
```

Analogy:

- `.env` is your real house key.
- `.env.example` is a picture showing what kind of key is needed.

You can share the picture, but not the real key.

## Phase 0 Checkpoint

These commands should return version numbers:

```powershell
node -v
npm -v
psql --version
```

If all three work, Phase 0 is complete.

## Interview Talking Points

You should be able to say:

```text
I used Node.js for the backend runtime, npm to manage JavaScript dependencies, and PostgreSQL for persistent transaction storage.
```

You should also be able to say:

```text
I keep real secrets in a local .env file and commit only .env.example as documentation for required environment variables.
```

## Next Phase

Phase 1 is Database Schema + Prisma.

In Phase 1, we will define the `User` and `Transaction` tables and teach Prisma how to connect JavaScript code to PostgreSQL.
