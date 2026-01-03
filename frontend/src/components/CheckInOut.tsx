import React, { useState, useEffect, useRef } from "react";
import { Clock, LogIn, LogOut, Timer } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import attendanceService from "../services/attendanceService.ts";
import styles from "./CheckInOut.module.css";

interface CheckInOutSession {
  id: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  duration: number; // in seconds
}

const CheckInOut: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<CheckInOutSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [currentElapsedTime, setCurrentElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current active session
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const isCheckedIn =
    currentSession !== undefined &&
    currentSession !== null &&
    currentSession.checkOutTime === null;

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
    if (isCheckedIn && currentSession) {
      // Calculate initial elapsed time
      const elapsed = Math.floor(
        (Date.now() - currentSession.checkInTime.getTime()) / 1000,
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
  }, [isCheckedIn, currentSession]);

  const loadTodayAttendance = async () => {
    if (!user) return;

    try {
      const todayAttendance = await attendanceService.getTodayAttendance();

      // TODO: Backend should return multiple sessions for today
      // For now, we'll simulate with the single check-in/check-out
      if (todayAttendance && todayAttendance.checkIn) {
        const session: CheckInOutSession = {
          id: todayAttendance.id || "1",
          checkInTime: new Date(todayAttendance.checkIn),
          checkOutTime: todayAttendance.checkOut
            ? new Date(todayAttendance.checkOut)
            : null,
          duration: todayAttendance.workHours
            ? parseWorkHours(todayAttendance.workHours)
            : 0,
        };

        setSessions([session]);

        if (!session.checkOutTime) {
          setCurrentSessionId(session.id);
        }
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const parseWorkHours = (workHours: string): number => {
    // Parse "8h 30m" format to seconds
    const hoursMatch = workHours.match(/(\d+)h/);
    const minutesMatch = workHours.match(/(\d+)m/);

    const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
    const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;

    return hours * 3600 + minutes * 60;
  };

  const handleCheckIn = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const result = await attendanceService.checkIn();

      const newSession: CheckInOutSession = {
        id: result.id || Date.now().toString(),
        checkInTime: new Date(result.checkIn || new Date().toISOString()),
        checkOutTime: null,
        duration: 0,
      };

      setSessions((prev) => [...prev, newSession]);
      setCurrentSessionId(newSession.id);
    } catch (error) {
      console.error("Error checking in:", error);
      alert("Failed to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || isLoading || !currentSession) return;

    setIsLoading(true);
    try {
      await attendanceService.checkOut();

      // Update current session with check-out time
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                checkOutTime: new Date(),
                duration: currentElapsedTime,
              }
            : session,
        ),
      );

      setCurrentSessionId(null);
      setCurrentElapsedTime(0);
    } catch (error) {
      console.error("Error checking out:", error);
      alert("Failed to check out. Please try again.");
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

  const getTotalWorkTime = () => {
    const total = sessions.reduce((acc, session) => {
      if (session.checkOutTime) {
        return acc + session.duration;
      } else if (session.id === currentSessionId) {
        return acc + currentElapsedTime;
      }
      return acc;
    }, 0);

    return total;
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
      {isCheckedIn && currentSession && (
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
            disabled={isLoading}
          >
            <LogIn size={18} />
            {isLoading ? "Checking In..." : "Check In"}
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
      <div className={styles.totalTime}>
        <Clock size={16} />
        <span className={styles.totalTimeLabel}>Total Today:</span>
        <span className={styles.totalTimeValue}>
          {formatDuration(getTotalWorkTime())}
        </span>
      </div>

      {/* Session History */}
      {sessions.length > 0 && (
        <div className={styles.sessionsContainer}>
          <h3 className={styles.sessionsTitle}>Today's Sessions</h3>
          <div className={styles.sessionsList}>
            {sessions.map((session, index) => (
              <div
                key={session.id}
                className={`${styles.sessionCard} ${
                  session.id === currentSessionId
                    ? styles.sessionCardActive
                    : ""
                }`}
              >
                <div className={styles.sessionHeader}>
                  <span className={styles.sessionNumber}>
                    Session {index + 1}
                  </span>
                  {session.id === currentSessionId && (
                    <span className={styles.sessionBadge}>Active</span>
                  )}
                </div>
                <div className={styles.sessionDetails}>
                  <div className={styles.sessionTime}>
                    <LogIn size={14} className={styles.sessionIcon} />
                    <span className={styles.sessionLabel}>In:</span>
                    <span className={styles.sessionValue}>
                      {formatTime(session.checkInTime)}
                    </span>
                  </div>
                  {session.checkOutTime ? (
                    <div className={styles.sessionTime}>
                      <LogOut size={14} className={styles.sessionIcon} />
                      <span className={styles.sessionLabel}>Out:</span>
                      <span className={styles.sessionValue}>
                        {formatTime(session.checkOutTime)}
                      </span>
                    </div>
                  ) : (
                    <div className={styles.sessionTime}>
                      <Timer size={14} className={styles.sessionIcon} />
                      <span className={styles.sessionLabel}>Running...</span>
                    </div>
                  )}
                  <div className={styles.sessionDuration}>
                    <span className={styles.sessionLabel}>Duration:</span>
                    <span className={styles.sessionDurationValue}>
                      {session.id === currentSessionId
                        ? formatDuration(currentElapsedTime)
                        : formatDuration(session.duration)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInOut;
