import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';
import styles from './Input.module.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      helperText,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const containerClasses = [
      styles.container,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      styles.input,
      error && styles.error,
      icon && styles[`withIcon${iconPosition === 'left' ? 'Left' : 'Right'}`],
      disabled && styles.disabled,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={containerClasses}>
        {label && (
          <label className={styles.label}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {icon && iconPosition === 'left' && (
            <span className={styles.iconLeft}>{icon}</span>
          )}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className={styles.iconRight}>{icon}</span>
          )}
        </div>
        {(error || helperText) && (
          <span className={error ? styles.errorText : styles.helperText}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
