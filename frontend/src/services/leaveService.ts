/**
 * Leave Service
 * Handles all leave management API calls
 * Following Dayflow HRMS API Contract Specification
 */

import apiClient from "../lib/apiClient";
import { API_ENDPOINTS } from "../config/api.config";

export enum LeaveType {
  SICK = "SICK",
  CASUAL = "CASUAL",
  ANNUAL = "ANNUAL",
  UNPAID = "UNPAID",
  MATERNITY = "MATERNITY",
  PATERNITY = "PATERNITY",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason: string;
  status: LeaveStatus;
  appliedOn: string;
  reviewedBy?: string;
  reviewedOn?: string;
  reviewComments?: string;
}

export interface ApplyLeaveData {
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
}

/**
 * POST /leave/apply
 * Apply for leave (Employee)
 */
export const applyLeave = async (
  data: ApplyLeaveData
): Promise<LeaveRequest> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.LEAVE.APPLY, {
      leave_type: data.leaveType,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason,
    });

    return mapBackendLeaveToFrontend(response.data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to apply for leave");
  }
};

/**
 * GET /leave/me
 * Get own leave requests (Employee)
 */
export const getMyLeaveRequests = async (
  status?: LeaveStatus
): Promise<LeaveRequest[]> => {
  try {
    const params: any = {};
    if (status) params.status = status;

    const response = await apiClient.get(API_ENDPOINTS.LEAVE.ME, { params });

    return response.data.map((leave: any) => mapBackendLeaveToFrontend(leave));
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch leave requests");
  }
};

/**
 * GET /admin/leave
 * Get all leave requests (Admin only)
 */
export const getAllLeaveRequests = async (
  status?: LeaveStatus,
  employeeId?: string
): Promise<LeaveRequest[]> => {
  try {
    const params: any = {};
    if (status) params.status = status;
    if (employeeId) params.employee_id = employeeId;

    const response = await apiClient.get(API_ENDPOINTS.ADMIN.LEAVE, { params });

    return response.data.map((leave: any) => mapBackendLeaveToFrontend(leave));
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch leave requests");
  }
};

/**
 * PUT /admin/leave/:id
 * Approve or reject leave request (Admin only)
 */
export const updateLeaveStatus = async (
  leaveId: string,
  status: LeaveStatus.APPROVED | LeaveStatus.REJECTED,
  comments?: string
): Promise<LeaveRequest> => {
  try {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.LEAVE_BY_ID(parseInt(leaveId)),
      {
        status: status,
        review_comments: comments,
      }
    );

    return mapBackendLeaveToFrontend(response.data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error(`Failed to ${status.toLowerCase()} leave request`);
  }
};

/**
 * Approve leave request (Admin only)
 */
export const approveLeave = async (
  leaveId: string,
  comments?: string
): Promise<LeaveRequest> => {
  return updateLeaveStatus(leaveId, LeaveStatus.APPROVED, comments);
};

/**
 * Reject leave request (Admin only)
 */
export const rejectLeave = async (
  leaveId: string,
  comments?: string
): Promise<LeaveRequest> => {
  return updateLeaveStatus(leaveId, LeaveStatus.REJECTED, comments);
};

/**
 * Get leave balance for employee
 * Note: Backend API spec doesn't include this endpoint yet
 */
export const getLeaveBalance = async (): Promise<{
  sick: number;
  casual: number;
  annual: number;
  unpaid: number;
}> => {
  try {
    // TODO: Update when backend implements GET /leave/balance endpoint
    // For now, return mock data or calculate from leave history
    const leaveRequests = await getMyLeaveRequests(LeaveStatus.APPROVED);

    const currentYear = new Date().getFullYear();
    const thisYearLeaves = leaveRequests.filter(
      (leave) => new Date(leave.startDate).getFullYear() === currentYear
    );

    const used = {
      sick: 0,
      casual: 0,
      annual: 0,
      unpaid: 0,
    };

    thisYearLeaves.forEach((leave) => {
      switch (leave.leaveType) {
        case LeaveType.SICK:
          used.sick += leave.numberOfDays;
          break;
        case LeaveType.CASUAL:
          used.casual += leave.numberOfDays;
          break;
        case LeaveType.ANNUAL:
          used.annual += leave.numberOfDays;
          break;
        case LeaveType.UNPAID:
          used.unpaid += leave.numberOfDays;
          break;
      }
    });

    // Standard leave allocation per year
    const total = {
      sick: 12,
      casual: 12,
      annual: 21,
      unpaid: 0, // Unlimited
    };

    return {
      sick: total.sick - used.sick,
      casual: total.casual - used.casual,
      annual: total.annual - used.annual,
      unpaid: 0, // Unpaid is unlimited
    };
  } catch (error: any) {
    throw new Error("Failed to fetch leave balance");
  }
};

/**
 * Calculate number of days between two dates
 */
export const calculateLeaveDays = (
  startDate: string,
  endDate: string
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end date
};

/**
 * Get pending leave requests count (Admin)
 */
export const getPendingLeaveCount = async (): Promise<number> => {
  try {
    const leaves = await getAllLeaveRequests(LeaveStatus.PENDING);
    return leaves.length;
  } catch (error) {
    return 0;
  }
};

/**
 * Helper function to map backend leave data to frontend LeaveRequest type
 */
function mapBackendLeaveToFrontend(data: any): LeaveRequest {
  return {
    id: data.id?.toString() || "",
    employeeId: data.employee_id?.toString() || data.login_id || "",
    employeeName: data.employee_name || "Unknown",
    leaveType: data.leave_type || LeaveType.CASUAL,
    startDate: data.start_date,
    endDate: data.end_date,
    numberOfDays:
      data.number_of_days || calculateLeaveDays(data.start_date, data.end_date),
    reason: data.reason || "",
    status: data.status || LeaveStatus.PENDING,
    appliedOn: data.applied_on || new Date().toISOString(),
    reviewedBy: data.reviewed_by || undefined,
    reviewedOn: data.reviewed_on || undefined,
    reviewComments: data.review_comments || undefined,
  };
}

// Export as default object
const leaveService = {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  updateLeaveStatus,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  calculateLeaveDays,
  getPendingLeaveCount,
};

export default leaveService;
