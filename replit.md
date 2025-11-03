# GoalGuard - Goal Commitment & Charitable Donation Platform

## Overview

GoalGuard is a web application designed for the German market, combining personal goal tracking with charitable giving. Users set goals with deadlines, pledging donations to verified betterplace.org charities if they fail. The platform integrates with Strava for fitness tracking and Stripe for payments, motivating users through accountability and charitable impact. The UI is clean, motivational, in German, and uses Euro (€) currency.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:** React 18 (TypeScript), Vite, Wouter, TanStack Query, Shadcn/ui (Radix UI), Tailwind CSS.

**Design System:** Green-centric color palette, light/dark modes (HSL variables), Inter font, custom CSS for elevation. Inspired by Strava, GoFundMe, Duolingo, and Linear.

**Key Frontend Patterns:** Component-based architecture, feature components, page-level components, path aliases, custom hooks (authentication, mobile detection, toasts), authentication-aware routing.

### Backend Architecture

**Technology Stack:** Express.js (TypeScript), Drizzle ORM, PostgreSQL (Neon), connect-pg-simple, RESTful API.

**Server Structure:** Main Express app, API route handlers for goals, organizations, Strava, Stripe; data access layer.

**API Endpoints:**
- **Authentication:** Login (Supabase OIDC), Logout, User Info, Callback.
- **Goals (Protected):** CRUD operations.
- **Organizations:** Retrieve all verified organizations.
- **Strava (Protected):** Connect, Callback, Sync activities.
- **Stripe (Protected):** Create payment intent.

**Data Storage Pattern:** `IStorage` interface, `DatabaseStorage` with Drizzle ORM. All operations filter by `userId`. Schema definitions in `/shared/schema.ts` with Drizzle and Zod.

### Database Schema

**Core Tables:** `users`, `sessions`, `organizations`, `goals`, `stravaConnections`.
**Design Decisions:** Serial primary keys, foreign key constraints, Zod schemas for validation, user isolation, `verified` flag for organizations.

### Authentication & Security

**Authentication System:** Supabase Auth with Email/Password (primary), optional Google/GitHub Login. JWT-based, email confirmation, protected routes with `isAuthenticated` middleware, automatic user creation, secure logout.

**Security Architecture:** JWT verification middleware protects endpoints, `userId` from Supabase JWTs, database operations filter by `userId`, environment variables for API keys, automatic token refresh.

## External Dependencies

**Stripe Integration:** Payment processing for pledge commitments, lazy initialization, payment intents created with goals, charges upon goal failure.

**Strava Integration:** OAuth 2.0 for athlete authentication, automatic token refresh, fetches activities to update goal progress, user-specific connections, syncs running/cycling activities.

**Betterplace.org Integration:** Fetches real charitable projects, syncs project data (images, location, funding progress, descriptions) into the `organizations` table. Auto-syncs on server startup if the database is empty.

**Third-Party UI Libraries:** Radix UI, Shadcn/ui, React Icons, Lucide React.

**Development Tools:** Replit plugins, TypeScript, ESBuild, Drizzle Kit for migrations.

## Recent Changes

### November 3, 2025 - Manual Sync Fallback for Production Deployments
- **Public init-sync endpoint** (`GET /api/organizations/init-sync`) - manual fallback for deployment setup if auto-sync fails
- **Enhanced error logging** - improved diagnostics with clear success/failure indicators (✓/✗) in startup logs
- **Better error messages** - API errors now include sanitized details for troubleshooting
- **Idempotent sync** - init-sync endpoint won't create duplicates, returns count if organizations already exist
- **Deployment troubleshooting** - logs now include instructions to use manual sync endpoint when auto-sync fails

### November 3, 2025 - OAuth Cleanup
- Removed Google and GitHub OAuth buttons from landing page (not configured)
- Simplified authentication UI to email/password only

### November 3, 2025 - Production-Ready Betterplace.org Auto-Sync
- **Protected sync endpoint** with authentication middleware - authenticated users can trigger `/api/organizations/sync`
- **Auto-sync on server startup** - automatically fetches and syncs 50 betterplace.org projects if database is empty
- **Refactored sync logic** into reusable `syncBetterplaceProjects()` function
- **Graceful error handling** - startup continues even if Betterplace.org API is unavailable

### November 3, 2025 - Complete German Localization and Euro Currency
- **Translated all user interface components to German** for the German market
- **Updated currency from USD ($) to Euro (€)** throughout the application
- Translated components: Landing, Dashboard, CreateGoalDialog, GoalCard, StravaConnect, UpdateProgressDialog, FeaturedOrganizations
- Integrated 50 real betterplace.org projects with images, locations, and progress tracking