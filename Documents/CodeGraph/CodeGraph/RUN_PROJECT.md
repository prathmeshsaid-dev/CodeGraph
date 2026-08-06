### Clean Launch Commands for CodeGraph (NVIDIA-powered version)

#### 🚀 Quick Start - Copy & Paste These Commands

**1. Setup Backend:**
```bash
cd "C:\Users\saidp\Documents\CodeGraph\CodeGraph\backend"

# Install/update dependencies
pip install -r requirements.txt

# Verify your .env file contains:
# ANTHROPIC_API_KEY=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
# NVIDIA_API_KEY=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

# Start the backend server
python app.py
```
*Backend will run on: http://localhost:5000*

**2. Setup Frontend (in new terminal):**
```bash
cd "C:\Users\saidp\Documents\CodeGraph\CodeGraph\frontend"

# Install dependencies
npm install

# Start the development server
npm run dev
```
*Frontend will be available at: http://localhost:5173 (Vite default port)*

#### 📝 Verification Steps:
1. Open http://localhost:5173 in your browser
2. Paste a GitHub repo URL (e.g., https://github.com/expressjs/express)
3. Click "Analyze Repo"
4. Test math queries in the chat like:
   - "What is the derivative of x^2 + 3x + 2?"
   - "Solve 2x + 5 = 15"
   - "Calculate time complexity of binary search"

#### 🔧 Troubleshooting:
- **Port already in use?** Backend uses 5000, frontend uses 5173 by default
- **Module not found?** Make sure you ran `pip install -r requirements.txt` in backend
- **API key errors?** Double-check your .env file has both keys correctly
- **CORS issues?** Ensure Flask-CORS is installed (it's in requirements)

#### ✨ Features Ready to Demo:
- 🔍 Instant repo analysis & interactive graph
- 🤖 AI Copilot (powered by your NVIDIA API key) for code questions
- 🧮 Mathematical computation engine (NVIDIA + Sympy) for:
  - Calculus (derivatives, integrals, limits)
  - Algebra (solving, simplifying, factoring)
  - Complexity analysis help
  - Step-by-step solutions with explanations
- 📦 Dependency analyzer
- 📚 Learning path generator
- 🔍 Code quality checker

#### 📁 File Structure Summary:
```
CodeGraph/
├── backend/
│   ├── app.py          # Main Flask server with NVIDIA/Sympy math engine
│   ├── requirements.txt # Python deps (sympy, not wolframalpha)
│   └── .env            # Your API keys (ANTHROPIC + NVIDIA)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ChatPanel.jsx  # Math detection & NVIDIA compute calls
│   │   ├── App.jsx          # Analysis tools UI
│   │   └── index.css        # Updated styling
│   └── package.json         # Frontend deps
└── HACKATHON_ENHANCEMENTS.md # Feature documentation
```

**No Wolfram Alpha code remains in the project - pure NVIDIA API + Sympy implementation!**