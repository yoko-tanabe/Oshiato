'use client';

import { useState } from 'react';
import { TrajectoryMap_dynamic } from '@/components/trajectory/TrajectoryMap/TrajectoryMap_dynamic';
import VisitList from '@/components/visits/VisitList/VisitList';
import styles from './TrajectoryTabs.module.css';

type TabType = 'map' | 'visits';

const TABS: { value: TabType; label: string }[] = [
  { value: 'map', label: '軌跡マップ' },
  { value: 'visits', label: '訪問ログ' },
];

/**
 * 軌跡ページのタブ切り替えコンポーネント
 * 「軌跡マップ」と「訪問ログ」をタブで切り替え表示する
 */
export default function TrajectoryTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('map');

  return (
    <div className={styles.container}>
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={`${styles.tab} ${activeTab === tab.value ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.content}>
        {activeTab === 'map' ? <TrajectoryMap_dynamic /> : <VisitList />}
      </div>
    </div>
  );
}
