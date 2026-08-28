# DriftFix Frontend

A React + TypeScript + Vite frontend for managing and tracking Stripe SDK versions across repositories.

## Requirements

- Node.js (v18+)
- Python 3.10+ (with the `driftfix` backend installed)

## Setup

1. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the API bridge:
   ```bash
   # From the frontend directory
   python api_bridge.py
   ```
   The bridge will run on `http://127.0.0.1:8080`.

3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`.

## Architecture

- **React + Vite**: Fast, modern frontend.
- **Tailwind-like Global CSS**: Custom dark mode "hacker" theme with Courier New.
- **API Bridge**: A FastAPI server (`api_bridge.py`) that imports the driftfix workflows from the backend and exposes them via HTTP for the frontend to consume.
- **Local Storage**: Repository tracking and history logs are stored in `localStorage` for simplicity.
