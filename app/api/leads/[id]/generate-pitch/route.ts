import type { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { handleApiException } from "@/lib/api-route";
import { apiSuccess } from "@/lib/http";
import { getLeadById, updateLead } from "@/lib/services/leads";
import { generateWithGemini } from "@/lib/gemini";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireApiUser(request, ["admin", "manager", "business"]);

    const lead = await getLeadById(id);
    if (!lead) {
      return Response.json({ success: false, message: "Lead not found" }, { status: 404 });
    }

    const systemInstruction = "You are an expert IT services sales professional at Probase Solution — a premium IT services company. Your job is to write a highly persuasive WhatsApp quotation message that will CONVERT the client. Write in a friendly, professional tone. Use emojis strategically. The message must be ready to copy-paste directly into WhatsApp.";

    const prompt = `Create a complete WhatsApp quotation message for this lead. The message should introduce Probase Solution, address the client's specific needs from the notes, present our services clearly with pricing range, and end with a strong call to action.

Client Name: ${lead.name}
Client Contact: ${lead.contact}
Lead Source: ${lead.source}
Deal Value: ₹${lead.value.toLocaleString("en-IN")}
Client Requirements / Notes: ${lead.notes || "General IT services requirement"}

Structure the WhatsApp message with these sections:

1. 👋 Greeting with client name
2. 🏢 Brief intro about Probase Solution (2-3 lines — premium IT services, custom software, web & app development, digital transformation)
3. ✅ What We Offer (based on their specific notes/requirements — list 4-5 specific services relevant to them with a short benefit each)
4. 💰 Investment Summary (give a realistic pricing range based on the deal value of ₹${lead.value.toLocaleString("en-IN")} — mention what's included)
5. 🎯 Why Choose Us (3 strong USPs of Probase Solution)
6. 📞 Call to Action (invite them to a quick call or demo, provide contact)

Make it ready to send. No placeholders. Be specific, confident, and conversion-focused.`;

    const pitch = await generateWithGemini(prompt, systemInstruction);

    // Save the pitch in the database
    await updateLead(id, { emailPitch: pitch });

    return apiSuccess({ pitch });
  } catch (error) {
    return handleApiException(error);
  }
}
