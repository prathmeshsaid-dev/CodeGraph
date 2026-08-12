# 🧠 CodeGraph — Problem Statement

> **An AI-powered Developer Onboarding Copilot that transforms how developers understand and navigate unfamiliar codebases.**

---

## 📌 Overview

CodeGraph is a full-stack web application that allows developers to paste any public GitHub repository URL and instantly receive an interactive, AI-augmented visualization of the codebase — including its structure, dependencies, language breakdown, and on-demand AI chat for deep code understanding.

---

## 🔍 The Problem

### Developer Onboarding is Broken

Every developer has faced this scenario: you join a new team, get handed a GitHub link, and are expected to contribute within days — sometimes hours. The reality is far more painful:

- 📁 **Large codebases are overwhelming.** Repositories can contain hundreds of files across deeply nested directories with no obvious starting point.
- 🧩 **Documentation is sparse or outdated.** README files rarely reflect the current state of the project, and inline comments are inconsistent.
- 🕰️ **Onboarding takes too long.** Studies estimate that developers spend **weeks** ramping up on a new codebase, which directly impacts team productivity.
- 🔗 **Dependency chaos is real.** Modern projects pull in dozens or hundreds of third-party libraries. Understanding why they exist and how they fit together is non-trivial.
- 💬 **Asking teammates is disruptive.** New developers hesitate to ask "obvious" questions repeatedly, and senior developers lose valuable focus time answering them.
- 🌐 **Open-source contribution has a high barrier.** Millions of developers want to contribute to open-source but cannot understand the codebase quickly enough to get started.

### Existing Tools Fall Short

| Tool | Limitation |
|---|---|
| GitHub's built-in file browser | No intelligence; purely static navigation |
| IDEs (VS Code, IntelliJ) | Requires cloning the repo locally; no AI context |
| Static documentation generators | Manual effort; often outdated |
| Generic LLMs (ChatGPT, etc.) | No real-time repo access; hallucinate file structures |
| Code search tools (Sourcegraph) | Requires indexing; no natural language interface |

None of these tools combine **live repository retrieval**, **interactive visualization**, and **context-aware AI Q&A** in a single, accessible interface.

---

## 💡 The Solution — CodeGraph

CodeGraph bridges the gap between raw code and human understanding by providing:

### 1. 🗺️ Interactive Architecture Graph
- Visualizes the entire repository file tree as an interactive force-directed graph using **React Force Graph**.
- Nodes represent files and folders; edges represent hierarchical relationships.
- Supports zoom, pan, and node-click file preview.
- Exports graph snapshots as PNG images for documentation and sharing.

### 2. 🤖 AI Chat Copilot (Agentic RAG)
- Powered by **Anthropic Claude** (with fallback support for **NVIDIA NIM / LLaMA 3.1** and **OpenRouter**).
- Uses a **two-step Retrieval-Augmented Generation (RAG)** pipeline:
  1. **Retrieval Agent**: Identifies the most relevant files from the repo tree based on the user's question.
  2. **Answer Generation**: Fetches those file contents from GitHub in real time and generates a precise, cited answer.
- Supports both **Beginner** and **Developer** explanation modes.

### 3. 📊 Repository Statistics & Language Insights
- Displays file count, folder count, primary languages, star/fork counts, and repository description.
- Visualizes language distribution as an interactive pie chart (Chart.js).

### 4. 🔗 Dependency Analyzer
- Parses standard manifest files (`package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Pipfile`, `pyproject.toml`) and extracts all project dependencies.

### 5. 🎓 Personalized Learning Paths
- Generates structured, step-by-step learning paths tailored to the user's skill level (Beginner / Intermediate / Advanced).
- Recommends specific files and estimated reading times per stage.

### 6. 🧮 NVIDIA-Powered Math Computation Engine
- Bonus feature integrating **NVIDIA NIM (LLaMA 3.1)** for natural-language math query interpretation.
- Performs symbolic computation via **SymPy** (simplify, solve, differentiate, integrate, limits).

### 7. 🎨 Premium, Accessible UI/UX
- Dark/Light theme toggle with localStorage persistence and system preference detection.
- Glassmorphism design with animated backgrounds and micro-interactions.
- Repository history dropdown for quick re-access to previously analyzed repos.
- Demo repository quick-fill buttons for popular open-source projects.

---

## 🏗️ Technical Architecture

