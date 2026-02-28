import { Router } from "express";
import { identifyHandler } from "../identify/identifyHandler.js";

const router = Router();

router.post("/", identifyHandler);

export default router;
