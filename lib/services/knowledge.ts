import KnowledgeBase from "@/models/KnowledgeBase";
import { createId } from "@/lib/utils";
import { ensureDatabase, mapDocument, useMemoryStore } from "@/lib/services/helpers";
import { getMemoryStore } from "@/lib/services/store";
import type { KnowledgeBaseRecord } from "@/types";

// Default playbooks, case studies, and objection guides
const defaultKnowledge: KnowledgeBaseRecord[] = [
  {
    id: "kb_01",
    title: "Objection: Pricing is too high",
    category: "objection",
    content: "When clients raise concerns about high pricing, emphasize Probase's premium quality, 6-month post-launch warranty, and 100% in-house engineering team (no outsourcing). Explain that cheaper agencies often use overseas freelancers, resulting in bugs, delayed schedules, and lack of code ownership. Recommend proposing a phased milestone delivery plan to match their cash flow (e.g. Phase 1 MVP for ₹4 Lakhs instead of full scope for ₹12 Lakhs).",
    tags: ["pricing", "objection", "budget"]
  },
  {
    id: "kb_02",
    title: "Objection: Competitor is cheaper",
    category: "objection",
    content: "Explain that competitor quotes often omit crucial requirements like security audits, automated testing, responsive design, and post-launch support. Probase includes all of these standard in our premium builds. Highlight our 98% client retention rate and verified case studies of delivering projects on time, whereas 70% of low-cost custom software projects fail or double in budget.",
    tags: ["competitor", "pricing", "quality"]
  },
  {
    id: "kb_03",
    title: "Case Study: Apex Retail Revamp",
    category: "case_study",
    content: "Probase successfully rebuilt the e-commerce system for Apex Retail. We replaced a legacy WooCommerce store with a modern Next.js Headless storefront and Node.js backend. This resulted in a 400% page speed increase, a 35% conversion rate boost, and supported ₹50 Lakhs in sales on day one. Project was completed in 3 months with a budget of ₹8 Lakhs.",
    tags: ["case_study", "nextjs", "ecommerce", "apex"]
  },
  {
    id: "kb_04",
    title: "USP: Standard Transparent Milestones",
    category: "usp",
    content: "Unlike other software development houses, Probase charges strictly by transparent, verifiable milestones. Payment is only released after the client reviews and signs off on the staging preview for each milestone (e.g. Design, Frontend, Backend, Deployment). This gives clients 100% safety and control over cash flow.",
    tags: ["usp", "transparency", "milestones"]
  }
];

function getStoreKnowledge() {
  const store = getMemoryStore();
  if (!store.knowledge) {
    store.knowledge = defaultKnowledge;
  }
  return store.knowledge;
}

export async function getKnowledgeArticles() {
  if (useMemoryStore()) {
    return getStoreKnowledge();
  }

  await ensureDatabase();
  const articles = await KnowledgeBase.find().sort({ createdAt: -1 }).lean();
  
  if (!articles.length) {
    // If MongoDB is empty, seed it with default knowledge so it works out of the box!
    await KnowledgeBase.insertMany(defaultKnowledge.map(item => ({ _id: item.id, ...item })));
    return defaultKnowledge;
  }

  return articles.map((item) => mapDocument(item as unknown as { _id: string } & KnowledgeBaseRecord));
}

export async function createKnowledgeArticle(payload: Omit<KnowledgeBaseRecord, "id">) {
  const article: KnowledgeBaseRecord = {
    id: createId("kb"),
    ...payload,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (useMemoryStore()) {
    getStoreKnowledge().unshift(article);
    return article;
  }

  await ensureDatabase();
  await KnowledgeBase.create({ _id: article.id, ...article });
  return article;
}

export async function updateKnowledgeArticle(id: string, payload: Partial<Omit<KnowledgeBaseRecord, "id">>) {
  if (useMemoryStore()) {
    const list = getStoreKnowledge();
    const index = list.findIndex((item) => item.id === id);
    if (index < 0) return null;
    list[index] = {
      ...list[index],
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    return list[index];
  }

  await ensureDatabase();
  const article = await KnowledgeBase.findByIdAndUpdate(
    id,
    { ...payload, updatedAt: new Date().toISOString() },
    { new: true },
  ).lean();

  return article ? mapDocument(article as unknown as { _id: string } & KnowledgeBaseRecord) : null;
}

export async function deleteKnowledgeArticle(id: string) {
  if (useMemoryStore()) {
    const list = getStoreKnowledge();
    const before = list.length;
    const store = getMemoryStore();
    store.knowledge = list.filter((item) => item.id !== id);
    return before !== store.knowledge.length;
  }

  await ensureDatabase();
  const result = await KnowledgeBase.deleteOne({ _id: id });
  return result.deletedCount === 1;
}
