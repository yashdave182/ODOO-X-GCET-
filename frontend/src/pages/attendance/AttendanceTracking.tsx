import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Clock, TrendingUp, Activity } from "lucide-react";
import CheckInOut from "../../components/CheckInOut";
import attendanceService from "../../services/attendanceService";
import { Attendance } from "../../types";
import styles from "./AttendanceTracking.module.css";

const AttendanceTracking: React.FC = () => {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekStats, setWeekStats] = useState({
    totalHours: 0,
    avgCheckIn: "09:00 AM",
    daysPresent: 0,
    productivity: 0,
  });

  useEffect(() => {
    if (user) {
      loadAttendanceData();
    }
  }, [user]);

  const loadAttendanceData = async () => {
    setIsLoading(true);
    try {
      // Get last 30 days of attendance
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const records = await attendanceService.getMyAttendance(
        startDate.toISOString().split("T")[0],
        endDate.toISOString().split("T")[0],
      );

      setAttendanceHistory(records);
      calculateWeekStats(records);
    } catch (error) {
      console.error("Error loading attendance data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWeekStats = (records: Attendance[]) => {
    const now = new Date();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekRecords = records.filter((record) => {
      const recordDate = new Date(record.date);
      return recordDate >= weekAgo && recordDate <= now;
    });

    let totalMinutes = 0;
    let checkInTimes: number[] = [];
    let daysPresent = 0;

    weekRecords.forEach((record) => {
      if (record.checkIn) {
        daysPresent++;

        // Calculate total hours
        if (record.workHours) {
          const hoursMatch = record.workHours.match(/(\d+)h/);
          const minutesMatch = record.workHours.match(/(\d+)m/);
          const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
          const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
          totalMinutes += hours * 60 + minutes;
        }

        // Collect check-in times for average
        const checkInDate = new Date(record.checkIn);
        checkInTimes.push(checkInDate.getHours() * 60 + checkInDate.getMinutes());
      }
    });

    const totalHours = totalMinutes / 60;
    const avgCheckInMinutes =
      checkInTimes.length > 0
        ? checkInTimes.reduce((a, b) => a + b, 0) / checkInTimes.length
        : 540; // Default 9:00 AM

    const avgHours = Math.floor(avgCheckInMinutes / 60);
    const avgMinutes = Math.floor(avgCheckInMinutes % 60);
    const avgCheckIn = new Date(0, 0, 0, avgHours, avgMinutes).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      },
    );

    // Calculate productivity score (based on total hours vs expected 40 hours/week)
    const productivity = Math.min((totalHours / 40) * 100, 100);

    setWeekStats({
      totalHours: Math.round(totalHours * 10) / 10,
      avgCheckIn,
      daysPresent,
      productivity: Math.round(productivity),
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return styles.statusPresent;
      case "LATE":
        return styles.statusLate;
      case "ABSENT":
        return styles.statusAbsent;
      case "ON_LEAVE":
        return styles.statusLeave;
      default:
        return "";
    }
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Attendance Tracking</h1>
          <p className={styles.subtitle}>
            Track your work hours and attendance records
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column - Check In/Out Widget */}
        <div className={styles.checkInSection}>
          <CheckInOut />
        </div>

        {/* Right Column - Stats and History */}
        <div className={styles.contentSection}>
          {/* Weekly Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: "#dbeafe" }}>
                <Clock size={24} style={{ color: "#3b82f6" }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Total Hours (7 days)</p>
                <p className={styles.statValue}>{weekStats.totalHours}h</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: "#dcfce7" }}>
                <Activity size={24} style={{ color: "#10b981" }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Days Present</p>
                <p className={styles.statValue}>{weekStats.daysPresent}/7</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: "#fef3c7" }}>
                <Calendar size={24} style={{ color: "#f59e0b" }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Avg Check-In</p>
                <p className={styles.statValue}>{weekStats.avgCheckIn}</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon} style={{ background: "#e9d5ff" }}>
                <TrendingUp size={24} style={{ color: "#a855f7" }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Productivity</p>
                <p className={styles.statValue}>{weekStats.productivity}%</p>
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <h2 className={styles.historyTitle}>Attendance History</h2>
              <p className={styles.historySubtitle}>Last 30 days</p>
            </div>

            {isLoading ? (
              <div className={styles.loadingContainer}>
                <p>Loading attendance history...</p>
              </div>
            ) : attendanceHistory.length === 0 ? (
              <div className={styles.emptyContainer}>
                <Calendar size={48} className={styles.emptyIcon} />
                <p className={styles.emptyText}>No attendance records found</p>
                <p className={styles.emptySubtext}>
                  Check in to start tracking your attendance
                </p>
              </div>
            ) : (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Work Hours</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td className={styles.dateCell}>
                          {formatDate(record.date)}
                        </td>
                        <td>{formatTime(record.checkIn)}</td>
                        <td>{formatTime(record.checkOut)}</td>
                        <td className={styles.hoursCell}>
                          {record.workHours || "N/A"}
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${getStatusColor(record.status)}`}
                          >
                            {record.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracking;
