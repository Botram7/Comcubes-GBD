# COMCUBES (Commercial Cubes) - Global Business Directory

## Overview
COMCUBES (Commercial Cubes) is a full-stack web application designed as a comprehensive global business directory. Its purpose is to allow users to navigate a hierarchical structure of business sectors, industries, and companies, embodying the slogan "Everything and Anything Business". The project aims to provide a clean, modern interface with search functionality and responsive design to serve as a go-to resource for business information.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture
The application employs a modern full-stack architecture, separating frontend and backend concerns.
- **Frontend**: A React-based Single Page Application (SPA) utilizing Vite for build processes, Wouter for routing, TanStack Query for server state management, and `shadcn/ui` (built on Radix UI) with Tailwind CSS for a responsive and accessible user interface.
- **Backend**: An Express.js REST API server managing data operations.
- **Database**: PostgreSQL is used as the database, integrated with Drizzle ORM for type-safe interactions. Initial data is loaded from CSV files.
- **Data Handling**: An in-memory caching layer is used for performance. The data model is hierarchical (Sectors > Industries > Companies) with name-based foreign key relationships.
- **UI/UX Design**: Features include a consistent 5x4 grid layout for displaying items, dynamic image integration, real-time search across all entity types, and clear breadcrumb navigation. The design prioritizes a mobile-first approach.
- **Technical Implementations**: The application features a comprehensive search system with dual modes: a local directory and a global search powered by Google Custom Search API, supporting worldwide business discovery with attribution. Legal compliance pages (Privacy Policy, Terms of Service, Disclaimer, Affiliate Disclosure) are integrated and linked across the site. The homepage and navigation structure have been enhanced for improved user experience, including consistent COMCUBES branding, detailed statistics, and clear calls-to-action.
- **Slot Management System**: Implemented industry capacity limits (max 20 companies per industry) with automatic waitlist functionality. Includes slot availability checking, resume payment capabilities for incomplete transactions, and comprehensive admin dashboard for managing company listings and waitlist entries. Date: August 12, 2025.
- **Admin Dashboard Consolidation**: Decommissioned the basic admin dashboard and consolidated all administrative functions into a comprehensive dashboard with real-time statistics, waitlist management, industry analytics, and email notification capabilities. Date: August 12, 2025.
- **Email Service**: Migrated from SendGrid to Namecheap SMTP for reliable email delivery. Implemented intelligent email routing where Company listing inquiries (contact type "Company Listing") are routed to admin@comcubes.com for business processing, while all other general website inquiries (contact types "General Inquiry", "Technical Support", "Partnership") are routed to contact-cgbd@comcubes.com for customer service. Configuration uses mail.comcubes.com:465 with SSL/TLS encryption and shared certificate servername handling. All emails are BCC'd to obiora.martin7@gmail.com for monitoring. Date: September 30, 2025.
- **Geographic Categorization System**: Fully operational geographic navigation infrastructure enabling dual discovery by business type AND geography. Database schema includes hierarchical relationships (7 Continents → 22 Regions → 198 Countries → 7,491 geocoded companies) with confidence tracking (high 9.3%, medium 1.7%, low 89%). Implemented 16 storage methods with proper INNER JOINs, confidence filtering, and statistical aggregations. Created 9 RESTful API endpoints for continents/regions/countries with stats, filtered company search, and pagination. Launched Geography Hub page (/geography) with interactive continent cards, real-time stats dashboard, and SEO optimization. Next phase: continent/region/country detail pages with company listings and combined filtering UI. Date: September 30, 2025.
- **Data Quality Enhancement & CSV Import Pipeline**: Extended database schema with enriched company fields (employee_count, revenue_estimate, founded_year, company_size, specialization_tags, verification_status) and backup columns for old geocoding data. Built intelligent country name normalization supporting 200+ variations (USA→United States, UK→United Kingdom) with exact/alias/fuzzy matching. Created robust CSV import pipeline with company deduplication, country validation, and quality metrics. Successfully imported 7 of 20 sectors (2,662 companies total) with 95%+ geographic accuracy: Aerospace & Defense (422), Agriculture (439), Automobile (391), Healthcare & Pharmaceuticals (373), Food & Beverage (325), Insurance (370), Manufacturing (342). Transformed geographic distribution - Nigeria reduced from 90%+ to realistic 8.6%, USA leads at 16.8%. Import utilities include generic sector import script and batch processing capability. 13 sectors remaining pending CSV file delivery. Date: October 9, 2025.

## External Dependencies
- **React Ecosystem**: `react`, `react-dom`, `@vitejs/plugin-react`
- **Routing**: `wouter`
- **State Management**: `@tanstack/react-query`
- **UI Components**: `@radix-ui/*`, `shadcn/ui`
- **Database**: `@neondatabase/serverless` (for PostgreSQL connectivity), `drizzle-orm`, `drizzle-kit`
- **Validation**: `zod`
- **Styling**: `tailwindcss`, `postcss`
- **Build Tool**: `vite`
- **Language**: `typescript`
- **Replit Specific**: `@replit/vite-plugin-runtime-error-modal`, `@replit/vite-plugin-cartographer`
- **Search**: Google Custom Search API
- **Email**: `nodemailer` (Namecheap SMTP integration)