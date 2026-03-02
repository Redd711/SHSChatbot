# UPHSL SHS Chatbot

A chatbot web application for the **University of Perpetual Help System Laguna — Senior High School Department** (Jonelta Campus). Built with vanilla HTML/CSS/JS on the frontend and a Vercel serverless function backend powered by Google's Gemini 2.5 Flash API.

## Project Structure

```
Chatbot/
├── index.html          ← Main chat interface
├── css/style.css       ← Styling (light & dark themes)
├── js/script.js        ← Chat logic & API calls
├── assets/logo.png     ← UPHSL SHS logo
├── api/chat.js         ← Vercel serverless function (Gemini AI)
├── vercel.json         ← Vercel configuration
├── package.json        ← Backend dependencies
└── README.md
```

> **One repo, two deployments:** GitHub Pages serves the static files. Vercel serves the API. Each platform picks up only what it needs.

## Setup Guide

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey).
2. Sign in with your Google account.
3. Click **"Create API Key"** and copy it.

### 2. Push to GitHub

1. Create a new GitHub repository (e.g., `uphsl-shs-chatbot`).
2. Push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/uphsl-shs-chatbot.git
   git push -u origin main
   ```

### 3. Deploy the Backend (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **"Add New → Project"** and import your `uphsl-shs-chatbot` repo.
3. Before deploying, add your **Environment Variable**:
   - Key: `GEMINI_API_KEY`
   - Value: *(paste your Gemini API key)*
4. Click **Deploy**.
5. Note your Vercel URL (e.g., `https://uphsl-shs-chatbot.vercel.app`).

### 4. Update the API URL & Deploy Frontend (GitHub Pages)

1. Open `js/script.js` and replace the placeholder on line 4:
   ```javascript
   const API_URL = "https://your-vercel-project.vercel.app/api/chat";
   ```
2. Commit and push the change.
3. Go to your repo on GitHub → **Settings → Pages**.
4. Under "Source," select **Deploy from a branch** → **main** → **/ (root)** → **Save**.
5. Your site will be live at `https://YOUR_USERNAME.github.io/uphsl-shs-chatbot/`.

### 5. Update CORS (Optional but Recommended)

For production, restrict the CORS origin in `api/chat.js`:
```javascript
res.setHeader("Access-Control-Allow-Origin", "https://YOUR_USERNAME.github.io");
```

## Features

- Clean, modern chat interface
- Light/dark theme toggle with persistence
- Typing indicator animation
- Conversation history maintained per session
- Markdown rendering in bot responses
- Responsive design (mobile-friendly)
- Powered by Gemini 2.5 Flash (free tier)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend  | HTML, CSS, JavaScript (vanilla) |
| Backend   | Vercel Serverless Functions (Node.js) |
| AI Model  | Google Gemini 2.5 Flash |
| Frontend Hosting | GitHub Pages |
| Backend Hosting  | Vercel |
