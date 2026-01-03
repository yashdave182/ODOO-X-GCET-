# Login ID Generation System

## Overview

The HRMS uses an auto-generated Login ID system for employee authentication. This document explains the Login ID format, generation rules, and authentication flow.

---

## Login ID Format

The Login ID follows this structure:

```
[CompanyCode][FirstTwoLettersFirstName][FirstTwoLettersLastName][YearOfJoining][SerialNumber]
```

### Example

**Login ID:** `OIODO20220001`

**Breakdown:**
- `OI` → Company Code (Odoo India)
- `OD` → First two letters of first name (Odoo Admin → **Od**)
- `O` → First two letters of last name (Odoo → **O** + padding)
- `2022` → Year of joining
- `0001` → Serial number for that year (4 digits, zero-padded)

---

## Company Code Generation

### Auto-Generation Rules

1. **Single Word Company Name:**
   - Take first 2 characters
   - Example: `Odoo` → `OD`

2. **Multi-Word Company Name:**
   - Take first letter of each word (max 2)
   - Example: `Odoo India` → `OI`
   - Example: `Tech Solutions Inc` → `TS`

3. **Custom Company Code:**
   - Admin can provide custom 2-letter code during signup
   - Must be unique and uppercase

---

## Serial Number System

### Rules

- Each employee gets a unique serial number per year
- Serial numbers start from `0001` for each new year
- Format: 4-digit zero-padded number

### Examples

```
OIJODO20220001  → 1st employee joined in 2022
OIJADO20220002  → 2nd employee joined in 2022
OIROFO20230001  → 1st employee joined in 2023
```

---

## User Types and Authentication

### 1. Admin/HR Officers

**Sign Up:**
- Admins register via the Sign Up page
- Provide: Company Name, Company Code (optional), Name, Email, Phone, Password
- System generates Login ID for admin automatically
- Can sign in with either Email or Login ID

**Sign In:**
- Use Email: `admin@odooindia.com`
- OR Login ID: `OIADUS20220001`
- Password: Custom password set during signup

**Privileges:**
- Create new employees
- Manage all employee data
- Approve/reject leave requests
- View all attendance records
- Access admin dashboard

### 2. Employees

**Registration:**
- Employees **CANNOT** self-register
- Only HR/Admin can create employee accounts
- HR creates employee with: First Name, Last Name, Email, Job Title, Department, Date of Joining

**Auto-Generated Credentials:**
- System generates Login ID: `OIJODO20220001`
- System generates random password: `Ab@12xyz`
- Password sent to employee's email

**Sign In:**
- Use Login ID: `OIJODO20220001`
- Use default password received via email
- Must change password on first login

**Privileges:**
- View own profile and attendance
- Apply for leaves
- Check in/out
- View salary details (read-only)
- Access employee dashboard

---

## Password System

### Admin/HR Password
- Custom password set during signup
- Must be at least 6 characters
- Can reset via "Forgot Password" flow

### Employee Password
- Auto-generated on account creation
- Format: 8 characters with uppercase, lowercase, numbers, and special chars
- Example: `Ab@12xyz`
- Sent via email to employee
- **Must be changed on first login**

### Password Requirements (After First Login)
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@#$%&*)

---

## Authentication Flow

### Admin Sign In Flow

```
1. Go to Sign In page
2. Enter Email OR Login ID
3. Enter password
4. Click "Sign In"
5. → Redirect to Admin Dashboard
```

### Employee Sign In Flow

```
1. Receive email with Login ID and default password
2. Go to Sign In page
3. Enter Login ID (e.g., OIJODO20220001)
4. Enter default password
5. Click "Sign In"
6. → Prompted to change password (first login)
7. Set new password
8. → Redirect to Employee Dashboard
```

### Employee Creation Flow (HR/Admin)

```
1. Admin signs in
2. Navigate to "Add Employee" page
3. Fill in employee details:
   - First Name
   - Last Name
   - Email
   - Job Title
   - Department
   - Date of Joining
4. Click "Create Employee"
5. System generates:
   - Login ID (e.g., OIJODO20220001)
   - Random password (e.g., Ab@12xyz)
6. Email sent to employee with credentials
7. Display credentials to admin for record
```

---

## Implementation Details

### Files

**Utility Functions:**
- `src/utils/loginIdGenerator.ts`
  - `generateLoginId()` - Generates Login ID
  - `generateRandomPassword()` - Creates secure password
  - `extractCompanyCode()` - Extracts code from company name
  - `getNextSerialNumber()` - Calculates next serial

**Services:**
- `src/services/authService.ts` - Authentication logic
- `src/services/employeeService.ts` - Employee CRUD operations

**Types:**
- `src/types/index.ts` - TypeScript interfaces for User, Employee, Company

---

## Test Credentials

### Admin Account
- **Email:** `admin@odooindia.com`
- **Login ID:** `OIADUS20220001`
- **Password:** `admin123`

### Employee Account
- **Email:** `john.doe@company.com`
- **Login ID:** `OIJODO20220002`
- **Password:** `password123`

---

## Security Considerations

1. **Login ID is not secret** - Treated as username
2. **Passwords are hashed** - Never stored in plain text
3. **Force password change** - First-time users must update password
4. **Email verification** - Credentials sent via secure email
5. **Role-based access** - Different dashboards for admin vs employee

---

## Future Enhancements

- [ ] Email verification during signup
- [ ] Two-factor authentication
- [ ] Password strength meter
- [ ] Password expiry policy
- [ ] Account lockout after failed attempts
- [ ] Audit log for login attempts
- [ ] Forgot Password functionality
- [ ] Remember Me option
- [ ] Session timeout

---

## Notes

- Company Code must be unique across all companies
- Serial numbers are per-year, per-company
- Login IDs are immutable once created
- Admin can access both admin and employee features
- Employees can only access employee features

---

For more information, refer to the main project documentation.