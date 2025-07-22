# COMCUBES (Commercial Cubes) - Global Business Directory

## Overview

COMCUBES (Commercial Cubes) is a full-stack web application that provides a hierarchical business directory system organized by sectors, industries, and companies. With the slogan "Everything and Anything Business", it serves as a comprehensive global business directory where users can browse through business sectors, drill down into specific industries, and view companies within those industries. The application features a clean, modern interface with the COMCUBES branding, search functionality, and responsive design.

## System Architecture

The application follows a modern full-stack architecture with clear separation between frontend and backend:

- **Frontend**: React-based SPA using Vite for build tooling
- **Backend**: Express.js REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Data Source**: CSV files for initial data loading
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Deployment**: Replit-optimized with autoscale deployment target

## Key Components

### Frontend Architecture
- **React**: Component-based UI with functional components and hooks
- **Wouter**: Lightweight client-side routing
- **TanStack Query**: Server state management and caching
- **shadcn/ui**: Modern, accessible UI component library built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for responsive design

### Backend Architecture
- **Express.js**: REST API server with middleware for logging and error handling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **CSV Parser**: Custom service for loading initial data from CSV files
- **Memory Storage**: In-memory caching layer for improved performance

### Database Schema
The application uses a hierarchical data model:
- **Sectors**: Top-level business categories
- **Industries**: Subcategories within sectors
- **Companies**: Individual businesses within industries

Each level maintains foreign key relationships through name-based references rather than traditional ID foreign keys.

### UI/UX Design
- **5x4 Grid Layout**: Consistent 20-item grid display across all levels
- **Image Integration**: Dynamic image mapping based on business categories
- **Search Functionality**: Real-time search across all entity types
- **Breadcrumb Navigation**: Clear hierarchical navigation
- **Responsive Design**: Mobile-first approach with responsive breakpoints

## Data Flow

