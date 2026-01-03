import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Check,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  XCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import leaveService, {
  LeaveRequest,
  LeaveStatus,
} from "../services/leaveService";
import styles from "./LeaveManagement.module.css";

interface LeaveBalance {
  paidTimeOff: number;
  sickLeave: number;
  unpaidLeave: number;
}

const LeaveManagement: React.FC = () => {
  const { user } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    paidTimeOff: 20,
    sickLeave: 12,
    unpaidLeave: 0,
  });
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(
    null,
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    reason: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === "ADMIN" || user?.role === "HR";

  useEffect(() => {
    if (user) {
      loadLeaveRequests();
      if (!isAdmin) {
        loadLeaveBalance();
      }
    }
  }, [user, isAdmin]);

  const loadLeaveRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let requests: LeaveRequest[];
      if (isAdmin) {
        requests = await leaveService.getAllLeaveRequests();
      } else {
        requests = await leaveService.getMyLeaveRequests();
      }
      setLeaveRequests(requests);
    } catch (error: any) {
      console.error("Error loading leave requests:", error);
      setError(error.message || "Failed to load leave requests");
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaveBalance = async () => {
    try {
      const balance = await leaveService.getLeaveBalance();
      setLeaveBalance(balance);
    } catch (error: any) {
      console.error("Error loading leave balance:", error);
    }
  };

  const handleRequestLeave = () => {
    setShowRequestModal(true);
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
    setFormData({
      startDate: "",
      endDate: "",
      reason: "",
    });
    setError(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.startDate || !formData.endDate) {
      setError("Please select both start and end dates");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) {
      setError("End date cannot be before start date");
      return;
    }

    setIsLoading(true);
    try {
      await leaveService.applyLeave({
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      // Reload leave requests and balance
      await loadLeaveRequests();
      if (!isAdmin) {
        await loadLeaveBalance();
      }

      handleCloseModal();
    } catch (error: any) {
      console.error("Error submitting leave request:", error);
      setError(error.message || "Failed to submit leave request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReject = async (
    requestId: string,
    action: "APPROVED" | "REJECTED",
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      if (action === "APPROVED") {
        await leaveService.approveLeave(requestId);
      } else {
        await leaveService.rejectLeave(requestId);
      }

      // Reload leave requests
      await loadLeaveRequests();

      // Close detail modal if open
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null);
      }
    } catch (error: any) {
      console.error(`Error ${action.toLowerCase()} leave:`, error);
      setError(
        error.message || `Failed to ${action.toLowerCase()} leave request`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setSelectedRequest(request);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return styles.statusApproved;
      case "REJECTED":
        return styles.statusRejected;
      case "PENDING":
        return styles.statusPending;
      default:
        return "";
    }
  };

  const calculateDuration = (startDate: string, endDate: string): number => {
    return leaveService.calculateLeaveDays(startDate, endDate);
  };

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className={styles.calendarDayEmpty}></div>,
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const hasLeave = leaveRequests.some((req) => {
        if (req.status !== LeaveStatus.APPROVED) return false;
        const start = new Date(req.startDate);
        const end = new Date(req.endDate);
        const current = new Date(dateStr);
        return current >= start && current <= end;
      });

      days.push(
        <div
          key={day}
          className={`${styles.calendarDay} ${hasLeave ? styles.calendarDayLeave : ""}`}
        >
          {day}
        </div>,
      );
    }

    return days;
  };

  // Employee View
  const renderEmployeeView = () => {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Time Off & Leave Management</h2>
          <button
            className={styles.requestButton}
            onClick={handleRequestLeave}
            disabled={isLoading}
          >
            <Plus size={20} />
            Request Leave
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Leave Balance */}
        <div className={styles.balanceSection}>
          <h3 className={styles.sectionTitle}>Leave Balance</h3>
          <div className={styles.balanceCards}>
            <div className={styles.balanceCard}>
              <div className={styles.balanceLabel}>Paid Time Off</div>
              <div className={styles.balanceValue}>
                {leaveBalance.paidTimeOff}
              </div>
              <div className={styles.balanceSubtext}>days remaining</div>
            </div>
            <div className={styles.balanceCard}>
              <div className={styles.balanceLabel}>Sick Leave</div>
              <div className={styles.balanceValue}>
                {leaveBalance.sickLeave}
              </div>
              <div className={styles.balanceSubtext}>days remaining</div>
            </div>
            <div className={styles.balanceCard}>
              <div className={styles.balanceLabel}>Unpaid Leave</div>
              <div className={styles.balanceValue}>
                {leaveBalance.unpaidLeave === 0
                  ? "∞"
                  : leaveBalance.unpaidLeave}
              </div>
              <div className={styles.balanceSubtext}>
                {leaveBalance.unpaidLeave === 0
                  ? "unlimited"
                  : "days remaining"}
              </div>
            </div>
          </div>
        </div>

        {/* Calendar View */}
        <div className={styles.calendarSection}>
          <div className={styles.calendarHeader}>
            <h3 className={styles.sectionTitle}>Leave Calendar</h3>
            <div className={styles.calendarControls}>
              <button className={styles.calendarButton} onClick={prevMonth}>
                <ChevronLeft size={20} />
              </button>
              <span className={styles.calendarMonth}>
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button className={styles.calendarButton} onClick={nextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className={styles.calendar}>
            <div className={styles.calendarWeekdays}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className={styles.calendarWeekday}>
                  {day}
                </div>
              ))}
            </div>
            <div className={styles.calendarDays}>{renderCalendar()}</div>
          </div>
        </div>

        {/* My Leave Requests */}
        <div className={styles.requestsSection}>
          <h3 className={styles.sectionTitle}>My Leave Requests</h3>
          {isLoading && leaveRequests.length === 0 ? (
            <div className={styles.loadingState}>Loading...</div>
          ) : leaveRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <Calendar size={48} />
              <p>No leave requests yet</p>
              <button
                className={styles.requestButtonSecondary}
                onClick={handleRequestLeave}
              >
                Request Your First Leave
              </button>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {leaveRequests.map((request) => (
                <div
                  key={request.id}
                  className={styles.requestCard}
                  onClick={() => handleViewDetails(request)}
                >
                  <div className={styles.requestHeader}>
                    <div className={styles.requestDates}>
                      <span className={styles.requestDate}>
                        {formatDate(request.startDate)}
                      </span>
                      <span className={styles.requestDateSeparator}>→</span>
                      <span className={styles.requestDate}>
                        {formatDate(request.endDate)}
                      </span>
                    </div>
                    <span
                      className={`${styles.statusBadge} ${getStatusColor(request.status)}`}
                    >
                      {request.status}
                    </span>
                  </div>
                  <div className={styles.requestBody}>
                    <div className={styles.requestDuration}>
                      <Clock size={16} />
                      <span>
                        {calculateDuration(request.startDate, request.endDate)}{" "}
                        day
                        {calculateDuration(
                          request.startDate,
                          request.endDate,
                        ) !== 1
                          ? "s"
                          : ""}
                      </span>
                    </div>
                    {request.reason && (
                      <p className={styles.requestReason}>{request.reason}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Admin View
  const renderAdminView = () => {
    const pendingRequests = leaveRequests.filter(
      (req) => req.status === LeaveStatus.PENDING,
    );
    const processedRequests = leaveRequests.filter(
      (req) => req.status !== LeaveStatus.PENDING,
    );

    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Leave Management - Admin</h2>
          <div className={styles.statsContainer}>
            <div className={styles.statBadge}>
              <Clock size={18} />
              <span>
                {pendingRequests.length} Pending Request
                {pendingRequests.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Pending Requests */}
        <div className={styles.requestsSection}>
          <h3 className={styles.sectionTitle}>Pending Approval</h3>
          {isLoading && leaveRequests.length === 0 ? (
            <div className={styles.loadingState}>Loading...</div>
          ) : pendingRequests.length === 0 ? (
            <div className={styles.emptyState}>
              <Check size={48} />
              <p>No pending leave requests</p>
            </div>
          ) : (
            <div className={styles.adminRequestsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Reason</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request.id}>
                      <td className={styles.employeeName}>
                        {request.employeeName || "N/A"}
                      </td>
                      <td>{request.employeeId || "N/A"}</td>
                      <td>{formatDate(request.startDate)}</td>
                      <td>{formatDate(request.endDate)}</td>
                      <td>
                        {calculateDuration(request.startDate, request.endDate)}{" "}
                        day
                        {calculateDuration(
                          request.startDate,
                          request.endDate,
                        ) !== 1
                          ? "s"
                          : ""}
                      </td>
                      <td className={styles.reasonCell}>
                        {request.reason || "N/A"}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            className={styles.approveButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveReject(request.id, "APPROVED");
                            }}
                            disabled={isLoading}
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            className={styles.rejectButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApproveReject(request.id, "REJECTED");
                            }}
                            disabled={isLoading}
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Processed Requests */}
        {processedRequests.length > 0 && (
          <div className={styles.requestsSection}>
            <h3 className={styles.sectionTitle}>Processed Requests</h3>
            <div className={styles.adminRequestsTable}>
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {processedRequests.map((request) => (
                    <tr key={request.id}>
                      <td className={styles.employeeName}>
                        {request.employeeName || "N/A"}
                      </td>
                      <td>{request.employeeId || "N/A"}</td>
                      <td>{formatDate(request.startDate)}</td>
                      <td>{formatDate(request.endDate)}</td>
                      <td>
                        {calculateDuration(request.startDate, request.endDate)}{" "}
                        day
                        {calculateDuration(
                          request.startDate,
                          request.endDate,
                        ) !== 1
                          ? "s"
                          : ""}
                      </td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusColor(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className={styles.reasonCell}>
                        {request.reason || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Request Leave Modal
  const renderRequestModal = () => {
    if (!showRequestModal) return null;

    const duration =
      formData.startDate && formData.endDate
        ? calculateDuration(formData.startDate, formData.endDate)
        : 0;

    return (
      <div className={styles.modalOverlay} onClick={handleCloseModal}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>Request Leave</h3>
            <button className={styles.modalClose} onClick={handleCloseModal}>
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleSubmitRequest}>
            <div className={styles.modalBody}>
              {error && (
                <div className={styles.errorMessage}>
                  <AlertCircle size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="startDate">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="endDate">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  min={
                    formData.startDate || new Date().toISOString().split("T")[0]
                  }
                  required
                />
              </div>

              {duration > 0 && (
                <div className={styles.durationInfo}>
                  <Clock size={16} />
                  <span>
                    Duration: {duration} day{duration !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label htmlFor="reason">Reason (Optional)</label>
                <textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) =>
                    setFormData({ ...formData, reason: e.target.value })
                  }
                  rows={4}
                  placeholder="Enter reason for leave..."
                />
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCloseModal}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Detail Modal
  const renderDetailModal = () => {
    if (!selectedRequest) return null;

    return (
      <div
        className={styles.modalOverlay}
        onClick={() => setSelectedRequest(null)}
      >
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h3>Leave Request Details</h3>
            <button
              className={styles.modalClose}
              onClick={() => setSelectedRequest(null)}
            >
              <X size={24} />
            </button>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.detailSection}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span
                  className={`${styles.statusBadge} ${getStatusColor(selectedRequest.status)}`}
                >
                  {selectedRequest.status}
                </span>
              </div>
              {isAdmin && selectedRequest.employeeName && (
                <>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Employee:</span>
                    <span className={styles.detailValue}>
                      {selectedRequest.employeeName}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Employee ID:</span>
                    <span className={styles.detailValue}>
                      {selectedRequest.employeeId}
                    </span>
                  </div>
                </>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Start Date:</span>
                <span className={styles.detailValue}>
                  {formatDate(selectedRequest.startDate)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>End Date:</span>
                <span className={styles.detailValue}>
                  {formatDate(selectedRequest.endDate)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Duration:</span>
                <span className={styles.detailValue}>
                  {calculateDuration(
                    selectedRequest.startDate,
                    selectedRequest.endDate,
                  )}{" "}
                  day
                  {calculateDuration(
                    selectedRequest.startDate,
                    selectedRequest.endDate,
                  ) !== 1
                    ? "s"
                    : ""}
                </span>
              </div>
              {selectedRequest.reason && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Reason:</span>
                  <span className={styles.detailValue}>
                    {selectedRequest.reason}
                  </span>
                </div>
              )}
            </div>

            {isAdmin && selectedRequest.status === LeaveStatus.PENDING && (
              <div className={styles.adminActions}>
                <button
                  className={styles.approveButtonLarge}
                  onClick={() => {
                    handleApproveReject(selectedRequest.id, "APPROVED");
                  }}
                  disabled={isLoading}
                >
                  <Check size={20} />
                  Approve Leave
                </button>
                <button
                  className={styles.rejectButtonLarge}
                  onClick={() => {
                    handleApproveReject(selectedRequest.id, "REJECTED");
                  }}
                  disabled={isLoading}
                >
                  <XCircle size={20} />
                  Reject Leave
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isAdmin ? renderAdminView() : renderEmployeeView()}
      {renderRequestModal()}
      {renderDetailModal()}
    </>
  );
};

export default LeaveManagement;
