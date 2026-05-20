import Link from 'next/link';
import { MapPin } from 'lucide-react';
import styles from './OshiCard.module.css';

type Props = {
  oshiId: string;
  name: string;
  groupName: string | null;
  themeColor: string;
};

export default function OshiCard({ oshiId, name, groupName, themeColor }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.colorDot} style={{ background: themeColor }} />
      <div className={styles.info}>
        <p className={styles.name}>{name}</p>
        {groupName && <p className={styles.group}>{groupName}</p>}
      </div>
      <Link href={`/oshi/${oshiId}/spots`} className={styles.spotsLink} aria-label="スポット一覧">
        <MapPin size={16} strokeWidth={1.5} />
        <span>スポット</span>
      </Link>
    </div>
  );
}
