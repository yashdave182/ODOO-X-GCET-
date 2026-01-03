# Employee Dashboard Documentation

## Overview

The Employee Dashboard is the main interface that employees see after logging into the HRMS system. It provides a comprehensive view of all employees in the organization, attendance tracking, and personal profile management.

## Features

### 1. **Employee Grid View**
- Displays all employees in a card-based grid layout (3 columns on desktop, responsive on mobile)
- Each card shows:
  - Employee profile picture (or generated avatar)
  - Full name
  - Job title
  - Department
  - Real-time attendance status indicator

### 2. **Attendance Status Indicators**
Located at the top-right corner of each employee card:
- 🟢 **Green Dot**: Employee is present/checked in
- ✈️ **Airplane Icon**: Employee is on leave
- 🟡 **Yellow Dot**: Employee is absent (no time-off applied)

### 3. **Check In/Check Out System**
Located in the left sidebar:
- **Status Indicator**: Animated pulsing dot (red = not checked in, green = checked in)
- **Check In Button**: Records employee arrival time
- **Check Out Button**: Records employee departure time and calculates work hours
- **Time Display**: Shows check-in time in 12-hour format
- **Automatic Late Detection**: Marks attendance as "Late" if check-in is after 9:30 AM

### 4. **User Profile Menu**
Located in the top-right header:
- Displays user avatar
- Dropdown menu with:
  - **My Profile**: Opens employee's personal profile (view-only for employees)
  - **Log Out**: Signs out the user and returns to login page

### 5. **Navigation Tabs**
Three main sections accessible via tabs:
- **Employees**: Grid view of all employees (default active)
- **Attendance**: Attendance history and records (coming soon)
- **Time Off**: Leave requests and time-off management (coming soon)

### 6. **Search Functionality**
- Real-time search bar for filtering employees
- Searches across:
  - Full name
  - Email address
  - Job title
  - Department
  - Login ID

### 7. **Employee Details Modal**
Clicking any employee card opens a modal with:
- Large profile picture
- Full employee information:
  - Login ID
  - Email
  - Job title
  - Department
  - Location
  - Date of joining
  - Employment status
  - Phone number (if available)
  - Manager (if assigned)
- **View-only mode**: Employees cannot edit other employees' information

## User Interface

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Employee Portal            [Settings] [User Avatar ▼]      │
├─────────────────────────────────────────────────────────────┤
│  [Employees] [Attendance] [Time Off]                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────────────────────────┐ │
│  │  Check In/  │  │  [Search Bar]                        │ │
│  │  Check Out  │  │                                      │ │
│  │             │  │  ┌────┐  ┌────┐  ┌────┐            │ │
│  │  [Status]   │  │  │Emp │  │Emp │  │Emp │            │ │
│  │  [Time]     │  │  │ 1  │  │ 2  │  │ 3  │            │ │
│  │  [Button]   │  │  └────┘  └────┘  └────┘            │ │
│  │             │  │                                      │ │
│  └─────────────┘  │  ┌────┐  ┌────┐  ┌────┐            │ │
│                   │  │Emp │  │Emp │  │Emp │            │ │
│                   │  │ 4  │  │ 5  │  │ 6  │            │ │
│                   │  └────┘  └────┘  └────┘            │ │
│                   └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/src/
├── pages/
│   └── EmployeeDashboard.tsx              # Main dashboard page
│   └── EmployeeDashboard.module.css       # Dashboard styles
├── components/
│   ├── EmployeeCard.tsx                   # Individual employee card
│   ├── EmployeeCard.module.css
│   ├── UserProfileMenu.tsx                # Avatar dropdown menu
│   ├── UserProfileMenu.module.css
│   ├── CheckInOut.tsx                     # Attendance check-in/out
│   └── CheckInOut.module.css
└── services/
    └── attendanceService.ts               # Attendance business logic
```

## Technical Details

### Components

#### **EmployeeDashboard**
- Main container component
- Manages tab navigation
- Fetches and displays employee data
- Handles search filtering
- Controls employee detail modal

#### **EmployeeCard**
- Reusable card component for each employee
- Props: `employee`, `onClick`
- Displays status indicator based on attendance
- Clickable to open detail modal

#### **UserProfileMenu**
- Dropdown menu component
- Handles click-outside to close
- Manages navigation to profile and logout

#### **CheckInOut**
- Attendance tracking component
- Manages check-in/out state
- Integrates with attendanceService
- Displays real-time status with animated indicator

### Services

#### **attendanceService**
Key methods:
- `getTodayAttendance(employeeId)`: Fetch today's attendance record
- `checkIn(employeeId)`: Record check-in time and status
- `checkOut(employeeId)`: Record check-out time and calculate hours
- `getAttendanceByEmployeeId(employeeId, startDate?, endDate?)`: Get attendance history
- `getAttendanceStats(employeeId, month, year)`: Get monthly statistics

## Routing

```typescript
/employee/dashboard  → EmployeeDashboard (Protected, Employee Role)
/employee/profile    → Employee Profile (Coming soon)
/admin/dashboard     → Admin Dashboard (Protected, Admin/HR Role)
```

### Role-Based Redirects
After login:
- **Employee** → `/employee/dashboard`
- **Admin/HR** → `/admin/dashboard`

## Responsive Design

### Desktop (1200px+)
- Sidebar and content side-by-side
- 3-column employee grid (auto-fill, min 280px)

### Tablet (768px - 1199px)
- Sidebar stacked above content
- 2-3 column employee grid

### Mobile (< 768px)
- Single column layout
- Sidebar full width
- Single column employee grid
- Collapsible navigation tabs (horizontal scroll)

## Future Enhancements

### Attendance Tab
- Calendar view of attendance history
- Monthly/weekly/daily views
- Work hours summary
- Late arrival tracking
- Export attendance reports

### Time Off Tab
- Leave request form
- Leave balance display
- Leave history
- Approval status tracking
- Calendar integration

### Additional Features
- Real-time status updates (WebSocket)
- Notifications for check-in reminders
- Team view (filter by department/team)
- Favorites/frequently contacted employees
- Advanced filtering (by role, department, status)
- Export employee directory

## Testing Checklist

- [ ] Check-in/out functionality works correctly
- [ ] Status indicators display correctly
- [ ] Employee cards are clickable and open modal
- [ ] Search filters employees in real-time
- [ ] Modal closes on overlay click or close button
- [ ] User menu dropdown works and closes on outside click
- [ ] Responsive design works on all screen sizes
- [ ] Tab navigation functions correctly
- [ ] Logout redirects to sign-in page
- [ ] Late detection works (after 9:30 AM)

## Known Limitations (Mock Data)

1. **Check-in/out data is not persisted** across page refreshes (in-memory only)
2. **No backend integration** - all data is stored in browser memory
3. **Email notifications are console logs** - real email sending not implemented
4. **No real-time updates** - status changes require page refresh
5. **Attendance history tab** is placeholder (coming soon)
6. **Time off tab** is placeholder (coming soon)

## Next Steps

1. Implement backend API integration for attendance service
2. Add WebSocket support for real-time status updates
3. Build out Attendance and Time Off tabs
4. Add employee profile edit functionality (for own profile)
5. Implement notification system
6. Add data persistence (database integration)
7. Add unit and integration tests
8. Implement accessibility features (WCAG compliance)