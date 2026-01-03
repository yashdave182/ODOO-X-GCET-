/**
 * Mock Payroll API
 * This file provides mock data for payroll management
 * To be replaced with actual backend API when available
 */

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  leaves: number;
  overtimeHours: number;
  status: "PENDING" | "PROCESSED" | "PAID";
  paymentDate?: string;
  paymentMethod?: string;
}

export interface PayrollSummary {
  totalEmployees: number;
  totalSalaryPaid: number;
  pendingPayments: number;
  averageSalary: number;
}

export interface SalaryBreakdown {
  baseSalary: number;
  hra: number;
  transport: number;
  medical: number;
  bonus: number;
  overtime: number;
  totalEarnings: number;
  tax: number;
  providentFund: number;
  insurance: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
}

// Mock payroll data
const mockPayrollRecords: PayrollRecord[] = [
  {
    id: "PAY001",
    employeeId: "OIJODO20240001",
    employeeName: "John Doe",
    month: "January",
    year: 2025,
    baseSalary: 50000,
    allowances: 15000,
    deductions: 8000,
    netSalary: 57000,
    workingDays: 22,
    presentDays: 21,
    leaves: 1,
    overtimeHours: 8,
    status: "PAID",
    paymentDate: "2025-01-31",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "PAY002",
    employeeId: "OIJASM20240002",
    employeeName: "Jane Smith",
    month: "January",
    year: 2025,
    baseSalary: 45000,
    allowances: 12000,
    deductions: 7000,
    netSalary: 50000,
    workingDays: 22,
    presentDays: 22,
    leaves: 0,
    overtimeHours: 5,
    status: "PROCESSED",
    paymentDate: "2025-01-31",
    paymentMethod: "Bank Transfer",
  },
  {
    id: "PAY003",
    employeeId: "OIJODO20240001",
    employeeName: "John Doe",
    month: "December",
    year: 2024,
    baseSalary: 50000,
    allowances: 15000,
    deductions: 8000,
    netSalary: 57000,
    workingDays: 21,
    presentDays: 20,
    leaves: 1,
    overtimeHours: 6,
    status: "PAID",
    paymentDate: "2024-12-31",
    paymentMethod: "Bank Transfer",
  },
];

// API Functions
export const getAllPayrollRecords = async (
  month?: string,
  year?: number,
  status?: string,
): Promise<PayrollRecord[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = [...mockPayrollRecords];

  if (month) {
    filtered = filtered.filter((record) => record.month === month);
  }

  if (year) {
    filtered = filtered.filter((record) => record.year === year);
  }

  if (status) {
    filtered = filtered.filter((record) => record.status === status);
  }

  return filtered;
};

export const getMyPayroll = async (
  employeeId: string,
  month?: string,
  year?: number,
): Promise<PayrollRecord[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  let filtered = mockPayrollRecords.filter(
    (record) => record.employeeId === employeeId,
  );

  if (month) {
    filtered = filtered.filter((record) => record.month === month);
  }

  if (year) {
    filtered = filtered.filter((record) => record.year === year);
  }

  return filtered;
};

export const getPayrollSummary = async (): Promise<PayrollSummary> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const currentMonth = mockPayrollRecords.filter(
    (record) =>
      record.month === "January" && record.year === 2025,
  );

  const totalSalary = currentMonth.reduce(
    (sum, record) => sum + record.netSalary,
    0,
  );
  const pending = currentMonth.filter((r) => r.status === "PENDING").length;
  const employees = new Set(currentMonth.map((r) => r.employeeId)).size;

  return {
    totalEmployees: employees,
    totalSalaryPaid: totalSalary,
    pendingPayments: pending,
    averageSalary: employees > 0 ? Math.round(totalSalary / employees) : 0,
  };
};

export const getSalaryBreakdown = async (
  payrollId: string,
): Promise<SalaryBreakdown> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const record = mockPayrollRecords.find((r) => r.id === payrollId);

  if (!record) {
    throw new Error("Payroll record not found");
  }

  // Calculate breakdown (mock calculations)
  const baseSalary = record.baseSalary;
  const hra = Math.round(baseSalary * 0.4);
  const transport = 2000;
  const medical = 1500;
  const bonus = record.overtimeHours * 200;
  const overtime = record.overtimeHours * 200;

  const totalEarnings =
    baseSalary + hra + transport + medical + bonus + overtime;

  const tax = Math.round(totalEarnings * 0.1);
  const providentFund = Math.round(baseSalary * 0.12);
  const insurance = 500;
  const otherDeductions = 1000;

  const totalDeductions = tax + providentFund + insurance + otherDeductions;

  return {
    baseSalary,
    hra,
    transport,
    medical,
    bonus,
    overtime,
    totalEarnings,
    tax,
    providentFund,
    insurance,
    otherDeductions,
    totalDeductions,
    netSalary: totalEarnings - totalDeductions,
  };
};

export const processPayroll = async (payrollId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const record = mockPayrollRecords.find((r) => r.id === payrollId);
  if (record) {
    record.status = "PROCESSED";
  }
};

export const markAsPaid = async (payrollId: string): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const record = mockPayrollRecords.find((r) => r.id === payrollId);
  if (record) {
    record.status = "PAID";
    record.paymentDate = new Date().toISOString().split("T")[0];
  }
};

export const generatePayslip = async (payrollId: string): Promise<Blob> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return a mock blob (in real implementation, this would generate a PDF)
  const content = `Payslip for ${payrollId}`;
  return new Blob([content], { type: "application/pdf" });
};

// Helper functions
export const getCurrentMonth = (): string => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[new Date().getMonth()];
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const getAvailableMonths = (): string[] => {
  return [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
};

export const getAvailableYears = (): number[] => {
  const currentYear = new Date().getFullYear();
  return [currentYear, currentYear - 1, currentYear - 2];
};
