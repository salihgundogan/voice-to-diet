import { useState, useEffect, useCallback } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { VoiceButton } from '@/features/voice/VoiceButton';
import { useVoiceRecorder } from '@/features/voice/useVoiceRecorder';
import { ConfirmationModal } from '@/features/analysis/ConfirmationModal';
import { Timeline } from '@/features/timeline/Timeline';
import { analyzeVoiceNote } from '@/lib/gemini';
import {
    addFoodEntry,
    getFoodEntries,
    deleteFoodEntry,
    groupEntriesByDay,
} from '@/services/foodEntryService';
import type { FoodEntry, FoodAnalysis, DayGroup } from '@/types';
import styles from './HomePage.module.css';

/** Demo kullanıcı ID'si — gerçek auth eklenene kadar */
const DEMO_USER_ID = 'demo-user';

export function HomePage() {
    const { state, audioBlob, duration, startRecording, stopRecording, reset, error } =
        useVoiceRecorder();

    const [entries, setEntries] = useState<FoodEntry[]>([]);
    const [groups, setGroups] = useState<DayGroup[]>([]);

    // Çoklu yiyecek kuyruğu
    const [analysisQueue, setAnalysisQueue] = useState<FoodAnalysis[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const currentAnalysis = analysisQueue[currentIndex] ?? null;
    const totalItems = analysisQueue.length;

    // Kayıtları yükle
    const loadEntries = useCallback(async () => {
        try {
            const data = await getFoodEntries(DEMO_USER_ID);
            setEntries(data);
            setGroups(groupEntriesByDay(data));
        } catch (err) {
            console.error('Kayıtlar yüklenemedi:', err);
        }
    }, []);

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    // Ses kaydı tamamlandığında AI analizi başlat
    useEffect(() => {
        if (audioBlob && state === 'done') {
            handleAnalyze(audioBlob);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [audioBlob, state]);

    const handleAnalyze = async (blob: Blob) => {
        setIsAnalyzing(true);
        try {
            const results = await analyzeVoiceNote(blob);
            if (results.length > 0) {
                setAnalysisQueue(results);
                setCurrentIndex(0);
                setIsModalOpen(true);
            }
        } catch (err) {
            console.error('Analiz hatası:', err);
            alert(err instanceof Error ? err.message : 'Analiz başarısız oldu.');
        } finally {
            setIsAnalyzing(false);
            reset();
        }
    };

    const handleConfirm = async (data: FoodAnalysis) => {
        try {
            await addFoodEntry({
                ...data,
                user_id: DEMO_USER_ID,
                recorded_at: new Date().toISOString(),
            });

            // Sıradaki yiyeceğe geç
            if (currentIndex < totalItems - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                // Hepsi kaydedildi
                setIsModalOpen(false);
                setAnalysisQueue([]);
                setCurrentIndex(0);
                await loadEntries();
            }
        } catch (err) {
            console.error('Kayıt eklenemedi:', err);
            alert('Kayıt eklenirken bir hata oluştu.');
        }
    };

    const handleCancel = () => {
        // Mevcut yiyeceği atla, sıradakine geç
        if (currentIndex < totalItems - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setIsModalOpen(false);
            setAnalysisQueue([]);
            setCurrentIndex(0);
            loadEntries();
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteFoodEntry(id);
            await loadEntries();
        } catch (err) {
            console.error('Kayıt silinemedi:', err);
        }
    };

    const todayCalories = groups.length > 0 ? (groups[0]?.totalCalories ?? 0) : 0;
    const effectiveState = isAnalyzing ? 'processing' : state;

    return (
        <PageContainer>
            <div className={styles['page']}>
                {/* Greeting */}
                <div className={styles['greeting']}>
                    <h2 className={styles['greetingText']}>{getGreeting()} 👋</h2>
                    <p className={styles['greetingHint']}>Ne yediğinizi kaydedin</p>
                </div>

                {/* Today's summary */}
                {entries.length > 0 && (
                    <div className={styles['summaryCard']}>
                        <span className={styles['summaryIcon']}>🔥</span>
                        <div className={styles['summaryContent']}>
                            <div className={styles['summaryCalories']}>{todayCalories}</div>
                            <div className={styles['summaryLabel']}>bugün alınan kalori</div>
                        </div>
                    </div>
                )}

                {/* Voice recorder */}
                <VoiceButton
                    state={effectiveState}
                    duration={duration}
                    error={error}
                    onStart={startRecording}
                    onStop={stopRecording}
                />

                {/* Timeline */}
                <Timeline groups={groups} onDelete={handleDelete} />

                {/* Confirmation Modal */}
                <ConfirmationModal
                    isOpen={isModalOpen}
                    analysis={currentAnalysis}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    itemCounter={totalItems > 1 ? `${currentIndex + 1}/${totalItems}` : undefined}
                />
            </div>
        </PageContainer>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'İyi geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi günler';
    return 'İyi akşamlar';
}
