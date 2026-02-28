import express from "express";
import healthRouter from "./routes/health.js";
import identifyRouter from "./routes/identify.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/identify", identifyRouter);

app.get("/", (_req, res) => {
  res.json({ message: "BiteSpeed API" });
});

export default app;
