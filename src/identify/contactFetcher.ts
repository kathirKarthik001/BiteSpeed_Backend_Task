import { prisma } from "../lib/prisma.js";
import type { Contact } from "../types.js";

export async function fetchAllRelatedContacts(
  email: string | undefined,
  phoneNumber: string | undefined,
): Promise<Contact[]> {
  const conditions: { email?: string; phoneNumber?: string }[] = [];
  if (email != null && email !== "") {
    conditions.push({ email });
  }
  if (phoneNumber != null && phoneNumber !== "") {
    conditions.push({ phoneNumber });
  }

  if (conditions.length === 0) {
    return [];
  }

  // fetch all contacts that match email or phone number
  const phase1 = await prisma.contact.findMany({
    where: {
      OR: conditions,
      deletedAt: null,
    },
  });

  if (phase1.length === 0) {
    return [];
  }

  // get the root ids of the clusters
  const rootIds = new Set<number>();
  for (const c of phase1) {
    if (c.linkPrecedence === "primary") {
      rootIds.add(c.id);
    } else if (c.linkedId != null) {
      rootIds.add(c.linkedId);
    }
  }

  const rootIdArray = Array.from(rootIds);

  // fetch all contacts that are linked to the root ids
  const phase2 = await prisma.contact.findMany({
    where: {
      OR: [{ id: { in: rootIdArray } }, { linkedId: { in: rootIdArray } }],
      deletedAt: null,
    },
  });

  // data may have duplicates
  const byId = new Map<number, Contact>();
  for (const c of [...phase1, ...phase2]) {
    byId.set(c.id, c);
  }
  return Array.from(byId.values());
}
