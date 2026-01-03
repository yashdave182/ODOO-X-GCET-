/**
 * Employee Service
 * Handles all employee-related API calls
 * Following Dayflow HRMS API Contract Specification
 */

import apiClient from "../lib/apiClient";
import { API_ENDPOINTS } from "../config/api.config";
import { Employee, CreateEmployeeData } from "../types";

/**
 * GET /users/me
 * Get current employee profile
 */
export const getCurrentEmployeeProfile = async (): Promise<Employee> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.USERS.ME);
    const data = response.data;

    return mapBackendEmployeeToFrontend(data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch employee profile");
  }
};

/**
 * PUT /users/me
 * Update current employee profile (limited fields)
 */
export const updateCurrentEmployeeProfile = async (updates: {
  phone?: string;
  address?: string;
}): Promise<Employee> => {
  try {
    const response = await apiClient.put(API_ENDPOINTS.USERS.ME, updates);
    const data = response.data;

    return mapBackendEmployeeToFrontend(data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to update profile");
  }
};

/**
 * POST /admin/users
 * Create a new employee account (Admin only)
 */
export const createEmployee = async (
  data: CreateEmployeeData,
): Promise<{
  employee: Employee;
  loginId: string;
  defaultPassword: string;
}> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.ADMIN.USERS, {
      first_name: data.firstName,
      last_name: data.lastName,
      year_of_joining: new Date(data.dateOfJoining).getFullYear(),
      email: data.email,
      phone: data.phone || "",
    });

    const { login_id, temporary_password } = response.data;

    // Fetch the newly created employee details
    const employees = await getAllEmployees();
    const newEmployee = employees.find((emp) => emp.loginId === login_id);

    if (!newEmployee) {
      throw new Error("Employee created but could not fetch details");
    }

    return {
      employee: newEmployee,
      loginId: login_id,
      defaultPassword: temporary_password,
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to create employee");
  }
};

/**
 * GET /admin/users
 * Get all employees (Admin only)
 */
export const getAllEmployees = async (
  companyCode?: string,
): Promise<Employee[]> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USERS);
    const employees = response.data;

    // Map backend response to frontend Employee type
    const mappedEmployees = employees.map((emp: any) =>
      mapBackendEmployeeToFrontend(emp),
    );

    // Filter by company code if provided
    if (companyCode) {
      return mappedEmployees.filter(
        (emp: Employee) => emp.companyCode === companyCode,
      );
    }

    return mappedEmployees;
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch employees");
  }
};

/**
 * GET /admin/users/:id
 * Get employee by ID (Admin only)
 */
export const getEmployeeById = async (id: number): Promise<Employee | null> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
    return mapBackendEmployeeToFrontend(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch employee");
  }
};

/**
 * Get employee by Login ID
 */
export const getEmployeeByLoginId = async (
  loginId: string,
): Promise<Employee | null> => {
  try {
    // Since backend doesn't have a direct endpoint for login_id lookup,
    // we fetch all employees and filter
    const employees = await getAllEmployees();
    return employees.find((emp) => emp.loginId === loginId) || null;
  } catch (error) {
    return null;
  }
};

/**
 * Update employee details (Admin only)
 * Note: Backend API spec doesn't include update endpoint, but we prepare for it
 */
export const updateEmployee = async (
  id: number,
  updates: Partial<Employee>,
): Promise<Employee> => {
  try {
    // TODO: Update when backend implements PUT /admin/users/:id
    const response = await apiClient.put(
      API_ENDPOINTS.ADMIN.USER_BY_ID(id),
      updates,
    );
    return mapBackendEmployeeToFrontend(response.data);
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to update employee");
  }
};

/**
 * Delete employee (Admin only)
 * Note: Backend API spec doesn't include delete endpoint, but we prepare for it
 */
export const deleteEmployee = async (id: number): Promise<void> => {
  try {
    // TODO: Update when backend implements DELETE /admin/users/:id
    await apiClient.delete(API_ENDPOINTS.ADMIN.USER_BY_ID(id));
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to delete employee");
  }
};

/**
 * Send default password email to employee
 * This is handled by backend, but frontend can trigger notification
 */
export const sendPasswordEmail = async (
  employeeEmail: string,
  loginId: string,
  password: string,
): Promise<void> => {
  // Log for development purposes
  console.log(`
    ========================================
    📧 PASSWORD EMAIL (Backend will send)
    ========================================
    To: ${employeeEmail}
    Login ID: ${loginId}
    Default Password: ${password}
    ========================================
    Employee should change password after first login.
  `);
};

/**
 * Helper function to map backend employee data to frontend Employee type
 */
function mapBackendEmployeeToFrontend(data: any): Employee {
  const firstName = data.name?.split(" ")[0] || data.name || "";
  const lastName = data.name?.split(" ").slice(1).join(" ") || "";

  return {
    id: data.id?.toString() || "",
    employeeId: data.login_id || "",
    loginId: data.login_id || "",
    firstName: firstName,
    lastName: lastName,
    fullName: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    role: data.role || "EMPLOYEE",
    jobTitle: data.job_title || "Employee",
    department: data.department || "General",
    location: data.location || "Office",
    dateOfJoining:
      data.date_of_joining || new Date().toISOString().split("T")[0],
    yearOfJoining:
      data.year_of_joining ||
      parseInt(data.login_id?.substring(6, 10)) ||
      new Date().getFullYear(),
    serialNumber: parseInt(data.login_id?.substring(10)) || 1,
    employmentStatus: data.employment_status || "ACTIVE",
    companyCode: data.login_id?.substring(0, 2) || "OI",
    address: data.address || "",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || "User"}`,
    isFirstLogin: data.is_first_login || false,
    defaultPassword: undefined, // Never expose password to frontend
  };
}
