import { Router } from "express";
import { exec } from "child_process";

const router = Router();

// Helper to run git commands
function runGit(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
      if (err) reject(stderr || err.message);
      else resolve(stdout);
    });
  });
}

// GET /api/git/status
router.get("/status", async (_req, res) => {
  try {
    const status = await runGit("git status --porcelain");
    res.json({ status });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// GET /api/git/history
router.get("/history", async (_req, res) => {
  try {
    const log = await runGit("git log --oneline --decorate --graph -n 50");
    res.json({ log });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/commit
router.post("/commit", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Missing commit message" });
  try {
    const out = await runGit(`git commit -am "${message.replace(/"/g, '\"')}"`);
    res.json({ out });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/push
router.post("/push", async (_req, res) => {
  try {
    const out = await runGit("git push");
    res.json({ out });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/pull
router.post("/pull", async (_req, res) => {
  try {
    const out = await runGit("git pull");
    res.json({ out });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/add
router.post("/add", async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: "Missing file" });
  try {
    const out = await runGit(`git add "${file.replace(/"/g, '\"')}"`);
    res.json({ out });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// POST /api/git/reset
router.post("/reset", async (req, res) => {
  const { file } = req.body;
  if (!file) return res.status(400).json({ error: "Missing file" });
  try {
    const out = await runGit(`git reset "${file.replace(/"/g, '\"')}"`);
    res.json({ out });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

export default router;
