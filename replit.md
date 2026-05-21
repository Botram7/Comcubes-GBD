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

## Admin Navigation Guide

The admin area is accessible at `/admin` (requires admin login). It has several tabs:

| Tab | What it does |
|-----|-------------|
| **Overview** | Site statistics, active companies, slot usage |
| **Waitlist** | Companies waiting for an industry slot to open |
| **Industries** | Manage industry slot limits and availability |
| **Analytics** | Search queries, page views, top sectors |
| **Email** | Send notifications, manage templates |
| **Data Expansion** | AI generation, Wikidata import, staged review, CSV export |

### Data Expansion Tab — Sub-sections

When you click **Data Expansion**, you land on an Overview screen showing four cards. Click any card (or use the internal navigation) to go deeper:

| Card / Section | What it does |
|----------------|-------------|
| **AI Company Generator** | Generate new companies with OpenAI for industries that have open slots. Supports geographic targeting (continent / country). |
| **Description Enricher** | Batch-enrich companies that have no description using AI. |
| **Wikidata Import** | Search for real companies from the free Wikidata database (100+ search terms, 20 languages). Results go to Staged Imports for review. |
| **Staged Imports** | Review, approve, reject, or export companies that came from AI or Wikidata before they go live. Includes "Re-categorize All Pending" button. |
| **Export All Companies (CSV)** | Download a full CSV of every live company in the directory (sector, industry, country, website, employees, founded year). Found at the bottom of the Data Expansion Overview page. |

### How to reach the Re-categorize button specifically:
1. Log into the admin area at `/admin`
2. Click the **"Data Expansion"** tab in the top navigation bar
3. On the overview, click the **"Staged Imports"** card
4. In the Staged Imports view, look at the filter/action bar above the company list
5. The **"Re-categorize All Pending"** button sits in that bar alongside Approve All, Reject All, and Export CSV

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
- `server/services/aiCompanyGenerator.ts` — OpenAI-powered company generation for industries with open slots. Supports geographic targeting (continent/country focus). Uses `gpt-4o-mini` for cost efficiency. Includes country name normalization (40+ variants) and composite deduplication (name + industry + sector).
- `server/services/aiDescriptionEnricher.ts` — AI-powered description enrichment replacing template descriptions. Batch processing with progress tracking. Uses `gpt-4o-mini`. Selects companies with NULL or empty descriptions consistently.
- `server/services/wikidataService.ts` — Free Wikidata SPARQL integration for importing real company data. Supports continent/country filtering. Multilingual queries (20 languages including English, French, Portuguese, Arabic, Swahili, Hausa, etc.) — no English-only restriction. No API key needed.
- `server/services/googleSearchService.ts` — Google Custom Search with database-backed caching (7-30 day TTL).

**Admin Dashboard Extensions**:
- "Data Expansion" tab in admin dashboard (`client/src/components/DataExpansionPanel.tsx`)
- AI Company Generator panel with industry gap analysis, geographic targeting, and error/warning feedback
- Description Enrichment panel with progress tracking, batch controls, and last-batch results
- Wikidata Import panel with continent/country filters, multilingual support, and empty-state messages
- Search Cache statistics panel

**Key Design: Multi-Country/Multi-Industry Companies**:
- Deduplication uses composite key: name + industryName + sectorName (matches DB unique constraint)
- Same company CAN exist in different industries (e.g., MTN in Telecommunications AND FinTech)
- Same company CAN exist with different country-specific URLs (e.g., mtn.ng vs mtn.co.za)
- AI prompts explicitly instruct generation of country-specific subsidiaries with local URLs

**User-Facing Features**:
- "Suggest for Directory" button on external Google search results (SearchPage.tsx)
- Suggestions flow to admin approval queue via `POST /api/suggest-company`

**API Endpoints Added**:
- `GET /api/admin/ai-generator/gaps` — Industry gap analysis
- `POST /api/admin/ai-generator/generate` — AI company generation
- `POST /api/admin/ai-generator/import` — Import generated companies (accepts array or {companies} wrapper)
- `GET /api/admin/descriptions/stats` — Description enrichment stats
- `POST /api/admin/descriptions/enrich-batch` — Batch description enrichment
- `GET /api/admin/wikidata/search` — Wikidata SPARQL search (multilingual)
- `POST /api/admin/wikidata/import` — Import Wikidata companies
- `GET /api/admin/search-cache/stats` — Cache statistics
- `POST /api/suggest-company` — User company suggestions

**Design Decisions**:
- OpenAI uses Replit AI credits via `AI_INTEGRATIONS_OPENAI_API_KEY` / `AI_INTEGRATIONS_OPENAI_BASE_URL` (no separate API key)
- Both AI services use `gpt-4o-mini` model (standardized)
- Google Custom Search stays limited to user-initiated searches only
- Wikidata is completely free with no rate limits for reasonable usage
- Wikidata SPARQL queries support 20 languages for global coverage

## Phase 3: Smart Import & Dynamic Grids (Completed)

**Goal**: Improve import accuracy with smart category matching, add a staging/review layer before live import, and remove the rigid 20-slot grid limit for dynamic company display.

