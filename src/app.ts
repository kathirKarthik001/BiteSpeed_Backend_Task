import express from "express";
import healthRouter from "./routes/health.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);

app.get("/", (_req, res) => {
  res.json({ message: "BiteSpeed API" });
});

export default app;
