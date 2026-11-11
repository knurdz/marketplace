import type { SessionUser } from "@/lib/backend/session";
import { getLoggedInUser } from "@/lib/backend/session";
import { ROLE_LABELS, userHasLabel } from "@/lib/backend/roles";

export class AdminAuthorizationError extends Error {
  readonly code = "ADMIN_UNAUTHORIZED";

  constructor() {
    super("Unauthorized");
    this.name = "AdminAuthorizationError";
  }
}

/**
 * Defense-in-depth guard for server services that use privileged clients.
 * Throws instead of redirecting so action/service callers cannot trigger a
 * second navigation while an enclosing admin layout is also enforcing access.
 */
export async function assertAdminUser(
  expectedUserId?: string,
): Promise<SessionUser> {
  const user = await getLoggedInUser();
  if (
    !user ||
    !userHasLabel(user, ROLE_LABELS.admin) ||
    (expectedUserId !== undefined && user.$id !== expectedUserId)
  ) {
    throw new AdminAuthorizationError();
  }
  return user;
}
