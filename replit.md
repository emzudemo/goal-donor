# GoalGuard - Goal Commitment & Charitable Donation Platform

## Overview

GoalGuard is a web application that combines personal goal tracking with charitable giving. Users set goals with deadlines, pledge donations to verified charitable organizations if they fail to meet their goals, and track their progress. The platform integrates with Strava for automated fitness tracking and uses Stripe for payment processing.

The application motivates users through accountability - turning personal commitments into potential charitable impact. It features a clean, motivational UI inspired by Strava, GoFundMe, and Linear's design principles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for styling with custom design system

**Design System:**
- Color palette centered around green (growth/achievement) with supporting colors for warnings and success states
- Supports light and dark modes with HSL color variables
- Inter font family for consistency across headings and body text
- Custom CSS variables for elevation effects (hover/active states)
- Design inspired by Strava (progress tracking), GoFundMe (trust), Duolingo (streaks), and Linear (clean dashboards)

**Key Frontend Patterns:**
- Component-based architecture with reusable UI components in `/client/src/components/ui`
- Feature components in `/client/src/components` (Dashboard, GoalCard, etc.)
- Page-level components in `/client/src/pages` (Landing for logged-out, Dashboard for logged-in)
- Path aliases (@, @shared, @assets) for clean imports
- Custom hooks for authentication (useAuth), mobile detection, and toast notifications
- Authentication-aware routing: Landing page shown to logged-out users, Dashboard to authenticated users

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Drizzle ORM for database operations
- PostgreSQL database (via Neon serverless driver)
- Session-based storage using connect-pg-simple
- RESTful API design

**Server Structure:**
- `/server/index.ts` - Main Express application with middleware and request logging
- `/server/routes.ts` - API route handlers for goals, organizations, Strava integration, and Stripe payments
- `/server/storage.ts` - Data access layer with in-memory storage implementation (MemStorage)
- `/server/vite.ts` - Development server setup with Vite middleware for HMR

**API Endpoints:**
- **Authentication:**
  - POST `/api/login` - Initiates Replit Auth OIDC flow
  - GET `/api/logout` - Destroys session and logs out user
  - GET `/api/auth/user` - Returns current authenticated user info
  - GET `/api/auth/callback` - OIDC callback endpoint
- **Goals (Protected):**
  - GET `/api/goals` - Returns goals for authenticated user
  - POST `/api/goals` - Creates goal for authenticated user
  - PATCH `/api/goals/:id` - Updates goal (user ownership verified)
  - DELETE `/api/goals/:id` - Deletes goal (user ownership verified)
- **Organizations:**
  - GET `/api/organizations` - Returns all verified organizations
- **Strava (Protected):**
  - POST `/api/strava/connect` - Initiates Strava OAuth for authenticated user
  - GET `/api/strava/callback` - OAuth callback, stores tokens linked to userId
  - POST `/api/strava/sync/:goalId` - Syncs Strava activities for user's goal
- **Stripe (Protected):**
  - POST `/api/create-payment-intent` - Creates payment intent for user's goal

**Data Storage Pattern:**
- Storage interface (IStorage) defines contract for data operations
- DatabaseStorage implements PostgreSQL-backed persistent storage using Drizzle ORM
- All operations automatically filter by authenticated userId for data isolation
- Schema definitions in `/shared/schema.ts` using Drizzle and Zod

### Database Schema

**Core Tables:**
- **users**: User accounts (id serial, sub text unique for OAuth, email, firstName, lastName, profileImageUrl)
- **sessions**: Session storage (sid primary key, sess jsonb, expire timestamp) managed by connect-pg-simple
- **organizations**: Charitable organizations (id serial, name, mission, category, verified status)
- **goals**: User goals (id serial, userId references users.id, title, organizationId, progress, target, unit, deadline, pledgeAmount, status, stripePaymentIntentId)
- **stravaConnections**: Strava OAuth tokens (id serial, userId references users.id, athleteId, accessToken, refreshToken, expiresAt)

**Design Decisions:**
- Serial primary keys for PostgreSQL auto-increment
- Foreign key constraints ensure referential integrity (userId links goals and Strava connections to users)
- Zod schemas for runtime validation of inserts
- Separate insert and select types for type safety
- Verified flag on organizations for trust and credibility
- User isolation enforced at storage layer - all queries automatically filter by userId

### External Dependencies

**Stripe Integration:**
- Payment processing for pledge commitments
- Lazy initialization of Stripe client to handle missing API keys gracefully
- Creates payment intents when goals are created
- Charges only trigger if users fail to meet their goals by the deadline

**Strava Integration:**
- OAuth 2.0 flow for athlete authentication
- Automatic token refresh using refresh tokens
- Fetches athlete activities to update goal progress
- Strava connections linked to userId in database for persistence
- Syncs running/cycling activities with goal progress (distance-based goals)
- Environment variables: STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET

