import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getFoodEntries, groupEntriesByDay } from '@/services/foodEntryService';
import { generatePdf, generatePlainText } from '@/features/report/generatePdf';
import type { DayGroup } from '@/types';
import styles from './ReportPage.module.css';

const DEMO_USER_ID = 'demo-user';

function getDefaultDateRange() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7);
    return {
        start: start.toISOString().split('T')[0]!,
        end: end.toISOString().split('T')[0]!,
    };
}

export function ReportPage() {
    const [dateRange, setDateRange] = useState(getDefaultDateRange);
    const [groups, setGroups] = useState<DayGroup[]>([]);
    const [toast, setToast] = useState<string | null>(null);

    const loadData = useCallback(async () => {
        try {
            const data = await getFoodEntries(DEMO_USER_ID, {
                start: `${dateRange.start}T00:00:00`,
                end: `${dateRange.end}T23:59:59`,
            });
            setGroups(groupEntriesByDay(data));
        } catch (err) {
            console.error('Rapor verileri yüklenemedi:', err);
        }
    }, [dateRange]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 2500);
    };

    const handleExportPdf = () => {
        const label = `${dateRange.start} — ${dateRange.end}`;
        generatePdf(groups, label);
        showToast('PDF indirildi ✓');
    };

    const handleCopyText = async () => {
        const label = `${dateRange.start} — ${dateRange.end}`;
        const text = generatePlainText(groups, label);
        await navigator.clipboard.writeText(text);
        showToast('Panoya kopyalandı ✓');
    };

    const totalCalories = groups.reduce((s, g) => s + g.totalCalories, 0);
    const totalProtein = groups.reduce((s, g) => s + g.totalProtein, 0);
    const totalCarbs = groups.reduce((s, g) => s + g.totalCarbs, 0);
    const totalFat = groups.reduce((s, g) => s + g.totalFat, 0);

    return (
        <PageContainer>
            <div className={styles['page']}>
                <h2 className={styles['pageTitle']}>📊 Raporlar</h2>

                {/* Date Range */}
                <div className={styles['dateRange']}>
                    <div className={styles['dateField']}>
                        <label className={styles['dateLabel']}>Başlangıç</label>
                        <input
                            type="date"
                            className={styles['dateInput']}
                            value={dateRange.start}
                            onChange={(e) =>
                                setDateRange((prev) => ({ ...prev, start: e.target.value }))
                            }
                        />
                    </div>
                    <span className={styles['dateSeparator']}>→</span>
                    <div className={styles['dateField']}>
                        <label className={styles['dateLabel']}>Bitiş</label>
                        <input
                            type="date"
                            className={styles['dateInput']}
                            value={dateRange.end}
                            onChange={(e) =>
                                setDateRange((prev) => ({ ...prev, end: e.target.value }))
                            }
                        />
                    </div>
                </div>

                {/* Stats */}
                {groups.length > 0 ? (
                    <>
                        <div className={styles['statsGrid']}>
                            <Card>
                                <div className={styles['statCard']}>
                                    <div className={styles['statValue']}>{totalCalories}</div>
                                    <div className={styles['statLabel']}>Toplam Kalori</div>
                                </div>
                            </Card>
                            <Card>
                                <div className={styles['statCard']}>
                                    <div className={styles['statValue']}>{totalProtein}g</div>
                                    <div className={styles['statLabel']}>Protein</div>
                                </div>
                            </Card>
                            <Card>
                                <div className={styles['statCard']}>
                                    <div className={styles['statValue']}>{totalCarbs}g</div>
                                    <div className={styles['statLabel']}>Karbonhidrat</div>
                                </div>
                            </Card>
                            <Card>
                                <div className={styles['statCard']}>
                                    <div className={styles['statValue']}>{totalFat}g</div>
                                    <div className={styles['statLabel']}>Yağ</div>
                                </div>
                            </Card>
                        </div>

                        {/* Actions */}
                        <div className={styles['actions']}>
                            <Button variant="primary" fullWidth onClick={handleExportPdf}>
                                📄 PDF İndir
                            </Button>
                            <Button variant="secondary" fullWidth onClick={handleCopyText}>
                                📋 Metin Kopyala
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className={styles['empty']}>
                        <div className={styles['emptyIcon']}>📊</div>
                        <p className={styles['emptyText']}>
                            Seçilen tarih aralığında kayıt bulunamadı
                        </p>
                    </div>
                )}

                {/* Toast */}
                {toast && <div className={styles['toast']}>{toast}</div>}
            </div>
        </PageContainer>
    );
}
