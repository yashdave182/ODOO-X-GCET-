import { Calendar, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { Card } from "../common";
import styles from "./LeaveBalance.module.css";

interface LeaveBalanceProps {
  paidLeave: number;
  sickLeave: number;
  unpaidLeave?: number;
  vacationLeave?: number;
  totalLeavesUsed?: number;
  totalLeavesAvailable?: number;
  showDetails?: boolean;
}

interface LeaveTypeCard {
  type: string;
  balance: number;
  total: number;
  color: string;
  icon: string;
  description: string;
}

export const LeaveBalance = ({
  paidLeave = 12,
  sickLeave = 7,
  unpaidLeave = 0,
  vacationLeave = 5,
  totalLeavesUsed = 8,
  totalLeavesAvailable = 24,
  showDetails = true,
}: LeaveBalanceProps) => {
  const leaveTypes: LeaveTypeCard[] = [
    {
      type: "Paid Leave",
      balance: paidLeave,
      total: 12,
      color: "#7c3aed",
      icon: "💼",
      description: "Regular paid time off",
    },
    {
      type: "Sick Leave",
      balance: sickLeave,
      total: 10,
      color: "#059669",
      icon: "🏥",
      description: "Medical leave days",
    },
    {
      type: "Vacation Leave",
      balance: vacationLeave || 0,
      total: 5,
      color: "#ea580c",
      icon: "🏖️",
      description: "Vacation days",
    },
    {
      type: "Unpaid Leave",
      balance: unpaidLeave || 0,
      total: 0,
      color: "#64748b",
      icon: "📋",
      description: "Unpaid time off (no limit)",
    },
  ];

  const usagePercentage = totalLeavesAvailable > 0
    ? Math.round((totalLeavesUsed / totalLeavesAvailable) * 100)
    : 0;

  const getStatusColor = () => {
    if (usagePercentage >= 80) return "#dc2626";
    if (usagePercentage >= 60) return "#ea580c";
    return "#059669";
  };

  const getProgressColor = (balance: number, total: number) => {
    if (total === 0) return "#64748b";
    const percentage = (balance / total) * 100;
    if (percentage <= 20) return "#dc2626";
    if (percentage <= 50) return "#ea580c";
    return "#059669";
  };

  return (
    <div className={styles.leaveBalanceContainer}>
      {/* Summary Card */}
      <Card className={styles.summaryCard}>
        <div className={styles.summaryHeader}>
          <div className={styles.summaryIcon}>
            <Calendar size={32} color="#7c3aed" />
          </div>
          <div className={styles.summaryContent}>
            <h3 className={styles.summaryTitle}>Leave Balance Overview</h3>
            <p className={styles.summarySubtitle}>
              Your available leave days for the current year
            </p>
          </div>
        </div>

        <div className={styles.totalBalance}>
          <div className={styles.totalBalanceItem}>
            <span className={styles.totalBalanceLabel}>Total Available</span>
            <span className={styles.totalBalanceValue}>
              {paidLeave + sickLeave + (vacationLeave || 0)} days
            </span>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.totalBalanceItem}>
            <span className={styles.totalBalanceLabel}>Used This Year</span>
            <span className={styles.totalBalanceValue} style={{ color: getStatusColor() }}>
              {totalLeavesUsed} days
            </span>
          </div>
        </div>

        <div className={styles.usageBar}>
          <div className={styles.usageBarHeader}>
            <span className={styles.usageBarLabel}>Annual Usage</span>
            <span className={styles.usageBarPercentage} style={{ color: getStatusColor() }}>
              {usagePercentage}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${usagePercentage}%`,
                backgroundColor: getStatusColor(),
              }}
            ></div>
          </div>
          <div className={styles.usageBarFooter}>
            <span>{totalLeavesUsed} used</span>
            <span>{totalLeavesAvailable - totalLeavesUsed} remaining</span>
          </div>
        </div>

        {usagePercentage >= 80 && (
          <div className={styles.warningBanner}>
            <AlertCircle size={18} />
            <span>
              You've used {usagePercentage}% of your annual leave. Plan your remaining days wisely.
            </span>
          </div>
        )}
      </Card>

      {/* Leave Type Cards */}
      {showDetails && (
        <div className={styles.leaveTypesGrid}>
          {leaveTypes.map((leave) => (
            <Card key={leave.type} className={styles.leaveTypeCard}>
              <div className={styles.leaveTypeHeader}>
                <div className={styles.leaveTypeIcon}>{leave.icon}</div>
                <div className={styles.leaveTypeInfo}>
                  <h4 className={styles.leaveTypeName}>{leave.type}</h4>
                  <p className={styles.leaveTypeDescription}>
                    {leave.description}
                  </p>
                </div>
              </div>

              <div className={styles.leaveTypeBalance}>
                <div className={styles.balanceNumbers}>
                  <span className={styles.balanceValue}>{leave.balance}</span>
                  {leave.total > 0 && (
                    <span className={styles.balanceTotal}>/ {leave.total} days</span>
                  )}
                  {leave.total === 0 && (
                    <span className={styles.balanceTotal}>days used</span>
                  )}
                </div>

                {leave.total > 0 && (
                  <>
                    <div className={styles.leaveProgressBar}>
                      <div
                        className={styles.leaveProgressFill}
                        style={{
                          width: `${(leave.balance / leave.total) * 100}%`,
                          backgroundColor: getProgressColor(leave.balance, leave.total),
                        }}
                      ></div>
                    </div>
                    <div className={styles.leaveProgressLabel}>
                      <span>
                        {leave.total - leave.balance} used
                      </span>
                      <span
                        style={{
                          color: getProgressColor(leave.balance, leave.total),
                          fontWeight: 600,
                        }}
                      >
                        {leave.balance} remaining
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className={styles.leaveTypeFooter}>
                {leave.balance === 0 && leave.total > 0 && (
                  <span className={styles.depleted}>
                    ⚠️ Fully depleted
                  </span>
                )}
                {leave.balance > 0 && leave.balance <= leave.total * 0.2 && leave.total > 0 && (
                  <span className={styles.lowBalance}>
                    ⚠️ Low balance
                  </span>
                )}
                {leave.balance > leave.total * 0.2 && leave.total > 0 && (
                  <span className={styles.available}>
                    ✓ Available
                  </span>
                )}
                {leave.total === 0 && (
                  <span className={styles.unlimited}>
                    ∞ No limit
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {showDetails && (
        <div className={styles.quickStats}>
          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: "#ede9fe" }}>
              <Clock size={24} color="#7c3aed" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {Math.round((totalLeavesAvailable - totalLeavesUsed) / 52)} weeks
              </span>
              <span className={styles.statLabel}>Equivalent Time Off</span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: "#d1fae5" }}>
              <TrendingUp size={24} color="#059669" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {totalLeavesAvailable - totalLeavesUsed}
              </span>
              <span className={styles.statLabel}>Days to Plan</span>
            </div>
          </Card>

          <Card className={styles.statCard}>
            <div className={styles.statIcon} style={{ backgroundColor: "#fed7aa" }}>
              <Calendar size={24} color="#ea580c" />
            </div>
            <div className={styles.statContent}>
              <span className={styles.statValue}>
                {new Date().getFullYear()}
              </span>
              <span className={styles.statLabel}>Current Year</span>
            </div>
          </Card>
        </div>
      )}

      {/* Info Box */}
      <div className={styles.infoBox}>
        <span className={styles.infoIcon}>💡</span>
        <div className={styles.infoContent}>
          <p className={styles.infoTitle}>Leave Policy Reminder</p>
          <ul className={styles.infoList}>
            <li>Unused paid leave expires at the end of the year</li>
            <li>Sick leave requires medical documentation for 3+ days</li>
            <li>Apply for leave at least 3 days in advance when possible</li>
            <li>Check with HR for leave transfer or encashment policies</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
