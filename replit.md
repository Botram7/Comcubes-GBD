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
- **Slot Management System**: Implemented industry capacity limits (max 20 companies per industry) with automatic waitlist functionality. Includes slot availability checking, resume payment capabilities for incomplete transactions, and admin dashboard for managing company listings and waitlist entries. Date: August 12, 2025.

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