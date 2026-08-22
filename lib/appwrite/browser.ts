import { Account, Client } from "appwrite";
import { getAppwriteEndpoint, getAppwriteProjectId } from "./config";

/**
 * Browser / Client Component Appwrite client.
 * Uses only endpoint + project id — never the API key.
 * Lazy so importing this module does not throw when env is unset at build time.
 */
let client: Client | null = null;

export function getBrowserClient(): Client {
  if (!client) {
    client = new Client()
      .setEndpoint(getAppwriteEndpoint())
      .setProject(getAppwriteProjectId());
  }
  return client;
}

export function getBrowserAccount(): Account {
  return new Account(getBrowserClient());
}