**Design Rationale:**
- Strava integration provides automatic, trustworthy progress tracking for fitness goals
- Reduces manual entry and increases engagement
- Token refresh ensures long-term connectivity without re-authentication
- User-specific connections enable cross-device Strava sync

**Third-Party UI Libraries:**
- Radix UI for accessible, unstyled component primitives
- Shadcn/ui for pre-built component patterns
- React Icons for Strava branding
- Lucide React for general iconography

**Development Tools:**
- Replit-specific plugins for development (runtime error overlay, cartographer, dev banner)
- TypeScript for type safety across the stack
- ESBuild for production server bundling
- Drizzle Kit for database migrations

### Authentication & Security

**Current Authentication System (November 2025):**
- **Supabase Auth** integration with multiple authentication methods:
  - **Email/Password** - Primary authentication method, works immediately
  - Google Login (optional, requires OAuth setup)
  - GitHub Login (optional, requires OAuth setup)
  - Easily extensible to Apple, Facebook, Twitter, Microsoft, and 20+ other providers
- **JWT-based authentication** using Supabase-issued tokens
- **Email confirmation** - Secure sign-up with verification emails
- **Protected routes** using `isAuthenticated` middleware that verifies Supabase JWTs
- **Automatic user creation** on first login via Supabase auth callbacks
- **Secure logout** via Supabase `signOut()` method
- **Frontend authentication** managed by `useAuth` hook with auth state listeners
- **Portable** - works on Replit, your own server, Vercel, Netlify, or any platform

**Security Architecture:**
- All goal, Strava, and payment endpoints protected with JWT verification middleware
- User ID derived from Supabase JWT claims
- Database operations automatically filter by userId to prevent cross-user data access
- API keys managed via environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY)
- Automatic token refresh handled by Supabase client

**Authentication Files:**
- `/server/supabaseAuth.ts` - Supabase Auth middleware and JWT verification
- `/server/supabase.ts` - Supabase admin client configuration
- `/client/src/lib/supabaseClient.ts` - Frontend Supabase client
- `/client/src/lib/queryClient.ts` - Auto-attaches JWT to API requests
- `/client/src/hooks/useAuth.ts` - Frontend authentication state with listeners
- `/client/src/pages/Landing.tsx` - Landing page with OAuth login buttons
- `/SUPABASE_SETUP.md` - Comprehensive setup guide

### Build & Deployment

**Development:**
- Vite dev server with HMR for frontend
- tsx for running TypeScript server files
- Concurrent client and server development

**Production:**
- Vite builds frontend to `/dist/public`
- ESBuild bundles server to `/dist/index.js`
- Environment variables required: 
  - DATABASE_URL (PostgreSQL connection)
  - SUPABASE_URL, SUPABASE_SERVICE_KEY (backend auth)
  - VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (frontend auth)
  - STRIPE_SECRET_KEY, VITE_STRIPE_PUBLIC_KEY (payment processing)
  - STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET (fitness tracking)
- Single entry point starts Express server serving both API and static frontend
- Database migrations via Drizzle Kit: `npm run db:push`

## Recent Changes

### November 3, 2025 - Migrated to Supabase Auth
- **Replaced Replit Auth with Supabase Auth** for portable authentication that works anywhere
- **Email/password authentication** works immediately - no OAuth setup required!
- Added tabbed Sign In / Sign Up interface on landing page
- Optional Google and GitHub OAuth login (requires additional setup)
- Updated frontend to use Supabase client SDK for authentication
- Updated backend middleware to verify Supabase JWT tokens
- Modified query client to automatically attach auth tokens to API requests
- Added authentication state listeners for automatic re-authentication
- Created comprehensive SUPABASE_SETUP.md guide for configuration
- Existing database schema is fully compatible - no migrations needed
- **Benefits**: App can now be deployed to any hosting platform (not just Replit)

### October 30, 2025 - Strava Sync Fix
- Fixed critical bug in Strava activity sync endpoint
- Changed activity fetch window from "30 days before deadline" to "from goal creation date (or last 90 days)"
- Added `createdAt` timestamp to goals table for better tracking
- Implemented comprehensive logging throughout sync process for debugging
- Improved error messages (e.g., "Please connect your Strava account first")
- Activities now sync correctly regardless of goal deadline

### October 30, 2025 - Authentication & Database Persistence
- Upgraded from in-memory storage to PostgreSQL with Drizzle ORM
- Implemented Replit Auth with support for Google, Apple, GitHub, X, and email/password login
- Added user accounts with session-based authentication
- Protected all user-specific API endpoints with authentication middleware
- Added Landing page for logged-out users with login options
- Updated Dashboard to display user profile and logout functionality
- Linked goals and Strava connections to user accounts via foreign keys
- Implemented automatic user data isolation at storage layer
- Goals and progress now persist across devices and sessions