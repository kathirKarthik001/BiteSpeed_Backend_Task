import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

// health check routes
router.get("/", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

router.get("/db", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
});

export default router;
