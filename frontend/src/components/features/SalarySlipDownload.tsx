import { useState } from "react";
import {
  Download,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
  Search,
} from "lucide-react";
import { Button, Card } from "../common";
import styles from "./SalarySlipDownload.module.css";

interface SalarySlip {
  id: string;
  month: string;
  year: number;
  grossSalary: number;
  netSalary: number;
  paymentDate: string;
  paymentStatus: "PAID" | "PENDING" | "PROCESSING";
  currency: string;
}

interface SalarySlipDownloadProps {
  employeeId?: string;
  employeeName?: string;
}

export const SalarySlipDownload = ({
  employeeId,
  employeeName,
}: SalarySlipDownloadProps) => {
  const [salarySlips, setSalarySlips] = useState<SalarySlip[]>([
    {
      id: "1",
      month: "January",
      year: 2024,
      grossSalary: 75000,
      netSalary: 67500,
      paymentDate: "2024-01-31",
      paymentStatus: "PAID",
      currency: "INR",
    },
    {
      id: "2",
      month: "December",
      year: 2023,
      grossSalary: 75000,
      netSalary: 67500,
      paymentDate: "2023-12-31",
      paymentStatus: "PAID",
      currency: "INR",
    },
    {
      id: "3",
      month: "November",
      year: 2023,
      grossSalary: 75000,
      netSalary: 67500,
      paymentDate: "2023-11-30",
      paymentStatus: "PAID",
      currency: "INR",
    },
    {
      id: "4",
      month: "October",
      year: 2023,
      grossSalary: 75000,
      netSalary: 67500,
      paymentDate: "2023-10-31",
      paymentStatus: "PAID",
      currency: "INR",
    },
  ]);

  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [previewing, setpreviewing] = useState<SalarySlip | null>(null);

  const years = [...new Set(salarySlips.map((slip) => slip.year))].sort(
    (a, b) => b - a
  );

  const filteredSlips = salarySlips.filter((slip) => slip.year === selectedYear);

  const formatCurrency = (amount: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className={`${styles.statusBadge} ${styles.paid}`}>
            <CheckCircle size={14} />
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className={`${styles.statusBadge} ${styles.pending}`}>
            <Clock size={14} />
            Pending
          </span>
        );
      case "PROCESSING":
        return (
          <span className={`${styles.statusBadge} ${styles.processing}`}>
            <Clock size={14} />
            Processing
          </span>
        );
      default:
        return null;
    }
  };

  const handleDownload = async (slip: SalarySlip) => {
    setDownloading(slip.id);

    try {
      // TODO: Replace with actual API call
      // const response = await downloadSalarySlip(slip.id);
      // const blob = await response.blob();
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `salary_slip_${slip.month}_${slip.year}.pdf`;
      // link.click();
      // window.URL.revokeObjectURL(url);

      // Simulate download
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert(
        `Download will be implemented when backend is ready.\nFile: Salary_Slip_${slip.month}_${slip.year}.pdf`
      );
    } catch (error) {
      console.error("Failed to download salary slip:", error);
    } finally {
      setDownloading(null);
    }
  };

  const handlePreview = (slip: SalarySlip) => {
    setpreviewing(slip);
  };

  const handleDownloadAll = async () => {
    try {
      // TODO: Replace with actual API call for bulk download
      alert(
        `Bulk download will be implemented when backend is ready.\nDownloading all slips for ${selectedYear}`
      );
    } catch (error) {
      console.error("Failed to download all slips:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Salary Slips</h2>
          <p className={styles.subtitle}>
            Download and view your monthly salary slips
          </p>
        </div>
      </div>

      {/* Summary Card */}
      <Card className={styles.summaryCard}>
        <div className={styles.summaryContent}>
          <div className={styles.summaryItem}>
            <div className={styles.summaryIcon}>
              <FileText size={24} color="#7c3aed" />
            </div>
            <div>
              <span className={styles.summaryLabel}>Total Slips</span>
              <span className={styles.summaryValue}>{salarySlips.length}</span>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryIcon}>
              <Calendar size={24} color="#059669" />
            </div>
            <div>
              <span className={styles.summaryLabel}>Latest Slip</span>
              <span className={styles.summaryValue}>
                {salarySlips[0]?.month} {salarySlips[0]?.year}
              </span>
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.summaryItem}>
            <div className={styles.summaryIcon}>
              <DollarSign size={24} color="#ea580c" />
            </div>
            <div>
              <span className={styles.summaryLabel}>Last Net Salary</span>
              <span className={styles.summaryValue}>
                {formatCurrency(salarySlips[0]?.netSalary || 0)}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters and Actions */}
      <div className={styles.filterBar}>
        <div className={styles.yearFilter}>
          <label className={styles.filterLabel}>Select Year:</label>
          <select
            className={styles.yearSelect}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="secondary"
          icon={<Download size={18} />}
          onClick={handleDownloadAll}
        >
          Download All ({selectedYear})
        </Button>
      </div>

      {/* Salary Slips Grid */}
      <div className={styles.slipsGrid}>
        {filteredSlips.length === 0 ? (
          <Card className={styles.emptyState}>
            <FileText size={48} color="#9ca3af" />
            <h3>No salary slips found</h3>
            <p>No salary slips available for {selectedYear}</p>
          </Card>
        ) : (
          filteredSlips.map((slip) => (
            <Card key={slip.id} className={styles.slipCard}>
              <div className={styles.slipHeader}>
                <div className={styles.slipIcon}>
                  <FileText size={28} color="#7c3aed" />
                </div>
                <div className={styles.slipTitle}>
                  <h3>
                    {slip.month} {slip.year}
                  </h3>
                  {getStatusBadge(slip.paymentStatus)}
                </div>
              </div>

              <div className={styles.slipDetails}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Gross Salary</span>
                  <span className={styles.detailValue}>
                    {formatCurrency(slip.grossSalary, slip.currency)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Net Salary</span>
                  <span className={`${styles.detailValue} ${styles.netSalary}`}>
                    {formatCurrency(slip.netSalary, slip.currency)}
                  </span>
                </div>

                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment Date</span>
                  <span className={styles.detailValue}>
                    {new Date(slip.paymentDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className={styles.slipActions}>
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Eye size={16} />}
                  onClick={() => handlePreview(slip)}
                  fullWidth
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  icon={<Download size={16} />}
                  onClick={() => handleDownload(slip)}
                  isLoading={downloading === slip.id}
                  fullWidth
                >
                  Download
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Preview Modal */}
      {previewing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                Salary Slip Preview - {previewing.month} {previewing.year}
              </h3>
              <button
                className={styles.closeButton}
                onClick={() => setpreviewing(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.previewPlaceholder}>
                <FileText size={64} color="#7c3aed" />
                <h4>Salary Slip Preview</h4>
                <p>Preview functionality will be implemented when backend is ready</p>

                <div className={styles.previewDetails}>
                  <div className={styles.previewRow}>
                    <span>Period:</span>
                    <strong>
                      {previewing.month} {previewing.year}
                    </strong>
                  </div>
                  <div className={styles.previewRow}>
                    <span>Gross Salary:</span>
                    <strong>
                      {formatCurrency(previewing.grossSalary, previewing.currency)}
                    </strong>
                  </div>
                  <div className={styles.previewRow}>
                    <span>Net Salary:</span>
                    <strong>
                      {formatCurrency(previewing.netSalary, previewing.currency)}
                    </strong>
                  </div>
                  <div className={styles.previewRow}>
                    <span>Payment Date:</span>
                    <strong>
                      {new Date(previewing.paymentDate).toLocaleDateString()}
                    </strong>
                  </div>
                  <div className={styles.previewRow}>
                    <span>Status:</span>
                    {getStatusBadge(previewing.paymentStatus)}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => setpreviewing(null)}
              >
                Close
              </Button>
              <Button
                icon={<Download size={18} />}
                onClick={() => {
                  handleDownload(previewing);
                  setPreview(null);
                }}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div>
          <p className={styles.infoTitle}>About Salary Slips</p>
          <ul className={styles.infoList}>
            <li>Salary slips are generated on the last day of each month</li>
            <li>Download slips in PDF format for your records</li>
            <li>Contact HR if you notice any discrepancies</li>
            <li>Keep slips for tax filing and loan applications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
