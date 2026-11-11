/** Query descriptors for the Drizzle tables adapter. */

export type QueryDescriptor =
  | { type: "equal"; attribute: string; value: string | string[] | boolean | number }
  | { type: "orderDesc"; attribute: string }
  | { type: "orderAsc"; attribute: string }
  | { type: "limit"; value: number }
  | { type: "cursorAfter"; value: string }
  | { type: "greaterThanEqual"; attribute: string; value: string | number }
  | { type: "lessThan"; attribute: string; value: string }
  | { type: "lessThanEqual"; attribute: string; value: string | number }
  | { type: "search"; attribute: string; value: string };

function serialize(descriptor: QueryDescriptor): string {
  return JSON.stringify(descriptor);
}

export const Query = {
  equal(attribute: string, value: string | string[] | boolean | number): string {
    return serialize({ type: "equal", attribute, value });
  },
  orderDesc(attribute: string): string {
    return serialize({ type: "orderDesc", attribute });
  },
  orderAsc(attribute: string): string {
    return serialize({ type: "orderAsc", attribute });
  },
  limit(value: number): string {
    return serialize({ type: "limit", value });
  },
  cursorAfter(value: string): string {
    return serialize({ type: "cursorAfter", value });
  },
  greaterThanEqual(attribute: string, value: string | number): string {
    return serialize({ type: "greaterThanEqual", attribute, value });
  },
  lessThan(attribute: string, value: string): string {
    return serialize({ type: "lessThan", attribute, value });
  },
  lessThanEqual(attribute: string, value: string | number): string {
    return serialize({ type: "lessThanEqual", attribute, value });
  },
  search(attribute: string, value: string): string {
    return serialize({ type: "search", attribute, value });
  },
};

export function parseQueries(queries: string[] | undefined): QueryDescriptor[] {
  if (!queries?.length) return [];
  return queries.map((q) => {
    try {
      return JSON.parse(q) as QueryDescriptor;
    } catch {
      throw new Error(`Invalid query descriptor: ${q}`);
    }
  });
}
