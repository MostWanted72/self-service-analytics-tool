/* src/components/ui/Card/Card.tsx */
import React from 'react';
import { motion } from 'motion/react';
import clsx from 'clsx';
import styles from './Card.module.scss';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
  hoverable?: boolean;
  id?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  animate = false,
  hoverable = false,
  id,
}) => {
  const cardClass = clsx(
    styles.card,
    {
      [styles.hoverable]: hoverable,
    },
    className
  );

  if (animate) {
    return (
      <motion.div
        className={cardClass}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        id={id}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClass} id={id}>
      {children}
    </div>
  );
};
