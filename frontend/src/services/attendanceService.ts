import { Attendance, AttendanceStatus } from "../types";
import { mockAttendance } from "./mockData";

class AttendanceService {
  private attendanceRecords: Attendance[] = [...mockAttendance];

  /**
   * Get today's attendance record for an employee
   */
  async getTodayAttendance(employeeId: string): Promise<Attendance | null> {
    const today = new Date().toISOString().split("T")[0];
    const attendance = this.attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === today,
    );
    return attendance || null;
  }

  /**
   * Check in an employee
   */
  async checkIn(employeeId: string): Promise<Attendance> {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // Check if already checked in today
    const existingAttendance = await this.getTodayAttendance(employeeId);
    if (existingAttendance && existingAttendance.checkIn) {
      throw new Error("Already checked in today");
    }

    // Determine if late (after 9:30 AM)
    const checkInTime = new Date();
    const lateThreshold = new Date();
    lateThreshold.setHours(9, 30, 0, 0);
    const isLate = checkInTime > lateThreshold;

    const attendance: Attendance = {
      id: existingAttendance?.id || `ATT${Date.now()}`,
      employeeId,
      date: today,
      checkIn: now,
      status: isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
    };

    if (existingAttendance) {
      // Update existing record
      const index = this.attendanceRecords.findIndex(
        (r) => r.id === existingAttendance.id,
      );
      this.attendanceRecords[index] = attendance;
    } else {
      // Create new record
      this.attendanceRecords.push(attendance);
    }

    return attendance;
  }

  /**
   * Check out an employee
   */
  async checkOut(employeeId: string): Promise<Attendance> {
    const now = new Date().toISOString();

    const attendance = await this.getTodayAttendance(employeeId);
    if (!attendance || !attendance.checkIn) {
      throw new Error("No check-in record found for today");
    }

    // Calculate work hours
    const checkInTime = new Date(attendance.checkIn);
    const checkOutTime = new Date(now);
    const workHours =
      (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    const hours = Math.floor(workHours);
    const minutes = Math.floor((workHours - hours) * 60);

    const updatedAttendance: Attendance = {
      ...attendance,
      checkOut: now,
      workHours: `${hours}h ${minutes}m`,
    };

    const index = this.attendanceRecords.findIndex(
      (r) => r.id === attendance.id,
    );
    this.attendanceRecords[index] = updatedAttendance;

    return updatedAttendance;
  }

  /**
   * Get attendance records for an employee
   */
  async getAttendanceByEmployeeId(
    employeeId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Attendance[]> {
    let records = this.attendanceRecords.filter(
      (record) => record.employeeId === employeeId,
    );

    if (startDate) {
      records = records.filter((record) => record.date >= startDate);
    }

    if (endDate) {
      records = records.filter((record) => record.date <= endDate);
    }

    return records.sort((a, b) => b.date.localeCompare(a.date));
  }

  /**
   * Get all attendance records (for admin/HR)
   */
  async getAllAttendance(date?: string): Promise<Attendance[]> {
    if (date) {
      return this.attendanceRecords.filter((record) => record.date === date);
    }
    return [...this.attendanceRecords].sort((a, b) =>
      b.date.localeCompare(a.date),
    );
  }

  /**
   * Mark attendance manually (for admin/HR)
   */
  async markAttendance(
    employeeId: string,
    date: string,
    status: AttendanceStatus,
    note?: string,
  ): Promise<Attendance> {
    const existingAttendance = this.attendanceRecords.find(
      (record) => record.employeeId === employeeId && record.date === date,
    );

    const attendance: Attendance = {
      id: existingAttendance?.id || `ATT${Date.now()}`,
      employeeId,
      date,
      status,
      note,
    };

    if (existingAttendance) {
      const index = this.attendanceRecords.findIndex(
        (r) => r.id === existingAttendance.id,
      );
      this.attendanceRecords[index] = attendance;
    } else {
      this.attendanceRecords.push(attendance);
    }

    return attendance;
  }

  /**
   * Get attendance statistics for an employee
   */
  async getAttendanceStats(employeeId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const records = await this.getAttendanceByEmployeeId(
      employeeId,
      startDate,
      endDate,
    );

    const present = records.filter(
      (r) => r.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = records.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;
    const leave = records.filter(
      (r) => r.status === AttendanceStatus.LEAVE,
    ).length;
    const late = records.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;
    const halfDay = records.filter(
      (r) => r.status === AttendanceStatus.HALF_DAY,
    ).length;

    // Calculate total work hours
    let totalMinutes = 0;
    records.forEach((record) => {
      if (record.workHours) {
        const match = record.workHours.match(/(\d+)h (\d+)m/);
        if (match) {
          totalMinutes += parseInt(match[1]) * 60 + parseInt(match[2]);
        }
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const totalMins = totalMinutes % 60;

    return {
      present,
      absent,
      leave,
      late,
      halfDay,
      totalWorkHours: `${totalHours}h ${totalMins}m`,
      totalDays: records.length,
    };
  }

  /**
   * Get today's attendance summary for dashboard
   */
  async getTodayAttendanceSummary() {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = this.attendanceRecords.filter(
      (record) => record.date === today,
    );

    const present = todayRecords.filter(
      (r) =>
        r.status === AttendanceStatus.PRESENT ||
        r.status === AttendanceStatus.LATE,
    ).length;
    const absent = todayRecords.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;
    const leave = todayRecords.filter(
      (r) => r.status === AttendanceStatus.LEAVE,
    ).length;
    const late = todayRecords.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;

    return {
      present,
      absent,
      leave,
      late,
      total: todayRecords.length,
    };
  }
}

export const attendanceService = new AttendanceService();
