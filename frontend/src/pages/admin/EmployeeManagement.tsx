import { useState } from "react";
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  MoreVertical,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Building2,
  Calendar,
  X,
  CheckCircle,
  Copy,
  AlertCircle,
} from "lucide-react";
import { Button, Card, Input } from "../../components/common";
import {
  Employee,
  EmploymentStatus,
  UserRole,
  CreateEmployeeData,
  CreateEmployeeResponse,
} from "../../types";
import * as employeeService from "../../services/employeeService";
import styles from "./EmployeeManagement.module.css";

export const EmployeeManagement = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      employeeId: "OIJODO20220001",
      loginId: "OIJODO20220001",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
      email: "john.doe@company.com",
      phone: "+91 98765 43210",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      role: UserRole.EMPLOYEE,
      jobTitle: "Senior Developer",
      department: "Engineering",
      location: "Mumbai",
      dateOfJoining: "2022-01-15",
      yearOfJoining: 2022,
      serialNumber: 1,
      employmentStatus: EmploymentStatus.ACTIVE,
      companyCode: "OI",
    },
    {
      id: "2",
      employeeId: "OIJASM20220002",
      loginId: "OIJASM20220002",
      firstName: "Jane",
      lastName: "Smith",
      fullName: "Jane Smith",
      email: "jane.smith@company.com",
      phone: "+91 98765 43211",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      role: UserRole.EMPLOYEE,
      jobTitle: "UI/UX Designer",
      department: "Design",
      location: "Bangalore",
      dateOfJoining: "2022-02-20",
      yearOfJoining: 2022,
      serialNumber: 2,
      employmentStatus: EmploymentStatus.ACTIVE,
      companyCode: "OI",
    },
    {
      id: "3",
      employeeId: "OIBRJO20220003",
      loginId: "OIBRJO20220003",
      firstName: "Bob",
      lastName: "Johnson",
      fullName: "Bob Johnson",
      email: "bob.johnson@company.com",
      phone: "+91 98765 43212",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      role: UserRole.EMPLOYEE,
      jobTitle: "Product Manager",
      department: "Product",
      location: "Delhi",
      dateOfJoining: "2022-03-10",
      yearOfJoining: 2022,
      serialNumber: 3,
      employmentStatus: EmploymentStatus.ON_LEAVE,
      companyCode: "OI",
    },
  ]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
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

  const departments = [
    "ALL",
    "Engineering",
    "Design",
    "Product",
    "HR",
    "Finance",
  ];
  const statuses = ["ALL", "ACTIVE", "INACTIVE", "ON_LEAVE"];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      searchQuery === "" ||
      employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "ALL" || employee.department === filterDepartment;

    const matchesStatus =
      filterStatus === "ALL" || employee.employmentStatus === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const stats = {
    total: employees.length,
    active: employees.filter(
      (e) => e.employmentStatus === EmploymentStatus.ACTIVE,
    ).length,
    onLeave: employees.filter(
      (e) => e.employmentStatus === EmploymentStatus.ON_LEAVE,
    ).length,
    inactive: employees.filter(
      (e) => e.employmentStatus === EmploymentStatus.INACTIVE,
    ).length,
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
    // Clear error for this field
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
      // Optionally reload employee list here
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

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowEditModal(true);
    setShowActionMenu(null);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      // TODO: Replace with actual API call
      // await deleteEmployee(employeeId);

      setEmployees(employees.filter((e) => e.id !== employeeId));
      setShowActionMenu(null);
    } catch (error) {
      console.error("Failed to delete employee:", error);
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    const newStatus =
      employee.employmentStatus === EmploymentStatus.ACTIVE
        ? EmploymentStatus.INACTIVE
        : EmploymentStatus.ACTIVE;

    try {
      // TODO: Replace with actual API call
      // await updateEmployeeStatus(employee.id, newStatus);

      setEmployees(
        employees.map((e) =>
          e.id === employee.id ? { ...e, employmentStatus: newStatus } : e,
        ),
      );
      setShowActionMenu(null);
    } catch (error) {
      console.error("Failed to update employee status:", error);
    }
  };

  const getStatusBadge = (status: EmploymentStatus) => {
    switch (status) {
      case EmploymentStatus.ACTIVE:
        return (
          <span className={`${styles.statusBadge} ${styles.active}`}>
            <UserCheck size={14} />
            Active
          </span>
        );
      case EmploymentStatus.INACTIVE:
        return (
          <span className={`${styles.statusBadge} ${styles.inactive}`}>
            <UserX size={14} />
            Inactive
          </span>
        );
      case EmploymentStatus.ON_LEAVE:
        return (
          <span className={`${styles.statusBadge} ${styles.onLeave}`}>
            <Calendar size={14} />
            On Leave
          </span>
        );
    }
  };

  const handleExport = () => {
    // TODO: Implement CSV/Excel export
    alert("Export functionality will be implemented when backend is ready");
  };

  const handleBulkImport = () => {
    // TODO: Implement bulk import
    alert(
      "Bulk import functionality will be implemented when backend is ready",
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Employee Management</h1>
          <p className={styles.subtitle}>
            Manage employee records, roles, and status
          </p>
        </div>
        <div className={styles.headerActions}>
          <Button
            variant="secondary"
            icon={<Upload size={18} />}
            onClick={handleBulkImport}
          >
            Import
          </Button>
          <Button
            variant="secondary"
            icon={<Download size={18} />}
            onClick={handleExport}
          >
            Export
          </Button>
          <Button icon={<Plus size={18} />} onClick={handleAddEmployee}>
            Add Employee
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Employees</span>
          </div>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#ede9fe" }}
          >
            <Building2 size={24} color="#7c3aed" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#d1fae5" }}
          >
            <UserCheck size={24} color="#059669" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.onLeave}</span>
            <span className={styles.statLabel}>On Leave</span>
          </div>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#fef3c7" }}
          >
            <Calendar size={24} color="#f59e0b" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.inactive}</span>
            <span className={styles.statLabel}>Inactive</span>
          </div>
          <div
            className={styles.statIcon}
            style={{ backgroundColor: "#fee2e2" }}
          >
            <UserX size={24} color="#dc2626" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className={styles.filtersCard}>
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <Filter size={18} />
            <select
              className={styles.filterSelect}
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === "ALL" ? "All Departments" : dept}
                </option>
              ))}
            </select>

            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Status" : status.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Employee Table */}
      <Card className={styles.tableCard}>
        {filteredEmployees.length === 0 ? (
          <div className={styles.emptyState}>
            <Building2 size={48} color="#9ca3af" />
            <h3>No employees found</h3>
            <p>Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Location</th>
                  <th>Joined Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td>
                      <div className={styles.employeeCell}>
                        <img
                          src={employee.avatar}
                          alt={employee.fullName}
                          className={styles.avatar}
                        />
                        <div>
                          <div className={styles.employeeName}>
                            {employee.fullName}
                          </div>
                          <div className={styles.employeeEmail}>
                            {employee.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.employeeId}>{employee.employeeId}</td>
                    <td>{employee.department}</td>
                    <td>{employee.jobTitle}</td>
                    <td>{employee.location}</td>
                    <td>
                      {new Date(employee.dateOfJoining).toLocaleDateString()}
                    </td>
                    <td>{getStatusBadge(employee.employmentStatus)}</td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionButton}
                          onClick={() =>
                            setShowActionMenu(
                              showActionMenu === employee.id
                                ? null
                                : employee.id,
                            )
                          }
                        >
                          <MoreVertical size={18} />
                        </button>

                        {showActionMenu === employee.id && (
                          <div className={styles.actionMenu}>
                            <button
                              className={styles.menuItem}
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Eye size={16} />
                              View Details
                            </button>
                            <button
                              className={styles.menuItem}
                              onClick={() => handleEditEmployee(employee)}
                            >
                              <Edit size={16} />
                              Edit
                            </button>
                            <button
                              className={styles.menuItem}
                              onClick={() => handleToggleStatus(employee)}
                            >
                              {employee.employmentStatus ===
                              EmploymentStatus.ACTIVE ? (
                                <>
                                  <UserX size={16} />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <UserCheck size={16} />
                                  Activate
                                </>
                              )}
                            </button>
                            <button
                              className={`${styles.menuItem} ${styles.danger}`}
                              onClick={() => handleDeleteEmployee(employee.id)}
                            >
                              <Trash2 size={16} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

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
              <Button
                variant="secondary"
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
              </Button>
              <Button onClick={handleSubmitEmployee} disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Employee"}
              </Button>
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
              <Button onClick={handleCloseSuccessModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
