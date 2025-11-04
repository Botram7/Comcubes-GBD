# COMCUBES (Commercial Cubes) - Global Business Directory

## Overview
COMCUBES (Commercial Cubes) is a comprehensive full-stack web application serving as a global business directory. Its core purpose is to provide users with a hierarchical navigation structure across business sectors, industries, and companies, embodying the slogan "Everything and Anything Business". The project aims to be a primary resource for business information through a modern, responsive interface with robust search capabilities.

## User Preferences
Preferred communication style: Simple, everyday language.
Monetization preference: Paystack PRIMARY for payment processing, PayPal SECONDARY for international customers.

## System Architecture
The application utilizes a modern full-stack architecture with distinct frontend and backend components.

**UI/UX Decisions:**
- **Frontend Framework**: React-based SPA with Vite, Wouter for routing, TanStack Query for state management.
- **Styling & Components**: `shadcn/ui` (built on Radix UI) with Tailwind CSS for responsive and accessible design.
- **Design Principles**: Consistent 5x4 grid layouts, dynamic image integration, real-time search, clear breadcrumb navigation, and a mobile-first approach.
- **Branding**: Consistent COMCUBES branding throughout, including enhanced homepage and navigation.
- **Legal Compliance**: Integrated and linked Privacy Policy, Terms of Service, Disclaimer, and Affiliate Disclosure pages.
- **Monetization Display**: Google AdSense integration for passive ad revenue, with ads strategically placed (e.g., left sidebar).

**Technical Implementations:**
- **Backend**: Express.js REST API server.
- **Database**: PostgreSQL with Drizzle ORM for type-safe interactions.
- **Data Model**: Hierarchical (Sectors > Industries > Companies) with name-based foreign key relationships, enhanced with geographic categorization (Continents > Regions > Countries > Geocoded Companies) and enriched company fields (e.g., employee_count, revenue_estimate).
- **Data Handling**: In-memory caching, intelligent country name normalization, robust CSV import pipeline with deduplication and validation, and multi-location support for companies.
- **Search Functionality**: Comprehensive system with local directory search and global search powered by Google Custom Search API.
- **Slot Management**: Industry capacity limits with waitlist functionality, including payment resumption and an admin dashboard for management.
- **Admin Dashboard**: Consolidated comprehensive dashboard with real-time statistics, waitlist management, industry analytics, and email notifications.
- **Email Service**: Namecheap SMTP for email delivery, with intelligent routing for inquiry types (Company Listing to admin, others to customer service).
- **Production Database Synchronization**: Web-based admin interface (`/admin-sync`) for browser-based, transaction-safe database synchronization with authentication, real-time status, and progress tracking.
- **Payment Gateway Integration**: Dual payment processor support with Paystack (primary) and PayPal (secondary), supporting multi-currency transactions, with intelligent routing and an elegant frontend selection UI.
- **Monetization System (COMPLETE)**: Comprehensive Google AdSense integration with all left sidebar ads replaced across 12 pages (vertical 160×600 skyscraper format), strategic responsive in-content ad placements on high-traffic pages (SectorsPage, IndustriesPage, CompanyPage) with non-obtrusive spacing and mobile-first design ensuring maximum 3 ads per page. Self-service advertising platform (client/src/pages/AdvertisePage.tsx) with dynamic pricing calculator ($140-$210/month base at 70% of market rate), volume discounts (10-20% for longer commitments), multi-format support (vertical/horizontal/rectangle/responsive), multi-position selection, multi-currency (USD/NGN/EUR/GBP), dual payment gateway UI (Paystack PRIMARY, PayPal SECONDARY), comprehensive form validation, real-time pricing summary, and professional email notifications. Backend API endpoint /api/ad-purchase/request handles self-service requests with beautifully formatted HTML emails to admin@comcubes.com. Analytics utilities (GA4, Microsoft Clarity) dynamically load via client/src/main.tsx with environment-driven configuration. Reusable GoogleAdSense component with lazy loading, error fallbacks, and graceful handling of unconfigured states. Database schema extended with adPurchases table for tracking direct ad sales with detailed specifications, payment tracking, and campaign management. All affiliate marketing BannerAd components preserved on right sidebar per user preference. Environment variables: VITE_GA_MEASUREMENT_ID, VITE_CLARITY_PROJECT_ID, VITE_ADSENSE_CLIENT_ID. Documentation: MONETIZATION_SETUP_GUIDE.md, ANALYTICS_CONFIGURATION_GUIDE.md. Next phase: Direct payment processing integration, ad creative upload with preview, automated campaign activation.
- **Data Transparency**: Implemented data accuracy disclaimers and a "Company Intelligence" section on profile pages to display enriched company data with transparency about validation status, allowing users to claim or update listings.

## External Dependencies
- **React Ecosystem**: `react`, `react-dom`, `@vitejs/plugin-react`
- **Routing**: `wouter`
- **State Management**: `@tanstack/react-query`
- **UI Components**: `@radix-ui/*`, `shadcn/ui`
- **Database**: `@neondatabase/serverless`, `drizzle-orm`, `drizzle-kit`
- **Validation**: `zod`
- **Styling**: `tailwindcss`, `postcss`
- **Build Tool**: `vite`
- **Language**: `typescript`
- **Replit Specific**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`
- **Search**: Google Custom Search API
- **Email**: `nodemailer`
- **Payment Processing**: `@paypal/paypal-server-sdk`, `paystack`