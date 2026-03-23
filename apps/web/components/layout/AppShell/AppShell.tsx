import TabBar from '@/components/ui/TabBar/TabBar';
import styles from './AppShell.module.css';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <main className={styles.content}>{children}</main>
      <TabBar />
    </div>
  );
}
