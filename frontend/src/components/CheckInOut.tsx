import React, { useState, useEffect, useRef } from "react";
import { Clock, LogIn, LogOut, Timer } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import attendanceService from "../services/attendanceService.ts";
import styles from "./CheckInOut.module.css";

interface AttendanceSession {
  id: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  duration: number; // in seconds
}

const CheckInOut: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentElapsedTime, setCurrentElapsedTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const isCheckedIn = activeSession !== undefined && activeSession !== null;

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
    if (isCheckedIn && activeSession) {
      // Calculate initial elapsed time
      const elapsed = Math.floor(
        (Date.now() - activeSession.checkInTime.getTime()) / 1000,
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
  }, [isCheckedIn, activeSession]);

  const loadTodayAttendance = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const records = await attendanceService.getMyAttendance(today, today);

      // Convert backend records to sessions
      const todaySessions: AttendanceSession[] = records.map((record) => {
        const checkIn = record.checkIn ? new Date(record.checkIn) : new Date();
        const checkOut = record.checkOut ? new Date(record.checkOut) : null;

        let duration = 0;
        if (checkOut) {
          duration = Math.floor(
            (checkOut.getTime() - checkIn.getTime()) / 1000,
          );
        }

        return {
          id: record.id,
          checkInTime: checkIn,
          checkOutTime: checkOut,
          duration: duration,
        };
      });

      // Sort by check-in time (newest first)
      todaySessions.sort(
        (a, b) => b.checkInTime.getTime() - a.checkInTime.getTime(),
      );

      setSessions(todaySessions);

      // Find active session (no check-out)
      const active = todaySessions.find((s) => s.checkOutTime === null);
      if (active) {
        setActiveSessionId(active.id);
      }
    } catch (error) {
      console.error("Error loading attendance:", error);
    }
  };

  const handleCheckIn = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      const result = await attendanceService.checkIn();

      const newSession: AttendanceSession = {
        id: result.id || Date.now().toString(),
        checkInTime: result.checkIn ? new Date(result.checkIn) : new Date(),
        checkOutTime: null,
        duration: 0,
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    } catch (error: any) {
      console.error("Error checking in:", error);
      alert(error.message || "Failed to check in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || isLoading || !activeSession) return;

    setIsLoading(true);
    try {
      await attendanceService.checkOut();

      // Update session with checkout time
      setSessions((prev) =>
        prev.map((session) =>
          session.id === activeSessionId
            ? {
                ...session,
                checkOutTime: new Date(),
                duration: currentElapsedTime,
              }
            : session,
        ),
      );

      setActiveSessionId(null);
      setCurrentElapsedTime(0);
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

  const getTotalWorkTime = () => {
    const total = sessions.reduce((acc, session) => {
      if (session.checkOutTime) {
        return acc + session.duration;
      } else if (session.id === activeSessionId) {
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
      {isCheckedIn && activeSession && (
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
            {isLoading
              ? "Checking In..."
              : sessions.length > 0
                ? "Start New Session"
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

      {/* Info message about multiple sessions */}
      {sessions.length > 0 && !isCheckedIn && (
        <div className={styles.infoMessage}>
          <span className={styles.infoIcon}>ℹ️</span>
          <span>You can check in multiple times during the day</span>
        </div>
      )}

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
                  session.id === activeSessionId ? styles.sessionCardActive : ""
                }`}
              >
                <div className={styles.sessionHeader}>
                  <span className={styles.sessionNumber}>
                    Session {sessions.length - index}
                  </span>
                  {session.id === activeSessionId && (
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
                      {session.id === activeSessionId
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
