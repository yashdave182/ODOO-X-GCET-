# HRMS Portal - Human Resource Management System

A modern, full-featured Human Resource Management System built with React, TypeScript, and Vite.

## 🚀 Features

- **Authentication & Authorization**
  - Secure Sign In / Sign Up
  - Role-based access control (Admin, HR, Employee)
  - Password visibility toggle
  - Session management

- **Employee Management**
  - Employee profiles with detailed information
  - Department and location tracking
  - Employment status management
  - Avatar support

- **Attendance Tracking**
  - Daily check-in/check-out
  - Attendance history
  - Working hours calculation
  - Status indicators (Present, Absent, Late, Leave, Weekend)

- **Leave Management**
  - Leave request submission
  - Leave approval workflow
  - Multiple leave types (Paid, Sick, Unpaid, Vacation)
  - Leave balance tracking

- **Payroll Management**
  - Salary structure configuration
  - Earnings and deductions
  - Monthly/yearly wage calculation
  - Read-only view for employees

## 🛠️ Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Context API
- **Styling:** CSS Modules
- **Icons:** Lucide React
- **Form Handling:** React Hook Form
- **Date Utilities:** date-fns

## 📋 Prerequisites

- Node.js 16+ and npm/yarn
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🏃 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ODOO-X-GCET-/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 🔐 Demo Credentials

### Admin Account
- **Email:** admin@company.com
- **Password:** admin123
- **Role:** Admin/HR

### Employee Account
- **Email:** john.doe@company.com
- **Password:** password123
- **Role:** Employee

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── components/          
│   ├── common/         # Reusable UI components (Button, Input, Card)
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   └── features/       # Feature-specific components
├── context/            # React Context providers (Auth, Theme)
├── hooks/              # Custom React hooks
├── pages/              
│   ├── auth/           # Authentication pages (Sign In, Sign Up)
│   ├── dashboard/      # Dashboard pages
│   ├── attendance/     # Attendance management
│   ├── leave/          # Leave management
│   ├── profile/        # Profile pages
│   └── payroll/        # Payroll pages
├── routes/             # Route configuration
├── services/           # API services and mock data
├── styles/             # Global styles and CSS variables
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main App component
└── main.tsx            # Application entry point
```

## 🎨 UI Components

### Common Components

- **Button:** Primary, secondary, outline, ghost, and danger variants
- **Input:** Text, email, password with icon support
- **Card:** Container component with header, body, and footer
- **Badge:** Status indicators
- **Modal:** Dialog component
- **Table:** Data table with sorting and pagination

### Styling Approach

- CSS Modules for component-level styling
- CSS variables for theming and consistency
- Responsive design with mobile-first approach
- Clean and modern UI inspired by best practices

## 🔧 Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint (if configured)

### Code Style

- Use TypeScript for type safety
- Follow React best practices and hooks patterns
- Use functional components
- Maintain clean component hierarchy
- Minimal comments (self-documenting code)

### Adding New Pages

1. Create page component in `src/pages/<feature-name>/`
2. Add route in `src/routes/index.tsx`
3. Add necessary types in `src/types/index.ts`
4. Create service functions in `src/services/`

## 🌐 API Integration

Currently using mock data services. To integrate with real backend:

1. Replace mock functions in `src/services/` with actual API calls
2. Configure base API URL in environment variables
3. Add interceptors for authentication tokens
4. Handle error responses appropriately

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_NAME=HRMS Portal
```

## 🔒 Security

- Passwords are never stored in plain text
- Authentication tokens stored in localStorage
- Protected routes check authentication status
- Role-based access control for sensitive features
- Input validation on all forms

## 🎯 Future Enhancements

- [ ] Employee dashboard with analytics
- [ ] Admin dashboard with company statistics
- [ ] Advanced reporting and exports
- [ ] Email notifications
- [ ] Document management
- [ ] Performance reviews
- [ ] Training and development tracking
- [ ] Real-time notifications
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🐛 Troubleshooting

### Common Issues

**Issue:** Vite server not starting
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Issue:** Build errors with TypeScript
```bash
# Check TypeScript configuration
npm run build
```

**Issue:** Styles not loading