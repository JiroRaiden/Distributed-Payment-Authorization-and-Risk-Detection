# Phase 2 - Express Server Skeleton

## Goal Of This Phase

In this phase, we built the smallest working version of our backend server using Node.js and Express.

The goal was not to build fraud detection yet. The goal was to prove that our backend can:

- start successfully
- listen on a port
- respond to a basic API request
- receive JSON data from a client
- send JSON data back as a response

This phase is the foundation for all future backend features.

In later phases, this same Express server will connect to Prisma, PostgreSQL, fraud rules, Socket.io, the Python ML service, and the OpenAI explainer.

## Why We Need Express

Node.js lets us run JavaScript outside the browser.

But plain Node.js does not give us a simple beginner-friendly way to create API routes like `/health` or `/transactions`.

Express is a backend framework for Node.js that makes it easier to:

- create routes
- handle requests
- send responses
- read JSON data
- organize backend logic

Simple analogy:

The backend is like a bank branch.

Express is like the receptionist system. It receives visitors, checks what they are asking for, sends them to the correct counter, and gives back a response.

In our project:

- the frontend is the customer
- Express is the receptionist
- a route is a counter
- the response is what the backend sends back

## Installing Express

We installed Express inside the `backend` folder:

```powershell
npm install express
```

We installed it inside `backend` because `backend/package.json` is the dependency list for the backend project.

After installation:

- `express` was added to `dependencies`
- `node_modules` stored the installed package files
- `package-lock.json` recorded the exact installed versions

Important point:

Installing a package makes it available to the project, but a file still needs to import it before using it.

## The `src` Folder

We created a `src` folder inside `backend`.

`src` means source code.

This folder is where our actual backend application code lives.

Configuration files like `package.json`, `.env`, and Prisma files are important, but they are not the main application logic.

Our backend source code starts in:

```text
backend/src/server.js
```

Simple analogy:

- `package.json` is like the project timetable
- `.env` is like a private locker note
- `prisma` is like the database blueprint folder
- `src` is like the notebook where we write application code

## The `server.js` File

We created:

```text
backend/src/server.js
```

This file is the entry point of the backend.

An entry point is the file Node.js runs first when starting the backend server.

In our project, `server.js`:

- imports Express
- creates the Express app
- enables JSON parsing
- defines routes
- starts the server on port `5000`

Simple analogy:

If the backend is a bank branch, `server.js` is the person who opens the branch in the morning, turns on the lights, opens the front door, and prepares the receptionist desk.

## Final `server.js` Code

```js
import express from "express";

const app = express();

app.use(express.json()); // Teach Express to read JSON data sent in request bodies.

const PORT = 5000; // Store the backend door number in one place so it is easy to change later.

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/echo", (req, res) => {
  res.json(req.body);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

## Line By Line Explanation

```js
import express from "express";
```

This imports the Express library into this file.

We installed Express with npm, but this line says: "I want to use Express inside `server.js`."

Without this line, JavaScript would not know what `express` means.

```js
const app = express();
```

This creates an Express application object.

We store it in the variable `app`.

The `app` object is where we register routes and server settings.

Examples:

- `app.get(...)`
- `app.post(...)`
- `app.use(...)`
- `app.listen(...)`

```js
app.use(express.json());
```

This adds JSON middleware.

Middleware is code that runs before route handlers.

`express.json()` teaches Express how to read JSON data sent in a request body.

After Express reads the JSON body, it stores the parsed result in:

```js
req.body
```

This will become very important when the frontend sends transaction data to the backend.

Example future transaction body:

```json
{
  "amount": 5000,
  "merchant": "Amazon"
}
```

With `express.json()`, we can read that later using:

```js
req.body.amount
req.body.merchant
```

```js
const PORT = 5000;
```

This stores the port number in a variable.

A port is like a door number on your computer.

Different services can use different ports:

- React frontend may use port `3000`
- Express backend uses port `5000`
- PostgreSQL usually uses port `5432`

Using a variable makes it easier to change the port later.

```js
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});
```

This creates a GET route.

`GET` means the client is asking for information.

`/health` is the route path.

When someone visits:

```text
http://localhost:5000/health
```

the backend responds with:

```json
{
  "status": "ok"
}
```

This route is called a health check route.

It helps us confirm the server is alive and responding.

```js
app.post("/echo", (req, res) => {
  res.json(req.body);
});
```

This creates a POST route.

`POST` means the client is sending data to the backend.

The `/echo` route receives JSON data and sends the same JSON data back.

This route is only for learning and testing.

It proves that:

- the backend can receive JSON
- `express.json()` is working
- the parsed data is available in `req.body`
- the backend can return JSON responses

```js
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

This starts the server.

`app.listen(PORT, ...)` tells Express to listen for requests on port `5000`.

The `console.log(...)` message prints after the server starts.

The backticks create a JavaScript template literal.

This part:

```js
${PORT}
```

inserts the value of the `PORT` variable into the text.

