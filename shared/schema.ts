import { pgTable, text, integer, timestamp, json, varchar, serial, boolean } from 'drizzle-orm/pg-core';
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

// Company Claims table (for claiming existing company listings)
export const companyClaims = pgTable('company_claims', {
  id: serial('id').primaryKey(),
  companyId: integer('company_id').notNull(), // Reference to existing company
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  websiteUrl: text('website_url'),
  companyDescription: text('company_description').notNull(),
  logoImagePath: text('logo_image_path'),
  logoImageOriginalName: text('logo_image_original_name'),
  plan: text('plan').notNull(), // 'basic', 'premium', 'enterprise'
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'rejected', 'completed'
  adminNotes: text('admin_notes'),
  submittedAt: timestamp('submitted_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  emailVerified: boolean('email_verified').default(false).notNull(),
  verificationCode: text('verification_code'),
  verificationSentAt: timestamp('verification_sent_at'),
  verificationExpiresAt: timestamp('verification_expires_at'),
});

// Banner Ads table for persistent banner ad management
export const bannerAds = pgTable('banner_ads', {
  id: serial('id').primaryKey(),
  position: text('position').notNull(), // 'left' or 'right'
  images: json('images').$type<string[]>().default([]).notNull(), // Array of image URLs
  imageUrls: json('image_urls').$type<string[]>().default([]).notNull(), // Individual URLs for each image
  clickUrl: text('click_url'),
  rotationInterval: integer('rotation_interval').default(7000).notNull(), // Milliseconds, default 7 seconds
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Ad Performance Analytics table
export const adAnalytics = pgTable('ad_analytics', {
  id: serial('id').primaryKey(),
  bannerId: integer('banner_id').notNull(), // Reference to banner_ads.id
  eventType: text('event_type').notNull(), // 'view', 'click', 'impression'
  imageUrl: text('image_url'), // Which specific image was interacted with
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  referrerPage: text('referrer_page'), // Which page the user was on
  timestamp: timestamp('timestamp').defaultNow().notNull(),
});

// Daily ad performance summary for efficient querying
export const adPerformanceSummary = pgTable('ad_performance_summary', {
  id: serial('id').primaryKey(),
  bannerId: integer('banner_id').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD format
  imageUrl: text('image_url'),
  impressions: integer('impressions').default(0).notNull(),
  views: integer('views').default(0).notNull(),
  clicks: integer('clicks').default(0).notNull(),
  clickThroughRate: text('click_through_rate'), // Stored as string for precision
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Email Logs table for tracking sent emails
export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  recipientEmail: text('recipient_email').notNull(),
  senderEmail: text('sender_email').notNull(),
  subject: text('subject').notNull(),
  content: text('content').notNull(),
  emailType: text('email_type').notNull(), // 'waitlist_notification', 'claim_approval', etc.
  relatedId: integer('related_id'), // Reference to related record (waitlist ID, claim ID, etc.)
  sentAt: timestamp('sent_at').defaultNow().notNull(),
  deliveryStatus: text('delivery_status').default('sent').notNull(), // 'sent', 'delivered', 'failed'
});

// Type exports
export type Sector = typeof sectors.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type CompanyListing = typeof companyListings.$inferSelect;
export type IndustryWaitlist = typeof industryWaitlist.$inferSelect;
export type CompanyClaim = typeof companyClaims.$inferSelect;
export type BannerAd = typeof bannerAds.$inferSelect;
export type AdAnalytics = typeof adAnalytics.$inferSelect;
export type AdPerformanceSummary = typeof adPerformanceSummary.$inferSelect;
export type EmailLog = typeof emailLogs.$inferSelect;

export type InsertSector = typeof sectors.$inferInsert;
export type InsertIndustry = typeof industries.$inferInsert;
export type InsertCompany = typeof companies.$inferInsert;
export type InsertContactMessage = typeof contactMessages.$inferInsert;
export type InsertCompanyListing = typeof companyListings.$inferInsert;
export type InsertIndustryWaitlist = typeof industryWaitlist.$inferInsert;
export type InsertCompanyClaim = typeof companyClaims.$inferInsert;
export type InsertBannerAd = typeof bannerAds.$inferInsert;
export type InsertAdAnalytics = typeof adAnalytics.$inferInsert;
export type InsertAdPerformanceSummary = typeof adPerformanceSummary.$inferInsert;
export type InsertEmailLog = typeof emailLogs.$inferInsert;

// Zod schemas for validation
export const insertSectorSchema = createInsertSchema(sectors);
export const insertIndustrySchema = createInsertSchema(industries);
export const insertCompanySchema = createInsertSchema(companies);
export const insertContactMessageSchema = createInsertSchema(contactMessages).extend({
  contactType: z.enum(['General Inquiry', 'Company Listing', 'Technical Support', 'Partnership']),
});
export const insertCompanyListingSchema = createInsertSchema(companyListings);
export const insertIndustryWaitlistSchema = createInsertSchema(industryWaitlist);
export const insertCompanyClaimSchema = createInsertSchema(companyClaims);

export const selectSectorSchema = createSelectSchema(sectors);
export const selectIndustrySchema = createSelectSchema(industries);
export const selectCompanySchema = createSelectSchema(companies);
export const selectContactMessageSchema = createSelectSchema(contactMessages);
export const selectCompanyListingSchema = createSelectSchema(companyListings);
export const selectIndustryWaitlistSchema = createSelectSchema(industryWaitlist);
export const selectCompanyClaimSchema = createSelectSchema(companyClaims);
export const insertBannerAdSchema = createInsertSchema(bannerAds);
export const selectBannerAdSchema = createSelectSchema(bannerAds);
export const insertEmailLogSchema = createInsertSchema(emailLogs);
export const selectEmailLogSchema = createSelectSchema(emailLogs);