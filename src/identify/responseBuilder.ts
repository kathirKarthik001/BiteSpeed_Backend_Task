import type { Contact, IdentifyResponse } from "../types.js";

function dedupe(arr: (string | null)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of arr) {
    if (x != null && x !== "" && !seen.has(x)) {
      seen.add(x);
      out.push(x);
    }
  }
  return out;
}

export function buildResponse(
  truePrimary: Contact,
  allContacts: Contact[]
): IdentifyResponse {

  // get the secondaries of the true primary
  const secondaries = allContacts.filter((c) => c.id !== truePrimary.id);

  // get the emails of the true primary and its secondaries
  const emails = dedupe([
    truePrimary.email,
    ...secondaries.map((c) => c.email),
  ].filter((x): x is string => x != null && x !== ""));

  // get the phone numbers of the true primary and its secondaries
  const phoneNumbers = dedupe([
    truePrimary.phoneNumber,
    ...secondaries.map((c) => c.phoneNumber),
  ].filter((x): x is string => x != null && x !== ""));

  // get the ids of the secondaries
  const secondaryContactIds = secondaries.map((c) => c.id);

  return {
    contact: {
      primaryContactId: truePrimary.id,
      emails,
      phoneNumbers,
      secondaryContactIds,
    },
  };
}
