import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { generateWithGemini } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // Both admins, managers, business users, and employees are allowed to generate proposals
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== "string") {
      return apiError("A prompt describing the project is required.", 400);
    }

    const systemInstruction = `You are a premium sales proposal architect at Probase Solution. 
Your goal is to parse the user's prompt and draft a highly detailed, professional sales proposal.

You MUST respond with a valid, clean JSON object ONLY. Do NOT include any markdown code blocks like \`\`\`json, backticks, or extra text outside the JSON.

Expected JSON Structure:
{
  "title": "A highly professional, sales-driven proposal title (e.g. Next.js E-Commerce Platform Development)",
  "amount": 200000, // Estimated or extracted project budget in INR as a clean number
  "content": "A detailed proposal body in standard Markdown formatting. Include sections for: 1. Project Overview, 2. Scope & Deliverables (detailed modules), 3. Development Milestone Timeline, 4. Recommended Part Payment Terms (e.g. 50% advance, 25% milestone, 25% delivery), and 5. Warranty & Post-Delivery Support terms."
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
