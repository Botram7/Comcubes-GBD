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
- **Payment Gateway**: Dual support for Paystack (primary) and PayPal (secondary) for multi-currency transactions, with intelligent routing and a selection UI.
- **Monetization System**: Google AdSense integration across various pages, self-service advertising platform for direct ad sales with dynamic pricing, multi-format support, and dual payment gateway options. Analytics utilities (GA4, Microsoft Clarity) dynamically loaded. Database schema includes `adPurchases` for tracking.
- **Data Transparency**: Disclaimers and "Company Intelligence" section for enriched company data with validation status, allowing user claims/updates.

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