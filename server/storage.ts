import { type User, type InsertUser, type Organization, type InsertOrganization, type Goal, type InsertGoal } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllOrganizations(): Promise<Organization[]>;
  getOrganization(id: string): Promise<Organization | undefined>;
  createOrganization(org: InsertOrganization): Promise<Organization>;
  
  getAllGoals(): Promise<Goal[]>;
  getGoal(id: string): Promise<Goal | undefined>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined>;
  deleteGoal(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private organizations: Map<string, Organization>;
  private goals: Map<string, Goal>;

  constructor() {
    this.users = new Map();
    this.organizations = new Map();
    this.goals = new Map();
    
    this.seedOrganizations();
  }

  private seedOrganizations() {
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

    orgs.forEach(org => {
      const id = randomUUID();
      const organization: Organization = { 
        id,
        name: org.name,
        mission: org.mission,
        category: org.category,
        verified: org.verified ?? 1,
      };
      this.organizations.set(id, organization);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllOrganizations(): Promise<Organization[]> {
    return Array.from(this.organizations.values());
  }

  async getOrganization(id: string): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(org: InsertOrganization): Promise<Organization> {
    const id = randomUUID();
    const organization: Organization = { 
      id,
      name: org.name,
      mission: org.mission,
      category: org.category,
      verified: org.verified ?? 1,
    };
    this.organizations.set(id, organization);
    return organization;
  }

  async getAllGoals(): Promise<Goal[]> {
    return Array.from(this.goals.values());
  }

  async getGoal(id: string): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = randomUUID();
    const goal: Goal = { 
      id,
      title: insertGoal.title,
      organizationId: insertGoal.organizationId,
      progress: insertGoal.progress ?? 0,
      target: insertGoal.target,
      unit: insertGoal.unit,
      deadline: insertGoal.deadline,
      pledgeAmount: insertGoal.pledgeAmount,
      status: insertGoal.status ?? "active",
      stripePaymentIntentId: null,
    };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | undefined> {
    const goal = this.goals.get(id);
    if (!goal) return undefined;
    
    const updated = { ...goal, ...updates };
    this.goals.set(id, updated);
    return updated;
  }

  async deleteGoal(id: string): Promise<boolean> {
    return this.goals.delete(id);
  }
}

export const storage = new MemStorage();
