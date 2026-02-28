import { prisma } from "../lib/prisma.js";
import type { Contact } from "../types.js";
import { LinkPrecedence } from "@prisma/client";

export async function mergeClusters(
  primaries: Contact[],
  secondaries: Contact[],
  email: string | undefined,
  phoneNumber: string | undefined,
): Promise<{ truePrimary: Contact; allContacts: Contact[] }> {
  const allContacts = [...primaries, ...secondaries];

  // no contacts found, creating a new primary ( cluster )
  if (primaries.length === 0 && secondaries.length === 0) {
    const created = await prisma.contact.create({
      data: {
        email: email ?? null,
        phoneNumber: phoneNumber ?? null,
        linkPrecedence: LinkPrecedence.primary,
      },
    });
    return { truePrimary: created, allContacts: [created] };
  }

  // one primary found, checking if email or phone number is new in the cluster
  if (primaries.length === 1) {
    const truePrimary = primaries[0];

    // check if email or phone number is new in the cluster
    const emailIsNew =
      email != null &&
      email !== "" &&
      !allContacts.some((c) => c.email === email);
    const phoneIsNew =
      phoneNumber != null &&
      phoneNumber !== "" &&
      !allContacts.some((c) => c.phoneNumber === phoneNumber);

    if (emailIsNew || phoneIsNew) {
      const secondary = await prisma.contact.create({
        data: {
          email: email ?? null,
          phoneNumber: phoneNumber ?? null,
          linkedId: truePrimary.id,
          linkPrecedence: LinkPrecedence.secondary,
        },
      });
      return { truePrimary, allContacts: [...allContacts, secondary] };
    }
    return { truePrimary, allContacts };
  }

  // multiple primaries found, sorting by createdAt and id to get the true primary
  // and updating the other primaries and their clusters to be secondary of the true primary
  if (primaries.length > 1) {
    const sorted = [...primaries].sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime() || a.id - b.id,
    );
    const truePrimary = sorted[0];
    const losers = sorted.slice(1);

    await prisma.$transaction(async (tx) => {
      for (const loser of losers) {
        await tx.contact.updateMany({
          where: { id: loser.id },
          data: {
            linkPrecedence: LinkPrecedence.secondary,
            linkedId: truePrimary.id,
            updatedAt: new Date(),
          },
        });
        await tx.contact.updateMany({
          where: { linkedId: loser.id },
          data: {
            linkedId: truePrimary.id,
            updatedAt: new Date(),
          },
        });
      }
    });

    const emailIsNew =
      email != null &&
      email !== "" &&
      !allContacts.some((c) => c.email === email);
    const phoneIsNew =
      phoneNumber != null &&
      phoneNumber !== "" &&
      !allContacts.some((c) => c.phoneNumber === phoneNumber);

    // create a secondary if details are new
    if (emailIsNew || phoneIsNew) {
      await prisma.contact.create({
        data: {
          email: email ?? null,
          phoneNumber: phoneNumber ?? null,
          linkedId: truePrimary.id,
          linkPrecedence: "secondary",
        },
      });
    }

    // get the fresh super cluster for the given input
    const freshCluster = await prisma.contact.findMany({
      where: {
        OR: [{ id: truePrimary.id }, { linkedId: truePrimary.id }],
        deletedAt: null,
      },
    });

    return {
      truePrimary:
        freshCluster.find((c) => c.id === truePrimary.id) ?? truePrimary,
      allContacts: freshCluster,
    };
  }

  throw new Error("Unreachable: primaries length not 0, 1, or >1");
}
