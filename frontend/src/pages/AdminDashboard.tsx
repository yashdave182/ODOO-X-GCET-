import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Settings, Download, Upload } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Employee } from "../types";
import * as employeeService from "../services/employeeService";
import UserProfileMenu from "../components/UserProfileMenu";
import styles from "./AdminDashboard.module.css";

type TabType = "employees" | "attendance" | "timeOff" | "payroll";

const AdminDashboard: React.FC = () => {
  const {} = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("employees");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees, departmentFilter, statusFilter]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const allEmployees = await employeeService.getAllEmployees();
      setEmployees(allEmployees);
      setFilteredEmployees(allEmployees);
    } catch (error) {
      console.error("Error loading employees:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = [...employees];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.fullName.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.jobTitle.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query) ||
          emp.loginId.toLowerCase().includes(query),
      );
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter((emp) => emp.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (emp) => emp.employmentStatus === statusFilter,
      );
    }

    setFilteredEmployees(filtered);
  };

  const handleEmployeeClick = (employee: Employee) => {
    navigate(`/admin/employee/${employee.id}`);
  };

  const handleAddEmployee = () => {
    navigate("/admin/employee/new");
  };

  const getDepartments = () => {
    const departments = new Set(employees.map((emp) => emp.department));
    return Array.from(departments).sort();
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
          {searchQuery && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={styles.tableContainer}>
        <table className={styles.employeeTable}>
          <thead>
            <tr>
              <th>Employee</th>
              <th>Login ID</th>
              <th>Email</th>
              <th>Job Title</th>
              <th>Department</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr
                key={employee.id}
                className={styles.tableRow}
                onClick={() => handleEmployeeClick(employee)}
              >
                <td>
                  <div className={styles.employeeCell}>
                    {employee.avatar ? (
                      <img
                        src={employee.avatar}
                        alt={employee.fullName}
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {employee.fullName.charAt(0)}
                      </div>
                    )}
                    <span className={styles.employeeName}>
                      {employee.fullName}
                    </span>
                  </div>
                </td>
                <td>{employee.loginId}</td>
                <td>{employee.email}</td>
                <td>{employee.jobTitle}</td>
                <td>{employee.department}</td>
                <td>{new Date(employee.dateOfJoining).toLocaleDateString()}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${styles[employee.employmentStatus.toLowerCase()]}`}
                  >
                    {employee.employmentStatus}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.actionButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEmployeeClick(employee);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAttendanceTab = () => {
    return (
      <div className={styles.tabContent}>
        <h2>Attendance Management</h2>
        <p className={styles.comingSoon}>
          Attendance tracking and reports will be displayed here.
        </p>
      </div>
    );
  };

  const renderTimeOffTab = () => {
    return (
      <div className={styles.tabContent}>
        <h2>Time Off Management</h2>
        <p className={styles.comingSoon}>
          Leave requests and approvals will be displayed here.
        </p>
      </div>
    );
  };

  const renderPayrollTab = () => {
    return (
      <div className={styles.tabContent}>
        <h2>Payroll Management</h2>
        <p className={styles.comingSoon}>
          Payroll processing and salary management will be displayed here.
        </p>
      </div>
    );
  };

  const getStats = () => {
    const total = employees.length;
    const active = employees.filter(
      (emp) => emp.employmentStatus === "ACTIVE",
    ).length;
    const onLeave = employees.filter(
      (emp) => emp.employmentStatus === "ON_LEAVE",
    ).length;
    const inactive = employees.filter(
      (emp) => emp.employmentStatus === "INACTIVE",
    ).length;

    return { total, active, onLeave, inactive };
  };

  const stats = getStats();

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Admin Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconButton} title="Settings">
            <Settings size={20} />
          </button>
          <UserProfileMenu />
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <h3>Total Employees</h3>
          <p className={styles.statNumber}>{stats.total}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Active</h3>
          <p className={`${styles.statNumber} ${styles.active}`}>
            {stats.active}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>On Leave</h3>
          <p className={`${styles.statNumber} ${styles.leave}`}>
            {stats.onLeave}
          </p>
        </div>
        <div className={styles.statCard}>
          <h3>Inactive</h3>
          <p className={`${styles.statNumber} ${styles.inactive}`}>
            {stats.inactive}
          </p>
        </div>
      </div>

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
        <button
          className={`${styles.tab} ${activeTab === "payroll" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("payroll")}
        >
          Payroll
        </button>
      </div>

      {/* Main Content */}
      <main className={styles.main}>
        {activeTab === "employees" && (
          <>
            {/* Toolbar */}
            <div className={styles.toolbar}>
              <div className={styles.searchContainer}>
                <Search size={20} className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                />
              </div>

              <div className={styles.filters}>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Departments</option>
                  {getDepartments().map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className={styles.actions}>
                <button className={styles.secondaryButton} title="Export">
                  <Download size={18} />
                  Export
                </button>
                <button className={styles.secondaryButton} title="Import">
                  <Upload size={18} />
                  Import
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={handleAddEmployee}
                >
                  <Plus size={18} />
                  Add Employee
                </button>
              </div>
            </div>

            {/* Employee Table */}
            {renderEmployeesTab()}
          </>
        )}

        {activeTab === "attendance" && renderAttendanceTab()}
        {activeTab === "timeOff" && renderTimeOffTab()}
        {activeTab === "payroll" && renderPayrollTab()}
      </main>
    </div>
  );
};

export default AdminDashboard;
