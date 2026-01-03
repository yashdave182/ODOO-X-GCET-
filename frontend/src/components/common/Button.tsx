import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  isLoading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) => {
  const buttonClasses = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    isLoading && styles.loading,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className={styles.icon}>{icon}</span>
          )}
          <span className={styles.text}>{children}</span>
          {icon && iconPosition === 'right' && (
            <span className={styles.icon}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};
