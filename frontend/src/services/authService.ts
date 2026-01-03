/**
 * Authentication Service
 * Handles all authentication-related API calls
 * Following Dayflow HRMS API Contract Specification
 */

import apiClient, { setAuthToken, removeAuthToken } from "../lib/apiClient";
import { API_ENDPOINTS } from "../config/api.config";
import { AuthResponse, SignInCredentials, User } from "../types";

/**
 * POST /auth/login
 * Authenticate user using Login ID or Email
 */
export const signIn = async (
  credentials: SignInCredentials,
): Promise<AuthResponse> => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, {
      login_id: credentials.email, // Can be login_id or email
      password: credentials.password,
    });

    const { access_token, role } = response.data;

    // Store JWT token
    setAuthToken(access_token);

    // Fetch user details
    const user = await getCurrentUser();

    return {
      user,
      token: access_token,
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Invalid login ID or password");
  }
};

/**
 * GET /auth/me
 * Fetch authenticated user details
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    const data = response.data;

    // Map backend response to frontend User type
    return {
      id: data.id.toString(),
      employeeId: data.login_id,
      loginId: data.login_id,
      email: data.email || "",
      role: data.role,
      firstName: data.name.split(" ")[0] || data.name,
      lastName: data.name.split(" ").slice(1).join(" ") || "",
      fullName: data.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      companyCode: data.login_id.substring(0, 2), // Extract from login_id (OI)
      yearOfJoining:
        parseInt(data.login_id.substring(6, 10)) || new Date().getFullYear(),
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to fetch user details");
  }
};

/**
 * Verify token validity by fetching current user
 */
export const verifyToken = async (token: string): Promise<User> => {
  try {
    setAuthToken(token);
    return await getCurrentUser();
  } catch (error) {
    removeAuthToken();
    throw new Error("Invalid or expired token");
  }
};

/**
 * Sign out user
 */
export const signOut = async (): Promise<void> => {
  removeAuthToken();
};

/**
 * PUT /users/me/password
 * Change account password
 */
export const changePassword = async (
  oldPassword: string,
  newPassword: string,
): Promise<{ message: string }> => {
  try {
    await apiClient.put(API_ENDPOINTS.USERS.ME_PASSWORD, {
      old_password: oldPassword,
      new_password: newPassword,
    });

    return {
      message: "Password changed successfully",
    };
  } catch (error: any) {
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw new Error("Failed to change password");
  }
};

/**
 * Forgot password - Not in API spec, placeholder for future
 */
export const forgotPassword = async (
  email: string,
): Promise<{ message: string }> => {
  // TODO: Implement when backend endpoint is available
  throw new Error("Forgot password feature not yet implemented");
};

/**
 * Reset password - Not in API spec, placeholder for future
 */
export const resetPassword = async (
  token: string,
  newPassword: string,
): Promise<{ message: string }> => {
  // TODO: Implement when backend endpoint is available
  throw new Error("Reset password feature not yet implemented");
};
