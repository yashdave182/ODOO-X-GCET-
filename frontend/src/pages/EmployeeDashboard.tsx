import React, { useState, useEffect } from "react";
import { Search, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Employee, AttendanceStatus } from "../types";
import * as employeeService from "../services/employeeService";
import { attendanceService } from "../services/attendanceService";
import EmployeeCard from "../components/EmployeeCard";
import UserProfileMenu from "../components/UserProfileMenu";
import CheckInOut from "../components/CheckInOut";
import styles from "./EmployeeDashboard.module.css";

type TabType = "employees" | "attendance" | "timeOff";

const EmployeeDashboard: React.FC = () => {
  const {} = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null,
  );

  useEffect(() => {
    loadEmployees();
  }, []);

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
            const attendance = await attendanceService.getTodayAttendance(
              emp.id,
            );
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
    return (
      <div className={styles.tabContent}>
        <h2>Attendance Records</h2>
        <p className={styles.comingSoon}>
          Attendance history will be displayed here.
        </p>
      </div>
    );
  };

  const renderTimeOffTab = () => {
    return (
      <div className={styles.tabContent}>
        <h2>Time Off & Leave Management</h2>
        <p className={styles.comingSoon}>
          Leave requests and time-off records will be displayed here.
        </p>
      </div>
    );
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
          {/* Search Bar */}
          {activeTab === "employees" && (
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
          )}

          {/* Tab Content */}
          {activeTab === "employees" && renderEmployeesTab()}
          {activeTab === "attendance" && renderAttendanceTab()}
          {activeTab === "timeOff" && renderTimeOffTab()}
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
                  <p className={styles.statusBadge}>
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
