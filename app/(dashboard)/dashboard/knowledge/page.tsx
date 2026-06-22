import { KnowledgeBaseModule } from "@/components/modules/knowledge-base-module";
import { requireSessionUser } from "@/lib/auth";
import { getKnowledgeArticles } from "@/lib/services/knowledge";

export default async function KnowledgePage() {
  await requireSessionUser(["admin", "manager", "business"]);
  const articles = await getKnowledgeArticles();

  return <KnowledgeBaseModule initialArticles={articles} />;
}
