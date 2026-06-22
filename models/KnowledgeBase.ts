import { model, models, Schema } from "mongoose";

const knowledgeBaseSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ["objection", "case_study", "pricing", "usp", "brochure", "other"], required: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }]
  },
  {
    timestamps: true,
  }
);

const KnowledgeBase = models.KnowledgeBase || model("KnowledgeBase", knowledgeBaseSchema);
export default KnowledgeBase;
