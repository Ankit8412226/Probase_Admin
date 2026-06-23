import type { NextRequest } from "next/server";

import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getLeadById } from "@/lib/services/leads";
import { getKnowledgeArticles } from "@/lib/services/knowledge";
import { generateWithGemini } from "@/lib/gemini";
import type { KnowledgeBaseRecord } from "@/types";

export async function POST(request: NextRequest) {
  try {
    await requireApiUser(request, ["admin", "manager", "business"]);
    const { leadId, message, chatHistory = [] } = await request.json();

    if (!message) {
      return Response.json({ success: false, message: "Message is required" }, { status: 400 });
    }

    // 1. Fetch Lead context if provided
    let lead = null;
    if (leadId) {
      lead = await getLeadById(leadId);
    }

    // 2. Fetch Knowledge Base articles and match them to user's message (RAG)
    const articles = await getKnowledgeArticles();
    const query = message.toLowerCase();
    
    // Simple keyword/tag scoring for RAG
    const scoredArticles = articles.map((article: KnowledgeBaseRecord) => {
      let score = 0;
      const titleWords = article.title.toLowerCase();
      const contentWords = article.content.toLowerCase();
      const tags = (article.tags || []).map(t => t.toLowerCase());

      // If keywords match
      if (titleWords.includes(query)) score += 10;
      if (contentWords.includes(query)) score += 3;
      
      tags.forEach(tag => {
        if (query.includes(tag)) score += 5;
      });

      return { article, score };
    });

    // Sort by score and take articles with score > 0 (or top 3 if none scored, to provide context)
    const sorted = scoredArticles.sort((a, b) => b.score - a.score);
    let relevantArticles = sorted.filter(item => item.score > 0).map(item => item.article);
    
    if (relevantArticles.length === 0) {
      // Fallback: provide default playbooks as general context
      relevantArticles = articles.slice(0, 3);
    } else {
      // Limit to top 3 relevant playbooks
      relevantArticles = relevantArticles.slice(0, 3);
    }

    // 3. Construct prompt & system instruction
    const systemInstruction = `You are the AI Sales Co-Pilot at Probase Solution — a premium IT services company.
Your role is to help our sales team handle objections, formulate deal closing strategies, draft follow-up templates, and structure pitches.
You must adopt a professional, highly strategic, consultative, and proactive tone.

Your output must follow these key directives:
1. PROACTIVE QUESTIONING: Do not just passively answer. Identify what qualifying details are missing about the client (such as budget constraints, timeline urgency, specific pain points, or decision-making power) and explicitly end every message with 1 or 2 precise, structured clarifying questions for the sales rep to ask the client or investigate.
2. PRECISE & ACTIABLE: Provide concrete, copy-paste ready scripts, email templates, or WhatsApp messages. Never speak in vague generalities.
3. PART PAYMENT STRATEGY: Probase supports flexible billing models with up to 3 part payments (installments). When the sales rep mentions budget constraints or pricing objections, suggest offering a milestone-based part payment plan (e.g., 50-30-20 or 50-50 split) as a key negotiation tactic to secure the deal.

Always refer to the specific Lead context and relevant Knowledge Base playbooks provided to ground your answers in actual company guidelines, case studies, and standard objections.

Use Indian Rupee (₹) for all pricing discussions.`;

    let leadContextText = "No specific lead context provided.";
    if (lead) {
      leadContextText = `
[LEAD CONTEXT]
- Name: ${lead.name}
- Contact Info: ${lead.contact}
- Source: ${lead.source}
- Stage: ${lead.stage}
- Status: ${lead.status}
- Deal Value: ₹${lead.value.toLocaleString("en-IN")}
- Notes/Requirements: ${lead.notes || "None"}
`;
    }

    const playbooksText = relevantArticles.map((art: KnowledgeBaseRecord) => `
---
[PLAYBOOK ARTICLE: ${art.title} (Category: ${art.category})]
${art.content}
`).join("\n");

    const historyText = chatHistory.map((h: any) => `${h.role === "model" ? "Co-Pilot" : "Sales Rep"}: ${h.text}`).join("\n");

    const prompt = `
${leadContextText}

[RELEVANT SALES PLAYBOOKS & KNOWLEDGE]
${playbooksText}

[CONVERSATION HISTORY]
${historyText}

Sales Rep: ${message}

AI Co-Pilot (Respond directly to the Sales Rep):`;

    // 4. Generate response using Gemini
    const responseText = await generateWithGemini(prompt, systemInstruction);

    return apiSuccess({
      reply: responseText,
      relevantPlaybooks: relevantArticles.map(a => ({ id: a.id, title: a.title, category: a.category }))
    });
  } catch (error) {
    return handleApiException(error);
  }
}
