import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { seedAllData } from "@/lib/services/seed";

export async function POST() {
  try {
    const result = await seedAllData();
    return apiSuccess(result);
  } catch (error) {
    return handleApiException(error);
  }
}
