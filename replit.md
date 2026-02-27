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
- **Monetization System**: Google AdSense integration across various pages, self-service advertising platform for direct ad sales with dynamic pricing, multi-format support, and dual payment gateway options. Analytics utilities (GA4, Microsoft Clarity) dynamically loaded with GDPR consent. Database schema includes `adPurchases` for tracking.
- **Data Transparency**: Disclaimers and "Company Intelligence" section for enriched company data with validation status, allowing user claims/updates.
- **GDPR Cookie Consent**: Custom cookie consent banner with Accept All/Reject/Preferences options. Analytics (GA4, Clarity) and Marketing (AdSense) cookies only load after explicit user consent. Consent preferences stored in localStorage. Revoking consent after scripts are loaded prompts page reload for full compliance. Use `?resetCookies=true` URL parameter to reset consent and show banner again for testing.
- **Anti-Spam Protection**: Cloudflare Turnstile integration on contact form for bot protection. Privacy-friendly CAPTCHA alternative that verifies human users without tracking. Server-side token verification before processing form submissions. CSP headers configured to allow Cloudflare domains. Turnstile widget configured in Cloudflare Dashboard must include the app's domains (both .replit.dev for development and production domain).

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

## SEO Optimization (Production Launch Ready)

**Brand Keywords Coverage**: All pages include comprehensive brand keyword variants: COMCUBES, Comcube, comcube, concube, COM CUBES, com cubes, commercial cubes, comcubes global directory, comcubes GBD, comcubes business, com cube, conc cube, COMCUBES directory, Comcubes global, comcubes.com

**Structured Data Schemas**:
- **WebSite Schema**: Homepage with SearchAction for sitelinks search box
- **Organization Schema**: COMCUBES brand information with logo
- **FAQ Schema**: Homepage FAQ section for rich snippets
- **ItemList Schema**: Sector, Industry, and Company listing pages
- **Place Schema**: Geography pages (continents, regions, countries)
- **LocalBusiness Schema**: Individual company profile pages
- **BreadcrumbList Schema**: All pages with navigation breadcrumbs

**Canonical URLs**: All public-facing pages use hardcoded production domain (https://comcubes.com) for canonical URLs and structured data references.

**robots.txt**: Comprehensive configuration allowing all public routes (sectors, industries, companies, geography, search) while blocking admin, API, and transactional pages.

**Sitemap**: Dynamic sitemap.xml generator including all sectors, industries, companies, and geography pages with proper priority and changefreq settings.

## Phase 2: Dynamic Data Infrastructure (Completed)

**Goal**: Expand company database from ~7,500 to 15,000-25,000+ using cost-effective AI and open data sources with geographic emphasis on Africa and underrepresented regions.

**Services Built**:
- `server/services/aiCompanyGenerator.ts` — OpenAI-powered company generation for industries with open slots. Supports geographic targeting (continent/country focus). Uses `gpt-5-nano` for cost efficiency.
- `server/services/aiDescriptionEnricher.ts` — AI-powered description enrichment replacing template descriptions. Batch processing with progress tracking.
- `server/services/wikidataService.ts` — Free Wikidata SPARQL integration for importing real company data. Supports continent/country filtering. No API key needed.
- `server/services/googleSearchService.ts` — Google Custom Search with database-backed caching (7-30 day TTL).

**Admin Dashboard Extensions**:
- "Data Expansion" tab in admin dashboard (`client/src/components/DataExpansionPanel.tsx`)
- AI Company Generator panel with industry gap analysis and geographic targeting
- Description Enrichment panel with progress tracking and batch controls
- Wikidata Import panel with continent/country filters
- Search Cache statistics panel

**User-Facing Features**:
- "Suggest for Directory" button on external Google search results (SearchPage.tsx)
- Suggestions flow to admin approval queue via `POST /api/suggest-company`

**API Endpoints Added**:
- `GET /api/admin/ai-generator/gaps` — Industry gap analysis
- `POST /api/admin/ai-generator/generate` — AI company generation
- `POST /api/admin/ai-generator/import` — Import generated companies
- `GET /api/admin/descriptions/stats` — Description enrichment stats
- `POST /api/admin/descriptions/enrich-batch` — Batch description enrichment
- `GET /api/admin/wikidata/search` — Wikidata SPARQL search
- `POST /api/admin/wikidata/import` — Import Wikidata companies
- `GET /api/admin/search-cache/stats` — Cache statistics
- `POST /api/suggest-company` — User company suggestions

**Design Decisions**:
- OpenAI uses Replit AI credits via `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL` (no separate API key)
- Google Custom Search stays limited to user-initiated searches only
- Wikidata is completely free with no rate limits for reasonable usage

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