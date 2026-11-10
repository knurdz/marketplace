/** Browser Appwrite client removed: auth uses Better Auth + server actions. */
export function getBrowserClient(): never {
  throw new Error("Browser Appwrite client is not available after MariaDB cutover.");
}

export function getBrowserAccount(): never {
  throw new Error("Browser Appwrite account is not available after MariaDB cutover.");
}
