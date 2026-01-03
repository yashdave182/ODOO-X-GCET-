import { Employee, CreateEmployeeData } from "../types";
import {
  generateLoginId,
  generateRandomPassword,
  getNextSerialNumber,
} from "../utils/loginIdGenerator";
import { mockEmployees as importedMockEmployees } from "./mockData";

const API_DELAY = 800;

const mockEmployees: Employee[] = [...importedMockEmployees];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a new employee with auto-generated Login ID and password
 * Only accessible by HR/Admin
 */
export const createEmployee = async (
  data: CreateEmployeeData,
): Promise<{
  employee: Employee;
  loginId: string;
  defaultPassword: string;
}> => {
  await delay(API_DELAY);

  const yearOfJoining = new Date(data.dateOfJoining).getFullYear();

  const serialNumber = getNextSerialNumber(
    mockEmployees.map((emp) => ({
      yearOfJoining: emp.yearOfJoining,
      serialNumber: emp.serialNumber,
    })),
    yearOfJoining,
  );

  const loginId = generateLoginId(
    data.companyCode,
    data.firstName,
    data.lastName,
    yearOfJoining,
    serialNumber,
  );

  const defaultPassword = generateRandomPassword();

  const newEmployee: Employee = {
    id: `${mockEmployees.length + 1}`,
    employeeId: `EMP-${String(mockEmployees.length + 1).padStart(3, "0")}`,
    loginId: loginId,
    firstName: data.firstName,
    lastName: data.lastName,
    fullName: `${data.firstName} ${data.lastName}`,
    email: data.email,
    role: "EMPLOYEE" as any,
    jobTitle: data.jobTitle,
    department: data.department,
    location: "Office",
    dateOfJoining: data.dateOfJoining,
    yearOfJoining: yearOfJoining,
    serialNumber: serialNumber,
    employmentStatus: "ACTIVE" as any,
    companyCode: data.companyCode,
    defaultPassword: defaultPassword,
    isFirstLogin: true,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}${data.lastName}`,
  };

  mockEmployees.push(newEmployee);

  return {
    employee: newEmployee,
    loginId: loginId,
    defaultPassword: defaultPassword,
  };
};

/**
 * Get all employees for a company
 */
export const getAllEmployees = async (
  companyCode?: string,
): Promise<Employee[]> => {
  await delay(API_DELAY);

  if (companyCode) {
    return mockEmployees.filter((emp) => emp.companyCode === companyCode);
  }

  return mockEmployees;
};

/**
 * Get employee by Login ID
 */
export const getEmployeeByLoginId = async (
  loginId: string,
): Promise<Employee | null> => {
  await delay(API_DELAY);

  const employee = mockEmployees.find((emp) => emp.loginId === loginId);
  return employee || null;
};

/**
 * Update employee details
 */
export const updateEmployee = async (
  loginId: string,
  updates: Partial<Employee>,
): Promise<Employee> => {
  await delay(API_DELAY);

  const index = mockEmployees.findIndex((emp) => emp.loginId === loginId);

  if (index === -1) {
    throw new Error("Employee not found");
  }

  mockEmployees[index] = {
    ...mockEmployees[index],
    ...updates,
  };

  return mockEmployees[index];
};

/**
 * Delete employee
 */
export const deleteEmployee = async (loginId: string): Promise<void> => {
  await delay(API_DELAY);

  const index = mockEmployees.findIndex((emp) => emp.loginId === loginId);

  if (index === -1) {
    throw new Error("Employee not found");
  }

  mockEmployees.splice(index, 1);
};

/**
 * Change employee password (for first-time login)
 */
export const changePassword = async (
  loginId: string,
  oldPassword: string,
  newPassword: string,
): Promise<void> => {
  await delay(API_DELAY);

  const employee = mockEmployees.find((emp) => emp.loginId === loginId);

  if (!employee) {
    throw new Error("Employee not found");
  }

  if (employee.defaultPassword !== oldPassword) {
    throw new Error("Current password is incorrect");
  }

  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  employee.defaultPassword = newPassword;
  employee.isFirstLogin = false;
};

/**
 * Send default password email to employee
 */
export const sendPasswordEmail = async (
  employeeEmail: string,
  loginId: string,
  password: string,
): Promise<void> => {
  await delay(API_DELAY);

  console.log(`
    ========================================
    📧 PASSWORD EMAIL SENT
    ========================================
    To: ${employeeEmail}
    Login ID: ${loginId}
    Default Password: ${password}
    ========================================
    Please change your password after first login.
  `);
};