```
+-----------------------------------------------------+
|                   USER BROWSER                      |
|                                                     |
|  +--------------+  +---------------+  +----------+ |
|  |  Graph View  |  |   Chat Panel  |  | Sidebar  | |
|  | (react-force-|  |  (AI Q&A +    |  |(Stats,   | |
|  |  graph)      |  |   RAG output) |  | Deps,    | |
|  +--------------+  +---------------+  | Learning)| |
|         React.js + Vite Frontend      +----------+ |
+---------------------------+--------------------------+
                            | HTTP (Axios)
                            v
+-----------------------------------------------------+
|              PYTHON / FLASK BACKEND                 |
|                                                     |
|  /analyze    -> GitHub API -> File tree + stats     |
|  /ask        -> Agentic RAG -> Claude / NVIDIA / OR |
|  /file       -> GitHub API -> File content fetch    |
|  /dependencies -> Manifest parsing                  |
|  /learning-path -> Structured study plan            |
|  /code-quality  -> Static analysis + AI insights   |
|  /compute    -> SymPy + NVIDIA NIM math engine      |
+---------------------------+--------------------------+
              +-------------+-------------+
              v                           v
   +------------------+     +-----------------------+
   |   GitHub REST    |     |   AI / LLM Providers  |
   |   API (PyGithub) |     |  - Anthropic Claude   |
   |                  |     |  - NVIDIA NIM (LLaMA) |
   +------------------+     |  - OpenRouter         |
                            +-----------------------+
```

### Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js (Vite), CSS Custom Properties, Lucide Icons, Chart.js, react-force-graph |
| **Backend** | Python, Flask, Flask-CORS |
| **GitHub Integration** | PyGithub, GitHub REST API v3 |
| **AI / LLM** | Anthropic Claude 3 Haiku, NVIDIA NIM (LLaMA 3.1 70B), OpenRouter |
| **Math Engine** | SymPy (symbolic computation) |
| **HTTP Client** | Axios (frontend), Requests (backend) |
| **Storage** | Browser localStorage (theme, history) — no database required |

---

## 🎯 Target Users

| User Group | Pain Point Solved |
|---|---|
| **New developers joining a team** | Rapid codebase orientation without relying on teammates |
| **Open-source contributors** | Lower barrier to understanding unfamiliar projects |
| **Engineering managers / tech leads** | Quick audits of third-party or inherited codebases |
| **Code reviewers** | Contextual understanding of a PR's surrounding architecture |
| **Students & bootcamp learners** | Learning by exploring real-world production code |

---

## 📈 Impact & Future Scope

### Current Impact
- Reduces developer onboarding time from **hours/days to minutes**.
- Enables contributions to unfamiliar open-source repositories with **minimal ramp-up**.
- Makes code exploration accessible to developers of **all skill levels**.

### Future Roadmap
- 🔒 **Private repository support** (OAuth-based GitHub authentication)
- 🧩 **IDE Plugin** (VS Code extension)
- 📝 **Automatic documentation generation** from codebase analysis
- 🔍 **Vector search / semantic code search** (embeddings-based RAG upgrade)
- 🌐 **Multi-repository analysis** for comparing or linking related projects
- 📱 **Mobile-responsive experience** for on-the-go code exploration
- 🤝 **Team collaboration features** (shared sessions, annotation overlays)

---

## 🏆 Unique Differentiators

> *What makes CodeGraph stand out from everything else?*

1. **Live Repository Access** — Unlike static LLMs, CodeGraph fetches the actual, up-to-date repository content at query time — no hallucinations.
2. **Agentic RAG Pipeline** — The AI first identifies *which files to read*, then reads them, then answers — mimicking how a senior developer would actually research a codebase.
3. **Interactive Visual Graph** — Turns abstract file trees into explorable, beautiful force-directed graphs.
4. **Multi-LLM Flexibility** — Works with Anthropic Claude, NVIDIA NIM, or OpenRouter — no vendor lock-in.
5. **Zero Setup for End Users** — No cloning, no local install, no configuration — just paste a GitHub URL and go.

---

## 🔑 API Dependencies

| Service | Purpose | Required |
|---|---|---|
| GitHub Token | Increased API rate limits | Optional (works without) |
| Anthropic API Key | Claude-powered AI chat | Optional (demo mode available) |
| NVIDIA NIM API Key | LLaMA 3.1 fallback + math engine | Optional |

---

*CodeGraph — Turning codebases into conversations.*