**Smart Category Matcher** (`server/services/categoryMatcher.ts`):
- Maps arbitrary incoming sector/industry names to closest existing Comcubes categories
- Keyword/alias map covering all 20 sectors and 400 industries (e.g., "Finance" → "Banking and Financial Services", "Farming" → "Agriculture")
- Fuzzy matching fallback using Levenshtein distance and token overlap (Dice coefficient)
- Returns best match with confidence score (1.0 = exact, 0.95 = alias, 0.8 = substring, variable for fuzzy)
- Items below 0.45 confidence threshold flagged with `needsReview: true` for admin review
- Integrated into both `aiCompanyGenerator.ts` and `wikidataService.ts`

**Staging/Preview System**:
- `staged_companies` table in database with source tracking (ai/wikidata/csv), matched category info, confidence scores, and status (pending/approved/rejected)
- AI generator and Wikidata imports now land in staging instead of going directly to live `companies` table
- Admin API routes: GET staged companies (with filters), approve/reject (single + bulk), CSV export
- "Staged Imports" tab in Data Expansion admin panel with stats, filters, bulk actions, and CSV export button
- Approve action moves staged company to live `companies` table via existing import pipeline

**Dynamic Pagination**:
- Removed rigid 20-slot grid limit: `ITEMS_PER_PAGE` increased to 40, `checkSlotAvailability` no longer caps at 20
- `BusinessGrid.tsx` no longer pads to 20 items with "Available Slot" placeholders — displays exactly the items passed
- `/api/industries/:name/companies` supports `?page=N&limit=N` pagination (backward compatible)
- Industry and Geography company pages use "Load More" pattern with skeleton loaders
- Companies accumulate as user clicks "Load More" for seamless browsing experience

**API Endpoints Added**:
- `GET /api/admin/staged-companies` — List staged companies with optional filters (status, source, sector)
- `GET /api/admin/staged-companies/stats` — Staging stats by status
- `GET /api/admin/staged-companies/export-csv` — CSV export of staged companies only
- `POST /api/admin/staged-companies/:id/approve` — Approve single staged company to live
- `POST /api/admin/staged-companies/:id/reject` — Reject single staged company
- `POST /api/admin/staged-companies/approve-bulk` — Bulk approve
- `POST /api/admin/staged-companies/reject-bulk` — Bulk reject

## Phase 4: Category Accuracy & Data Export (Completed)

**Goal**: Fix sector/industry mismatch bugs in the auto-categorization engine, allow admins to repair existing wrongly-categorized staged companies in one click, and provide a full data export of the live company directory.

### Problem Fixed — Sector/Industry Mismatch
The original `categoryMatcher.ts` matched sector and industry independently. This caused absurd assignments (e.g., "EgyptAir" landed in "Banking and Financial Services" because the word "air" matched no industry strongly, so the sector was guessed separately). The fix derives the sector *from* the industry match, not independently.

**Solution** (`server/services/categoryMatcher.ts`):
- Added `INDUSTRY_TO_SECTOR` lookup map covering all ~150 industry names — maps each industry to its correct parent sector.
- Added new exported function `matchCategoryForCompany(probe)`:
  1. Run `matchIndustry(probe)` first.
  2. If industry confidence ≥ 0.5, look up the correct sector from `INDUSTRY_TO_SECTOR`.
  3. Only fall back to independent `matchSector` if industry confidence < 0.5.
- Both Wikidata import and AI generator staging endpoints now call `matchCategoryForCompany` instead of running sector/industry matching separately.

### Wikidata Search Reliability Fix
The Wikidata service previously failed with 500 errors on many legitimate search terms because the internal `TERM_TO_QID_MAP` only had a small number of entries.

**Solution** (`server/services/wikidataService.ts`):
- Massively expanded `TERM_TO_QID_MAP` to 100+ terms covering all 20 business sectors (e.g., "airlines", "banking", "pharmaceuticals", "retail", "construction", "agriculture", etc.).
- Removed hard-coded block that prevented continent+label searches — any search term now works correctly.

### Re-categorize All Pending (Admin Tool)
Admins can now fix all existing wrongly-categorized staged companies in one click, without having to re-import them.

**How to use**:
1. Admin → Data Expansion tab → click **Staged Imports** card
2. In the filter/action bar, click **"Re-categorize All Pending"**
3. The engine re-runs `matchCategoryForCompany` on every pending record and updates their sector, industry, and confidence score in place
4. The table refreshes automatically showing the corrected assignments

**API Endpoint**: `POST /api/admin/staged-companies/recategorize` — re-categorizes all pending staged companies and returns `{ updated: N }`.

### Export All Companies (Admin Tool)
Admins can download a complete CSV snapshot of every live company in the directory for offline audit or analysis.

**How to use**:
1. Admin → Data Expansion tab → Overview (the default landing screen)
2. Scroll to the bottom — click **"Export All Companies (CSV)"** button
3. Browser downloads `comcubes-companies.csv` immediately

**CSV columns**: Company Name, Website URL, Business Sector, Industry, Country, Founded Year, Employee Count, Company Size, Description

**API Endpoint**: `GET /api/admin/companies/export-csv` — streams a CSV of all 7,500+ live companies with sector, industry, and geographic data.

**API Endpoints Added**:
- `POST /api/admin/staged-companies/recategorize` — Re-categorize all pending staged companies using the corrected matching engine
- `GET /api/admin/companies/export-csv` — Full CSV export of all live companies

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
