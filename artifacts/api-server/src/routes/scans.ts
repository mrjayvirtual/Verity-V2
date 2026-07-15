import { Router, type Request, type Response } from "express";
import { desc, eq } from "drizzle-orm";
import { db, scansTable } from "@workspace/db";
import { CreateScanBody, ListScansQueryParams, GetScanParams, DeleteScanParams } from "@workspace/api-zod";

const router = Router();

// GET /scans/stats — MUST be before /:id to avoid route conflict
router.get("/scans/stats", async (_req: Request, res: Response): Promise<void> => {
  const allScans = await db.select().from(scansTable);

  if (allScans.length === 0) {
    res.json({
      totalScans: 0,
      avgOverallScore: 0,
      avgReasoningScore: 0,
      avgEvidenceScore: 0,
      highRiskCount: 0,
      mediumRiskCount: 0,
      lowRiskCount: 0,
      criticalRiskCount: 0,
    });
    return;
  }

  let sumOverall = 0;
  let sumReasoning = 0;
  let sumEvidence = 0;
  let highRisk = 0;
  let mediumRisk = 0;
  let lowRisk = 0;
  let criticalRisk = 0;

  for (const scan of allScans) {
    const result = scan.result as Record<string, unknown>;
    const scores = result?.scores as Record<string, number> | undefined;
    if (scores) {
      sumOverall += scores.overallTrustSignal ?? 0;
      sumReasoning += scores.reasoningQuality ?? 0;
      sumEvidence += scores.evidenceStrength ?? 0;
    }
    const riskLevel = result?.riskLevel as string | undefined;
    if (riskLevel === "high") highRisk++;
    else if (riskLevel === "medium") mediumRisk++;
    else if (riskLevel === "low") lowRisk++;
    else if (riskLevel === "critical") criticalRisk++;
  }

  const total = allScans.length;
  res.json({
    totalScans: total,
    avgOverallScore: Math.round((sumOverall / total) * 10) / 10,
    avgReasoningScore: Math.round((sumReasoning / total) * 10) / 10,
    avgEvidenceScore: Math.round((sumEvidence / total) * 10) / 10,
    highRiskCount: highRisk,
    mediumRiskCount: mediumRisk,
    lowRiskCount: lowRisk,
    criticalRiskCount: criticalRisk,
  });
});

// GET /scans
router.get("/scans", async (req: Request, res: Response): Promise<void> => {
  const params = ListScansQueryParams.safeParse(req.query);
  const limit = params.success && params.data.limit ? params.data.limit : 20;

  const scans = await db
    .select()
    .from(scansTable)
    .orderBy(desc(scansTable.createdAt))
    .limit(limit);

  res.json(scans);
});

// POST /scans
router.post("/scans", async (req: Request, res: Response): Promise<void> => {
  const parsed = CreateScanBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [scan] = await db
    .insert(scansTable)
    .values({
      inputText: parsed.data.inputText,
      result: parsed.data.result as Record<string, unknown>,
      title: parsed.data.title ?? null,
    })
    .returning();

  res.status(201).json(scan);
});

// GET /scans/:id
router.get("/scans/:id", async (req: Request, res: Response): Promise<void> => {
  const params = GetScanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid scan ID" });
    return;
  }

  const [scan] = await db
    .select()
    .from(scansTable)
    .where(eq(scansTable.id, params.data.id));

  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  res.json(scan);
});

// DELETE /scans/:id
router.delete("/scans/:id", async (req: Request, res: Response): Promise<void> => {
  const params = DeleteScanParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid scan ID" });
    return;
  }

  const [scan] = await db
    .delete(scansTable)
    .where(eq(scansTable.id, params.data.id))
    .returning();

  if (!scan) {
    res.status(404).json({ error: "Scan not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
