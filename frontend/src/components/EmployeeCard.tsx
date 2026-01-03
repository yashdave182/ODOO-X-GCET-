import React from 'react';
import { Employee, AttendanceStatus } from '../types';
import { User, Circle, Plane } from 'lucide-react';
import styles from './EmployeeCard.module.css';

interface EmployeeCardProps {
  employee: Employee;
  onClick?: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onClick }) => {
  const getStatusIcon = () => {
    const status = employee.status || AttendanceStatus.ABSENT;

    switch (status) {
      case AttendanceStatus.PRESENT:
        return <Circle className={styles.statusIconPresent} fill="currentColor" size={16} />;
      case AttendanceStatus.LEAVE:
        return <Plane className={styles.statusIconLeave} size={16} />;
      case AttendanceStatus.ABSENT:
        return <Circle className={styles.statusIconAbsent} fill="currentColor" size={16} />;
      default:
        return <Circle className={styles.statusIconAbsent} fill="currentColor" size={16} />;
    }
  };

  const getStatusTitle = () => {
    const status = employee.status || AttendanceStatus.ABSENT;

    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'Present';
      case AttendanceStatus.LEAVE:
        return 'On Leave';
      case AttendanceStatus.ABSENT:
        return 'Absent';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={styles.card} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.statusIndicator} title={getStatusTitle()}>
        {getStatusIcon()}
      </div>

      <div className={styles.avatarContainer}>
        {employee.avatar ? (
          <img
            src={employee.avatar}
            alt={employee.fullName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            <User size={48} />
          </div>
        )}
      </div>

      <div className={styles.info}>
        <h3 className={styles.name}>{employee.fullName}</h3>
        <p className={styles.detail}>{employee.jobTitle}</p>
        <p className={styles.detail}>{employee.department}</p>
      </div>
    </div>
  );
};

export default EmployeeCard;
