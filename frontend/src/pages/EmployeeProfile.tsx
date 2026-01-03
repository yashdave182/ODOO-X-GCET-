import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  DollarSign,
  Shield,
  Edit,
  Save,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Employee, UserRole, SalaryStructure, WageType } from "../types";
import * as employeeService from "../services/employeeService";
import styles from "./EmployeeProfile.module.css";

type TabType = "personal" | "salary" | "security";

const EmployeeProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<Employee | null>(null);

  // Salary structure state
  const [salaryStructure] = useState<SalaryStructure>({
    basicSalary: 50000,
    currency: "INR",
    wageType: WageType.FIXED,
    workingDays: 22,
    earnings: [
      {
        id: "1",
        name: "House Rent Allowance (HRA)",
        amount: 20000,
        type: "EARNING",
        isPercentage: true,
        percentage: 40,
      },
      {
        id: "2",
        name: "Medical Allowance",
        amount: 1250,
        type: "EARNING",
        isPercentage: false,
      },
      {
        id: "3",
        name: "Conveyance",
        amount: 1600,
        type: "EARNING",
        isPercentage: false,
      },
      {
        id: "4",
        name: "Internet Allowance",
        amount: 1500,
        type: "EARNING",
        isPercentage: false,
      },
      {
        id: "5",
        name: "Performance Bonus",
        amount: 5000,
        type: "EARNING",
        isPercentage: false,
      },
      {
        id: "6",
        name: "Leave Travel Allowance",
        amount: 3750,
        type: "EARNING",
        isPercentage: false,
      },
    ],
    deductions: [
      {
        id: "d1",
        name: "Provident Fund (PF) Contribution",
        amount: 6000,
        type: "DEDUCTION",
        isPercentage: true,
        percentage: 12,
      },
      {
        id: "d2",
        name: "Professional Tax",
        amount: 200,
        type: "DEDUCTION",
        isPercentage: false,
      },
    ],
    grossSalary: 83100,
    netSalary: 76900,
  });

  useEffect(() => {
    loadEmployee();
  }, [id]);

  const loadEmployee = async () => {
    if (!id || id === "new") {
      // Create a blank employee template for new employee
      const newEmployee: Employee = {
        id: "new",
        employeeId: "",
        loginId: "",
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        phone: "",
        role: UserRole.EMPLOYEE,
        jobTitle: "",
        department: "",
        location: "",
        dateOfJoining: new Date().toISOString().split("T")[0],
        yearOfJoining: new Date().getFullYear(),
        serialNumber: 0,
        employmentStatus: "ACTIVE" as any,
        companyCode: user?.companyCode || "OI",
      };
      setEmployee(newEmployee);
      setEditedEmployee(newEmployee);
      setIsEditing(true); // Auto-enable editing mode for new employee
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const allEmployees = await employeeService.getAllEmployees();
      const emp = allEmployees.find((e) => e.id === id);
      setEmployee(emp || null);
      setEditedEmployee(emp || null);
    } catch (error) {
      console.error("Error loading employee:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    // Navigate based on user role
    if (user?.role === UserRole.EMPLOYEE) {
      navigate("/employee/dashboard");
    } else {
      navigate("/admin/dashboard");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedEmployee(employee);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee(employee);
  };

  const handleSave = async () => {
    if (!editedEmployee) return;

    try {
      if (id === "new") {
        // TODO: Call API to create new employee
        // await employeeService.createEmployee(editedEmployee);
        alert("New employee created successfully! (API integration pending)");
        // Navigate based on user role
        if (user?.role === UserRole.EMPLOYEE) {
          navigate("/employee/dashboard");
        } else {
          navigate("/admin/dashboard");
        }
      } else {
        // TODO: Call API to update employee
        // await employeeService.updateEmployee(id, editedEmployee);
        setEmployee(editedEmployee);
        setIsEditing(false);
        alert("Employee information updated successfully!");
      }
    } catch (error) {
      console.error("Error saving employee:", error);
      alert("Failed to save employee information.");
    }
  };

  const handleInputChange = (field: keyof Employee, value: any) => {
    if (!editedEmployee) return;
    setEditedEmployee({
      ...editedEmployee,
      [field]: value,
    });
  };

  const calculateGrossSalary = () => {
    const basicSalary = salaryStructure.basicSalary;
    let totalEarnings = basicSalary;

    salaryStructure.earnings.forEach((earning) => {
      if (earning.isPercentage && earning.percentage) {
        totalEarnings += (basicSalary * earning.percentage) / 100;
      } else {
        totalEarnings += earning.amount;
      }
    });

    return totalEarnings;
  };

  const calculateDeductions = () => {
    const basicSalary = salaryStructure.basicSalary;
    let totalDeductions = 0;

    salaryStructure.deductions.forEach((deduction) => {
      if (deduction.isPercentage && deduction.percentage) {
        totalDeductions += (basicSalary * deduction.percentage) / 100;
      } else {
        totalDeductions += deduction.amount;
      }
    });

    return totalDeductions;
  };

  const calculateNetSalary = () => {
    return calculateGrossSalary() - calculateDeductions();
  };

  const isAdmin = user?.role === UserRole.ADMIN || user?.role === UserRole.HR;
  const isOwnProfile = user?.id === employee?.id;
  const canEdit = isAdmin || isOwnProfile;

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading employee information...</p>
      </div>
    );
  }

  if (!employee && id !== "new") {
    return (
      <div className={styles.errorContainer}>
        <p>Employee not found</p>
        <button className={styles.backButton} onClick={handleBack}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const displayEmployee = isEditing ? editedEmployee : employee;

  const renderPersonalInfoTab = () => {
    return (
      <div className={styles.tabContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>
                <User size={16} />
                Full Name
              </label>
              {isEditing ? (
                <div className={styles.nameInputs}>
                  <input
                    type="text"
                    value={displayEmployee?.firstName || ""}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    placeholder="First Name"
                    className={styles.input}
                  />
                  <input
                    type="text"
                    value={displayEmployee?.lastName || ""}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    placeholder="Last Name"
                    className={styles.input}
                  />
                </div>
              ) : (
                <p>{displayEmployee?.fullName}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <Mail size={16} />
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={displayEmployee?.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.email}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <Phone size={16} />
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={displayEmployee?.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.phone || "N/A"}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Login ID</label>
              <p>{displayEmployee?.loginId}</p>
            </div>

            <div className={styles.infoItem}>
              <label>
                <Calendar size={16} />
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={displayEmployee?.dateOfBirth || ""}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>
                  {displayEmployee?.dateOfBirth
                    ? new Date(displayEmployee.dateOfBirth).toLocaleDateString()
                    : "N/A"}
                </p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Gender</label>
              {isEditing ? (
                <select
                  value={displayEmployee?.gender || ""}
                  onChange={(e) => handleInputChange("gender", e.target.value)}
                  className={styles.select}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <p>{displayEmployee?.gender || "N/A"}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Marital Status</label>
              {isEditing ? (
                <select
                  value={displayEmployee?.maritalStatus || ""}
                  onChange={(e) =>
                    handleInputChange("maritalStatus", e.target.value)
                  }
                  className={styles.select}
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              ) : (
                <p>{displayEmployee?.maritalStatus || "N/A"}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Nationality</label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayEmployee?.nationality || ""}
                  onChange={(e) =>
                    handleInputChange("nationality", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.nationality || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Work Information</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>
                <Briefcase size={16} />
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayEmployee?.jobTitle || ""}
                  onChange={(e) =>
                    handleInputChange("jobTitle", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.jobTitle}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <Users size={16} />
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayEmployee?.department || ""}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.department}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>
                <MapPin size={16} />
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayEmployee?.location || ""}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.location || "N/A"}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Manager</label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayEmployee?.manager || ""}
                  onChange={(e) => handleInputChange("manager", e.target.value)}
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.manager || "N/A"}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Date of Joining</label>
              {isEditing ? (
                <input
                  type="date"
                  value={displayEmployee?.dateOfJoining || ""}
                  onChange={(e) =>
                    handleInputChange("dateOfJoining", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>
                  {displayEmployee?.dateOfJoining
                    ? new Date(
                        displayEmployee.dateOfJoining,
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Employment Status</label>
              {isEditing ? (
                <select
                  value={displayEmployee?.employmentStatus || ""}
                  onChange={(e) =>
                    handleInputChange("employmentStatus", e.target.value)
                  }
                  className={styles.select}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON_LEAVE">On Leave</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              ) : (
                <p className={styles.statusBadge}>
                  {displayEmployee?.employmentStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Emergency Contact</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Contact Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={displayEmployee?.emergencyContactName || ""}
                  onChange={(e) =>
                    handleInputChange("emergencyContactName", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.emergencyContactName || "N/A"}</p>
              )}
            </div>

            <div className={styles.infoItem}>
              <label>Contact Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={displayEmployee?.emergencyContactPhone || ""}
                  onChange={(e) =>
                    handleInputChange("emergencyContactPhone", e.target.value)
                  }
                  className={styles.input}
                />
              ) : (
                <p>{displayEmployee?.emergencyContactPhone || "N/A"}</p>
              )}
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Address</h3>
          <div className={styles.infoItem}>
            <label>Permanent Address</label>
            {isEditing ? (
              <textarea
                value={displayEmployee?.permanentAddress || ""}
                onChange={(e) =>
                  handleInputChange("permanentAddress", e.target.value)
                }
                className={styles.textarea}
                rows={3}
              />
            ) : (
              <p>{displayEmployee?.permanentAddress || "N/A"}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSalaryInfoTab = () => {
    if (!isAdmin) {
      return (
        <div className={styles.tabContent}>
          <div className={styles.restrictedAccess}>
            <Shield size={48} />
            <h3>Restricted Access</h3>
            <p>Only administrators can view salary information.</p>
          </div>
        </div>
      );
    }

    const grossSalary = calculateGrossSalary();
    const netSalary = calculateNetSalary();

    return (
      <div className={styles.tabContent}>
        <div className={styles.salaryDetails}>
          <div className={styles.salaryHeader}>
            <h3>Salary Structure</h3>
            <div className={styles.wageTypeSelector}>
              <label>Wage Type:</label>
              <select
                value={salaryStructure.wageType}
                className={styles.select}
              >
                <option value="FIXED">Fixed</option>
                <option value="HOURLY">Hourly</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>
          </div>

          <div className={styles.salaryTable}>
            <div className={styles.salaryRow}>
              <span className={styles.salaryLabel}>Basic Salary</span>
              <span className={styles.salaryAmount}>
                ₹{salaryStructure.basicSalary.toLocaleString()}/month
              </span>
            </div>

            <div className={styles.salarySection}>
              <h4>Salary Components (Earnings)</h4>
              {salaryStructure.earnings.map((earning) => (
                <div key={earning.id} className={styles.salaryRow}>
                  <span className={styles.salaryLabel}>
                    {earning.name}
                    {earning.isPercentage && (
                      <span className={styles.percentage}>
                        ({earning.percentage}% of Basic)
                      </span>
                    )}
                  </span>
                  <span className={styles.salaryAmount}>
                    ₹
                    {earning.isPercentage
                      ? (
                          (salaryStructure.basicSalary *
                            (earning.percentage || 0)) /
                          100
                        ).toLocaleString()
                      : earning.amount.toLocaleString()}
                    /month
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.salarySection}>
              <h4>Other Allowances</h4>
              <div className={styles.salaryRow}>
                <span className={styles.salaryLabel}>Standard Allowance</span>
                <span className={styles.salaryAmount}>₹0/month</span>
              </div>
            </div>

            <div className={styles.salaryRow + " " + styles.totalRow}>
              <span className={styles.salaryLabel}>Gross Salary</span>
              <span className={styles.salaryAmount}>
                ₹{grossSalary.toLocaleString()}/month
              </span>
            </div>

            <div className={styles.salarySection}>
              <h4>Tax Deductions</h4>
              {salaryStructure.deductions.map((deduction) => (
                <div key={deduction.id} className={styles.salaryRow}>
                  <span className={styles.salaryLabel}>
                    {deduction.name}
                    {deduction.isPercentage && (
                      <span className={styles.percentage}>
                        ({deduction.percentage}% of Basic)
                      </span>
                    )}
                  </span>
                  <span className={styles.salaryAmountNegative}>
                    -₹
                    {deduction.isPercentage
                      ? (
                          (salaryStructure.basicSalary *
                            (deduction.percentage || 0)) /
                          100
                        ).toLocaleString()
                      : deduction.amount.toLocaleString()}
                    /month
                  </span>
                </div>
              ))}
            </div>

            <div className={styles.salaryRow + " " + styles.totalRow}>
              <span className={styles.salaryLabel}>Net Salary</span>
              <span className={styles.salaryAmountTotal}>
                ₹{netSalary.toLocaleString()}/month
              </span>
            </div>

            <div className={styles.workingDaysRow}>
              <span className={styles.salaryLabel}>
                Number of working days in a week:{" "}
                <strong>{salaryStructure.workingDays}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSecurityTab = () => {
    return (
      <div className={styles.tabContent}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Login Credentials</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Login ID</label>
              <p>{employee.loginId}</p>
            </div>

            <div className={styles.infoItem}>
              <label>Email</label>
              <p>{employee.email}</p>
            </div>

            <div className={styles.infoItem}>
              <label>Role</label>
              <p className={styles.roleBadge}>{employee.role}</p>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Password Management</h3>
          <div className={styles.passwordSection}>
            <p>Last password change: Never</p>
            <button className={styles.secondaryButton}>
              <Shield size={16} />
              Reset Password
            </button>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Account Status</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <label>Account Status</label>
              <p className={styles.activeBadge}>Active</p>
            </div>

            <div className={styles.infoItem}>
              <label>Created Date</label>
              <p>{new Date(employee.dateOfJoining).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {isAdmin && (
          <div className={styles.dangerZone}>
            <h3 className={styles.sectionTitle}>Danger Zone</h3>
            <div className={styles.dangerActions}>
              <button className={styles.dangerButton}>
                Deactivate Account
              </button>
              <button className={styles.dangerButton}>Delete Account</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft size={20} />
          Back
        </button>
        <div className={styles.headerActions}>
          {canEdit && !isEditing && (
            <button className={styles.editButton} onClick={handleEdit}>
              <Edit size={18} />
              Edit
            </button>
          )}
          {isEditing && (
            <>
              <button className={styles.cancelButton} onClick={handleCancel}>
                <X size={18} />
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSave}>
                <Save size={18} />
                {id === "new" ? "Create Employee" : "Save Changes"}
              </button>
            </>
          )}
        </div>
      </header>

      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          {employee.avatar ? (
            <img src={employee.avatar} alt={employee.fullName} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {employee.fullName.charAt(0)}
            </div>
          )}
        </div>
        <div className={styles.profileInfo}>
          <h2>{id === "new" ? "New Employee" : employee.fullName}</h2>
          <p className={styles.jobTitle}>
            {id === "new" ? "Add employee details below" : employee.jobTitle}
          </p>
          <div className={styles.profileMeta}>
            <span>
              <Mail size={16} />
              {employee.email}
            </span>
            <span>
              <Phone size={16} />
              {employee.phone || "N/A"}
            </span>
            <span>
              <MapPin size={16} />
              {employee.location || "N/A"}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "personal" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("personal")}
        >
          <User size={18} />
          Personal Info
        </button>
        <button
          className={`${styles.tab} ${activeTab === "salary" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("salary")}
        >
          <DollarSign size={18} />
          Salary Info
        </button>
        <button
          className={`${styles.tab} ${activeTab === "security" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("security")}
        >
          <Shield size={18} />
          Security
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === "personal" && renderPersonalInfoTab()}
        {activeTab === "salary" && renderSalaryInfoTab()}
        {activeTab === "security" && renderSecurityTab()}
      </div>
    </div>
  );
};

export default EmployeeProfile;
