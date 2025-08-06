# Overview

CodeAssist AI is an intelligent code editor application that combines modern web development tools with AI-powered code assistance. The application provides a comprehensive IDE-like experience with features including syntax highlighting, file management, AI chat integration, and terminal functionality. It supports multiple AI models (OpenAI GPT-4o, Anthropic Claude Sonnet 4, Google Gemini 2.5 Pro/Flash) for code generation, explanation, and assistance.

# User Preferences

Preferred communication style: Simple, everyday language.

## AI Model Preferences
- Primary AI Provider: Google Gemini (user has API key)
- Secondary Providers: Amazon Q Developer, Microsoft Copilot, DeepSeek Coder, Llama 3.3 (free/alternative services)
- Removed: OpenAI GPT models, Anthropic Claude (user requested alternatives)

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Build System**: Vite for fast development and optimized production builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui with Radix UI components for accessible, customizable interface components
- **Styling**: Tailwind CSS with CSS variables for theming and responsive design
- **Code Editor**: Monaco Editor integration for syntax highlighting and code editing features

## Backend Architecture
- **Runtime**: Node.js with Express.js framework for REST API endpoints
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: In-memory storage with planned database persistence
- **File Processing**: Server-side file management with project organization

## Data Storage Solutions
- **Primary Database**: PostgreSQL via Neon Database for production scalability
- **ORM**: Drizzle for type-safe database queries and migrations
- **Session Storage**: Connect-pg-simple for PostgreSQL-backed session storage
- **Schema Design**: 
  - Projects table for organizing code projects
  - Files table for storing project files with metadata
  - AI conversations table for chat history
  - AI models table for provider configuration

## Authentication and Authorization
- **Current Implementation**: Basic session-based authentication placeholder
- **Architecture**: Prepared for user authentication with session management
- **Session Storage**: PostgreSQL-backed sessions for persistence across server restarts

## AI Integration Architecture
- **Multi-Provider Support**: Unified interface for multiple AI providers
- **Supported Models**:
  - Google Gemini 2.5 Pro/Flash (primary with user API key)
  - Amazon Q Developer (AWS coding assistant)
  - Microsoft Copilot (via free proxy service)
  - DeepSeek Coder (specialized for code generation)
  - Llama 3.3 (open source alternative via Together API)
- **API Abstraction**: Service layer abstracts provider-specific implementations
- **Features**: Code generation, explanation, chat-based assistance, and context-aware suggestions
- **Default Model**: Gemini 2.5 Flash for optimal performance with user's API key

# External Dependencies

## AI Services
- **Google Generative AI**: Gemini 2.5 Pro and Flash models (primary with user API key)
- **Amazon Q Developer**: AWS coding assistant via Bedrock integration
- **Microsoft Copilot**: Via DeepAI proxy service for free access
- **DeepSeek API**: Specialized coding assistant with free tier
- **Together API**: For Llama 3.3 open source model access

## Database and Infrastructure
- **Neon Database**: Serverless PostgreSQL database for production deployment
- **Drizzle Kit**: Database migration and schema management tools

## Development and Build Tools
- **Vite**: Frontend build tool with HMR and optimization
- **TypeScript**: Type checking and compilation for both frontend and backend
- **ESBuild**: Backend bundling for production deployment
- **PostCSS**: CSS processing with Tailwind CSS integration

## UI and Styling
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless UI components for accessibility and customization
- **Lucide React**: Icon library for consistent iconography
- **Monaco Editor**: Advanced code editor with syntax highlighting

## Utility Libraries
- **Wouter**: Lightweight routing for single-page application navigation
- **Date-fns**: Date manipulation and formatting utilities
- **Clsx/Tailwind Merge**: Conditional CSS class management
- **Zod**: Runtime type validation for API endpoints and forms