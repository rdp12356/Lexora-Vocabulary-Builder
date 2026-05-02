import { Router, type IRouter } from "express";
import healthRouter from "./health";
import wordsRouter from "./words";
import userWordsRouter from "./userWords";

const router: IRouter = Router();

router.use(healthRouter);
router.use(wordsRouter);
router.use(userWordsRouter);

export default router;
