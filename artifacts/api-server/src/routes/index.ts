import { Router } from "express";
import healthRouter from "./health.js";
import analyzeRouter from "./analyze.js";
import scansRouter from "./scans.js";

const router = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(scansRouter);

export default router;
