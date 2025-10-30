import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertOrganizationSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import Stripe from "stripe";

// Lazy initialization of Stripe to handle missing secrets gracefully
let stripe: Stripe | null = null;

function getStripeClient(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
  }
  return stripe;
}

// Strava configuration
const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID || "";
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET || "";
const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_URL = "https://www.strava.com/api/v3";

function validateStravaConfig() {
  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    throw new Error("Strava configuration missing. Please set STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET environment variables.");
  }
}

// Helper function to refresh Strava access token
async function refreshStravaToken(refreshToken: string) {
  const response = await fetch(STRAVA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh Strava token");
  }

  return await response.json();
}

// Helper function to get valid access token
async function getValidStravaToken(userId: string) {
  const connection = await storage.getStravaConnection(userId);
  if (!connection) {
    throw new Error("Strava connection not found");
  }

  const now = new Date();
  const expiresAt = new Date(connection.expiresAt);

  if (now >= expiresAt) {
    const tokenData = await refreshStravaToken(connection.refreshToken);
    const updatedConnection = await storage.upsertStravaConnection({
      athleteId: connection.athleteId,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: new Date(tokenData.expires_at * 1000),
      athleteName: connection.athleteName,
      athleteProfileUrl: connection.athleteProfileUrl,
    }, userId);
    return updatedConnection.accessToken;
  }

  return connection.accessToken;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth - supports Google, Apple, GitHub, X, email/password
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Organizations routes (public)
  app.get("/api/organizations", async (req, res) => {
    try {
      const organizations = await storage.getAllOrganizations();
      res.json(organizations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organizations" });
    }
  });

  app.get("/api/organizations/:id", async (req, res) => {
    try {
      const organization = await storage.getOrganization(req.params.id);
      if (!organization) {
        return res.status(404).json({ error: "Organization not found" });
      }
      res.json(organization);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch organization" });
    }
  });

  // Goals routes (protected - user-specific)
  app.get("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goals = await storage.getAllGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.getGoal(req.params.id, userId);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goal" });
    }
  });

  app.post("/api/goals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      console.log("Received goal data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData, userId);
      res.status(201).json(goal);
    } catch (error) {
      console.error("Goal validation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Failed to create goal" });
      }
    }
  });

  app.patch("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const goal = await storage.updateGoal(req.params.id, userId, req.body);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deleted = await storage.deleteGoal(req.params.id, userId);
      if (!deleted) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Stripe payment intent creation (protected)
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const stripeClient = getStripeClient();
      const { amount, goalId } = req.body;
      
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          goalId,
        },
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({ error: "Failed to create payment intent" });
    }
  });

  // Process failed goal donation (protected)
  app.post("/api/goals/:id/process-donation", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stripeClient = getStripeClient();
      const goal = await storage.getGoal(req.params.id, userId);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      // Create payment intent for the pledge amount
      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: goal.pledgeAmount * 100,
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          goalId: goal.id,
          goalTitle: goal.title,
        },
      });

      // Update goal with payment intent ID
      await storage.updateGoal(goal.id, userId, {
        stripePaymentIntentId: paymentIntent.id,
      });

      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: goal.pledgeAmount,
      });
    } catch (error) {
      console.error("Error processing donation:", error);
      res.status(500).json({ error: "Failed to process donation" });
    }
  });

  // Strava OAuth routes (protected)
  app.get("/api/strava/connect", isAuthenticated, (req, res) => {
    try {
      validateStravaConfig();
      // Use https for Replit (req.protocol returns http behind proxy)
      const protocol = req.get('host')?.includes('replit.dev') ? 'https' : req.protocol;
      const redirectUri = `${protocol}://${req.get('host')}/api/strava/callback`;
      console.log("Strava OAuth redirect URI:", redirectUri);
      const authUrl = `${STRAVA_AUTH_URL}?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=activity:read_all&approval_prompt=auto`;
      res.redirect(authUrl);
    } catch (error) {
      console.error("Strava configuration error:", error);
      res.redirect("/?strava=config_error");
    }
  });

  app.get("/api/strava/callback", isAuthenticated, async (req: any, res) => {
    console.log("Strava callback received! Query params:", req.query);
    const { code, error } = req.query;

    if (error) {
      console.error("Strava authorization error:", error);
      return res.redirect("/?strava=error");
    }

    if (!code || typeof code !== 'string') {
      console.error("Missing authorization code");
      return res.status(400).send("Missing authorization code");
    }

    try {
      const userId = req.user.claims.sub;
      console.log("Exchanging code for tokens...");
      const response = await fetch(STRAVA_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: "authorization_code",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Token exchange failed:", response.status, errorText);
        throw new Error("Failed to exchange code for token");
      }

      const data = await response.json();
      console.log("Tokens received, athlete ID:", data.athlete.id);

      const athleteId = String(data.athlete.id);
      
      await storage.upsertStravaConnection({
        athleteId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(data.expires_at * 1000),
        athleteName: `${data.athlete.firstname} ${data.athlete.lastname}`,
        athleteProfileUrl: data.athlete.profile,
      }, userId);

      console.log("Strava connection saved successfully");
      res.redirect(`/?strava=connected`);
    } catch (error) {
      console.error("Strava OAuth error:", error);
      res.redirect("/?strava=error");
    }
  });

  app.get("/api/strava/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const connection = await storage.getStravaConnection(userId);
      res.json({ 
        connected: !!connection,
        athleteName: connection?.athleteName,
        athleteProfileUrl: connection?.athleteProfileUrl,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get Strava status" });
    }
  });

  app.post("/api/strava/disconnect", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.deleteStravaConnection(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      res.status(500).json({ error: "Failed to disconnect Strava" });
    }
  });

  app.post("/api/strava/sync/:goalId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { goalId } = req.params;

      console.log(`[Strava Sync] Starting sync for goal ${goalId}, user ${userId}`);

      const goal = await storage.getGoal(goalId, userId);
      if (!goal) {
        console.log(`[Strava Sync] Goal not found: ${goalId}`);
        return res.status(404).json({ error: "Goal not found" });
      }

      console.log(`[Strava Sync] Goal found: ${goal.title}, unit: ${goal.unit}`);

      // Check if Strava is connected
      let accessToken: string;
      try {
        accessToken = await getValidStravaToken(userId);
        console.log(`[Strava Sync] Got valid Strava token`);
      } catch (error) {
        console.log(`[Strava Sync] Strava not connected:`, error);
        return res.status(400).json({ error: "Please connect your Strava account first" });
      }

      // Fetch activities from goal creation date (or last 90 days, whichever is more recent)
      const goalCreationTime = goal.createdAt ? new Date(goal.createdAt).getTime() : Date.now();
      const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
      const afterTimestamp = Math.max(goalCreationTime, ninetyDaysAgo);
      const after = Math.floor(afterTimestamp / 1000);

      console.log(`[Strava Sync] Fetching activities after: ${new Date(afterTimestamp).toISOString()}`);

      const activitiesResponse = await fetch(
        `${STRAVA_API_URL}/athlete/activities?after=${after}&per_page=100`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!activitiesResponse.ok) {
        console.log(`[Strava Sync] Failed to fetch activities: ${activitiesResponse.status}`);
        throw new Error("Failed to fetch Strava activities");
      }

      const activities = await activitiesResponse.json();
      console.log(`[Strava Sync] Fetched ${activities.length} activities`);

      let totalDistance = 0;
      if (goal.unit === "km") {
        totalDistance = activities.reduce((sum: number, activity: any) => 
          sum + (activity.distance / 1000), 0
        );
      } else if (goal.unit === "miles") {
        totalDistance = activities.reduce((sum: number, activity: any) => 
          sum + (activity.distance / 1609.34), 0
        );
      }

      console.log(`[Strava Sync] Calculated total distance: ${totalDistance} ${goal.unit}`);

      const updatedGoal = await storage.updateGoal(goalId, userId, {
        progress: Math.round(totalDistance * 100) / 100,
      });

      if (!updatedGoal) {
        throw new Error("Failed to update goal");
      }

      console.log(`[Strava Sync] Updated goal progress to: ${updatedGoal.progress}`);

      res.json(updatedGoal);
    } catch (error) {
      console.error("[Strava Sync] Error syncing Strava data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to sync Strava data";
      res.status(500).json({ error: errorMessage });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
