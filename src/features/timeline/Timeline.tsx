import type { FoodEntry, DayGroup as DayGroupType } from '@/types';
import { Badge } from '@/components/ui/Badge';
import styles from './Timeline.module.css';

/* ═══════════════════════════════════════════════════
   Timeline — Günlere göre gruplanmış yiyecek kayıtları
   ═══════════════════════════════════════════════════ */

interface TimelineProps {
    groups: DayGroupType[];
    onDelete?: (id: string) => void;
}

const DAYS_TR = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const MONTHS_TR = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
];

function formatDateTR(dateStr: string): string {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Bugün';
    if (dateStr === yesterdayStr) return 'Dün';

    const dayName = DAYS_TR[date.getDay()];
    const day = date.getDate();
    const month = MONTHS_TR[date.getMonth()];
    return `${dayName}, ${day} ${month}`;
}

function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

/* ── Food Entry Row ── */
function FoodEntryRow({
    entry,
    onDelete,
}: {
    entry: FoodEntry;
    onDelete?: (id: string) => void;
}) {
    return (
        <div className={styles['entry']}>
            <span className={styles['entryTime']}>{formatTime(entry.recorded_at)}</span>
            <div className={styles['entryInfo']}>
                <div className={styles['entryName']}>{entry.food_name}</div>
                <div className={styles['entryPortion']}>
                    {entry.portion} · <Badge mealType={entry.meal_type} />
                </div>
            </div>
            <span className={styles['entryCalories']}>{entry.calories} kcal</span>
            {onDelete && (
                <button
                    className={styles['entryDelete']}
                    onClick={() => onDelete(entry.id)}
                    aria-label={`${entry.food_name} sil`}
                >
                    ✕
                </button>
            )}
        </div>
    );
}

/* ── Day Group ── */
function DayGroupCard({
    group,
    onDelete,
    index,
}: {
    group: DayGroupType;
    onDelete?: (id: string) => void;
    index: number;
}) {
    return (
        <div
            className={styles['dayGroup']}
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className={styles['dayHeader']}>
                <span className={styles['dayDate']}>{formatDateTR(group.date)}</span>
                <span className={styles['dayCalories']}>
                    {group.totalCalories} kcal
                </span>
            </div>
            <div className={styles['entriesList']}>
                {group.entries.map((entry) => (
                    <FoodEntryRow key={entry.id} entry={entry} onDelete={onDelete} />
                ))}
            </div>
        </div>
    );
}

/* ── Main Timeline Component ── */
export function Timeline({ groups, onDelete }: TimelineProps) {
    if (groups.length === 0) {
        return (
            <div className={styles['empty']}>
                <div className={styles['emptyIcon']}>🍽️</div>
                <p className={styles['emptyText']}>Henüz kayıt yok</p>
                <p className={styles['emptyHint']}>
                    Yukarıdaki butona basarak ne yediğinizi söyleyin
                </p>
            </div>
        );
    }

    return (
        <div className={styles['timeline']}>
            <h2 className={styles['sectionTitle']}>Günlük Akış</h2>
            {groups.map((group, index) => (
                <DayGroupCard
                    key={group.date}
                    group={group}
                    onDelete={onDelete}
                    index={index}
                />
            ))}
        </div>
    );
}
