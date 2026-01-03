import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Users,
  TrendingUp,
  Download,
  Filter,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
} from "lucide-react";
import {
  getAllPayrollRecords,
  getPayrollSummary,
  getSalaryBreakdown,
  processPayroll,
  markAsPaid,
  getCurrentMonth,
  getCurrentYear,
  getAvailableMonths,
  getAvailableYears,
  PayrollRecord,
  PayrollSummary,
  SalaryBreakdown,
} from "../api/mockPayroll";
import styles from "./AdminPayroll.module.css";

const AdminPayroll: React.FC = () => {
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(
    null,
  );
  const [breakdown, setBreakdown] = useState<SalaryBreakdown | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState<string>(getCurrentMonth());
  const [yearFilter, setYearFilter] = useState<number>(getCurrentYear());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);

  useEffect(() => {
    loadPayrollData();
    loadSummary();
  }, [monthFilter, yearFilter, statusFilter]);

  const loadPayrollData = async () => {
    setIsLoading(true);
    try {
      const records = await getAllPayrollRecords(
        monthFilter,
        yearFilter,
        statusFilter === "all" ? undefined : statusFilter,
      );
      setPayrollRecords(records);
    } catch (error) {
      console.error("Error loading payroll data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const summaryData = await getPayrollSummary();
      setSummary(summaryData);
    } catch (error) {
      console.error("Error loading summary:", error);
    }
  };

  const handleViewBreakdown = async (record: PayrollRecord) => {
    setSelectedRecord(record);
    try {
      const breakdownData = await getSalaryBreakdown(record.id);
      setBreakdown(breakdownData);
      setShowBreakdownModal(true);
    } catch (error) {
      console.error("Error loading breakdown:", error);
    }
  };

  const handleProcessPayroll = async (payrollId: string) => {
    try {
      await processPayroll(payrollId);
      await loadPayrollData();
    } catch (error) {
      console.error("Error processing payroll:", error);
    }
  };

  const handleMarkAsPaid = async (payrollId: string) => {
    try {
      await markAsPaid(payrollId);
      await loadPayrollData();
      await loadSummary();
    } catch (error) {
      console.error("Error marking as paid:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return styles.statusPaid;
      case "PROCESSED":
        return styles.statusProcessed;
      case "PENDING":
        return styles.statusPending;
      default:
        return "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Payroll Management</h2>
        <div className={styles.actions}>
          <button className={styles.exportButton}>
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Total Employees</div>
              <div className={styles.statValue}>{summary.totalEmployees}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}
            >
              <DollarSign size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Total Salary Paid</div>
              <div className={styles.statValue}>
                {formatCurrency(summary.totalSalaryPaid)}
              </div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "linear-gradient(135deg, #92400e 0%, #b45309 100%)" }}
            >
              <Clock size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Pending Payments</div>
              <div className={styles.statValue}>{summary.pendingPayments}</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div
              className={styles.statIcon}
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)" }}
            >
              <TrendingUp size={24} />
            </div>
            <div className={styles.statContent}>
              <div className={styles.statLabel}>Average Salary</div>
              <div className={styles.statValue}>
                {formatCurrency(summary.averageSalary)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <Filter size={18} />
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className={styles.filterSelect}
          >
            {getAvailableMonths().map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <Calendar size={18} />
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            className={styles.filterSelect}
          >
            {getAvailableYears().map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSED">Processed</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingState}>Loading payroll data...</div>
        ) : payrollRecords.length === 0 ? (
          <div className={styles.emptyState}>
            <DollarSign size={48} />
            <p>No payroll records found</p>
          </div>
        ) : (
          <table className={styles.payrollTable}>
            <thead>
              <tr>
                <th>Payroll ID</th>
                <th>Employee</th>
                <th>Employee ID</th>
                <th>Month</th>
                <th>Base Salary</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrollRecords.map((record) => (
                <tr key={record.id}>
                  <td className={styles.idCell}>{record.id}</td>
                  <td className={styles.nameCell}>{record.employeeName}</td>
                  <td>{record.employeeId}</td>
                  <td>
                    {record.month} {record.year}
                  </td>
                  <td className={styles.amountCell}>
                    {formatCurrency(record.baseSalary)}
                  </td>
                  <td className={styles.amountCell}>
                    {formatCurrency(record.allowances)}
                  </td>
                  <td className={styles.amountCell}>
                    {formatCurrency(record.deductions)}
                  </td>
                  <td className={styles.netSalaryCell}>
                    {formatCurrency(record.netSalary)}
                  </td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${getStatusColor(record.status)}`}
                    >
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.viewButton}
                        onClick={() => handleViewBreakdown(record)}
                        title="View Breakdown"
                      >
                        <Eye size={16} />
                      </button>
                      {record.status === "PENDING" && (
                        <button
                          className={styles.processButton}
                          onClick={() => handleProcessPayroll(record.id)}
                          title="Process"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      {record.status === "PROCESSED" && (
                        <button
                          className={styles.payButton}
                          onClick={() => handleMarkAsPaid(record.id)}
                          title="Mark as Paid"
                        >
                          <DollarSign size={16} />
                        </button>
                      )}
                      <button
                        className={styles.downloadButton}
                        title="Download Payslip"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Breakdown Modal */}
      {showBreakdownModal && selectedRecord && breakdown && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowBreakdownModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Salary Breakdown - {selectedRecord.employeeName}</h3>
              <button
                className={styles.modalClose}
                onClick={() => setShowBreakdownModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.breakdownSection}>
                <h4 className={styles.breakdownTitle}>Earnings</h4>
                <div className={styles.breakdownGrid}>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Base Salary</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.baseSalary)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>HRA (40%)</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.hra)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Transport</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.transport)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Medical</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.medical)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Bonus</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.bonus)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Overtime</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.overtime)}
                    </span>
                  </div>
                </div>
                <div className={styles.breakdownTotal}>
                  <span className={styles.breakdownLabel}>Total Earnings</span>
                  <span className={styles.breakdownTotalValue}>
                    {formatCurrency(breakdown.totalEarnings)}
                  </span>
                </div>
              </div>

              <div className={styles.breakdownSection}>
                <h4 className={styles.breakdownTitle}>Deductions</h4>
                <div className={styles.breakdownGrid}>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Income Tax</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.tax)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>
                      Provident Fund (12%)
                    </span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.providentFund)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Insurance</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.insurance)}
                    </span>
                  </div>
                  <div className={styles.breakdownItem}>
                    <span className={styles.breakdownLabel}>Other</span>
                    <span className={styles.breakdownValue}>
                      {formatCurrency(breakdown.otherDeductions)}
                    </span>
                  </div>
                </div>
                <div className={styles.breakdownTotal}>
                  <span className={styles.breakdownLabel}>
                    Total Deductions
                  </span>
                  <span className={styles.breakdownTotalValue}>
                    {formatCurrency(breakdown.totalDeductions)}
                  </span>
                </div>
              </div>

              <div className={styles.netSalarySection}>
                <span className={styles.netSalaryLabel}>Net Salary</span>
                <span className={styles.netSalaryValue}>
                  {formatCurrency(breakdown.netSalary)}
                </span>
              </div>

              <div className={styles.additionalInfo}>
                <div className={styles.infoRow}>
                  <span>Working Days:</span>
                  <span>{selectedRecord.workingDays}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Present Days:</span>
                  <span>{selectedRecord.presentDays}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Leaves Taken:</span>
                  <span>{selectedRecord.leaves}</span>
                </div>
                <div className={styles.infoRow}>
                  <span>Overtime Hours:</span>
                  <span>{selectedRecord.overtimeHours} hrs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayroll;
