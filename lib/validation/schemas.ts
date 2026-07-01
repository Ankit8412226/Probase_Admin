import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const employeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  role: z.string().min(2),
  salary: z.coerce.number().positive(),
  joiningDate: z.string().min(10),
  loginRole: z.enum(["admin", "manager", "business", "employee"]).optional().or(z.literal("")),
  password: z.string().min(8).optional().or(z.literal("")),
});

export const salarySchema = z.object({
  employeeId: z.string().min(1),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  amount: z.coerce.number().positive(),
  status: z.enum(["Paid", "Pending"]),
  paidDate: z.string().optional().or(z.literal("")),
});

export const projectSchema = z.object({
  name: z.string().min(2),
  clientId: z.string().min(1),
  status: z.enum(["Active", "Completed"]),
  budget: z.coerce.number().positive(),
  assignedEmployeeIds: z.array(z.string()).min(1),
  startDate: z.string().min(10),
  endDate: z.string().optional().or(z.literal("")),
});

export const leadSchema = z.object({
  name: z.string().min(2),
  contact: z.string().min(3),
  source: z.string().min(2),
  stage: z.enum(["New", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"]),
  ownerId: z.string().min(1),
  status: z.enum(["Converted", "Not Converted"]),
  value: z.coerce.number().nonnegative(),
  acquisitionCost: z.coerce.number().nonnegative(),
  expectedCloseDate: z.string().optional().or(z.literal("")),
  lastContactDate: z.string().optional().or(z.literal("")),
  convertedAt: z.string().optional().or(z.literal("")),
  lostAt: z.string().optional().or(z.literal("")),
  lostReason: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export const clientSchema = z.object({
  name: z.string().min(2),
  company: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  revenue: z.coerce.number().nonnegative(),
  accountManagerId: z.string().min(1),
  contractStartDate: z.string().min(10),
  contractEndDate: z.string().min(10),
  renewalStatus: z.enum(["On Track", "At Risk", "Renewed", "Expired"]),
});

export const proposalSchema = z.object({
  title: z.string().min(2),
  leadId: z.string().optional().or(z.literal("")),
  clientId: z.string().optional().or(z.literal("")),
  recipientName: z.string().optional().or(z.literal("")),
  recipientPhone: z.string().optional().or(z.literal("")),
  ownerId: z.string().min(1),
  amount: z.coerce.number().positive(),
  status: z.enum(["Draft", "Sent", "Accepted", "Rejected", "Expired"]),
  sentDate: z.string().optional().or(z.literal("")),
  validUntil: z.string().min(10),
  content: z.string().optional(),
});

export const partPaymentSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  paidDate: z.string().min(10, "Paid date must be a valid date"),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(3),
  clientId: z.string().min(1),
  projectId: z.string().optional().or(z.literal("")),
  ownerId: z.string().min(1),
  amount: z.coerce.number().positive(),
  issueDate: z.string().min(10),
  dueDate: z.string().min(10),
  status: z.enum(["Paid", "Pending", "Overdue", "Partially Paid"]),
  paidDate: z.string().optional().or(z.literal("")),
  partPayments: z.array(partPaymentSchema).max(3, "Max 3 part payments allowed").optional().default([]),
});

export const targetSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  ownerId: z.string().min(1),
  targetRevenue: z.coerce.number().positive(),
  targetConversions: z.coerce.number().int().nonnegative(),
});

export const knowledgeSchema = z.object({
  title: z.string().min(3),
  category: z.enum(["objection", "case_study", "pricing", "usp", "brochure", "other"]),
  content: z.string().min(10),
  tags: z.array(z.string()).optional().default([]),
});

export function formatValidationIssues(error: z.ZodError) {
  return error.issues.map((issue) => `${issue.path.join(".") || "field"}: ${issue.message}`);
}
