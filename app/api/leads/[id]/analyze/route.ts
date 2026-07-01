import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiError, apiSuccess } from "@/lib/http";
import { getLeadById } from "@/lib/services/leads";
import { generateWithGemini } from "@/lib/gemini";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireApiUser(request, ["admin", "manager", "business", "employee"]);
    const { id } = await params;

    const lead = await getLeadById(id);
    if (!lead) {
      return apiError("Lead not found", 404);
    }

    const systemInstruction = `You are a strategic AI Sales Analyst at Probase Solution.
Your task is to analyze the provided Lead and generate a highly professional, structured JSON report containing a SWOT analysis, deal qualification score, recommended installment-based part payment milestone structures, key objections counter-strategies, and a list of strategic questions the sales rep should ask the client.

You MUST respond with a valid, clean JSON object ONLY. Do NOT include any markdown formatting like \`\`\`json, backticks, or extra text outside the JSON.

JSON Structure:
{
  "dealScore": 75,
  "swot": {
    "strengths": ["string"],
    "weaknesses": ["string"],
    "opportunities": ["string"],
    "threats": ["string"]
  },
  "objectionCounters": ["string"],
  "milestonePayments": ["string"],
  "nextActions": ["string"],
  "recommendedQuestions": ["string"]
}`;

    const prompt = `Perform a comprehensive sales strategy analysis for the following lead:

Lead Name: ${lead.name}
Stage: ${lead.stage}
Status: ${lead.status}
Deal Value: ₹${lead.value.toLocaleString("en-IN")}
Lead Source: ${lead.source}
Notes/Requirements: ${lead.notes || "No specific requirements provided."}

Ensure your SWOT analysis is highly customized to their requirements and the tech services domain.
The 'milestonePayments' array should recommend 2-3 specific installment options (e.g. "50% upfront, 50% on completion" or "40% upfront, 30% milestone, 30% delivery") that split the value of ₹${lead.value.toLocaleString("en-IN")} to ease cashflow concerns.
The 'recommendedQuestions' should contain 3-4 precise questions to ask this client to qualify their timeline, budget constraints, or decision maker authority.`;

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
      console.error("Failed to parse Gemini response as JSON:", rawResponse);
      // Fallback response in case JSON format is invalid
      return apiSuccess({
        dealScore: lead.notes ? 70 : 40,
        swot: {
          strengths: ["Initial client connection established", "Defined budget expectation of ₹" + lead.value.toLocaleString("en-IN")],
          weaknesses: ["Requirements are not fully detailed in the logs", "Client's decision-maker hierarchy is unknown"],
          opportunities: ["Offer a phased milestone payment plan to build trust", "Upsell post-launch maintenance & support package"],
          threats: ["Competitors offering cheaper generic solutions", "Risk of scope creep due to loose initial specifications"]
        },
        objectionCounters: [
          "If price objection arises, present Probase's flexible part payment options (up to 3 installments).",
          "Highlight our expert design and premium post-delivery warranty support."
        ],
        milestonePayments: [
          `50% Advance (₹${(lead.value * 0.5).toLocaleString("en-IN")}) | 50% Project Handover (₹${(lead.value * 0.5).toLocaleString("en-IN")})`,
          `40% Advance (₹${(lead.value * 0.4).toLocaleString("en-IN")}) | 30% Milestone Approval (₹${(lead.value * 0.3).toLocaleString("en-IN")}) | 30% Launch (₹${(lead.value * 0.3).toLocaleString("en-IN")})`
        ],
        nextActions: [
          "Schedule a discovery call to detailed requiremnets.",
          "Present the flexible milestone installment option."
        ],
        recommendedQuestions: [
          "What is your target launch date for this project?",
          "Are there other stakeholders who will be reviewing the proposal?",
          "Have you allocated a specific budget range for this initiative?"
        ]
      });
    }
  } catch (error) {
    return handleApiException(error);
  }
}
