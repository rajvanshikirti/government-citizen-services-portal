export type Role = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  aadhaarNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
}

export interface GovernmentService {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  processingDays: number;
  fee: number;
  requiredDocs: string[];
  isActive: boolean;
}

export interface Application {
  id: string;
  applicationNo: string;
  userId: string;
  serviceId: string;
  status: ApplicationStatus;
  formData: Record<string, unknown>;
  remarks?: string;
  certificateNo?: string;
  qrCode?: string;
  submittedAt?: string;
  reviewedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  service?: Pick<GovernmentService, 'id' | 'name' | 'slug' | 'category'>;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'phone'>;
  documents?: Document[];
  statusHistory?: StatusHistory[];
}

export interface Document {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  isVerified?: boolean;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  createdAt: string;
}

export interface StatusHistory {
  id: string;
  status: ApplicationStatus;
  remarks?: string;
  changedBy: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  expiresIn: string;
}

export interface DashboardStats {
  total?: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  totalUsers?: number;
  totalApplications?: number;
  pendingApplications?: number;
  completedApplications?: number;
  servicesCount?: number;
}
