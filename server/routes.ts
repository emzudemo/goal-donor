import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertOrganizationSchema } from "@shared/schema";
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
async function getValidStravaToken(athleteId: string) {
  const connection = await storage.getStravaConnection(athleteId);
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
    });
    return updatedConnection.accessToken;
  }

  return connection.accessToken;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Organizations routes
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

  // Goals routes
  app.get("/api/goals", async (req, res) => {
    try {
      const goals = await storage.getAllGoals();
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goals" });
    }
  });

  app.get("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.getGoal(req.params.id);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goal" });
    }
  });

  app.post("/api/goals", async (req, res) => {
    try {
      console.log("Received goal data:", JSON.stringify(req.body, null, 2));
      const validatedData = insertGoalSchema.parse(req.body);
      const goal = await storage.createGoal(validatedData);
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

  app.patch("/api/goals/:id", async (req, res) => {
    try {
      const goal = await storage.updateGoal(req.params.id, req.body);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ error: "Failed to update goal" });
    }
  });

  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteGoal(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Goal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete goal" });
    }
  });

  // Stripe payment intent creation
  app.post("/api/create-payment-intent", async (req, res) => {
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

  // Process failed goal donation
  app.post("/api/goals/:id/process-donation", async (req, res) => {
    try {
      const stripeClient = getStripeClient();
      const goal = await storage.getGoal(req.params.id);
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
      await storage.updateGoal(goal.id, {
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

  // Strava OAuth routes
  app.get("/api/strava/connect", (req, res) => {
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

  app.get("/api/strava/callback", async (req, res) => {
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
      });

      console.log("Strava connection saved successfully");
      res.redirect(`/?strava=connected&athleteId=${athleteId}`);
    } catch (error) {
      console.error("Strava OAuth error:", error);
      res.redirect("/?strava=error");
    }
  });

  app.get("/api/strava/status", async (req, res) => {
    const { athleteId } = req.query;
    
    if (!athleteId || typeof athleteId !== 'string') {
      return res.json({ connected: false });
    }

    const connection = await storage.getStravaConnection(athleteId);
    res.json({ 
      connected: !!connection,
      athleteName: connection?.athleteName,
      athleteProfileUrl: connection?.athleteProfileUrl,
    });
  });

  app.post("/api/strava/disconnect", async (req, res) => {
    try {
      const { athleteId } = req.body;
      if (!athleteId) {
        return res.status(400).json({ error: "Missing athleteId" });
      }

      await storage.deleteStravaConnection(athleteId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting Strava:", error);
      res.status(500).json({ error: "Failed to disconnect Strava" });
    }
  });

  app.post("/api/strava/sync/:goalId", async (req, res) => {
    try {
      const { goalId } = req.params;
      const { athleteId } = req.body;

      if (!athleteId) {
        return res.status(400).json({ error: "Missing athleteId" });
      }

      const goal = await storage.getGoal(goalId);
      if (!goal) {
        return res.status(404).json({ error: "Goal not found" });
      }

      const accessToken = await getValidStravaToken(athleteId);

      const after = Math.floor(new Date(goal.deadline).getTime() / 1000) - (30 * 24 * 60 * 60);
      const activitiesResponse = await fetch(
        `${STRAVA_API_URL}/athlete/activities?after=${after}&per_page=100`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!activitiesResponse.ok) {
        throw new Error("Failed to fetch Strava activities");
      }

      const activities = await activitiesResponse.json();

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

      const updatedGoal = await storage.updateGoal(goalId, {
        progress: Math.round(totalDistance * 100) / 100,
      });

      res.json(updatedGoal);
    } catch (error) {
      console.error("Error syncing Strava data:", error);
      res.status(500).json({ error: "Failed to sync Strava data" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
