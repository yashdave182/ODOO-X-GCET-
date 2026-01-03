import { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
}

export const Card = ({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className = '',
  ...props
}: CardProps) => {
  const cardClasses = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hoverable && styles.hoverable,
    clickable && styles.clickable,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className = '' }: CardHeaderProps) => {
  return <div className={`${styles.header} ${className}`}>{children}</div>;
};

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export const CardBody = ({ children, className = '' }: CardBodyProps) => {
  return <div className={`${styles.body} ${className}`}>{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const CardFooter = ({ children, className = '' }: CardFooterProps) => {
  return <div className={`${styles.footer} ${className}`}>{children}</div>;
};
