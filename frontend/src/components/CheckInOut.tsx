import React, { useState, useEffect, useRef } from "react";
import { Clock, LogIn, LogOut, Timer } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import attendanceService from "../services/attendanceService.ts";
import styles from "./CheckInOut.module.css";

interface TodayAttendance {
  id?: string;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  workHours: string;
}

const CheckInOut: React.FC = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance>({
    id: undefined,
    checkInTime: null,
    checkOutTime: null,
    workHours: "0h 0m",
  });
  const [currentElapsedTime, setCurrentElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isCheckedIn =
    todayAttendance.checkInTime !== null &&
    todayAttendance.checkOutTime === null;

  useEffect(() => {
    if (user) {
      loadTodayAttendance();
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [user]);

  // Start/update timer when checked in
  useEffect(() => {
    if (isCheckedIn && todayAttendance.checkInTime) {
      // Calculate initial elapsed time
      const elapsed = Math.floor(
        (Date.now() - todayAttendance.checkInTime.getTime()) / 1000,
      );
      setCurrentElapsedTime(elapsed);

      // Start interval to update every second
      timerRef.current = setInterval(() => {
        setCurrentElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isCheckedIn, todayAttendance.checkInTime]);

  const loadTodayAttendance = async () => {
    if (!user) return;

    try {
      const attendance = await attendanceService.getTodayAttendance();

      if (attendance) {
        setTodayAttendance({
          id: attendance.id,
          checkInTime: attendance.checkIn ? new Date(attendance.checkIn) : null,
          checkOutTime: attendance.checkOut
            ? new Date(attendance.checkOut)
            : null,
          workHours: attendance.workHours || "0h 0m",
        });
      } else {
        setTodayAttendance({
          id: undefined,
          checkInTime: null,
          checkOutTime: null,
          workHours: "0h 0m",
        });
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || isLoading || isCheckedIn) return;

    setIsLoading(true);
    try {
      const result = await attendanceService.checkIn();

      setTodayAttendance({
        id: result.id,
        checkInTime: result.checkIn ? new Date(result.checkIn) : new Date(),
        checkOutTime: null,
        workHours: "0h 0m",
      });
    } catch (error: any) {
      console.error("Error checking in:", error);
      alert(error.message || "Failed to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || isLoading || !isCheckedIn) return;

    setIsLoading(true);
    try {
      await attendanceService.checkOut();

      // Reload attendance to get updated data with calculated work hours
      await loadTodayAttendance();
    } catch (error: any) {
      console.error("Error checking out:", error);
      alert(error.message || "Failed to check out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatWorkHours = (workHours: string) => {
    // Convert "8h 30m" to readable format
    return workHours;
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      {/* Status Header */}
      <div className={styles.header}>
        <div className={styles.statusIndicator}>
          <div
            className={`${styles.statusDot} ${
              isCheckedIn ? styles.statusDotGreen : styles.statusDotRed
            }`}
          />
          <span className={styles.statusText}>
            {isCheckedIn ? "Active Session" : "Not Checked In"}
          </span>
        </div>
      </div>

      {/* Running Clock Display */}
      {isCheckedIn && todayAttendance.checkInTime && (
        <div className={styles.clockDisplay}>
          <div className={styles.clockIcon}>
            <Timer size={24} />
          </div>
          <div className={styles.clockTime}>
            {formatDuration(currentElapsedTime)}
          </div>
          <div className={styles.clockLabel}>Current Session</div>
        </div>
      )}

      {/* Check In/Out Actions */}
      <div className={styles.actions}>
        {!isCheckedIn ? (
          <button
            className={`${styles.button} ${styles.buttonCheckIn}`}
            onClick={handleCheckIn}
            disabled={isLoading || todayAttendance.checkOutTime !== null}
          >
            <LogIn size={18} />
            {isLoading
              ? "Checking In..."
              : todayAttendance.checkOutTime
                ? "Already Completed Today"
                : "Check In"}
          </button>
        ) : (
          <button
            className={`${styles.button} ${styles.buttonCheckOut}`}
            onClick={handleCheckOut}
            disabled={isLoading}
          >
            <LogOut size={18} />
            {isLoading ? "Checking Out..." : "Check Out"}
          </button>
        )}
      </div>

      {/* Total Work Time Today */}
      {todayAttendance.checkInTime && (
        <div className={styles.totalTime}>
          <Clock size={16} />
          <span className={styles.totalTimeLabel}>
            {todayAttendance.checkOutTime
              ? "Total Work Time:"
              : "Current Session:"}
          </span>
          <span className={styles.totalTimeValue}>
            {todayAttendance.checkOutTime
              ? formatWorkHours(todayAttendance.workHours)
              : formatDuration(currentElapsedTime)}
          </span>
        </div>
      )}

      {/* Today's Attendance Details */}
      {todayAttendance.checkInTime && (
        <div className={styles.sessionsContainer}>
          <h3 className={styles.sessionsTitle}>Today's Attendance</h3>
          <div className={styles.sessionsList}>
            <div
              className={`${styles.sessionCard} ${!todayAttendance.checkOutTime ? styles.sessionCardActive : ""}`}
            >
              <div className={styles.sessionHeader}>
                <span className={styles.sessionNumber}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {!todayAttendance.checkOutTime && (
                  <span className={styles.sessionBadge}>Active</span>
                )}
              </div>
              <div className={styles.sessionDetails}>
                <div className={styles.sessionTime}>
                  <LogIn size={14} className={styles.sessionIcon} />
                  <span className={styles.sessionLabel}>Check In:</span>
                  <span className={styles.sessionValue}>
                    {formatTime(todayAttendance.checkInTime)}
                  </span>
                </div>
                {todayAttendance.checkOutTime ? (
                  <>
                    <div className={styles.sessionTime}>
                      <LogOut size={14} className={styles.sessionIcon} />
                      <span className={styles.sessionLabel}>Check Out:</span>
                      <span className={styles.sessionValue}>
                        {formatTime(todayAttendance.checkOutTime)}
                      </span>
                    </div>
                    <div className={styles.sessionDuration}>
                      <span className={styles.sessionLabel}>Work Hours:</span>
                      <span className={styles.sessionDurationValue}>
                        {formatWorkHours(todayAttendance.workHours)}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className={styles.sessionTime}>
                    <Timer size={14} className={styles.sessionIcon} />
                    <span className={styles.sessionLabel}>In Progress...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;
