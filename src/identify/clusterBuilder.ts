import type { Contact } from "../types.js";

export function buildClusters(contacts: Contact[]): {
  primaries: Contact[];
  secondaries: Contact[];
} {
  // filter contacts into primaries and secondaries
  const primaries = contacts.filter((c) => c.linkPrecedence === "primary");
  const secondaries = contacts.filter((c) => c.linkPrecedence === "secondary");
  return { primaries, secondaries };
}
