import React, { useState, useEffect } from "react";
import { Settings, Search } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Attendance, Employee, AttendanceStatus } from "../types";
import attendanceService from "../services/attendanceService";
import * as employeeService from "../services/employeeService";
import UserProfileMenu from "../components/UserProfileMenu";
import CheckInOut from "../components/CheckInOut";
import EmployeeCard from "../components/EmployeeCard";
import LeaveManagement from "../components/LeaveManagement";
import styles from "./EmployeeDashboard.module.css";

type TabType = "employees" | "attendance" | "timeOff";

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  useEffect(() => {
    if (user) {
      loadEmployees();
      loadAttendanceRecords();
    }
  }, [user]);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const allEmployees = await employeeService.getAllEmployees();

      // Get today's attendance for all employees
      const employeesWithStatus = await Promise.all(
        allEmployees.map(async (emp: Employee) => {
          try {
            const attendance = await attendanceService.getTodayAttendance();
            return {
              ...emp,
              status: attendance?.status || AttendanceStatus.ABSENT,
              checkInTime: attendance?.checkIn,
            };
          } catch (error) {
            return {
              ...emp,
              status: AttendanceStatus.ABSENT,
            };
          }
        }),
      );

      setEmployees(employeesWithStatus);
      setFilteredEmployees(employeesWithStatus);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.jobTitle.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.loginId.toLowerCase().includes(query),
    );
    setFilteredEmployees(filtered);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const closeEmployeeModal = () => {
    setSelectedEmployee(null);
  };

  const loadAttendanceRecords = async () => {
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

      setAttendanceRecords(records);
    } catch (error) {
      console.error("Error loading attendance records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalWorkHours = () => {
    let totalMinutes = 0;
    let daysPresent = 0;

    attendanceRecords.forEach((record) => {
      if (
        record.workHours &&
        record.workHours !== "N/A" &&
        record.workHours !== "0h 0m"
      ) {
        daysPresent++;
        // Parse "8h 30m" format
        const hoursMatch = record.workHours.match(/(\d+)h/);
        const minutesMatch = record.workHours.match(/(\d+)m/);
        const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
        const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
        totalMinutes += hours * 60 + minutes;
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    return {
      formatted: `${totalHours}h ${remainingMinutes}m`,
      daysPresent,
      averageHours:
        daysPresent > 0 ? (totalMinutes / daysPresent / 60).toFixed(1) : "0",
    };
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

  const renderEmployeesTab = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <p>Loading employees...</p>
        </div>
      );
    }

    if (filteredEmployees.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <p>No employees found</p>
        </div>
      );
    }

    return (
      <div className={styles.employeesGrid}>
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            employee={employee}
            onClick={() => handleEmployeeClick(employee)}
          />
        ))}
      </div>
    );
  };

  const renderAttendanceTab = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <p>Loading attendance records...</p>
        </div>
      );
    }

    if (attendanceRecords.length === 0) {
      return (
        <div className={styles.emptyContainer}>
          <p className={styles.emptyText}>
            Attendance history will be displayed here.
          </p>
        </div>
      );
    }

    const workStats = calculateTotalWorkHours();

    return (
      <div className={styles.recordsContainer}>
        {/* Work Hours Summary */}
        <div className={styles.workSummary}>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Work Hours</div>
            <div className={styles.summaryValue}>{workStats.formatted}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Days Present</div>
            <div className={styles.summaryValue}>{workStats.daysPresent}</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Average Hours/Day</div>
            <div className={styles.summaryValue}>{workStats.averageHours}h</div>
          </div>
          <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Records</div>
            <div className={styles.summaryValue}>
              {attendanceRecords.length}
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <table className={styles.attendanceTable}>
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
            {attendanceRecords.map((record) => (
              <tr key={record.id}>
                <td className={styles.dateCell}>{formatDate(record.date)}</td>
                <td>{formatTime(record.checkIn)}</td>
                <td>{formatTime(record.checkOut)}</td>
                <td className={styles.hoursCell}>
                  {record.workHours || "N/A"}
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
      </div>
    );
  };

  const renderTimeOffTab = () => {
    return <LeaveManagement />;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Employee Portal</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.settingsButton} title="Settings">
            <Settings size={20} />
          </button>
          <UserProfileMenu />
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === "employees" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("employees")}
        >
          Employees
        </button>
        <button
          className={`${styles.tab} ${activeTab === "attendance" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>
        <button
          className={`${styles.tab} ${activeTab === "timeOff" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("timeOff")}
        >
          Time Off
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Sidebar - Check In/Out */}
        <aside className={styles.sidebar}>
          <CheckInOut />
        </aside>

        {/* Content Area */}
        <div className={styles.content}>
          {activeTab === "employees" && (
            <>
              <div className={styles.searchContainer}>
                <div className={styles.searchInputWrapper}>
                  <Search size={20} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search employees by name, email, job title, or department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
              {renderEmployeesTab()}
            </>
          )}

          {activeTab === "attendance" && (
            <>
              <div className={styles.contentHeader}>
                <h2 className={styles.contentTitle}>Attendance Records</h2>
              </div>
              {renderAttendanceTab()}
            </>
          )}

          {activeTab === "timeOff" && (
            <>
              <div className={styles.contentHeader}>
                <h2 className={styles.contentTitle}>
                  Time Off & Leave Management
                </h2>
              </div>
              {renderTimeOffTab()}
            </>
          )}
        </div>
      </main>

      {/* Employee Details Modal */}
      {selectedEmployee && (
        <div className={styles.modalOverlay} onClick={closeEmployeeModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Employee Information</h2>
              <button
                className={styles.modalClose}
                onClick={closeEmployeeModal}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalAvatarSection}>
                {selectedEmployee.avatar ? (
                  <img
                    src={selectedEmployee.avatar}
                    alt={selectedEmployee.fullName}
                    className={styles.modalAvatar}
                  />
                ) : (
                  <div className={styles.modalAvatarPlaceholder}>
                    {selectedEmployee.fullName.charAt(0)}
                  </div>
                )}
              </div>

              <div className={styles.modalInfoGrid}>
                <div className={styles.modalInfoItem}>
                  <label>Full Name</label>
                  <p>{selectedEmployee.fullName}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Login ID</label>
                  <p>{selectedEmployee.loginId}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Email</label>
                  <p>{selectedEmployee.email}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Job Title</label>
                  <p>{selectedEmployee.jobTitle}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Department</label>
                  <p>{selectedEmployee.department}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Location</label>
                  <p>{selectedEmployee.location || "N/A"}</p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Date of Joining</label>
                  <p>
                    {new Date(
                      selectedEmployee.dateOfJoining,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <div className={styles.modalInfoItem}>
                  <label>Status</label>
                  <p className={styles.employeeStatusBadge}>
                    {selectedEmployee.employmentStatus}
                  </p>
                </div>
                {selectedEmployee.phone && (
                  <div className={styles.modalInfoItem}>
                    <label>Phone</label>
                    <p>{selectedEmployee.phone}</p>
                  </div>
                )}
                {selectedEmployee.manager && (
                  <div className={styles.modalInfoItem}>
                    <label>Manager</label>
                    <p>{selectedEmployee.manager}</p>
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

export default EmployeeDashboard;
