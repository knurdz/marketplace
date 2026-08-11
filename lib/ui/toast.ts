/**
 * Toast helpers for Members 2–4.
 *
 * Usage (client components only):
 *   import { toast } from "@/lib/ui/toast";
 *   toast.success("Saved");
 *   toast.error("Something went wrong");
 *
 * Ensure <Toaster /> is mounted in the root layout (step 1.18).
 * Prefer toasts for cross-page feedback; keep button `pending` text for in-form loading.
 */
export { toast } from "sonner";
