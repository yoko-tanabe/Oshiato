import styles from './OshiCard.module.css';

type Props = {
  name: string;
  groupName: string | null;
  themeColor: string;
};

export default function OshiCard({ name, groupName, themeColor }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.colorDot} style={{ background: themeColor }} />
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        {groupName && <p className={styles.group}>{groupName}</p>}
      </div>
    </div>
  );
}
