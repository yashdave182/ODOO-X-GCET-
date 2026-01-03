/**
 * Leave Service
 * Handles all leave management API calls
 * Following Dayflow HRMS API Contract Specification
 */

import apiClient from "../lib/apiClient";
import { API_ENDPOINTS } from "../config/api.config";

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
}

export interface ApplyLeaveData {
  startDate: string;
  endDate: string;
  reason: string;
}

/**
 * POST /leaves/apply
 * Apply for leave (Employee)
 */
export const applyLeave = async (
  data: ApplyLeaveData,
): Promise<{ message: string; status: string }> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.LEAVE.APPLY, {
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason,
    });

    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to apply for leave");
  }
};

/**
 * GET /leaves/me
 * Get own leave requests (Employee)
 */
export const getMyLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.LEAVE.ME);

    return response.data.map((leave: any) => ({
      id: leave.id?.toString() || "",
      employeeId: "",
      startDate: leave.start_date,
      endDate: leave.end_date,
      reason: leave.reason || "",
      status: leave.status as LeaveStatus,
    }));
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch leave requests");
  }
};

/**
 * GET /admin/leaves
 * Get all leave requests (Admin only)
 */
export const getAllLeaveRequests = async (): Promise<LeaveRequest[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.LEAVES);

    return response.data.map((leave: any) => ({
      id: leave.id?.toString() || "",
      employeeId: leave.employee_id || "",
      employeeName: leave.name || "",
      startDate: leave.start_date,
      endDate: leave.end_date,
      reason: leave.reason || "",
      status: leave.status as LeaveStatus,
    }));
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch leave requests");
  }
};

/**
 * PUT /admin/leaves/:id/approve
 * Approve leave request (Admin only)
 */
export const approveLeave = async (
  leaveId: string,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.APPROVE_LEAVE(parseInt(leaveId)),
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to approve leave request");
  }
};

/**
 * PUT /admin/leaves/:id/reject
 * Reject leave request (Admin only)
 */
export const rejectLeave = async (
  leaveId: string,
): Promise<{ message: string }> => {
  try {
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.REJECT_LEAVE(parseInt(leaveId)),
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to reject leave request");
  }
};

/**
 * Calculate number of days between two dates (inclusive)
 */
export const calculateLeaveDays = (
  startDate: string,
  endDate: string,
): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end date
};

/**
 * Get leave balance (mock implementation - backend doesn't provide this yet)
 */
export const getLeaveBalance = async (): Promise<{
  paidTimeOff: number;
  sickLeave: number;
  unpaidLeave: number;
}> => {
  try {
    // Calculate from existing leave requests
    const leaveRequests = await getMyLeaveRequests();

    const currentYear = new Date().getFullYear();
    const thisYearLeaves = leaveRequests.filter(
      (leave) =>
        new Date(leave.startDate).getFullYear() === currentYear &&
        leave.status === LeaveStatus.APPROVED,
    );

    let usedDays = 0;
    thisYearLeaves.forEach((leave) => {
      usedDays += calculateLeaveDays(leave.startDate, leave.endDate);
    });

    // Standard leave allocation per year
    const totalPaidLeave = 20;
    const totalSickLeave = 12;

    return {
      paidTimeOff: Math.max(0, totalPaidLeave - usedDays),
      sickLeave: totalSickLeave,
      unpaidLeave: 0,
    };
  } catch (error: any) {
    // Return default values if fetch fails
    return {
      paidTimeOff: 20,
      sickLeave: 12,
      unpaidLeave: 0,
    };
  }
};

/**
 * Get pending leave requests count (Admin)
 */
export const getPendingLeaveCount = async (): Promise<number> => {
  try {
    const leaves = await getAllLeaveRequests();
    return leaves.filter((leave) => leave.status === LeaveStatus.PENDING)
      .length;
  } catch (error) {
    return 0;
  }
};

// Export as default object
const leaveService = {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  approveLeave,
  rejectLeave,
  getLeaveBalance,
  calculateLeaveDays,
  getPendingLeaveCount,
};

export default leaveService;
