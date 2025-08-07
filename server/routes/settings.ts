import { Router } from "express";
import { db } from "../storage";
import { userSettings } from "@shared/schema";
import type { UserSettings } from "@shared/settings";

const router = Router();

// For now, use a static userId (to be replaced with real auth)
const STATIC_USER_ID = "demo-user";

// GET /api/settings
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(userSettings).where(userSettings.userId.eq(STATIC_USER_ID));
    if (result.length > 0) {
      res.json(result[0].settings);
    } else {
      res.json(null);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to load settings" });
  }
});

// POST /api/settings
router.post("/", async (req, res) => {
  try {
    const settings: UserSettings = req.body;
    await db
      .insert(userSettings)
      .values({ userId: STATIC_USER_ID, settings })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: { settings },
      });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save settings" });
  }
});

export default router;
