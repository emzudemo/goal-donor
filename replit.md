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
- Page-level components in `/client/src/pages`
- Path aliases (@, @shared, @assets) for clean imports
- Custom hooks for mobile detection and toast notifications

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
- Goal CRUD operations (GET, POST, PATCH, DELETE at `/api/goals`)
- Organization management (`/api/organizations`)
- Strava OAuth flow and activity syncing (`/api/strava/*`)
- Stripe payment intent creation (`/api/create-payment-intent`)

**Data Storage Pattern:**
- Storage interface (IStorage) defines contract for data operations
- MemStorage implements in-memory storage for development/testing
- Designed to be replaced with Drizzle ORM implementation for production
- Schema definitions in `/shared/schema.ts` using Drizzle and Zod

### Database Schema

**Core Tables:**
- **users**: User authentication (id, username, password)
- **organizations**: Charitable organizations (id, name, mission, category, verified status)
- **goals**: User goals (id, title, organizationId, progress, target, unit, deadline, pledgeAmount, status, stripePaymentIntentId)
- **stravaConnections**: Strava OAuth tokens (athleteId, accessToken, refreshToken, expiresAt)

**Design Decisions:**
- UUID primary keys using `gen_random_uuid()` for distributed systems compatibility
- Zod schemas for runtime validation of inserts
- Separate insert and select types for type safety
- Verified flag on organizations for trust and credibility

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
- Stores athlete ID in localStorage for session persistence
- Syncs running/cycling activities with goal progress (distance-based goals)

**Design Rationale:**
- Strava integration provides automatic, trustworthy progress tracking for fitness goals
- Reduces manual entry and increases engagement
- Token refresh ensures long-term connectivity without re-authentication

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

**Current Implementation:**
- Basic username/password authentication schema defined
- Session management prepared with connect-pg-simple
- No authentication currently enforced on routes (MVP phase)

**Future Considerations:**
- Implement session-based authentication middleware
- Add user context to goal and payment operations
- Secure Strava and Stripe operations to authenticated users only

### Build & Deployment

**Development:**
- Vite dev server with HMR for frontend
- tsx for running TypeScript server files
- Concurrent client and server development

**Production:**
- Vite builds frontend to `/dist/public`
- ESBuild bundles server to `/dist/index.js`
- Environment variables required: DATABASE_URL, STRIPE_SECRET_KEY, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET
- Single entry point starts Express server serving both API and static frontend