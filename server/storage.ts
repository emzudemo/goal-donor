// Database storage using PostgreSQL with Drizzle ORM
import { 
  users, 
  organizations, 
  goals, 
  stravaConnections,
  type User, 
  type UpsertUser,
  type Organization, 
  type InsertOrganization, 
  type Goal, 
  type InsertGoal, 
  type StravaConnection, 
  type InsertStravaConnection 
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Organization operations
  getAllOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  // Goal operations - now filtered by user
  getAllGoals(userId: string): Promise<Goal[]>;
  getGoal(id: string, userId: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal, userId: string): Promise<Goal>;
  updateGoal(id: string, userId: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string, userId: string): Promise<boolean>;
  
  // Strava connection operations - now filtered by user
  getStravaConnection(userId: string): Promise<StravaConnection | undefined>;
  upsertStravaConnection(connection: InsertStravaConnection, userId: string): Promise<StravaConnection>;
  deleteStravaConnection(userId: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Seed organizations if needed
    this.seedOrganizations();
  }

  private async seedOrganizations() {
    try {
      const existingOrgs = await db.select().from(organizations);
      if (existingOrgs.length > 0) return;

      const orgs: InsertOrganization[] = [
        {
          name: "Clean Water Initiative",
          mission: "Providing safe drinking water to communities in need across 45 countries",
          category: "Water & Sanitation",
          verified: 1,
        },
        {
          name: "Wildlife Conservation Fund",
          mission: "Protecting endangered species and preserving natural habitats worldwide",
          category: "Environment",
          verified: 1,
        },
        {
          name: "Education For All",
          mission: "Building schools and providing quality education to underserved communities",
          category: "Education",
          verified: 1,
        },
        {
          name: "Global Health Alliance",
          mission: "Delivering medical care and disease prevention programs in developing nations",
          category: "Healthcare",
          verified: 1,
        },
        {
          name: "Ocean Protection Society",
          mission: "Combating ocean pollution and protecting marine ecosystems",
          category: "Environment",
          verified: 1,
        },
        {
          name: "Children's Literacy Project",
          mission: "Promoting reading skills and access to books for children in poverty",
          category: "Education",
          verified: 1,
        },
      ];

      await db.insert(organizations).values(orgs);
    } catch (error) {
      console.error("Error seeding organizations:", error);
    }
  }

  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Organization operations
  async getAllOrganizations(): Promise<Organization[]> {
    return await db.select().from(organizations);
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
    return org;
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const [organization] = await db
      .insert(organizations)
      .values(org)
      .returning();
    return organization;
  }

  // Goal operations - now filtered by user
  async getAllGoals(userId: string): Promise<Goal[]> {
    return await db.select().from(goals).where(eq(goals.userId, userId));
  }

  async getGoal(id: string, userId: string): Promise<Goal | undefined> {
    const [goal] = await db
      .select()
      .from(goals)
      .where(eq(goals.id, id));
    
    if (!goal || goal.userId !== userId) return undefined;
    return goal;
  }

  async createGoal(insertGoal: InsertGoal, userId: string): Promise<Goal> {
    const [goal] = await db
      .insert(goals)
      .values({
        ...insertGoal,
        userId,
        progress: 0,
        status: "active",
      })
      .returning();
    return goal;
  }

  async updateGoal(id: string, userId: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const existing = await this.getGoal(id, userId);
    if (!existing) return undefined;

    const [goal] = await db
      .update(goals)
      .set(updates)
      .where(eq(goals.id, id))
      .returning();
    return goal;
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    const existing = await this.getGoal(id, userId);
    if (!existing) return false;

    await db.delete(goals).where(eq(goals.id, id));
    return true;
  }

  // Strava connection operations - now filtered by user
  async getStravaConnection(userId: string): Promise<StravaConnection | undefined> {
    const [connection] = await db
      .select()
      .from(stravaConnections)
      .where(eq(stravaConnections.userId, userId));
    return connection;
  }

  async upsertStravaConnection(insertConnection: InsertStravaConnection, userId: string): Promise<StravaConnection> {
    const [connection] = await db
      .insert(stravaConnections)
      .values({
        ...insertConnection,
        userId,
      })
      .onConflictDoUpdate({
        target: stravaConnections.userId,
        set: {
          athleteId: insertConnection.athleteId,
          accessToken: insertConnection.accessToken,
          refreshToken: insertConnection.refreshToken,
          expiresAt: insertConnection.expiresAt,
          athleteName: insertConnection.athleteName,
          athleteProfileUrl: insertConnection.athleteProfileUrl,
        },
      })
      .returning();
    return connection;
  }

  async deleteStravaConnection(userId: string): Promise<boolean> {
    const result = await db
      .delete(stravaConnections)
      .where(eq(stravaConnections.userId, userId));
    return true;
  }
}

export const storage = new DatabaseStorage();
