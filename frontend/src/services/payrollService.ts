/**
 * Payroll Service
 * Handles all payroll-related API calls
 * Following Dayflow HRMS API Contract Specification
 */

import apiClient from "../lib/apiClient";
import { API_ENDPOINTS } from "../config/api.config";

export interface PayrollInfo {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: {
    hra: number;
    transport: number;
    medical: number;
    special: number;
  };
  deductions: {
    pf: number;
    tax: number;
    insurance: number;
    other: number;
  };
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: "PENDING" | "PROCESSED" | "PAID";
  paymentDate?: string;
  remarks?: string;
}

export interface PayslipInfo {
  employeeId: string;
  employeeName: string;
  loginId: string;
  department: string;
  designation: string;
  month: string;
  year: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  earnings: {
    basic: number;
    hra: number;
    transport: number;
    medical: number;
    special: number;
    total: number;
  };
  deductions: {
    pf: number;
    tax: number;
    insurance: number;
    other: number;
    total: number;
  };
  grossSalary: number;
  netSalary: number;
  paymentDate?: string;
  bankDetails?: {
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
}

/**
 * GET /payroll/me
 * Get own payroll information (Employee)
 * Note: Payroll is read-only for employees
 */
export const getMyPayroll = async (
  month?: number,
  year?: number
): Promise<PayrollInfo[]> => {
  try {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;

    const response = await apiClient.get(API_ENDPOINTS.PAYROLL.ME, { params });

    return response.data.map((payroll: any) =>
      mapBackendPayrollToFrontend(payroll)
    );
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch payroll information");
  }
};

/**
 * Get current month payroll
 */
export const getCurrentMonthPayroll = async (): Promise<PayrollInfo | null> => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const payrolls = await getMyPayroll(month, year);
    return payrolls.length > 0 ? payrolls[0] : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get latest payslip
 */
export const getLatestPayslip = async (): Promise<PayslipInfo | null> => {
  try {
    const payrolls = await getMyPayroll();
    if (payrolls.length === 0) return null;

    // Get the most recent payroll
    const latest = payrolls.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (
        new Date(`${b.month} 1, ${b.year}`).getTime() -
        new Date(`${a.month} 1, ${a.year}`).getTime()
      );
    })[0];

    return mapPayrollToPayslip(latest);
  } catch (error) {
    return null;
  }
};

/**
 * Get payroll history (last 12 months)
 */
export const getPayrollHistory = async (): Promise<PayrollInfo[]> => {
  try {
    // Fetch all payroll records and sort by date
    const payrolls = await getMyPayroll();
    return payrolls.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return (
        new Date(`${b.month} 1, ${b.year}`).getTime() -
        new Date(`${a.month} 1, ${a.year}`).getTime()
      );
    });
  } catch (error: any) {
    throw new Error("Failed to fetch payroll history");
  }
};

/**
 * Calculate YTD (Year to Date) earnings
 */
export const calculateYTDEarnings = async (
  year: number
): Promise<{
  grossSalary: number;
  netSalary: number;
  totalDeductions: number;
}> => {
  try {
    const payrolls = await getMyPayroll(undefined, year);

    const ytd = {
      grossSalary: 0,
      netSalary: 0,
      totalDeductions: 0,
    };

    payrolls.forEach((payroll) => {
      ytd.grossSalary += payroll.grossSalary;
      ytd.netSalary += payroll.netSalary;
      ytd.totalDeductions += payroll.totalDeductions;
    });

    return ytd;
  } catch (error) {
    return {
      grossSalary: 0,
      netSalary: 0,
      totalDeductions: 0,
    };
  }
};

/**
 * Download payslip as PDF
 * Note: Backend API spec doesn't include this endpoint yet
 */
export const downloadPayslip = async (
  payrollId: string
): Promise<Blob> => {
  try {
    // TODO: Update when backend implements GET /payroll/payslip/:id/download
    const response = await apiClient.get(
      `/payroll/payslip/${payrollId}/download`,
      {
        responseType: "blob",
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error("Failed to download payslip");
  }
};

/**
 * Helper function to map backend payroll data to frontend PayrollInfo type
 */
function mapBackendPayrollToFrontend(data: any): PayrollInfo {
  const allowances = {
    hra: data.allowances?.hra || data.hra || 0,
    transport: data.allowances?.transport || data.transport_allowance || 0,
    medical: data.allowances?.medical || data.medical_allowance || 0,
    special: data.allowances?.special || data.special_allowance || 0,
  };

  const deductions = {
    pf: data.deductions?.pf || data.provident_fund || 0,
    tax: data.deductions?.tax || data.income_tax || 0,
    insurance: data.deductions?.insurance || data.insurance || 0,
    other: data.deductions?.other || data.other_deductions || 0,
  };

  const grossSalary =
    data.gross_salary ||
    data.basicSalary +
      allowances.hra +
      allowances.transport +
      allowances.medical +
      allowances.special;

  const totalDeductions =
    data.total_deductions ||
    deductions.pf + deductions.tax + deductions.insurance + deductions.other;

  const netSalary = data.net_salary || grossSalary - totalDeductions;

  return {
    id: data.id?.toString() || "",
    employeeId: data.employee_id?.toString() || data.login_id || "",
    employeeName: data.employee_name || "Unknown",
    month: data.month || new Date().toLocaleString("default", { month: "long" }),
    year: data.year || new Date().getFullYear(),
    basicSalary: data.basic_salary || data.basicSalary || 0,
    allowances,
    deductions,
    grossSalary,
    totalDeductions,
    netSalary,
    status: data.status || "PENDING",
    paymentDate: data.payment_date || undefined,
    remarks: data.remarks || undefined,
  };
}

/**
 * Helper function to convert PayrollInfo to PayslipInfo
 */
function mapPayrollToPayslip(payroll: PayrollInfo): PayslipInfo {
  return {
    employeeId: payroll.employeeId,
    employeeName: payroll.employeeName,
    loginId: payroll.employeeId, // Assuming employeeId is loginId
    department: "General", // Would come from employee data
    designation: "Employee", // Would come from employee data
    month: payroll.month,
    year: payroll.year,
    workingDays: 22, // Default working days per month
    presentDays: 22, // Would come from attendance data
    leaveDays: 0, // Would come from leave data
    earnings: {
      basic: payroll.basicSalary,
      hra: payroll.allowances.hra,
      transport: payroll.allowances.transport,
      medical: payroll.allowances.medical,
      special: payroll.allowances.special,
      total: payroll.grossSalary,
    },
    deductions: {
      pf: payroll.deductions.pf,
      tax: payroll.deductions.tax,
      insurance: payroll.deductions.insurance,
      other: payroll.deductions.other,
      total: payroll.totalDeductions,
    },
    grossSalary: payroll.grossSalary,
    netSalary: payroll.netSalary,
    paymentDate: payroll.paymentDate,
    bankDetails: undefined, // Would come from employee profile
  };
}

// Export as default object
const payrollService = {
  getMyPayroll,
  getCurrentMonthPayroll,
  getLatestPayslip,
  getPayrollHistory,
  calculateYTDEarnings,
  downloadPayslip,
};

export default payrollService;