1. **Initial Load**: CSV files are parsed and loaded into memory storage on server startup
2. **API Requests**: Frontend makes REST API calls using TanStack Query
3. **Data Transformation**: Server processes requests and returns JSON responses
4. **Client Rendering**: React components render data with loading states and error handling
5. **Navigation**: User interactions trigger route changes and new API requests
6. **Search**: Real-time search queries are debounced and cached

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: react, react-dom, @vitejs/plugin-react
- **Routing**: wouter for lightweight client-side routing
- **State Management**: @tanstack/react-query for server state
- **UI Components**: @radix-ui/* components for accessibility

### Database & Backend
- **Database**: @neondatabase/serverless for PostgreSQL connectivity
- **ORM**: drizzle-orm with drizzle-kit for migrations
- **Validation**: zod for runtime type checking

### Development Tools
- **Build**: Vite for fast development and optimized builds
- **TypeScript**: Full TypeScript support across the stack
- **CSS**: Tailwind CSS with PostCSS processing

### Replit Integration
- **Error Handling**: @replit/vite-plugin-runtime-error-modal
- **Development**: @replit/vite-plugin-cartographer for debugging

## Deployment Strategy

The application is configured for deployment on Replit with the following setup:

### Build Process
- **Development**: `npm run dev` runs the Express server with Vite middleware
- **Production**: `npm run build` creates optimized client bundle and server build
- **Database**: `npm run db:push` applies schema changes via Drizzle

### Environment Configuration
- **Node.js 20**: Modern JavaScript features and performance
- **PostgreSQL 16**: Latest stable database version
- **Port Configuration**: Server runs on port 5000, mapped to external port 80

### Deployment Settings
- **Target**: Autoscale deployment for automatic scaling
- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Health Check**: Waits for port 5000 to be available

## Recent Changes

```
Recent Changes:
- July 22, 2025: Logo Navigation & Advanced Search Access Enhancement - COMPLETED ✓
  * Made COMCUBES logo clickable across all pages (HomePage, SectorsPage, IndustriesPage, CompanyPage, SearchPage)
  * Added hover effects and proper cursor styling for logo navigation to homepage
  * Integrated Advanced Search button alongside search bars on SectorsPage, IndustriesPage, and CompanyPage
  * Updated CompanyPage description to highlight global search: "Browse 8,000+ companies locally, or discover millions more worldwide via Advanced Search"
  * Improved user navigation experience with consistent logo behavior following web best practices
  * Enhanced accessibility to Advanced Search feature from all major directory pages

- July 22, 2025: Enhanced Search System with Global Business Discovery - COMPLETED ✓
  * Successfully implemented comprehensive enhanced search system with real-time filtering
  * Integrated Google Custom Search API for worldwide business discovery with working authentication
  * Added dual search modes: Local Directory (8,000+ companies) and Global Search (Google-powered) 
  * Implemented proper "via Google" attribution badges and geographic region detection
  * Created automatic Search Engine ID extraction from HTML embed codes for flexibility
  * Tested and confirmed working global search discovering authentic businesses (Nike, Tesla, etc.)
  * Added advanced filtering capabilities (geographic regions, company sizes, search scopes)
  * Enhanced homepage with "Advanced Search" button and dedicated SearchPage (/search)
  * Active with 100 free daily Google searches, expandable to unlimited ($5 per 1,000 searches)

- July 21, 2025: Complete legal compliance implementation
  * Created comprehensive Privacy Policy page with 10 detailed sections covering data collection, usage, and user rights
  * Created Terms of Service page with 12 sections including trademark usage, affiliate relationships, and liability limitations
  * Created Disclaimer page with 5 sections covering affiliate disclosure, trademark usage, and external links
  * Created Affiliate Disclosure page with detailed FAQ section and cost transparency highlights
  * Added all 4 legal document links to footers across entire website (HomePage, SectorsPage, IndustriesPage, SectorPage, IndustryPage, CompanyPage)
  * All legal pages accessible via routes: /privacy-policy, /terms-of-service, /disclaimer, /affiliate-disclosure
  * Updated all footers with consistent COMCUBES branding and legal compliance links
  * Enhanced visual presentation with color-coded sections, callout boxes, and professional styling

- July 16, 2025: Complete homepage redesign and navigation structure enhancement
  * Redesigned homepage to match professional marketing design with COMCUBES branding
  * Created hero section with statistics cards showing real data (20 sectors, 400+ industries, 8,000+ companies)
  * Added "Why Choose Comcubes GBD?" feature section with 4 professional benefit cards
  * Implemented "Explore by Category" section with visual sector grid
  * Created blue call-to-action section for user engagement
  * Added professional dark footer with company information
  * Created dedicated SectorsPage (/sectors) showing all 20 business sectors in grid layout
  * Created dedicated IndustriesPage (/industries) with pagination for browsing all industries
  * Established proper navigation flow: Homepage → Sectors → Industries → Companies → External websites
  * Updated routing to support new page structure: /, /sectors, /industries, /sector/:name, /industry/:name, /companies
  * All navigation buttons now properly link to existing dedicated pages maintaining the 421-page structure
  * Fixed breadcrumb navigation hierarchy to show proper path: Home > Business Sectors > Sector > Industry
  * Removed top navigation menu from homepage (Home, About, Services, Contact, Sign In) as requested
  * Enhanced user experience with proper back-navigation through breadcrumb system
  * Updated COMCUBES branding across all pages with 100x100 pixel logos in headers and hero section
  * Removed "GBD" text beneath logos for cleaner presentation
  * Standardized header branding to show "COMCUBES" instead of "Global Business Directory"

- June 26, 2025: Implemented COMCUBES branding and enhanced visual system
  * Integrated COMCUBES logo and branding throughout the application
  * Updated site title, meta tags, and SEO optimization for "COMCUBES - Global Business Directory"
  * Retained "Global Business Directory" caption for SEO while highlighting "Everything and Anything Business" slogan
  * Enhanced Media and Entertainment + Professional Services sector images
  * Created comprehensive breadcrumb system with compact COMCUBES header for internal pages

- June 25, 2025: Fixed critical application startup issues & Enhanced visual design
  * Resolved BusinessGrid component error with undefined items array
  * Added proper error handling to all database storage methods  
  * Fixed CSV data loading and database initialization
  * Successfully loaded data from CSV files: 22 sectors, 398+ industries, 7400+ companies
  * API endpoints now fully functional and serving real data
  * Implemented comprehensive image system with 20+ sector-specific images
  * Added 150+ industry-specific high-quality professional images with unique mapping
  * Repositioned card text to center-bottom with gradient overlay for better readability
  * Enhanced image matching algorithm with keyword-based intelligent mapping
  * Improved visual hierarchy with drop shadows and better typography
```

## Changelog

```
Changelog:
- June 24, 2025. Initial setup
- June 25, 2025. Fixed startup errors and got application running successfully
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```