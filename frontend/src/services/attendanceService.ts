/**
 * Attendance Service
 * Handles all attendance-related API calls
 * Following Dayflow HRMS API Contract Specification
 */

import apiClient from "../lib/apiClient";
import { API_ENDPOINTS } from "../config/api.config";
import { Attendance, AttendanceStatus } from "../types";

/**
 * POST /attendance/check-in
 * Check in for attendance (Employee)
 */
export const checkIn = async (): Promise<Attendance> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_IN);
    return mapBackendAttendanceToFrontend(response.data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to check in");
  }
};

/**
 * POST /attendance/check-out
 * Check out from attendance (Employee)
 */
export const checkOut = async (): Promise<Attendance> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ATTENDANCE.CHECK_OUT);
    return mapBackendAttendanceToFrontend(response.data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to check out");
  }
};

/**
 * GET /attendance/me
 * Get own attendance records (Employee)
 */
export const getMyAttendance = async (
  startDate?: string,
  endDate?: string,
): Promise<Attendance[]> => {
  try {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;

    const response = await apiClient.get(API_ENDPOINTS.ATTENDANCE.ME, {
      params,
    });

    return response.data.map((record: any) =>
      mapBackendAttendanceToFrontend(record),
    );
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch attendance records");
  }
};

/**
 * GET /attendance/me (today only)
 * Get today's attendance record
 */
export const getTodayAttendance = async (): Promise<Attendance | null> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const records = await getMyAttendance(today, today);
    return records.length > 0 ? records[0] : null;
  } catch (error) {
    return null;
  }
};

/**
 * GET /admin/attendance
 * Get all attendance records (Admin only)
 */
export const getAllAttendance = async (
  startDate?: string,
  endDate?: string,
  employeeId?: string,
): Promise<Attendance[]> => {
  try {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (employeeId) params.employee_id = employeeId;

    const response = await apiClient.get(API_ENDPOINTS.ADMIN.ATTENDANCE, {
      params,
    });

    return response.data.map((record: any) =>
      mapBackendAttendanceToFrontend(record),
    );
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch attendance records");
  }
};

/**
 * Get attendance by employee ID (Admin only)
 */
export const getAttendanceByEmployeeId = async (
  employeeId: string,
  startDate?: string,
  endDate?: string,
): Promise<Attendance[]> => {
  return getAllAttendance(startDate, endDate, employeeId);
};

/**
 * Get today's attendance summary for all employees (Admin only)
 */
export const getTodayAttendanceSummary = async (): Promise<{
  present: number;
  absent: number;
  onLeave: number;
  late: number;
  total: number;
}> => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const records = await getAllAttendance(today, today);

    const summary = {
      present: 0,
      absent: 0,
      onLeave: 0,
      late: 0,
      total: records.length,
    };

    records.forEach((record) => {
      switch (record.status) {
        case AttendanceStatus.PRESENT:
          summary.present++;
          break;
        case AttendanceStatus.ABSENT:
          summary.absent++;
          break;
        case AttendanceStatus.LEAVE:
          summary.onLeave++;
          break;
        case AttendanceStatus.LATE:
          summary.late++;
          break;
      }
    });

    return summary;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch attendance summary");
  }
};

/**
 * Calculate work hours between check-in and check-out
 */
export const calculateWorkHours = (
  checkIn: string,
  checkOut?: string,
): string => {
  if (!checkOut) return "0h 0m";

  const checkInTime = new Date(checkIn);
  const checkOutTime = new Date(checkOut);
  const workHours =
    (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);

  const hours = Math.floor(workHours);
  const minutes = Math.floor((workHours - hours) * 60);

  return `${hours}h ${minutes}m`;
};

/**
 * Check if check-in time is late (after 9:30 AM)
 */
export const isLateCheckIn = (checkInTime: string): boolean => {
  const checkIn = new Date(checkInTime);
  const lateThreshold = new Date(checkIn);
  lateThreshold.setHours(9, 30, 0, 0);
  return checkIn > lateThreshold;
};

/**
 * Helper function to map backend attendance data to frontend Attendance type
 */
function mapBackendAttendanceToFrontend(data: any): Attendance {
  // Derive status based on backend rules:
  // - Approved leave → ON_LEAVE
  // - Attendance record exists → PRESENT (or LATE if late)
  // - Otherwise → ABSENT
  let status = AttendanceStatus.ABSENT;

  if (data.status === "ON_LEAVE" || data.on_leave) {
    status = AttendanceStatus.LEAVE;
  } else if (data.check_in) {
    // Check if late
    if (data.is_late || isLateCheckIn(data.check_in)) {
      status = AttendanceStatus.LATE;
    } else {
      status = AttendanceStatus.PRESENT;
    }
  }

  return {
    id: data.id?.toString() || `ATT${Date.now()}`,
    employeeId: data.employee_id?.toString() || data.login_id || "",
    date: data.date || new Date().toISOString().split("T")[0],
    checkIn: data.check_in || undefined,
    checkOut: data.check_out || undefined,
    status: status,
    workHours:
      data.work_hours || calculateWorkHours(data.check_in, data.check_out),
    note: data.notes || data.note || undefined,
  };
}

// Export as default class for backward compatibility
class AttendanceService {
  async getTodayAttendance(employeeId?: string): Promise<Attendance | null> {
    if (employeeId) {
      // Admin view: get attendance for specific employee
      const today = new Date().toISOString().split("T")[0];
      const records = await getAttendanceByEmployeeId(employeeId, today, today);
      return records.length > 0 ? records[0] : null;
    }
    // Employee view: get own attendance
    return getTodayAttendance();
  }

  async checkIn(): Promise<Attendance> {
    return checkIn();
  }

  async checkOut(): Promise<Attendance> {
    return checkOut();
  }

  async getMyAttendance(
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    return getMyAttendance(startDate, endDate);
  }

  async getAttendanceByEmployeeId(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    return getAttendanceByEmployeeId(employeeId, startDate, endDate);
  }

  async getTodayAttendanceSummary(): Promise<{
    present: number;
    absent: number;
    onLeave: number;
    late: number;
    total: number;
  }> {
    return getTodayAttendanceSummary();
  }
}

const attendanceServiceInstance = new AttendanceService();

export default attendanceServiceInstance;
export { attendanceServiceInstance as attendanceService };
