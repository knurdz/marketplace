/** Query/ID/Permission helpers used by marketplace services (Drizzle adapter). */
export { Query } from "./query";
export { ID } from "./tables-db";

export namespace Models {
  export type Preferences = Record<string, unknown>;
  export type User<_P = Preferences> = {
    $id: string;
    email?: string;
    name?: string;
    labels?: string[];
    status?: boolean;
    $createdAt?: string;
    registration?: string;
  };
}

/** Row ACL strings (ignored by MariaDB layer; kept for call-site compatibility). */
export const Permission = {
  read: (target: unknown) => `read:${String(target)}`,
  update: (target: unknown) => `update:${String(target)}`,
  delete: (target: unknown) => `delete:${String(target)}`,
  create: (target: unknown) => `create:${String(target)}`,
};

export const Role = {
  any: () => "any",
  user: (userId: string) => `user:${userId}`,
  label: (label: string) => `label:${label}`,
  users: () => "users",
};

export { DbException } from "./errors";
