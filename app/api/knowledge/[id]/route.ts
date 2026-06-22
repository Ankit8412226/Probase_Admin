import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { deleteKnowledgeArticle, updateKnowledgeArticle } from "@/lib/services/knowledge";
import { knowledgeSchema } from "@/lib/validation/schemas";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = await validateRequest(request, knowledgeSchema.partial());
    const { id } = await params;
    const article = await updateKnowledgeArticle(id, payload);
    return article ? apiSuccess(article) : apiError("Article not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const { id } = await params;
    const deleted = await deleteKnowledgeArticle(id);
    return deleted ? apiSuccess({ deleted: true }) : apiError("Article not found", 404);
  } catch (error) {
    return handleApiException(error);
  }
}
