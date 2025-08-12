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
  notified: timestamp('notified').default(null),
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