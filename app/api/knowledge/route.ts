import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException, validateRequest } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { createKnowledgeArticle, getKnowledgeArticles } from "@/lib/services/knowledge";
import { knowledgeSchema } from "@/lib/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const articles = await getKnowledgeArticles();
    return apiSuccess(articles);
  } catch (error) {
    return handleApiException(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager"]);
    const payload = await validateRequest(request, knowledgeSchema);
    const article = await createKnowledgeArticle(payload);
    return apiSuccess(article, { status: 201 });
  } catch (error) {
    return handleApiException(error);
  }
}
