import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const sectors = pgTable("sectors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const industries = pgTable("industries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sectorName: text("sector_name").notNull(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  websiteUrl: text("website_url"),
  industryName: text("industry_name").notNull(),
  sectorName: text("sector_name").notNull(),
  logoUrl: text("logo_url"),
  logoStatus: text("logo_status").default("pending"), // pending, fetched, failed, removed
  logoFetchedAt: timestamp("logo_fetched_at"),
  logoQuality: text("logo_quality"), // high, medium, low
});

export const insertSectorSchema = createInsertSchema(sectors).omit({ id: true });
export const insertIndustrySchema = createInsertSchema(industries).omit({ id: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true });

export type Sector = typeof sectors.$inferSelect;
export type Industry = typeof industries.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type InsertSector = z.infer<typeof insertSectorSchema>;
export type InsertIndustry = z.infer<typeof insertIndustrySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
