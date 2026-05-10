import SetupProfileForm from '@/components/auth/SetupProfileForm/SetupProfileForm';
import styles from './page.module.css';

export default function SetupProfilePage() {
  return (
    <main className={styles.page}>
      <SetupProfileForm />
    </main>
  );
}
