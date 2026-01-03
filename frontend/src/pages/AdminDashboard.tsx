import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Settings,
  Download,
  Upload,
  X,
  CheckCircle,
  Copy,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Employee, CreateEmployeeData, CreateEmployeeResponse } from "../types";
import * as employeeService from "../services/employeeService";
import UserProfileMenu from "../components/UserProfileMenu";
import LeaveManagement from "../components/LeaveManagement";
import AdminAttendance from "../components/AdminAttendance";
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

  // Add Employee Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [newEmployeeCredentials, setNewEmployeeCredentials] =
    useState<CreateEmployeeResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateEmployeeData>({
    first_name: "",
    last_name: "",
    year_of_joining: new Date().getFullYear(),
    email: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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
    setFormData({
      first_name: "",
      last_name: "",
      year_of_joining: new Date().getFullYear(),
      email: "",
      phone: "",
    });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleFormChange = (
    field: keyof CreateEmployeeData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!formData.last_name.trim()) {
      errors.last_name = "Last name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }
    if (
      formData.year_of_joining < 1900 ||
      formData.year_of_joining > new Date().getFullYear() + 1
    ) {
      errors.year_of_joining = "Please enter a valid year";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await employeeService.createEmployee(formData);
      setNewEmployeeCredentials(response);
      setShowAddModal(false);
      setShowSuccessModal(true);
      // Reload employees list
      await loadEmployees();
    } catch (error: any) {
      alert(error.message || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`${label} copied to clipboard!`);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setNewEmployeeCredentials(null);
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
    return <AdminAttendance />;
  };

  const renderTimeOffTab = () => {
    return <LeaveManagement />;
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add New Employee</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    first_name: "",
                    last_name: "",
                    year_of_joining: new Date().getFullYear(),
                    email: "",
                    phone: "",
                  });
                  setFormErrors({});
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formContainer}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    First Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${formErrors.first_name ? styles.formInputError : ""}`}
                    placeholder="Enter first name"
                    value={formData.first_name}
                    onChange={(e) =>
                      handleFormChange("first_name", e.target.value)
                    }
                  />
                  {formErrors.first_name && (
                    <span className={styles.errorText}>
                      {formErrors.first_name}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Last Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.formInput} ${formErrors.last_name ? styles.formInputError : ""}`}
                    placeholder="Enter last name"
                    value={formData.last_name}
                    onChange={(e) =>
                      handleFormChange("last_name", e.target.value)
                    }
                  />
                  {formErrors.last_name && (
                    <span className={styles.errorText}>
                      {formErrors.last_name}
                    </span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={`${styles.formInput} ${formErrors.email ? styles.formInputError : ""}`}
                    placeholder="employee@example.com"
                    value={formData.email}
                    onChange={(e) => handleFormChange("email", e.target.value)}
                  />
                  {formErrors.email && (
                    <span className={styles.errorText}>{formErrors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="tel"
                    className={`${styles.formInput} ${formErrors.phone ? styles.formInputError : ""}`}
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={(e) => handleFormChange("phone", e.target.value)}
                  />
                  {formErrors.phone && (
                    <span className={styles.errorText}>{formErrors.phone}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Year of Joining <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    className={`${styles.formInput} ${formErrors.year_of_joining ? styles.formInputError : ""}`}
                    placeholder="2024"
                    value={formData.year_of_joining}
                    onChange={(e) =>
                      handleFormChange(
                        "year_of_joining",
                        parseInt(e.target.value) || new Date().getFullYear(),
                      )
                    }
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                  {formErrors.year_of_joining && (
                    <span className={styles.errorText}>
                      {formErrors.year_of_joining}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryButton}
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    first_name: "",
                    last_name: "",
                    year_of_joining: new Date().getFullYear(),
                    email: "",
                    phone: "",
                  });
                  setFormErrors({});
                }}
              >
                Cancel
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleSubmitEmployee}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Employee"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal - Show Credentials */}
      {showSuccessModal && newEmployeeCredentials && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div
              className={styles.modalHeader}
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  color: "white",
                }}
              >
                <CheckCircle size={28} />
                <h3 style={{ color: "white", margin: 0 }}>
                  Employee Created Successfully!
                </h3>
              </div>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.successContent}>
                <div className={styles.alertBox}>
                  <AlertCircle size={20} color="#f59e0b" />
                  <p className={styles.alertText}>
                    Please save these credentials securely. The temporary
                    password will not be shown again.
                  </p>
                </div>

                <div className={styles.credentialsContainer}>
                  <div className={styles.credentialItem}>
                    <label className={styles.credentialLabel}>Login ID</label>
                    <div className={styles.credentialValue}>
                      <code className={styles.credentialCode}>
                        {newEmployeeCredentials.login_id}
                      </code>
                      <button
                        className={styles.copyButton}
                        onClick={() =>
                          handleCopyToClipboard(
                            newEmployeeCredentials.login_id,
                            "Login ID",
                          )
                        }
                        title="Copy Login ID"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.credentialItem}>
                    <label className={styles.credentialLabel}>
                      Temporary Password
                    </label>
                    <div className={styles.credentialValue}>
                      <code className={styles.credentialCode}>
                        {newEmployeeCredentials.temporary_password}
                      </code>
                      <button
                        className={styles.copyButton}
                        onClick={() =>
                          handleCopyToClipboard(
                            newEmployeeCredentials.temporary_password,
                            "Temporary Password",
                          )
                        }
                        title="Copy Password"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.instructionsBox}>
                  <h4>Next Steps:</h4>
                  <ol>
                    <li>
                      Share these credentials securely with the new employee
                    </li>
                    <li>
                      Employee should log in and change their password
                      immediately
                    </li>
                    <li>
                      Employee will be prompted to verify their email address
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.primaryButton}
                onClick={handleCloseSuccessModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
