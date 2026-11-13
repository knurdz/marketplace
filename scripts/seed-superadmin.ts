/**
 * Ensure the singleton superadmin account exists.
 * Usage: npx tsx --env-file=.env.local scripts/seed-superadmin.ts
 */
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { getDb, getPool, newId } from "../lib/db/client";
import {
  authAccount,
  authUser,
  profiles,
} from "../lib/db/schema";

const SUPERADMIN_EMAIL = "vishva@knurdz.org";
const SUPERADMIN_NAME = "Vishva";
const INITIAL_PASSWORD = "12345678";

async function main() {
  const db = getDb();

  const existingSuper = await db
    .select()
    .from(authUser)
    .where(eq(authUser.isSuperAdmin, true))
    .limit(1);

  const existingEmail = await db
    .select()
    .from(authUser)
    .where(eq(authUser.email, SUPERADMIN_EMAIL))
    .limit(1);

  if (existingSuper[0] && existingSuper[0].email !== SUPERADMIN_EMAIL) {
    console.error(
      `Another superadmin already exists (${existingSuper[0].email}). Aborting.`,
    );
    process.exit(1);
  }

  if (existingEmail[0]) {
    const userId = existingEmail[0].id;
    await db
      .update(authUser)
      .set({
        name: SUPERADMIN_NAME,
        role: "admin",
        disabled: false,
        isSuperAdmin: true,
        emailVerified: true,
      })
      .where(eq(authUser.id, userId));

    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);
    if (profile[0]) {
      await db
        .update(profiles)
        .set({
          displayName: SUPERADMIN_NAME,
          registrationComplete: true,
        })
        .where(eq(profiles.userId, userId));
    } else {
      await db.insert(profiles).values({
        id: userId,
        userId,
        displayName: SUPERADMIN_NAME,
        registrationComplete: true,
      });
    }

    console.log(
      `Updated existing user ${SUPERADMIN_EMAIL} as superadmin (password unchanged).`,
    );
    await getPool().end();
    return;
  }

  if (existingSuper[0]) {
    console.error("Superadmin row exists without matching email. Fix manually.");
    process.exit(1);
  }

  const userId = newId();
  const hashed = await hashPassword(INITIAL_PASSWORD);

  await db.insert(authUser).values({
    id: userId,
    email: SUPERADMIN_EMAIL,
    name: SUPERADMIN_NAME,
    emailVerified: true,
    role: "admin",
    disabled: false,
    isSuperAdmin: true,
  });
  await db.insert(authAccount).values({
    id: newId(),
    accountId: userId,
    providerId: "credential",
    userId,
    password: hashed,
  });
  await db.insert(profiles).values({
    id: userId,
    userId,
    displayName: SUPERADMIN_NAME,
    registrationComplete: true,
  });

  console.log(`Created superadmin ${SUPERADMIN_EMAIL}.`);
  await getPool().end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
