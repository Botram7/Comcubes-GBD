import { pgTable, text, integer, timestamp, json, varchar, serial } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const sectors = pgTable('sectors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
});

export const industries = pgTable('industries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  sectorName: text('sector_name').notNull(),
});

export const companies = pgTable('companies', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  websiteUrl: text('website_url'),
  industryName: text('industry_name').notNull(),
  sectorName: text('sector_name').notNull(),
  // Keep existing logo fields
  logoUrl: text('logo_url'),
  logoStatus: text('logo_status'),
  logoFetchedAt: timestamp('logo_fetched_at'),
  logoQuality: text('logo_quality'),
});

// Contact Messages table
export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  contactType: text('contact_type').notNull(), // 'general', 'technical', 'business', 'listing'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  // Keep existing field
  status: text('status'),
});

// Company Listings table
export const companyListings = pgTable('company_listings', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  contactEmail: text('contact_email').notNull(),
  sectorName: text('sector_name').notNull(),
  industryName: text('industry_name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  paymentAmount: text('payment_amount').notNull(), // Stored as string to preserve decimal precision
  paymentStatus: text('payment_status').default('pending').notNull(), // 'pending', 'completed', 'failed'
  paymentReference: text('payment_reference'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  // Keep existing fields
  listingStatus: text('listing_status'),
  reviewedAt: timestamp('reviewed_at'),
  publishedAt: timestamp('published_at'),
});

// Waitlist for full industries
export const industryWaitlist = pgTable('industry_waitlist', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  websiteUrl: text('website_url').notNull(),
  contactEmail: text('contact_email').notNull(),
  sectorName: text('sector_name').notNull(),
  industryName: text('industry_name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  notified: timestamp('notified'),
});

// Type exports
export type Sector = typeof sectors.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type CompanyListing = typeof companyListings.$inferSelect;
export type IndustryWaitlist = typeof industryWaitlist.$inferSelect;

export type InsertSector = typeof sectors.$inferInsert;
export type InsertIndustry = typeof industries.$inferInsert;
export type InsertCompany = typeof companies.$inferInsert;
export type InsertContactMessage = typeof contactMessages.$inferInsert;
export type InsertCompanyListing = typeof companyListings.$inferInsert;
export type InsertIndustryWaitlist = typeof industryWaitlist.$inferInsert;

// Zod schemas for validation
export const insertSectorSchema = createInsertSchema(sectors);
export const insertIndustrySchema = createInsertSchema(industries);
export const insertCompanySchema = createInsertSchema(companies);
export const insertContactMessageSchema = createInsertSchema(contactMessages).extend({
  contactType: z.enum(['General Inquiry', 'Company Listing', 'Technical Support', 'Partnership']),
});
export const insertCompanyListingSchema = createInsertSchema(companyListings);
export const insertIndustryWaitlistSchema = createInsertSchema(industryWaitlist);

export const selectSectorSchema = createSelectSchema(sectors);
export const selectIndustrySchema = createSelectSchema(industries);
export const selectCompanySchema = createSelectSchema(companies);
export const selectContactMessageSchema = createSelectSchema(contactMessages);
export const selectCompanyListingSchema = createSelectSchema(companyListings);
export const selectIndustryWaitlistSchema = createSelectSchema(industryWaitlist);

// Users table for Phase 2: User Account System
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  isEmailVerified: integer('is_email_verified').default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at'),
});

// User favorites table
export const userFavorites = pgTable('user_favorites', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  entityType: text('entity_type').notNull(), // 'company', 'industry', 'sector'
  entityId: integer('entity_id').notNull(),
  entityName: text('entity_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User saved searches table
export const userSavedSearches = pgTable('user_saved_searches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  searchQuery: text('search_query').notNull(),
  searchType: text('search_type').notNull(), // 'local', 'global'
  resultCount: integer('result_count').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User activity tracking for analytics
export const userActivityLog = pgTable('user_activity_log', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'), // nullable for anonymous users
  sessionId: text('session_id').notNull(),
  actionType: text('action_type').notNull(), // 'page_view', 'search', 'company_view', 'favorite_add', etc.
  entityType: text('entity_type'), // 'company', 'industry', 'sector', 'search_result'
  entityId: integer('entity_id'), // ID of the entity interacted with
  entityName: text('entity_name'), // Name for easier reporting
  metadata: json('metadata'), // Additional data (search terms, filters, etc.)
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Analytics aggregation tables for performance
export const dailyAnalytics = pgTable('daily_analytics', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(), // YYYY-MM-DD format
  totalVisits: integer('total_visits').default(0).notNull(),
  uniqueVisitors: integer('unique_visitors').default(0).notNull(),
  totalSearches: integer('total_searches').default(0).notNull(),
  topSector: text('top_sector'),
  topIndustry: text('top_industry'),
  topSearchTerm: text('top_search_term'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Recently viewed items for users
export const userRecentlyViewed = pgTable('user_recently_viewed', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  sessionId: text('session_id').notNull(), // For anonymous users
  entityType: text('entity_type').notNull(), // 'company', 'industry', 'sector'
  entityId: integer('entity_id').notNull(),
  entityName: text('entity_name').notNull(),
  viewedAt: timestamp('viewed_at').defaultNow().notNull(),
});

// Type exports for new tables
export type User = typeof users.$inferSelect;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type UserSavedSearch = typeof userSavedSearches.$inferSelect;
export type UserActivityLog = typeof userActivityLog.$inferSelect;
export type DailyAnalytics = typeof dailyAnalytics.$inferSelect;
export type UserRecentlyViewed = typeof userRecentlyViewed.$inferSelect;

export type InsertUser = typeof users.$inferInsert;
export type InsertUserFavorite = typeof userFavorites.$inferInsert;
export type InsertUserSavedSearch = typeof userSavedSearches.$inferInsert;
export type InsertUserActivityLog = typeof userActivityLog.$inferInsert;
export type InsertDailyAnalytics = typeof dailyAnalytics.$inferInsert;
export type InsertUserRecentlyViewed = typeof userRecentlyViewed.$inferInsert;

// Zod schemas for new tables
export const insertUserSchema = createInsertSchema(users).extend({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
}).omit({ id: true, createdAt: true, lastLoginAt: true, passwordHash: true });

export const loginUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerUserSchema = insertUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const insertUserFavoriteSchema = createInsertSchema(userFavorites).omit({ id: true, createdAt: true });
export const insertUserSavedSearchSchema = createInsertSchema(userSavedSearches).omit({ id: true, createdAt: true });
export const insertUserActivityLogSchema = createInsertSchema(userActivityLog).omit({ id: true, createdAt: true });
export const insertUserRecentlyViewedSchema = createInsertSchema(userRecentlyViewed).omit({ id: true, viewedAt: true });

export const selectUserSchema = createSelectSchema(users);
export const selectUserFavoriteSchema = createSelectSchema(userFavorites);
export const selectUserSavedSearchSchema = createSelectSchema(userSavedSearches);
export const selectUserActivityLogSchema = createSelectSchema(userActivityLog);
export const selectDailyAnalyticsSchema = createSelectSchema(dailyAnalytics);
export const selectUserRecentlyViewedSchema = createSelectSchema(userRecentlyViewed);