import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Filter,
  Search,
} from "lucide-react";
import { Button, Card, Input } from "../../components/common";
import { LeaveRequest, LeaveStatus, LeaveType } from "../../types";
import styles from "./AdminLeaveApproval.module.css";

export const AdminLeaveApproval = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: "1",
      employeeId: "OIJODO20220001",
      employeeName: "John Doe",
      employeeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
      type: LeaveType.PAID,
      startDate: "2024-02-15",
      endDate: "2024-02-17",
      duration: 3,
      reason: "Family vacation planned for a long time.",
      status: LeaveStatus.PENDING,
      appliedDate: "2024-02-01",
    },
    {
      id: "2",
      employeeId: "OIJASM20220002",
      employeeName: "Jane Smith",
      employeeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
      type: LeaveType.SICK,
      startDate: "2024-02-10",
      endDate: "2024-02-11",
      duration: 2,
      reason: "Severe flu and fever. Doctor advised rest.",
      status: LeaveStatus.PENDING,
      appliedDate: "2024-02-09",
    },
    {
      id: "3",
      employeeId: "OIBRJO20220003",
      employeeName: "Bob Johnson",
      employeeAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
      type: LeaveType.VACATION,
      startDate: "2024-03-01",
      endDate: "2024-03-05",
      duration: 5,
      reason: "Wedding anniversary celebration trip.",
      status: LeaveStatus.APPROVED,
      appliedDate: "2024-01-25",
      reviewedBy: "Admin",
      reviewedDate: "2024-01-26",
      reviewComment: "Approved. Enjoy your trip!",
    },
  ]);

  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<"approve" | "reject">("approve");
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  const handleReview = (request: LeaveRequest, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewComment("");
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedRequest) return;

    setIsSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // await reviewLeaveRequest(selectedRequest.id, {
      //   action: reviewAction,
      //   comment: reviewComment,
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update local state
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status:
                  reviewAction === "approve"
                    ? LeaveStatus.APPROVED
                    : LeaveStatus.REJECTED,
                reviewedBy: "Admin",
                reviewedDate: new Date().toISOString().split("T")[0],
                reviewComment: reviewComment || undefined,
              }
            : req
        )
      );

      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewComment("");
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLeaveTypeColor = (type: LeaveType) => {
    switch (type) {
      case LeaveType.PAID:
        return "#7c3aed";
      case LeaveType.SICK:
        return "#059669";
      case LeaveType.VACATION:
        return "#ea580c";
      case LeaveType.UNPAID:
        return "#64748b";
      default:
        return "#6b7280";
    }
  };

  const getLeaveTypeLabel = (type: LeaveType) => {
    switch (type) {
      case LeaveType.PAID:
        return "Paid Leave";
      case LeaveType.SICK:
        return "Sick Leave";
      case LeaveType.VACATION:
        return "Vacation";
      case LeaveType.UNPAID:
        return "Unpaid Leave";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.PENDING:
        return (
          <span className={`${styles.statusBadge} ${styles.pending}`}>
            <Clock size={14} />
            Pending
          </span>
        );
      case LeaveStatus.APPROVED:
        return (
          <span className={`${styles.statusBadge} ${styles.approved}`}>
            <CheckCircle size={14} />
            Approved
          </span>
        );
      case LeaveStatus.REJECTED:
        return (
          <span className={`${styles.statusBadge} ${styles.rejected}`}>
            <XCircle size={14} />
            Rejected
          </span>
        );
    }
  };

  const filteredRequests = leaveRequests.filter((request) => {
    const matchesStatus =
      filterStatus === "ALL" || request.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.employeeId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r) => r.status === LeaveStatus.PENDING).length,
    approved: leaveRequests.filter((r) => r.status === LeaveStatus.APPROVED).length,
    rejected: leaveRequests.filter((r) => r.status === LeaveStatus.REJECTED).length,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Leave Approvals</h1>
          <p className={styles.subtitle}>
            Review and manage employee leave requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total Requests</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#ede9fe" }}>
            <Calendar size={24} color="#7c3aed" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#fef3c7" }}>
            <Clock size={24} color="#f59e0b" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.approved}</span>
            <span className={styles.statLabel}>Approved</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#d1fae5" }}>
            <CheckCircle size={24} color="#059669" />
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.rejected}</span>
            <span className={styles.statLabel}>Rejected</span>
          </div>
          <div className={styles.statIcon} style={{ backgroundColor: "#fee2e2" }}>
            <XCircle size={24} color="#dc2626" />
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
              placeholder="Search by name or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterButtons}>
            <Filter size={18} />
            <button
              className={`${styles.filterButton} ${
                filterStatus === "ALL" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("ALL")}
            >
              All
            </button>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "PENDING" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("PENDING")}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "APPROVED" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("APPROVED")}
            >
              Approved
            </button>
            <button
              className={`${styles.filterButton} ${
                filterStatus === "REJECTED" ? styles.active : ""
              }`}
              onClick={() => setFilterStatus("REJECTED")}
            >
              Rejected
            </button>
          </div>
        </div>
      </Card>

      {/* Leave Requests List */}
      <div className={styles.requestsList}>
        {filteredRequests.length === 0 ? (
          <Card className={styles.emptyState}>
            <Calendar size={48} color="#9ca3af" />
            <h3>No leave requests found</h3>
            <p>
              {searchQuery
                ? "Try adjusting your search criteria"
                : "There are no leave requests matching the selected filter"}
            </p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className={styles.requestCard}>
              <div className={styles.requestHeader}>
                <div className={styles.employeeInfo}>
                  <img
                    src={request.employeeAvatar}
                    alt={request.employeeName}
                    className={styles.avatar}
                  />
                  <div>
                    <h3 className={styles.employeeName}>
                      {request.employeeName}
                    </h3>
                    <p className={styles.employeeId}>{request.employeeId}</p>
                  </div>
                </div>
                <div className={styles.requestStatus}>
                  {getStatusBadge(request.status)}
                </div>
              </div>

              <div className={styles.requestBody}>
                <div className={styles.requestInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Leave Type</span>
                    <span
                      className={styles.leaveType}
                      style={{
                        backgroundColor: `${getLeaveTypeColor(request.type)}15`,
                        color: getLeaveTypeColor(request.type),
                      }}
                    >
                      {getLeaveTypeLabel(request.type)}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Duration</span>
                    <span className={styles.infoValue}>
                      {request.duration} {request.duration === 1 ? "day" : "days"}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>From</span>
                    <span className={styles.infoValue}>
                      {new Date(request.startDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>To</span>
                    <span className={styles.infoValue}>
                      {new Date(request.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Applied On</span>
                    <span className={styles.infoValue}>
                      {new Date(request.appliedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {request.reason && (
                  <div className={styles.reasonBox}>
                    <span className={styles.reasonLabel}>
                      <MessageSquare size={16} />
                      Reason
                    </span>
                    <p className={styles.reasonText}>{request.reason}</p>
                  </div>
                )}

                {request.reviewComment && (
                  <div className={styles.reviewCommentBox}>
                    <span className={styles.reviewLabel}>
                      <User size={16} />
                      Admin Comment
                    </span>
                    <p className={styles.reviewCommentText}>
                      {request.reviewComment}
                    </p>
                    {request.reviewedBy && request.reviewedDate && (
                      <p className={styles.reviewMeta}>
                        Reviewed by {request.reviewedBy} on{" "}
                        {new Date(request.reviewedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {request.status === LeaveStatus.PENDING && (
                <div className={styles.requestFooter}>
                  <Button
                    variant="secondary"
                    icon={<XCircle size={18} />}
                    onClick={() => handleReview(request, "reject")}
                  >
                    Reject
                  </Button>
                  <Button
                    icon={<CheckCircle size={18} />}
                    onClick={() => handleReview(request, "approve")}
                  >
                    Approve
                  </Button>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {reviewAction === "approve" ? "Approve" : "Reject"} Leave Request
              </h3>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.reviewSummary}>
                <img
                  src={selectedRequest.employeeAvatar}
                  alt={selectedRequest.employeeName}
                  className={styles.reviewAvatar}
                />
                <div>
                  <h4>{selectedRequest.employeeName}</h4>
                  <p>{selectedRequest.employeeId}</p>
                  <p className={styles.reviewDates}>
                    {new Date(selectedRequest.startDate).toLocaleDateString()} -{" "}
                    {new Date(selectedRequest.endDate).toLocaleDateString()} (
                    {selectedRequest.duration} days)
                  </p>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Comment {reviewAction === "reject" && "(Required)"}
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder={
                    reviewAction === "approve"
                      ? "Add a comment (optional)..."
                      : "Please provide a reason for rejection..."
                  }
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                  required={reviewAction === "reject"}
                />
              </div>

              <div
                className={styles.confirmMessage}
                style={{
                  backgroundColor:
                    reviewAction === "approve" ? "#d1fae5" : "#fee2e2",
                  color: reviewAction === "approve" ? "#065f46" : "#991b1b",
                  border:
                    reviewAction === "approve"
                      ? "1px solid #a7f3d0"
                      : "1px solid #fecaca",
                }}
              >
                {reviewAction === "approve" ? (
                  <>
                    <CheckCircle size={18} />
                    <span>
                      You are about to approve this leave request. The employee
                      will be notified.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    <span>
                      You are about to reject this leave request. Please provide a
                      reason.
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedRequest(null);
                  setReviewComment("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitReview}
                isLoading={isSubmitting}
                disabled={reviewAction === "reject" && !reviewComment.trim()}
                style={{
                  backgroundColor:
                    reviewAction === "approve" ? "#059669" : "#dc2626",
                }}
              >
                Confirm {reviewAction === "approve" ? "Approval" : "Rejection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
