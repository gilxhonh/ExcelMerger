# Excel Merger

A Node.js + React app to merge two Excel files on any shared column.

## Features
- Upload any two `.xlsx` / `.xls` files
- Pick the join column from a dropdown (auto-detects common columns)
- Choose merge type: Left Join or Outer Join
- Select exactly which columns to bring over from File 2
- Downloads the merged `.xlsx` instantly

## Project Structure
```
excel-merger/
├── server/         # Express backend (port 4000)
│   └── index.js
└── client/         # React + Vite frontend (port 3000)
    └── src/
```

## Setup & Run

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Start the server

```bash
cd server
npm run dev       # uses nodemon for hot reload
# or
npm start
```

### 3. Start the client

```bash
cd client
npm run dev
```

### 4. Open the app

Visit **http://localhost:3000**

> The client proxies `/api` requests to `http://localhost:4000` automatically.

## Build for production

```bash
cd client
npm run build
```

Then serve the `dist/` folder from the Express server (or any static host).
