import api from './api';
import type {
  ApiResponse,
  AuthResponse,
  User,
  GovernmentService,
  Application,
  Notification,
  PaginatedResponse,
  DashboardStats,
  ApplicationStatus,
  Role,
} from '../types';

export const authApi = {
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    aadhaarNumber?: string;
  }) => api.post<ApiResponse<AuthResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<AuthResponse>>('/auth/login', data),

  verifyAadhaar: (aadhaarNumber: string) =>
    api.post<ApiResponse<{ valid: boolean; message: string }>>('/auth/verify-aadhaar', { aadhaarNumber }),

  getProfile: () => api.get<ApiResponse<User>>('/auth/profile'),

  updateProfile: (data: Partial<User>) =>
    api.put<ApiResponse<User>>('/auth/profile', data),
};

export const servicesApi = {
  list: (params?: { page?: number; search?: string; category?: string; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<GovernmentService>>>('/services', { params }),

  getBySlug: (slug: string) =>
    api.get<ApiResponse<GovernmentService>>(`/services/${slug}`),

  getCategories: () => api.get<ApiResponse<string[]>>('/services/categories'),
};

export const applicationsApi = {
  list: (params?: {
    page?: number;
    search?: string;
    status?: ApplicationStatus;
    serviceId?: string;
    limit?: number;
  }) => api.get<ApiResponse<PaginatedResponse<Application>>>('/applications', { params }),

  getById: (id: string) =>
    api.get<ApiResponse<Application>>(`/applications/${id}`),

  create: (data: { serviceId: string; formData: Record<string, unknown> }) =>
    api.post<ApiResponse<Application>>('/applications', data),

  submit: (id: string) =>
    api.post<ApiResponse<Application>>(`/applications/${id}/submit`),

  updateStatus: (id: string, data: { status: ApplicationStatus; remarks?: string }) =>
    api.patch<ApiResponse<Application>>(`/applications/${id}/status`, data),

  verifyCertificate: (certificateNo: string) =>
    api.get<ApiResponse<{
      valid: boolean;
      certificateNo: string;
      applicationNo: string;
      serviceName: string;
      citizenName: string;
      issuedDate: string;
    }>>(`/applications/verify/${certificateNo}`),
};

export const notificationsApi = {
  list: (params?: { page?: number; unreadOnly?: boolean; limit?: number }) =>
    api.get<ApiResponse<PaginatedResponse<Notification>>>('/notifications', { params }),

  getUnreadCount: () =>
    api.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const reportsApi = {
  getDashboardStats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  getByService: () =>
    api.get<ApiResponse<{ service: string; count: number }[]>>('/reports/by-service'),

  getByStatus: () =>
    api.get<ApiResponse<{ status: string; count: number }[]>>('/reports/by-status'),

  getMonthlyTrend: (months?: number) =>
    api.get<ApiResponse<{ month: string; count: number }[]>>('/reports/monthly-trend', {
      params: { months },
    }),
};

export const adminApi = {
  listUsers: (params?: { page?: number; search?: string; role?: Role }) =>
    api.get<ApiResponse<PaginatedResponse<User & { isActive: boolean; _count: { applications: number } }>>>('/admin/users', { params }),

  toggleUserStatus: (id: string) =>
    api.patch<ApiResponse<{ id: string; email: string; isActive: boolean }>>(`/admin/users/${id}/toggle-status`),
};

export const documentsApi = {
  upload: (file: File, applicationId?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (applicationId) formData.append('applicationId', applicationId);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
