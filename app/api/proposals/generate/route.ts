import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { generateWithGemini } from "@/lib/gemini";
import { getKnowledgeArticles } from "@/lib/services/knowledge";

export async function POST(request: NextRequest) {
  try {
    // Both admins, managers, business users, and employees are allowed to generate proposals
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return apiError("A prompt describing the project is required.", 400);
    }

    // Retrieve Knowledge Base articles for RAG context
    let knowledgeContext = "No custom pricing or objection case-study documents found in knowledge base.";
    try {
      const articles = await getKnowledgeArticles();
      if (articles && articles.length > 0) {
        knowledgeContext = articles
          .map(
            (a) => `Title: ${a.title}\nCategory: ${a.category}\nContent: ${a.content}`
          )
          .join("\n\n---\n\n");
      }
    } catch (err) {
      console.error("Failed to load knowledge base for proposal generation:", err);
    }

    const systemInstruction = `You are a premium sales proposal architect at Probase Solution. 
Your goal is to parse the user's prompt and draft a highly detailed, professional sales proposal.

You MUST base your pricing calculations, budgeting, client case study mentions, payment terms, and unique selling points on the following internal Knowledge Base articles:

--- KNOWLEDGE BASE CONTEXT ---
${knowledgeContext}
-----------------------------

You MUST respond with a valid, clean JSON object ONLY. Do NOT include any markdown code blocks like \`\`\`json, backticks, or extra text outside the JSON.

Expected JSON Structure:
{
  "title": "A highly professional, sales-driven proposal title (e.g. Next.js E-Commerce Platform Development)",
  "amount": 200000, // Estimated or extracted project budget in INR as a clean number (MUST align with standard pricing guidelines from context if applicable)
  "content": "A detailed proposal body in standard Markdown formatting. Include sections for: 1. Project Overview, 2. Scope & Deliverables (detailed modules), 3. Development Milestone Timeline, 4. Recommended Part Payment Terms (align with milestones from knowledge base USP), and 5. Warranty & Post-Delivery Support terms."
}`;

    const rawResponse = await generateWithGemini(prompt, systemInstruction);

    // Clean response of any markdown code block wrappers if the model generated them
    let cleaned = rawResponse.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.substring(0, cleaned.length - 3);
    }
    cleaned = cleaned.trim();

    try {
      const parsedData = JSON.parse(cleaned);
      return apiSuccess(parsedData);
    } catch (parseErr) {
      console.error("Failed to parse Gemini response as JSON in proposal generation:", rawResponse);
      // Fallback structured proposal
      return apiSuccess({
        title: "Custom IT Services Proposal",
        amount: 150000,
        content: `### Project Overview\nBased on your requirements, Probase Solution proposes a custom software development cycle to deliver your project.\n\n### Key Deliverables\n- Full Responsive Design\n- Clean Next.js/React Implementation\n- Secure Database Integration\n\n### Milestones & Payments\n- **40% Advance:** Project Initiation\n- **30% Milestone:** Beta Release & Feature Signoff\n- **30% Handover:** Live Deployment & Final Approvals`,
      });
    }
  } catch (error) {
    return handleApiException(error);
  }
}
