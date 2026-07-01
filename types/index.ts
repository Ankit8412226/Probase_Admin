export type UserRole = "admin" | "manager" | "business" | "employee";
export type LeadStage =
  | "New"
  | "Qualified"
  | "Proposal Sent"
  | "Negotiation"
  | "Won"
  | "Lost";
export type LeadStatus = "Converted" | "Not Converted";
export type RenewalStatus = "On Track" | "At Risk" | "Renewed" | "Expired";
export type ProposalStatus = "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue" | "Partially Paid";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  faceDescriptor?: number[];
}

export interface UserRecord extends AuthUser {
  password: string;
}

export interface EmployeeRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  salary: number;
  joiningDate: string;
  createdAt?: string;
  updatedAt?: string;
  loginRole?: UserRole;
  password?: string;
  faceDescriptor?: number[];
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  month: string;
  amount: number;
  status: "Paid" | "Pending";
  paidDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectRecord {
  id: string;
  name: string;
  clientId: string;
  status: "Active" | "Completed";
  budget: number;
  assignedEmployeeIds: string[];
  startDate: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  contact: string;
  source: string;
  status: LeadStatus;
  stage: LeadStage;
  ownerId: string;
  value: number;
  acquisitionCost: number;
  expectedCloseDate?: string;
  lastContactDate?: string;
  convertedAt?: string;
  lostAt?: string;
  lostReason?: string;
  notes?: string;
  emailPitch?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  revenue: number;
  accountManagerId: string;
  contractStartDate: string;
  contractEndDate: string;
  renewalStatus: RenewalStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProposalRecord {
  id: string;
  title: string;
  leadId: string;
  clientId?: string;
  ownerId: string;
  amount: number;
  status: ProposalStatus;
  sentDate?: string;
  validUntil: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PartPayment {
  amount: number;
  paidDate: string;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  clientId: string;
  projectId?: string;
  ownerId: string;
  amount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  paidDate?: string;
  partPayments?: PartPayment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TargetRecord {
  id: string;
  month: string;
  ownerId: string;
  targetRevenue: number;
  targetConversions: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RevenuePoint {
  month: string;
  revenue: number;
}

export interface LeadPoint {
  month: string;
  converted: number;
  nonConverted: number;
}

export interface SourcePerformancePoint {
  source: string;
  totalLeads: number;
  wonLeads: number;
  pipelineValue: number;
  wonValue: number;
  acquisitionCost: number;
  roiPercent: number;
}

export interface TargetPerformancePoint {
  month: string;
  targetRevenue: number;
  actualRevenue: number;
  targetConversions: number;
  actualConversions: number;
}

export interface DashboardStats {
  totalEmployees: number;
  activeProjects: number;
  convertedLeads: number;
  monthlyRevenue: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  revenueTrend: RevenuePoint[];
  leadConversionTrend: LeadPoint[];
}

export interface BusinessOverview {
  stats: {
    pipelineValue: number;
    wonValue: number;
    openProposals: number;
    outstandingCollections: number;
    expiringContracts: number;
    conversionRate: number;
  };
  sourcePerformance: SourcePerformancePoint[];
  targetVsActual: TargetPerformancePoint[];
  renewalAlerts: ClientRecord[];
  overdueInvoices: InvoiceRecord[];
  recentProposals: ProposalRecord[];
}

export interface SeedPayload {
  users: UserRecord[];
  employees: EmployeeRecord[];
  salaries: SalaryRecord[];
  projects: ProjectRecord[];
  leads: LeadRecord[];
  clients: ClientRecord[];
  proposals: ProposalRecord[];
  invoices: InvoiceRecord[];
  targets: TargetRecord[];
  knowledge?: KnowledgeBaseRecord[];
  attendances?: AttendanceRecord[];
  shifts?: ShiftRecord[];
}

export interface ShiftRecord {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  assignedEmployeeIds: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  date: string; // YYYY-MM-DD
  loginTime: string; // ISO String
  logoutTime?: string; // ISO String
  method: "face" | "password";
  status: "Present" | "Late";
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  issues?: string[];
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface KnowledgeBaseRecord {
  id: string;
  title: string;
  category: "objection" | "case_study" | "pricing" | "usp" | "brochure" | "other";
  content: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
