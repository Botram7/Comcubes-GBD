# Global Business Directory

## Overview

This is a full-stack web application that provides a hierarchical business directory system organized by sectors, industries, and companies. Users can browse through business sectors, drill down into specific industries, and view companies within those industries. The application features a clean, modern interface with search functionality and responsive design.

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
- June 25, 2025: Fixed critical application startup issues
  * Resolved BusinessGrid component error with undefined items array
  * Added proper error handling to all database storage methods  
  * Fixed CSV data loading and database initialization
  * Worked around Vite configuration type error
  * Successfully loaded data from CSV files: 22 sectors, 398+ industries, 7400+ companies
  * API endpoints now fully functional and serving real data
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