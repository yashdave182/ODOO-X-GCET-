/**
 * API Configuration
 * Base URL and endpoint definitions for Dayflow HRMS API
 */

// API Base URL - Update this when backend is deployed
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: "/auth/login",
    ME: "/users/me",
  },

  // User/Employee Profile
  USERS: {
    ME: "/users/me",
    ME_PASSWORD: "/users/me/password",
  },

  // Admin - Employee Management
  ADMIN: {
    USERS: "/admin/users",
    USER_BY_ID: (id: number) => `/admin/users/${id}`,
    ATTENDANCE: "/admin/attendance",
    LEAVE: "/admin/leave",
    LEAVE_BY_ID: (id: number) => `/admin/leave/${id}`,
  },

  // Attendance
  ATTENDANCE: {
    CHECK_IN: "/attendance/check-in",
    CHECK_OUT: "/attendance/check-out",
    ME: "/attendance/me",
  },

  // Leave Management
  LEAVE: {
    APPLY: "/leave/apply",
    ME: "/leave/me",
  },

  // Payroll
  PAYROLL: {
    ME: "/payroll/me",
  },
} as const;

// Request timeout (milliseconds)
export const API_TIMEOUT = 30000;

// Token storage key
export const TOKEN_STORAGE_KEY = "hrms_auth_token";

// Role types
export const USER_ROLES = {
  EMPLOYEE: "EMPLOYEE",
  ADMIN: "ADMIN",
} as const;
