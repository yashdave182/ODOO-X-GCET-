export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  ADMIN = "ADMIN",
  HR = "HR",
}

export enum AttendanceStatus {
  PRESENT = "PRESENT",
  ABSENT = "ABSENT",
  HALF_DAY = "HALF_DAY",
  LEAVE = "LEAVE",
  LATE = "LATE",
  WEEKEND = "WEEKEND",
}

export enum LeaveType {
  PAID = "PAID",
  SICK = "SICK",
  UNPAID = "UNPAID",
  VACATION = "VACATION",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum EmploymentStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ON_LEAVE = "ON_LEAVE",
}

export enum WageType {
  FIXED = "FIXED",
  HOURLY = "HOURLY",
  CONTRACT = "CONTRACT",
}

export interface User {
  id: string;
  employeeId: string;
  loginId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  isOnline?: boolean;
  companyCode?: string;
  yearOfJoining?: number;
}

export interface Company {
  id: string;
  name: string;
  code: string;
  logo?: string;
  adminEmail: string;
  adminName: string;
  phone: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  employeeId: string;
  loginId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  personalEmail?: string;
  phone?: string;
  personalPhone?: string;
  avatar?: string;
  role: UserRole;
  jobTitle: string;
  department: string;
  location: string;
  manager?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  dateOfJoining: string;
  yearOfJoining: number;
  serialNumber: number;
  employmentStatus: EmploymentStatus;
  workLocation?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  status?: AttendanceStatus;
  checkInTime?: string;
  companyCode: string;
  defaultPassword?: string;
  isFirstLogin?: boolean;
}

export interface PersonalInfo {
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  nationality?: string;
  personalEmail?: string;
  personalPhone?: string;
  permanentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface WorkInfo {
  dateOfJoining: string;
  workLocation?: string;
  employmentStatus: EmploymentStatus;
  workEmail: string;
  workPhone?: string;
}

export interface BankDetails {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
}

export interface Skill {
  name: string;
  level: number;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  icon?: string;
}

export interface ProfileData {
  aboutMe?: string;
  interests?: string[];
  skills?: Skill[];
  certifications?: Certification[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  employeeName?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workHours?: string;
  status: AttendanceStatus;
  note?: string;
  department?: string;
}

export interface AttendanceSummary {
  totalHours: string;
  workingDays: number;
  totalWorkingDays: number;
  lateArrivals: number;
  currentStatus?: AttendanceStatus;
  checkInTime?: string;
  lastCheckIn?: string;
  target?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  duration: number;
  reason?: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  reviewComment?: string;
}

export interface LeaveBalance {
  paidLeave: number;
  sickLeave: number;
  unpaidLeave?: number;
  vacationLeave?: number;
}

export interface SalaryComponent {
  id: string;
  name: string;
  amount: number;
  type: "EARNING" | "DEDUCTION";
  description?: string;
  isPercentage?: boolean;
  percentage?: number;
}

export interface SalaryStructure {
  basicSalary: number;
  currency: string;
  wageType: WageType;
  earnings: SalaryComponent[];
  deductions: SalaryComponent[];
  grossSalary: number;
  netSalary: number;
  workingDays: number;
}

export interface PayrollData {
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  salaryStructure: SalaryStructure;
  paymentDate?: string;
  paymentStatus?: "PENDING" | "PAID" | "PROCESSING";
}

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  absent: number;
  pendingLeaveRequests?: number;
  lateArrivals?: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  companyName: string;
  companyCode: string;
  companyLogo?: string;
  adminName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface CreateEmployeeData {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  dateOfJoining: string;
  companyCode: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  read: boolean;
  createdAt: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  department?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
