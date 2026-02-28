import type { Request, Response } from "express";
import { fetchAllRelatedContacts } from "./contactFetcher.js";
import { buildClusters } from "./clusterBuilder.js";
import { mergeClusters } from "./clusterMerger.js";
import { buildResponse } from "./responseBuilder.js";

export async function identifyHandler(
  req: Request,
  res: Response,
): Promise<void> {
  try {
    const email =
      typeof req.body?.email === "string" ? req.body.email : undefined;
    const phoneNumber =
      typeof req.body?.phoneNumber === "string"
        ? req.body.phoneNumber
        : undefined;

    if (
      (!email || email.trim() === "") &&
      (!phoneNumber || phoneNumber.trim() === "")
    ) {
      res.status(400).json({
        error: "At least one of email or phoneNumber is required",
      });
      return;
    }

    // fetch all related contacts
    const contacts = await fetchAllRelatedContacts(email, phoneNumber);

    // build clusters
    const { primaries, secondaries } = buildClusters(contacts);

    // merge clusters
    const { truePrimary, allContacts } = await mergeClusters(
      primaries,
      secondaries,
      email,
      phoneNumber,
    );

    // build identify response
    const response = buildResponse(truePrimary, allContacts);
    res.status(200).json(response);
  } catch (err) {
    console.error("identify error:", err);
    res.status(500).json({
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
