# Replit/Config Migration

This project was originally set up for Replit, which used `replit.md` and `.replit` for configuration and instructions. All configuration is now managed in `.config` for consistency across all platforms.

**If you are using Replit:**
- The main entry point is `npm run dev`.
- The project uses Node.js 20, PostgreSQL 16, and a web server.
- Environment variables and workflow are set in `.config`.
- To start the app, use the Run button or run `npm run dev` in the shell.
- For deployment, use the build and run commands in `.config`.

**For all other platforms:**



# Extension System & Remote Registry

Supacoda features a professional, extensible extension system supporting language, ML, and NLP extensions. Extensions are auto-discovered and loaded at startup, and the IDE can fetch new or updated extensions from a remote registry.

- **Remote Extension Registry:**
  - On startup, Supacoda fetches available extensions from a remote registry (`client/src/extensions/remoteRegistry.ts`).
  - New extensions are auto-installed and activated if not already present locally.
  - The system falls back to local simulated extensions if the remote registry is unavailable.
  - Extensions can be updated or added dynamically without redeploying the IDE.
- **How to Add Extensions:**
  - Add new language or tool modules to `client/src/extensions/languages/` or similar folders.
  - Register them in `client/src/extensions/index.ts` for local use.
  - For remote/distributed updates, publish to the remote registry endpoint.

- **Self-Updating:**
  - The extension system checks for new/updated extensions on every startup.
  - No manual update required for users—extensions are always up to date.

## Extension Management UI

Supacoda now includes a professional Extension Manager UI, accessible from the main menu bar ("Extensions").

- View all installed extensions (local and remote)
- Enable/disable extensions on demand
- Roadmap: update, uninstall, health/status, version info, remote registry browsing, one-click install, details, changelogs, and permissions

This UI provides a seamless, VS Code-like experience for managing your IDE's capabilities, and will continue to evolve with more advanced features.

# Overview

- Primary AI Provider: Google Gemini (user has API key)
- Secondary Providers: SupaAI, Amazon Q Developer, Microsoft Copilot, DeepSeek Coder, Llama 3.3 (free/alternative services)
- **Build System**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database for production scalability
- **Schema Design**: 
  - Projects table for organizing code projects
  - Files table for storing project files with metadata
  - AI conversations table for chat history
  - AI models table for provider configuration

## AI Integration Architecture
- **Multi-Provider Support**: Unified interface for multiple AI providers
- **Supported Models**:
- **API Abstraction**: Service layer abstracts provider-specific implementations
- **Features**: Code generation, explanation, chat-based assistance, context-aware suggestions, direct code editing, quick actions, and intelligent suggestions
- **Default Model**: Gemini 2.5 Flash for optimal performance with user's API key

- **SupaAI**: Advanced coding assistant via OpenRouter API
- **Amazon Q Developer**: AWS coding assistant via Bedrock integration
## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **TypeScript**: Type checking and compilation for both frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **PostCSS**: CSS processing with Tailwind CSS integration

## UI and Styling
## Utility Libraries
- **Wouter**: Lightweight routing for single-page application navigation
- **Clsx/Tailwind Merge**: Conditional CSS class management
- **Zod**: Runtime type validation for API endpoints and forms
