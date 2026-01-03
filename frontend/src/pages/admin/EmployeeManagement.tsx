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
} from "lucide-react";
import { Button, Card, Input } from "../../components/common";
import { Employee, EmploymentStatus, UserRole } from "../../types";
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
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);

  const departments = ["ALL", "Engineering", "Design", "Product", "HR", "Finance"];
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
    active: employees.filter((e) => e.employmentStatus === EmploymentStatus.ACTIVE).length,
    onLeave: employees.filter((e) => e.employmentStatus === EmploymentStatus.ON_LEAVE).length,
    inactive: employees.filter((e) => e.employmentStatus === EmploymentStatus.INACTIVE).length,
  };

  const handleAddEmployee = () => {
    setShowAddModal(true);
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
          e.id === employee.id ? { ...e, employmentStatus: newStatus } : e
        )
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
    alert("Bulk import functionality will be implemented when backend is ready");
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
          <Button variant="secondary" icon={<Upload size={18} />} onClick={handleBulkImport}>
            Import
          </Button>
          <Button variant="secondary" icon={<Download size={18} />} onClick={handleExport}>
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
          <div className={styles.statIcon} style={{ backgroundColor: "#ede9fe" }}>
            <Building2 size={24} color="#7c3aed" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.active}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#d1fae5" }}>
            <UserCheck size={24} color="#059669" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.onLeave}</span>
            <span className={styles.statLabel}>On Leave</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#fef3c7" }}>
            <Calendar size={24} color="#f59e0b" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.inactive}</span>
            <span className={styles.statLabel}>Inactive</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#fee2e2" }}>
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
                              showActionMenu === employee.id ? null : employee.id
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
                              {employee.employmentStatus === EmploymentStatus.ACTIVE ? (
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

      {/* Add/Edit Modal Placeholder */}
      {(showAddModal || showEditModal) && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>{showAddModal ? "Add New Employee" : "Edit Employee"}</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedEmployee(null);
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formPlaceholder}>
                <CheckCircle size={48} color="#7c3aed" />
                <h4>Employee Form</h4>
                <p>
                  Complete employee form with all fields will be implemented here.
                </p>
                <div className={styles.formFields}>
                  <p><strong>Fields to include:</strong></p>
                  <ul>
                    <li>Personal Information (Name, Email, Phone, DOB)</li>
                    <li>Employment Details (Job Title, Department, Location)</li>
                    <li>Work Information (Join Date, Manager, Role)</li>
                    <li>Bank Details</li>
                    <li>Emergency Contact</li>
                    <li>Profile Picture Upload</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedEmployee(null);
                }}
              >
                Cancel
              </Button>
              <Button>
                {showAddModal ? "Add Employee" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
