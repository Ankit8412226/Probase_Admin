import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { updateFaceDescriptor, deleteFaceDescriptor } from "@/lib/services/attendance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Only administrators or managers should be allowed to register face profiles
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;

    const body = await request.json();
    const { descriptor } = body;

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return apiError("Invalid face descriptor data", 400);
    }

    await updateFaceDescriptor(id, descriptor);
    return apiSuccess({ success: true, message: "Face registered successfully" });
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;

    await deleteFaceDescriptor(id);
    return apiSuccess({ success: true, message: "Face profile removed successfully" });
  } catch (error) {
    return handleApiException(error);
  }
}
