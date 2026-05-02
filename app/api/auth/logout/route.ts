import { getClearAuthCookieConfig } from "@/lib/auth";
import { apiSuccess } from "@/lib/http";

export async function POST() {
  const response = apiSuccess({ loggedOut: true });
  response.cookies.set(getClearAuthCookieConfig());
  return response;
}
