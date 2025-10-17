import express from "express";
import { startStream, endStream } from "../controllers/streamController.js";

const router = express.Router();

router.post("/start", startStream);
router.put("/end/:id", endStream);

export default router;
