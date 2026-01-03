import React, { useState, useEffect } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import attendanceService from "../services/attendanceService";
import styles from "./CheckInOut.module.css";

const CheckInOut: React.FC = () => {
  const { user } = useAuth();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodayAttendance();
    }
  }, [user]);

  const checkTodayAttendance = async () => {
    if (!user) return;

    try {
      const todayAttendance = await attendanceService.getTodayAttendance(
        user.employeeId,
      );
      if (todayAttendance && todayAttendance.checkIn) {
        setIsCheckedIn(true);
        setCheckInTime(todayAttendance.checkIn);
      }
    } catch (error) {
      console.error("Error checking attendance:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const result = await attendanceService.checkIn(user.employeeId);
      setIsCheckedIn(true);
      setCheckInTime(result.checkIn || new Date().toISOString());
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      await attendanceService.checkOut(user.employeeId);
      alert("You have successfully checked out!");
      // Optionally reset or update UI
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Failed to check out. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!user) return null;

  return (
    <div className={styles.container}>
      <div className={styles.statusIndicator}>
        <div
          className={`${styles.statusDot} ${isCheckedIn ? styles.statusDotGreen : styles.statusDotRed}`}
        />
        <span className={styles.statusText}>
          {isCheckedIn ? "Checked In" : "Not Checked In"}
        </span>
      </div>

      {checkInTime && (
        <div className={styles.timeDisplay}>
          <Clock size={16} />
          <span>Check In: {formatTime(checkInTime)}</span>
        </div>
      )}

      <div className={styles.actions}>
        {!isCheckedIn ? (
          <button
            className={`${styles.button} ${styles.buttonCheckIn}`}
            onClick={handleCheckIn}
            disabled={isLoading}
          >
            <CheckCircle size={18} />
            {isLoading ? "Checking In..." : "Check In"}
          </button>
        ) : (
          <button
            className={`${styles.button} ${styles.buttonCheckOut}`}
            onClick={handleCheckOut}
            disabled={isLoading}
          >
            <CheckCircle size={18} />
            {isLoading ? "Checking Out..." : "Check Out"}
          </button>
        )}
      </div>
    </div>
  );
};

export default CheckInOut;
