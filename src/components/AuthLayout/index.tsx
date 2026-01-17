'use client';

import { memo, type ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './AuthLayout.module.scss';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  showLogo?: boolean;
}

export const AuthLayout = memo<AuthLayoutProps>(({
  title,
  subtitle,
  children,
  footer,
  showLogo = true,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          {showLogo && (
            <div className={styles.logo}>
              <Image src="/logo.jpg" alt="Trend Pulse" fill className={styles.logoImage} />
            </div>
          )}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {children}

        <div className={styles.footer}>{footer}</div>
      </div>
    </div>
  );
});

AuthLayout.displayName = 'AuthLayout';

interface AuthLinkProps {
  text: string;
  linkText: string;
  href: string;
}

export const AuthLink = memo<AuthLinkProps>(({ text, linkText, href }) => {
  return (
    <p className={styles.linkText}>
      {text}{' '}
      <Link href={href} className={styles.link}>
        {linkText}
      </Link>
    </p>
  );
});

AuthLink.displayName = 'AuthLink';
