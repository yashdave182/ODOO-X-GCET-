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
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import styles from "./LeaveManagement.module.css";

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  appliedDate: string;
  approvedBy?: string;
  rejectionReason?: string;
}

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
    leaveType: "Paid time off",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const isAdmin = user?.role === "ADMIN" || user?.role === "HR";

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = () => {
    // TODO: Replace with actual API call
    const mockRequests: LeaveRequest[] = [
      {
        id: "1",
        employeeName: isAdmin ? "John Doe" : user?.fullName || "",
        employeeId: isAdmin ? "OI001" : user?.employeeId || "",
        leaveType: "Paid time off",
        startDate: "2025-05-15",
        endDate: "2025-05-18",
        duration: 4,
        reason: "Family vacation",
        status: "APPROVED",
        appliedDate: "2025-05-01",
        approvedBy: "Admin",
      },
      {
        id: "2",
        employeeName: isAdmin ? "Jane Smith" : user?.fullName || "",
        employeeId: isAdmin ? "OI002" : user?.employeeId || "",
        leaveType: "Sick leave",
        startDate: "2025-06-10",
        endDate: "2025-06-10",
        duration: 1,
        reason: "Medical appointment",
        status: "PENDING",
        appliedDate: "2025-06-05",
      },
    ];
    setLeaveRequests(mockRequests);
  };

  const handleRequestLeave = () => {
    setShowRequestModal(true);
  };

  const handleCloseModal = () => {
    setShowRequestModal(false);
    setSelectedRequest(null);
    setFormData({
      leaveType: "Paid time off",
      startDate: "",
      endDate: "",
      reason: "",
    });
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const duration =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      employeeName: user?.fullName || "",
      employeeId: user?.employeeId || "",
      leaveType: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      duration,
      reason: formData.reason,
      status: "PENDING",
      appliedDate: new Date().toISOString().split("T")[0],
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    handleCloseModal();
  };

  const handleApproveReject = (
    requestId: string,
    action: "APPROVED" | "REJECTED",
  ) => {
    setLeaveRequests((prev) =>
      prev.map((req) =>
        req.id === requestId
          ? {
              ...req,
              status: action,
              approvedBy: action === "APPROVED" ? user?.fullName : undefined,
            }
          : req,
      ),
    );
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

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={styles.calendarDayEmpty} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const hasLeave = leaveRequests.some(
        (req) =>
          req.status === "APPROVED" &&
          dateStr >= req.startDate &&
          dateStr <= req.endDate,
      );

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

  return (
    <div className={styles.container}>
      {isAdmin ? (
        // Admin/HR View
        <div className={styles.adminView}>
          <div className={styles.tableContainer}>
            <table className={styles.leaveTable}>
              <thead>
                <tr>
                  <th>NEW</th>
                  <th>Paid time off</th>
                  <th>Sick time off</th>
                  <th>25 Days Availble</th>
                  <th>55 Days Availble</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Time off Type</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td>
                      <input type="checkbox" />
                    </td>
                    <td className={styles.employeeName}>
                      {request.employeeName}
                    </td>
                    <td>{formatDate(request.appliedDate)}</td>
                    <td>{request.duration} Days Availble</td>
                    <td>55 Days Availble</td>
                    <td>{formatDate(request.startDate)}</td>
                    <td>{formatDate(request.endDate)}</td>
                    <td>{request.leaveType}</td>
                    <td>
                      <div className={styles.statusActions}>
                        {request.status === "PENDING" ? (
                          <>
                            <button
                              className={styles.approveBtn}
                              onClick={() =>
                                handleApproveReject(request.id, "APPROVED")
                              }
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className={styles.rejectBtn}
                              onClick={() =>
                                handleApproveReject(request.id, "REJECTED")
                              }
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <span
                            className={`${styles.statusBadge} ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.adminNote}>
            <div className={styles.noteHeader}>
              <AlertCircle size={20} />
              <span>Note</span>
            </div>
            <p>
              Employees can view only their own time off records, while Admins
              and HR Officers can view all time off records & approve/reject
              them for all employees
            </p>
          </div>
        </div>
      ) : (
        // Employee View
        <div className={styles.employeeView}>
          <div className={styles.leaveBalanceSection}>
            <div className={styles.balanceCard}>
              <h3>Leave Balance</h3>
              <div className={styles.balanceItems}>
                <div className={styles.balanceItem}>
                  <span className={styles.balanceLabel}>Paid Time Off</span>
                  <span className={styles.balanceValue}>
                    {leaveBalance.paidTimeOff} days
                  </span>
                </div>
                <div className={styles.balanceItem}>
                  <span className={styles.balanceLabel}>Sick Leave</span>
                  <span className={styles.balanceValue}>
                    {leaveBalance.sickLeave} days
                  </span>
                </div>
                <div className={styles.balanceItem}>
                  <span className={styles.balanceLabel}>Unpaid Leave</span>
                  <span className={styles.balanceValue}>
                    {leaveBalance.unpaidLeave} days
                  </span>
                </div>
              </div>
              <button
                className={styles.requestButton}
                onClick={handleRequestLeave}
              >
                <Plus size={18} />
                Request Time Off
              </button>
            </div>

            <div className={styles.calendarCard}>
              <div className={styles.calendarHeader}>
                <button onClick={prevMonth} className={styles.calendarNav}>
                  <ChevronLeft size={20} />
                </button>
                <h3>
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
                <button onClick={nextMonth} className={styles.calendarNav}>
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className={styles.calendarGrid}>
                <div className={styles.calendarWeekday}>Sun</div>
                <div className={styles.calendarWeekday}>Mon</div>
                <div className={styles.calendarWeekday}>Tue</div>
                <div className={styles.calendarWeekday}>Wed</div>
                <div className={styles.calendarWeekday}>Thu</div>
                <div className={styles.calendarWeekday}>Fri</div>
                <div className={styles.calendarWeekday}>Sat</div>
                {renderCalendar()}
              </div>
            </div>
          </div>

          <div className={styles.requestsList}>
            <h3>My Time Off Requests</h3>
            <div className={styles.tableContainer}>
              <table className={styles.leaveTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Time off Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((request) => (
                    <tr
                      key={request.id}
                      onClick={() => handleViewDetails(request)}
                      className={styles.clickableRow}
                    >
                      <td className={styles.employeeName}>
                        {request.employeeName}
                      </td>
                      <td>{formatDate(request.startDate)}</td>
                      <td>{formatDate(request.endDate)}</td>
                      <td>{request.leaveType}</td>
                      <td>
                        <span
                          className={`${styles.statusBadge} ${getStatusColor(request.status)}`}
                        >
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Request Leave Modal */}
      {showRequestModal && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Time off Type Request</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmitRequest} className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Employee</label>
                <input
                  type="text"
                  value={user?.fullName || ""}
                  disabled
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Time off Type</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) =>
                    setFormData({ ...formData, leaveType: e.target.value })
                  }
                  className={styles.formInput}
                  required
                >
                  <option value="Paid time off">Paid time off</option>
                  <option value="Sick leave">Sick leave</option>
                  <option value="Unpaid leave">Unpaid leave</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Validity Period (May 18 - May 18)</label>
                  <div className={styles.dateInputs}>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className={styles.formInput}
                      required
                    />
                    <span>To</span>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className={styles.formInput}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Duration</label>
                <input
                  type="text"
                  value={
                    formData.startDate && formData.endDate
                      ? `${Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} Days`
                      : "0 Days"
                  }
                  disabled
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label>Attachment</label>
                <div className={styles.fileUpload}>
                  <input type="file" className={styles.fileInput} />
                  <span className={styles.fileLabel}>
                    Choose file or drag here (Optional)
                  </span>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={handleCloseModal}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitButton}>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Request Details Modal */}
      {selectedRequest && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedRequest(null)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Time Off Request Details</h3>
              <button
                className={styles.closeButton}
                onClick={() => setSelectedRequest(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <label>Employee</label>
                  <p>{selectedRequest.employeeName}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Time off Type</label>
                  <p>{selectedRequest.leaveType}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Start Date</label>
                  <p>{formatDate(selectedRequest.startDate)}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>End Date</label>
                  <p>{formatDate(selectedRequest.endDate)}</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Duration</label>
                  <p>{selectedRequest.duration} Days</p>
                </div>
                <div className={styles.detailItem}>
                  <label>Status</label>
                  <p>
                    <span
                      className={`${styles.statusBadge} ${getStatusColor(selectedRequest.status)}`}
                    >
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
                <div className={styles.detailItem}>
                  <label>Reason</label>
                  <p>{selectedRequest.reason}</p>
                </div>
                {selectedRequest.approvedBy && (
                  <div className={styles.detailItem}>
                    <label>Approved By</label>
                    <p>{selectedRequest.approvedBy}</p>
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

export default LeaveManagement;
