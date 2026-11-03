import { handlePayHereNotifyRequest } from "@/lib/payhere/notify-handler";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown;
  if (contentType.includes("application/json")) {
    body = await request.json();
  } else {
    body = await request.text();
  }
  return handlePayHereNotifyRequest(body);
}
