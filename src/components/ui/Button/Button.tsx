/* src/components/ui/Button/Button.tsx */
import React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import styles from './Button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  type = 'button',
  id,
  ...props
}) => {
  const buttonClass = clsx(
    styles.button,
    styles[variant],
    styles[size],
    {
      [styles.fullWidth]: fullWidth,
      [styles.loading]: isLoading,
      [styles.disabled]: disabled || isLoading,
    },
    className
  );

  return (
    <motion.button
      type={type}
      className={buttonClass}
      disabled={disabled || isLoading}
      whileHover={disabled || isLoading ? undefined : { y: -1, scale: 1.01 }}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      id={id}
      {...(props as any)}
    >
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
      {!isLoading && leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span className={styles.content}>{children}</span>
      {!isLoading && rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </motion.button>
  );
};
