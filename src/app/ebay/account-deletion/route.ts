import { NextResponse } from "next/server";
import { createHash } from "crypto";

/** eBay Marketplace Account Deletion notification endpoint.
 * Verification: eBay sends GET ?challenge_code=xxx. We return JSON with challengeResponse (SHA256 hash).
 * Notifications: eBay sends POST with JSON body. We log and return 200.
 * @see https://developer.ebay.com/docs/account-deletion
 */
const EBAY_ACCOUNT_DELETION_ENDPOINT = "https://karenarcayvintage.com/ebay/account-deletion";

function computeChallengeResponse(challengeCode: string): string {
  const token = process.env.EBAY_VERIFICATION_TOKEN ?? "";
  const hash = createHash("sha256");
  hash.update(challengeCode, "utf8");
  hash.update(token, "utf8");
  hash.update(EBAY_ACCOUNT_DELETION_ENDPOINT, "utf8");
  return hash.digest("hex");
}

/** eBay verification: GET https://.../ebay/account-deletion?challenge_code=xxx */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const challengeCode = url.searchParams.get("challenge_code");

  if (challengeCode && challengeCode.length > 0) {
    const challengeResponse = computeChallengeResponse(challengeCode);
    return NextResponse.json(
      { challengeResponse },
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  return new NextResponse(null, { status: 200 });
}

/** eBay notifications: POST with JSON body (metadata + notification) */
export async function POST(req: Request) {
  let body: Record<string, unknown> = {};
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    // Non-JSON or empty body: still return 200
  }

  // Normal account deletion notification: log and acknowledge
  console.log("[eBay Account Deletion] Notification received:", JSON.stringify(body, null, 2));
  return new NextResponse(null, { status: 200 });
}
