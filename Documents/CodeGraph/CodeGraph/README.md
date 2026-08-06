# CodeGraph — Developer Onboarding Copilot

> Analyze any GitHub repository instantly. Visualize the architecture as an interactive graph and chat with an AI that understands the codebase.

![Tech Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Flask-Python-green) ![AI](https://img.shields.io/badge/Claude-AI-purple)

---

## ✨ Features

- **🔍 Instant Repo Analysis** — Paste any public GitHub URL and get the full file tree
- **🌐 Interactive Architecture Graph** — React Flow–powered tree visualization with zoom, pan, minimap, and folder filtering
- **🤖 AI Copilot Chat** — Ask questions about the codebase and get intelligent, context-aware answers (powered by Claude)
- **📊 Repo Stats** — File count, folder count, language detection, and description at a glance
- **🌙 Premium Dark UI** — Glassmorphism, gradient accents, micro-animations, and JetBrains Mono typography

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** and **pip**
- **Node.js 18+** and **npm**

### 1. Clone & Enter

```bash
cd ContextualCopilot
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

**(Optional)** Add API keys in `backend/.env`:

```env
GITHUB_TOKEN=ghp_your_token_here        # Higher rate limits (60/hr without)
ANTHROPIC_API_KEY=sk-ant-your_key_here   # Real AI responses (demo mode without)
```

Start the backend:

```bash
python app.py
```

Backend runs on **http://localhost:5000**

### 3. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on **http://localhost:3000**

### 4. Use It!

1. Open **http://localhost:3000** in your browser
2. Paste a GitHub URL (e.g. `https://github.com/expressjs/express`)
3. Click **Analyze** — watch the architecture graph render
4. Ask the AI Copilot questions about the codebase

---

## 🏗️ Architecture

```
ContextualCopilot/
├── backend/
│   ├── app.py              # Flask server (analyze + ask endpoints)
│   ├── requirements.txt    # Python dependencies
│   └── .env                # API keys (optional)
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main app with hero + workspace views
│   │   ├── index.css       # Complete design system
│   │   ├── components/
│   │   │   ├── GraphView.jsx    # React Flow graph with layout algorithm
│   │   │   ├── ChatPanel.jsx    # AI chat with markdown rendering
│   │   │   ├── StatsBar.jsx     # Animated stats cards
│   │   │   └── CustomNode.jsx   # File-type-aware graph nodes
│   │   └── main.jsx        # Entry point
│   ├── vite.config.js      # Dev server + API proxy
│   └── package.json        # Node dependencies
└── README.md
```

---

## 🎯 Demo Script (2 minutes)

1. **"This is CodeGraph"** — show the landing page
2. **Paste** `https://github.com/expressjs/express` → click Analyze
3. **Pan and zoom** the architecture graph, toggle "Folders Only"
4. **Point out** the stats bar (files, folders, description)
5. **Ask the AI**: "What's the entry point?" → show intelligent response
6. **Ask**: "Explain the folder structure" → show file references
7. **Close**: "It works with any public GitHub repo, live."

---

## 🔑 API Endpoints

| Method | Endpoint   | Body                        | Response                     |
|--------|------------|-----------------------------|------------------------------|
| POST   | `/analyze` | `{ "url": "github_url" }`   | `{ nodes, edges, stats, tree_text }` |
| POST   | `/ask`     | `{ "question": "...", "context": "..." }` | `{ "answer": "..." }` |

---

## 📄 License

MIT — Built for hackathon glory 🏆
# CodeGraph
# CodeGraph
