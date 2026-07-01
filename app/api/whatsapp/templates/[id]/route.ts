import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { deleteWhatsappTemplate } from "@/lib/services/whatsapp";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    await deleteWhatsappTemplate(id);
    return apiSuccess({ success: true, message: "Template deleted successfully" });
  } catch (error) {
    return handleApiException(error);
  }
}
