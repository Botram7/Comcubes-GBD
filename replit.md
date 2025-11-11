# COMCUBES (Commercial Cubes) - Global Business Directory

## Overview
COMCUBES is a comprehensive full-stack web application designed as a global business directory. Its primary goal is to offer a hierarchical navigation system across business sectors, industries, and companies, embodying the slogan "Everything and Anything Business." The project aims to be a leading source of business information through a modern, responsive interface with robust search capabilities, and expand into a universal discovery platform for various audiences.

## User Preferences
Preferred communication style: Simple, everyday language.
Monetization preference: Paystack PRIMARY for payment processing, PayPal SECONDARY for international customers.

## System Architecture
The application is built with a modern full-stack architecture, separating frontend and backend concerns.

**UI/UX Decisions:**
- **Frontend**: React-based SPA using Vite, Wouter for routing, and TanStack Query for state management.
- **Styling**: `shadcn/ui` (Radix UI) and Tailwind CSS for responsive, accessible design, adhering to a consistent 5x4 grid layout.
- **Features**: Dynamic image integration, real-time search, clear breadcrumb navigation, mobile-first approach, consistent COMCUBES branding.
- **Legal**: Integrated Privacy Policy, Terms of Service, Disclaimer, and Affiliate Disclosure pages.
- **Monetization Display**: Google AdSense for passive ad revenue, strategically placed.

**Technical Implementations:**
- **Backend**: Express.js REST API server.
- **Database**: PostgreSQL with Drizzle ORM.
- **Data Model**: Hierarchical structure (Sectors > Industries > Companies) with geographic categorization (Continents > Regions > Countries > Geocoded Companies) and enriched company data.
- **Data Handling**: In-memory caching, country name normalization, robust CSV import with deduplication, and multi-location support.
- **Search**: Comprehensive system with local directory search and global search via Google Custom Search API.
- **Slot Management**: Industry capacity limits, waitlist functionality, and admin dashboard for management.
- **Admin Dashboard**: Comprehensive dashboard for statistics, waitlist, industry analytics, and email notifications.
- **Email Service**: Namecheap SMTP for email delivery, with intelligent routing.
- **Database Synchronization**: Web-based `/admin-sync` interface for secure, transaction-safe database synchronization.
- **Payment Gateway**: Dual support for Paystack (primary via Zenith Bank USD account) and PayPal (secondary) for USD transactions. Feature-flagged NGN fallback system preserved for emergency use (requires manual activation via `PAYSTACK_ENABLE_NGN_FALLBACK=true`).
  - **Payment Channels**: Currency-aware channel selection - USD supports card and Apple Pay, NGN supports card/bank/USSD/QR/mobile money/bank transfer. Other currencies use Paystack auto-selection.
  - **Apple Pay**: Domain verification file preloaded at startup and served with text/plain content-type at `/.well-known/apple-developer-merchantid-domain-association`. Requires app restart to reload if file changes. Note: Apple Pay will only fully function in production with a verified domain - development environment testing is limited.
- **Company Claim Verification**: Multi-step verification system for company claims that requires email verification before payment. Includes rate-limited resend functionality (3 per 5 min) and brute-force protection (10 attempts per 15 min). Verification codes expire in 24 hours. Domain matching required between business email and company website for security.
- **Monetization System**: Google AdSense integration across various pages, self-service advertising platform for direct ad sales with dynamic pricing, multi-format support, and dual payment gateway options. Analytics utilities (GA4, Microsoft Clarity) dynamically loaded. Database schema includes `adPurchases` for tracking.
- **Data Transparency**: Disclaimers and "Company Intelligence" section for enriched company data with validation status, allowing user claims/updates.

## Feature Flags

### PAYSTACK_ENABLE_NGN_FALLBACK (Emergency-Only NGN Fallback System)

**Purpose**: Preserve the Western Union/RemitRadar currency conversion system for emergency situations without activating it by default.

**Default**: `false` (USD-only production mode)

**How It Works**:
- **When false (default)**:
  - All payments process via Paystack USD account (Zenith Bank)
  - No Western Union/RemitRadar API calls are made
  - Currency conversion endpoint `/api/currency/usd-to-ngn` returns 503 error
  - USD payment failures throw clear error messages (no silent fallback to NGN)
  
- **When true (emergency mode)**:
  - NGN fallback system activates
  - USD payments that fail can automatically convert to NGN equivalent
  - Western Union/RemitRadar APIs fetch real-time exchange rates
  - Currency conversion endpoint works normally

**When to Enable**:
- Paystack USD channel experiences outages
- Zenith Bank USD account has temporary issues
- Emergency situations requiring NGN payment acceptance
- **NEVER enable automatically** - requires explicit manual activation

**How to Enable**:
1. Go to Replit Secrets
2. Add environment variable: `PAYSTACK_ENABLE_NGN_FALLBACK` = `true`
3. Restart the application
4. Monitor logs for: "⚠️ NGN FALLBACK ENABLED (Emergency Mode)"

**How to Disable**:
1. Remove the environment variable from Replit Secrets
2. OR set it to `false`
3. Restart the application
4. Monitor logs for: "✅ USD-ONLY (Production Mode)"

**Code Locations**:
- `server/paystackService.ts` - Payment fallback logic
- `server/currencyService.ts` - Exchange rate fetching (Western Union/RemitRadar)
- `server/routes.ts` - Payment verification and currency API endpoint

## External Dependencies
- **Frontend Frameworks**: `react`, `react-dom`, `@vitejs/plugin-react`
- **Routing**: `wouter`
- **State Management**: `@tanstack/react-query`
- **UI Libraries**: `@radix-ui/*`, `shadcn/ui`
- **Database**: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`
- **Validation**: `zod`
- **Styling**: `tailwindcss`, `postcss`
- **Build Tool**: `vite`
- **Language**: `typescript`
- **Replit Specific**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`
- **Search**: Google Custom Search API
- **Email**: `nodemailer`
- **Payment Processing**: `@paypal/paypal-server-sdk`, `paystack`