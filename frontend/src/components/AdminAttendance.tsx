import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  Users,
  TrendingUp,
  Download,
  Filter,
} from "lucide-react";
import attendanceService, {
  getAllAttendance,
} from "../services/attendanceService";
import { Attendance, AttendanceStatus } from "../types";
import styles from "./AdminAttendance.module.css";

const AdminAttendance: React.FC = () => {
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<string>("today");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadAttendanceData();
  }, [dateFilter, statusFilter]);

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      const endDate = new Date();
      let startDate = new Date();

      // Set date range based on filter
      switch (dateFilter) {
        case "today":
          startDate = new Date();
          break;
        case "week":
          startDate.setDate(startDate.getDate() - 7);
          break;
        case "month":
          startDate.setDate(startDate.getDate() - 30);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      const records = await getAllAttendance(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      );

      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayStats = () => {
    const today = new Date().toISOString().split("T")[0];
    const todayRecords = attendanceRecords.filter(
      (record) => record.date === today,
    );

    const present = todayRecords.filter(
      (r) =>
        r.status === AttendanceStatus.PRESENT ||
        r.status === AttendanceStatus.LATE,
    ).length;
    const late = todayRecords.filter(
      (r) => r.status === AttendanceStatus.LATE,
    ).length;
    const onLeave = todayRecords.filter(
      (r) => r.status === AttendanceStatus.LEAVE,
    ).length;
    const absent = todayRecords.filter(
      (r) => r.status === AttendanceStatus.ABSENT,
    ).length;

    return { present, late, onLeave, absent, total: todayRecords.length };
  };

  const getAverageWorkHours = () => {
    let totalMinutes = 0;
    let daysWithWork = 0;

    attendanceRecords.forEach((record) => {
      if (record.workHours && record.workHours !== "0h 0m") {
        const hoursMatch = record.workHours.match(/(\d+)h/);
        const minutesMatch = record.workHours.match(/(\d+)m/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        totalMinutes += hours * 60 + minutes;
        daysWithWork++;
      }
    });

    if (daysWithWork === 0) return "0h 0m";

    const avgMinutes = totalMinutes / daysWithWork;
    const hours = Math.floor(avgMinutes / 60);
    const minutes = Math.floor(avgMinutes % 60);

    return `${hours}h ${minutes}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return "N/A";
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getFilteredRecords = () => {
    if (statusFilter === "all") return attendanceRecords;
    return attendanceRecords.filter((record) => {
      switch (statusFilter) {
        case "present":
          return (
            record.status === AttendanceStatus.PRESENT ||
            record.status === AttendanceStatus.LATE
          );
        case "absent":
          return record.status === AttendanceStatus.ABSENT;
        case "leave":
          return record.status === AttendanceStatus.LEAVE;
        default:
          return true;
      }
    });
  };

  const stats = getTodayStats();
  const filteredRecords = getFilteredRecords();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Attendance Management</h2>
        <div className={styles.actions}>
          <button className={styles.exportButton}>
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Today's Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Users size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Present Today</div>
            <div className={styles.statValue}>{stats.present}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#92400e" }}>
            <Clock size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Late Arrivals</div>
            <div className={styles.statValue}>{stats.late}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#3730a3" }}>
            <Calendar size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>On Leave</div>
            <div className={styles.statValue}>{stats.onLeave}</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: "#991b1b" }}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statLabel}>Avg Work Hours</div>
            <div className={styles.statValue}>{getAverageWorkHours()}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={18} />
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
            <option value="leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>Loading attendance data...</div>
        ) : filteredRecords.length === 0 ? (
          <div className={styles.emptyState}>
            <Calendar size={48} />
            <p>No attendance records found</p>
          </div>
        ) : (
          <table className={styles.attendanceTable}>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Work Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map((record) => (
                <tr key={record.id}>
                  <td className={styles.employeeCell}>
                    {record.employeeName || "N/A"}
                  </td>
                  <td>{record.employeeId}</td>
                  <td className={styles.dateCell}>{formatDate(record.date)}</td>
                  <td>{formatTime(record.checkIn)}</td>
                  <td>{formatTime(record.checkOut)}</td>
                  <td className={styles.hoursCell}>
                    {record.workHours || "0h 0m"}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${styles[`status${record.status}`]}`}
                    >
                      {record.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminAttendance;
