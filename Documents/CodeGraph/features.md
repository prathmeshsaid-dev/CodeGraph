# CodeGraph Features

CodeGraph is an AI-powered developer onboarding copilot that helps users understand any GitHub repository quickly. Below is a comprehensive list of features implemented in the application.

## Core Functionality

- **Repository Analysis**: Paste a GitHub URL to instantly analyze the codebase structure, statistics, and insights.
- **Dependency Analysis**: Detect and list project dependencies from various manifest files (package.json, requirements.txt, pom.xml, etc.).
- **Learning Path Generation**: Generate personalized learning paths for different skill levels (beginner, intermediate, advanced) with estimated time and relevant files.
- **Code Quality Analysis**: Analyze code quality metrics, identify strengths, issues, and provide suggestions for improvement.
- **Repository Statistics**: View file count, folder count, primary language, and description of the analyzed repository.

## User Interface & Experience

- **Modern Glassmorphism Design**: Utilizes CSS glassmorphism effects with backdrop blur, semi-transparent cards, and subtle gradients for a sleek, modern look.
- **Dark/Light Theme Toggle**: Seamlessly switch between dark and light themes with persistence via localStorage and system preference detection.
- **Responsive Layout**: Adaptive three-column layout (sidebar, main content, chat panel) that collapses to single column on mobile devices.
- **Interactive Architecture Graph**: Visualize repository structure using react-force-graph with node expansion, file preview, and dependency connections.
- **AI Chat Panel**: Chat with an AI assistant that has context of the repository tree and can answer questions about the codebase.
- **File Viewer**: View contents of any file in the repository with syntax highlighting and a clean modal interface.
- **Statistics Bar**: Visual cards displaying key repository metrics (files, folders, language, description) with icons and gradients.
- **Repository History**: Track recently analyzed repositories with quick re-access via dropdown menu.
- **Demo Repositories**: Quick-fill buttons for popular open-source projects and a random repo button for exploration.
- **Smooth Animations & Micro-interactions**: Pulse effects on buttons, spin indicators, typing animations, fade-in sections, and hover transitions.

## Technical Implementation

- **React.js Frontend**: Built with functional components, hooks (useState, useEffect), and modern React patterns.
- **CSS Custom Properties**: Comprehensive design system using CSS variables for colors, spacing, gradients, shadows, and transitions.
- **Gradient Backgrounds**: Animated mesh background and gradient-text effects using CSS gradients.
- **Lucide Icons**: Consistent, lightweight icon set for UI elements.
- **Axios HTTP Client**: For communicating with the backend API endpoints.
- **LocalStorage Persistence**: Saves theme preference, repository history, and other user settings.
- **Responsive Breakpoints**: Optimized layouts for widths >1400px, 1024px, and 768px.
- **Accessibility Considerations**: Proper color contrast, focus states, and ARIA-friendly interactions.

## Backend API Endpoints (integrated)

- `POST /api/analyze` – Main repository analysis
- `POST /api/dependencies` – Dependency extraction
- `POST /api/learning-path` – Personalized learning path generation
- `POST /api/code-quality` – Code quality assessment

## Customization & Extensibility

- **Easy Theme Modification**: Adjust design tokens in `:root` and `.light-theme` sections of index.css.
- **Component-Based Architecture**: UI broken into reusable components (Header, GraphView, ChatPanel, StatsBar, LanguageStats, FileViewer).
- **Placeholder System**: Graceful loading and error states for asynchronous operations.
- **Modular Styling**: Utility classes like `.glass-card`, `.tab-button`, `.tool-btn` for consistent styling.

## Performance & Optimization

- **Debounced Input**: Efficient handling of user input in repository URL field.
- **Selective Re-renders**: React hooks and memoization where appropriate.
- **Optimized Animations**: GPU-accelerated CSS transitions and transforms.
- **Lazy Loading Concepts**: Components render only when needed (conditional rendering based on state).

## Security & Privacy

- **Client-Side Processing**: No repository data is stored permanently; analysis results are held in memory and cleared on new analysis.
- **Local Storage Limits**: Only stores non-sensitive UI preferences and history.
- **Safe API Calls**: Uses axios with error handling and loading states.

---
*Features.md generated to document the current capabilities of CodeGraph.*