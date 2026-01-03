import {
  AuthResponse,
  SignInCredentials,
  SignUpData,
  User,
  UserRole,
  Company,
} from "../types";
import { extractCompanyCode, generateLoginId } from "../utils/loginIdGenerator";

const API_DELAY = 800;

const mockCompanies: Company[] = [
  {
    id: "1",
    name: "Odoo India",
    code: "OI",
    adminEmail: "admin@odooindia.com",
    adminName: "Admin User",
    phone: "+91 1234567890",
    createdAt: "2022-01-01",
  },
];

const mockUsers = [
  {
    id: "1",
    employeeId: "EMP-001",
    loginId: "OIADUS20220001",
    email: "admin@odooindia.com",
    password: "admin123",
    role: UserRole.ADMIN,
    firstName: "Admin",
    lastName: "User",
    fullName: "Admin User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
    companyCode: "OI",
    yearOfJoining: 2022,
  },
  {
    id: "2",
    employeeId: "EMP-002",
    loginId: "OIJODO20220002",
    email: "john.doe@company.com",
    password: "password123",
    role: UserRole.EMPLOYEE,
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    companyCode: "OI",
    yearOfJoining: 2022,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const signIn = async (
  credentials: SignInCredentials,
): Promise<AuthResponse> => {
  await delay(API_DELAY);

  const user = mockUsers.find(
    (u) =>
      (u.email === credentials.email || u.loginId === credentials.email) &&
      u.password === credentials.password,
  );

  if (!user) {
    throw new Error("Invalid email/login ID or password");
  }

  const { password, ...userWithoutPassword } = user;
  const token = `mock_token_${user.id}_${Date.now()}`;

  return {
    user: userWithoutPassword as User,
    token,
  };
};

export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  await delay(API_DELAY);

  if (data.password !== data.confirmPassword) {
    throw new Error("Passwords do not match");
  }

  const existingUser = mockUsers.find((u) => u.email === data.email);
  if (existingUser) {
    throw new Error("User already exists");
  }

  const companyCode = data.companyCode || extractCompanyCode(data.companyName);
  const firstName = data.adminName.split(" ")[0] || data.adminName;
  const lastName = data.adminName.split(" ").slice(1).join(" ") || "User";
  const currentYear = new Date().getFullYear();
  const serialNumber = 1;

  const loginId = generateLoginId(
    companyCode,
    firstName,
    lastName,
    currentYear,
    serialNumber,
  );

  const newCompany: Company = {
    id: `${mockCompanies.length + 1}`,
    name: data.companyName,
    code: companyCode,
    logo: data.companyLogo,
    adminEmail: data.email,
    adminName: data.adminName,
    phone: data.phone,
    createdAt: new Date().toISOString(),
  };

  mockCompanies.push(newCompany);

  const newUser: User = {
    id: `${mockUsers.length + 1}`,
    employeeId: `EMP-${String(mockUsers.length + 1).padStart(3, "0")}`,
    loginId: loginId,
    email: data.email,
    role: UserRole.ADMIN,
    firstName: firstName,
    lastName: lastName,
    fullName: data.adminName,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.adminName}`,
    companyCode: companyCode,
    yearOfJoining: currentYear,
  };

  const token = `mock_token_${newUser.id}_${Date.now()}`;

  return {
    user: newUser,
    token,
  };
};

export const verifyToken = async (token: string): Promise<User> => {
  await delay(API_DELAY);

  const userId = token.split("_")[2];
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    throw new Error("Invalid token");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as User;
};

export const forgotPassword = async (
  email: string,
): Promise<{ message: string }> => {
  await delay(API_DELAY);

  const user = mockUsers.find((u) => u.email === email);

  if (!user) {
    throw new Error("User not found");
  }

  return {
    message: "Password reset link has been sent to your email",
  };
};

export const resetPassword = async (
  _token: string,
  _newPassword: string,
): Promise<{ message: string }> => {
  await delay(API_DELAY);

  return {
    message: "Password has been reset successfully",
  };
};