So the terminal prints:

```text
Server is running on http://localhost:5000
```

## GET Vs POST

GET and POST are HTTP methods.

They tell the backend what kind of action the client wants.

### GET

GET is used when the client wants to request or read data.

Example:

```text
GET /health
```

Meaning:

"Server, please tell me if you are running."

### POST

POST is used when the client wants to send data to the backend.

Example:

```text
POST /echo
```

Meaning:

"Server, here is some data. Please process it."

In our fraud dashboard, future transaction creation will likely use POST because the frontend will send transaction details to the backend.

## Testing The Health Route

We started the backend with:

```powershell
npm run dev
```

Then we opened this in the browser:

```text
http://localhost:5000/health
```

The browser showed:

```json
{"status":"ok"}
```

This proved that:

- the server started correctly
- the `/health` route exists
- Express can send JSON responses
- the browser can reach the backend

## Testing The Echo Route

The browser address bar is good for simple GET requests.

But `/echo` is a POST route, and POST requests need a request body.

So we tested it using PowerShell:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/echo" -Method POST -ContentType "application/json" -Body '{"amount":5000, "merchant":"amazon"}'
```

PowerShell returned:

```text
amount merchant
------ --------
  5000 amazon
```

This proved that:

- PowerShell sent JSON to the backend
- Express received the request
- `express.json()` parsed the JSON request body
- the parsed data was stored in `req.body`
- `res.json(req.body)` sent the same data back

## Important Debugging Lessons

### 1. A File Must Be Saved Before Node Runs The New Code

At one point, the server did not show output because the file had not been saved.

Node.js runs the saved file on disk, not unsaved text inside the editor.

Lesson:

Always save the file before running the server.

### 2. `server.js` Must Be A File, Not A Folder

At one point, `server.js` was accidentally created as a folder.

That caused Notepad to show a permission/opening problem because it was trying to open a folder as if it were a file.

Correct structure:

```text
backend/
  src/
    server.js
```

### 3. Local Development Uses HTTP, Not HTTPS

Our local server runs at:

```text
http://localhost:5000
```

not:

```text
https://localhost:5000
```

HTTPS usually requires certificate setup and is often handled during deployment.

For local learning and development, HTTP is normal.

## NPM Dev Script

We added a script in `backend/package.json`:

```json
"scripts": {
  "dev": "node src/server.js"
}
```

This means:

```powershell
npm run dev
```

runs:

```powershell
node src/server.js
```

Why this is useful:

- easier to remember
- standard command for starting the backend
- future changes can be hidden behind the same command
- other developers can run the project without guessing the entry file

Simple analogy:

`node src/server.js` is like dialing a full phone number.

`npm run dev` is like saving that number as a contact name.

## What We Built In Phase 2

By the end of this phase, we built:

- a backend source folder
- a `server.js` entry file
- an Express app
- JSON request body parsing
- a health check route
- a test POST route
- an npm dev script
- manual testing using browser and PowerShell

## Current Backend Routes

### `GET /health`

Purpose:

Check if the server is running.

Response:

```json
{
  "status": "ok"
}
```

### `POST /echo`

Purpose:

Test whether the backend can receive JSON request bodies.

Example request body:

```json
{
  "amount": 5000,
  "merchant": "amazon"
}
```

Response:

```json
{
  "amount": 5000,
  "merchant": "amazon"
}
```

## How This Fits The Big Project

The fraud detection dashboard will need many backend features later:

- receive transactions from the frontend
- save transactions in PostgreSQL using Prisma
- run fraud detection rules
- call a Python ML microservice
- send live updates using Socket.io
- ask OpenAI to explain suspicious transactions

All of those future features need one basic thing first:

An Express server that can receive requests and send responses.

That is what Phase 2 created.

## Interview Talking Points

### Why did you start with a health check route?

I started with a health check route because it proves the backend server is running and can return JSON before adding database or fraud logic.

### Why did you use Express?

Express gives Node.js a simple way to create HTTP API routes, handle requests, and send responses.

### What does `express.json()` do?

`express.json()` parses incoming JSON request bodies and makes the parsed data available on `req.body`.

### What is the difference between GET and POST?

GET is used to request data from the server.

POST is used to send data to the server, usually inside the request body.

### Why use `npm run dev`?

`npm run dev` is a standard shortcut that starts the backend using the command stored in `package.json`.

## Phase 2 Completion Checklist

- Express installed
- `backend/src` folder created
- `backend/src/server.js` created
- Express app created
- JSON middleware added
- Port `5000` configured
- `GET /health` route working
- `POST /echo` route working
- `npm run dev` working
- Browser test completed
- PowerShell POST test completed
- Phase 2 documentation written

## Final Phase 2 Summary

Phase 2 created the basic Express backend skeleton.

The backend can now start, listen on port `5000`, respond to a health check, and receive JSON data through a POST request.

This prepares the project for the next phase, where we can begin connecting real transaction routes to the database and fraud detection logic.
