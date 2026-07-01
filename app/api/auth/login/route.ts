import { authenticateUser, getAuthCookieConfig, signAuthToken } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { loginSchema } from "@/lib/validation/schemas";
import { markAttendance } from "@/lib/services/attendance";

export async function POST(request: Request) {
  try {
    const payload = await validateRequest(request, loginSchema);
    const user = await authenticateUser(payload.email, payload.password);

    if (!user) {
      return apiError("Invalid email or password", 401);
    }

    // Record password-based attendance check-in
    await markAttendance(user.id, user.name, user.role, "password");

    const response = apiSuccess(user);
    response.cookies.set(getAuthCookieConfig(signAuthToken(user)));
    return response;
  } catch (error) {
    return handleApiException(error);
  }
}
