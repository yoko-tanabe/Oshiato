'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, LayoutGrid, MapPin, Plus, User } from 'lucide-react';
import styles from './TabBar.module.css';

type Tab = {
  href: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; color?: string }>;
  label: string;
  isCenter?: boolean;
};

const TABS: Tab[] = [
  { href: '/', icon: MapPin, label: 'マップ' },
  { href: '/timeline', icon: LayoutGrid, label: 'タイムライン' },
  { href: '/post/new', icon: Plus, label: '投稿', isCenter: true },
  { href: '/trajectory', icon: Layers, label: '軌跡' },
  { href: '/oshi', icon: User, label: 'マイページ' },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        if (tab.isCenter) {
          return (
            <Link key={tab.href} href={tab.href} className={styles.centerTab}>
              <span className={styles.centerButton}>
                <Icon size={20} strokeWidth={2} color="#0D0D0D" />
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`${styles.tab} ${isActive ? styles.tabActive : ''}`}
          >
            <Icon
              size={20}
              strokeWidth={1.5}
              color={isActive ? '#C4B5FD' : '#808080'}
            />
            <span className={styles.label}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
