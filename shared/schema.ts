import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, timestamp, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - Required for Replit Auth
// Supports login with Google, Apple, GitHub, X, and email/password
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Organizations table
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

// Goals table - now linked to users
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  organizationId: varchar("organization_id").notNull(),
  progress: real("progress").notNull().default(0),
  target: real("target").notNull(),
  unit: text("unit").notNull(),
  deadline: timestamp("deadline").notNull(),
  pledgeAmount: integer("pledge_amount").notNull(),
  status: text("status").notNull().default("active"),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
  stripePaymentIntentId: true,
  createdAt: true,
}).extend({
  deadline: z.coerce.date(),
  pledgeAmount: z.coerce.number().int(),
  progress: z.coerce.number(),
  target: z.coerce.number(),
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

// Strava connections table - now linked to users
export const stravaConnections = pgTable("strava_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  athleteId: varchar("athlete_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  athleteName: text("athlete_name").notNull(),
  athleteProfileUrl: text("athlete_profile_url"),
});

export const insertStravaConnectionSchema = createInsertSchema(stravaConnections).omit({
  id: true,
  userId: true,
});

export type InsertStravaConnection = z.infer<typeof insertStravaConnectionSchema>;
export type StravaConnection = typeof stravaConnections.$inferSelect;

// Relations - explicit modeling using Drizzle relations operator
export const usersRelations = relations(users, ({ many }) => ({
  goals: many(goals),
  stravaConnection: many(stravaConnections),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [goals.organizationId],
    references: [organizations.id],
  }),
}));

export const stravaConnectionsRelations = relations(stravaConnections, ({ one }) => ({
  user: one(users, {
    fields: [stravaConnections.userId],
    references: [users.id],
  }),
}));
