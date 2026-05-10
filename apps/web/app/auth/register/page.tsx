import RegisterForm from '@/components/auth/RegisterForm/RegisterForm';
import styles from './page.module.css';

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <RegisterForm />
    </main>
  );
}
