import { getAuth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const authHandler = toNextJsHandler(getAuth());
export const GET = authHandler.GET;
export const POST = authHandler.POST;
