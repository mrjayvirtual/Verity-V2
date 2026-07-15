import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import analyzeRouter from "./analyze.js";
import scansRouter from "./scans.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(scansRouter);

export default router;
