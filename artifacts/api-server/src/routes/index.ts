import { Router, type IRouter } from "express";
import healthRouter from "./health";
import analyzeRouter from "./analyze";
import scansRouter from "./scans";

const router: IRouter = Router();

router.use(healthRouter);
router.use(analyzeRouter);
router.use(scansRouter);

export default router;
