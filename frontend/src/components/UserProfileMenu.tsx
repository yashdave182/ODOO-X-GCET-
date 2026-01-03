import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './UserProfileMenu.module.css';

const UserProfileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMyProfile = () => {
    setIsOpen(false);
    navigate('/employee/profile');
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/signin');
  };

  if (!user) return null;

  return (
    <div className={styles.container} ref={menuRef}>
      <button
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className={styles.avatarContainer}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              <User size={20} />
            </div>
          )}
        </div>
        <ChevronDown size={16} className={styles.chevron} />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.userInfo}>
            <p className={styles.userName}>{user.fullName}</p>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
          <div className={styles.divider} />
          <button className={styles.menuItem} onClick={handleMyProfile}>
            <User size={16} />
            <span>My Profile</span>
          </button>
          <button className={styles.menuItem} onClick={handleLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
