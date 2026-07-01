import { NextResponse } from "next/server";
import { getAuthCookieConfig, signAuthToken } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { getUsers } from "@/lib/services/users";
import { markAttendance } from "@/lib/services/attendance";

function euclideanDistance(arr1: number[], arr2: number[]) {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { descriptor } = body;

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return apiError("Invalid face descriptor data", 400);
    }

    const allUsers = await getUsers();
    
    // Filter users that have registered face descriptors
    const registeredUsers = allUsers.filter((u) => u.faceDescriptor && Array.isArray(u.faceDescriptor));

    if (registeredUsers.length === 0) {
      return apiError("No face profiles registered in the system.", 404);
    }

    let minDistance = Infinity;
    let matchedUser = null;

    for (const user of registeredUsers) {
      const distance = euclideanDistance(descriptor, user.faceDescriptor!);
      if (distance < minDistance) {
        minDistance = distance;
        matchedUser = user;
      }
    }

    // Threshold for face matching is typically 0.5 (smaller distance = better match)
    if (!matchedUser || minDistance > 0.5) {
      return apiError("Face not recognized. Please try again or use password login.", 401);
    }

    // Log the user's attendance
    await markAttendance(matchedUser.id, matchedUser.name, matchedUser.role, "face");

    // Success login: Sign token and set cookie
    const response = apiSuccess({
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    });
    
    response.cookies.set(getAuthCookieConfig(signAuthToken(matchedUser)));
    return response;
  } catch (error) {
    return handleApiException(error);
  }
}
