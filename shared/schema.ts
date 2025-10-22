import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const organizations = pgTable("organizations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  mission: text("mission").notNull(),
  category: text("category").notNull(),
  verified: integer("verified").notNull().default(1),
});

export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
});

export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizations.$inferSelect;

export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  organizationId: varchar("organization_id").notNull(),
  progress: real("progress").notNull().default(0),
  target: real("target").notNull(),
  unit: text("unit").notNull(),
  deadline: timestamp("deadline").notNull(),
  pledgeAmount: integer("pledge_amount").notNull(),
  status: text("status").notNull().default("active"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  stripePaymentIntentId: true,
}).extend({
  deadline: z.coerce.date(),
  pledgeAmount: z.coerce.number().int(),
  progress: z.coerce.number(),
  target: z.coerce.number(),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export const stravaConnections = pgTable("strava_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  athleteId: varchar("athlete_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  athleteName: text("athlete_name").notNull(),
  athleteProfileUrl: text("athlete_profile_url"),
});

export const insertStravaConnectionSchema = createInsertSchema(stravaConnections).omit({
  id: true,
});

export type InsertStravaConnection = z.infer<typeof insertStravaConnectionSchema>;
export type StravaConnection = typeof stravaConnections.$inferSelect;
