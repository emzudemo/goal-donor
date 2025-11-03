import type { Express, Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "./supabase";
import { storage } from "./storage";

// Middleware to verify Supabase JWT token
export const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: "No authorization token provided" });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the JWT token with Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Ensure user exists in our database
    let dbUser = await storage.getUser(user.id);
    if (!dbUser) {
      // Create user if they don't exist using upsertUser
      dbUser = await storage.upsertUser({
        id: user.id,
        email: user.email || '',
        firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name || '',
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || '',
        profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      });
    }

    // Attach user to request (compatible with existing replitAuth structure)
    req.user = {
      claims: {
        sub: user.id,
        email: user.email || '',
        first_name: dbUser.firstName,
        last_name: dbUser.lastName,
        profile_image_url: dbUser.profileImageUrl,
      }
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Authentication failed" });
  }
};

// Setup authentication routes
export async function setupAuth(app: Express) {
  // Get current user
  app.get('/api/auth/user', isAuthenticated, async (req: any, res: Response) => {
    try {
      if (!req.user || !req.user.claims) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.claims.sub);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Logout endpoint (client-side handles Supabase signOut)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    res.json({ message: "Logged out successfully" });
  });

  // Health check
  app.get('/api/auth/status', (req: Request, res: Response) => {
    res.json({ message: "Supabase Auth configured" });
  });
}
